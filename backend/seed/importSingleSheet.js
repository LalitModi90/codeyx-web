#!/usr/bin/env node
/**
 * ============================================================
 *  importSingleSheet.js  — Codeyx DSA Sheet Importer
 * ============================================================
 *
 *  Usage:
 *    node seed/importSingleSheet.js ./seed/data/striverA2Z.json
 *    node seed/importSingleSheet.js ./seed/data/blind75.json
 *    node seed/importSingleSheet.js ./seed/data/neetcode150.json
 *
 *  What it does:
 *    1. Reads the JSON sheet file
 *    2. Creates (or finds existing) DsaSheet
 *    3. Creates DsaSteps (or finds existing for idempotent re-runs)
 *    4. For every problem in every step:
 *         - Checks MasterProblem by titleKey (normalized title)
 *         - If found  → reuses existing masterProblemId
 *         - If new    → inserts into MasterProblem (auto-increments global ID)
 *    5. Bulk-writes SheetProblem mappings (sheetId + stepId + masterProblemId)
 *    6. Updates DsaSheet.totalProblems and DsaStep.totalProblems counts
 *
 *  Key design: problems are GLOBAL. Solving "Two Sum" once = solved everywhere.
 *
 *  Safe to re-run: uses upserts + duplicate-safe logic throughout.
 * ============================================================
 */

'use strict';

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// ---- Load .env from backend root ----
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ============================================================
// Inline schema definitions (no TS compilation needed)
// ============================================================

const DsaSheetSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    source: { type: String, default: '' },
    totalProblems: { type: Number, default: 0 },
    icon: { type: String, default: 'Code2' },
    color: { type: String, default: 'from-purple-600 to-indigo-600' },
    tags: [{ type: String }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const DsaStepSchema = new mongoose.Schema(
  {
    sheetId: { type: mongoose.Schema.Types.ObjectId, ref: 'DsaSheet', required: true },
    stepNumber: { type: Number, required: true },
    title: { type: String, required: true },
    totalProblems: { type: Number, default: 0 },
  },
  { timestamps: true }
);
DsaStepSchema.index({ sheetId: 1, stepNumber: 1 }, { unique: true });

const MasterProblemSchema = new mongoose.Schema(
  {
    problemId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    titleKey: { type: String, required: true, unique: true, index: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    platform: { type: String, default: '' },
    link: { type: String, default: '' },
    youtubeUrl: { type: String, default: '' },
    articleUrl: { type: String, default: '' },
    tags: [{ type: String }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const SheetProblemSchema = new mongoose.Schema(
  {
    sheetId: { type: mongoose.Schema.Types.ObjectId, ref: 'DsaSheet', required: true },
    stepId: { type: mongoose.Schema.Types.ObjectId, ref: 'DsaStep', required: true },
    masterProblemId: { type: Number, required: true },
    orderInStep: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);
SheetProblemSchema.index({ sheetId: 1, stepId: 1, masterProblemId: 1 }, { unique: true });
SheetProblemSchema.index({ stepId: 1, orderInStep: 1 });
SheetProblemSchema.index({ masterProblemId: 1 });

// ---- Register models (guard against re-registration in dev) ----
const DsaSheet =
  mongoose.models.DsaSheet || mongoose.model('DsaSheet', DsaSheetSchema);
const DsaStep =
  mongoose.models.DsaStep || mongoose.model('DsaStep', DsaStepSchema);
const MasterProblem =
  mongoose.models.MasterProblem || mongoose.model('MasterProblem', MasterProblemSchema);
const SheetProblem =
  mongoose.models.SheetProblem || mongoose.model('SheetProblem', SheetProblemSchema);

// ============================================================
// Utilities
// ============================================================

/** Normalize a problem title for dedup matching */
const toTitleKey = (title) => title.toLowerCase().trim().replace(/\s+/g, ' ');

/** Generate a URL-safe slug from a string */
const toSlug = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** Color gradient presets keyed by source */
const COLOR_MAP = {
  'take u forward': 'from-purple-600 to-indigo-600',
  neetcode: 'from-blue-600 to-cyan-600',
  leetcode: 'from-amber-600 to-orange-600',
  blind: 'from-purple-500 to-fuchsia-600',
  'love babbar': 'from-emerald-600 to-green-600',
  default: 'from-violet-600 to-purple-600',
};

const resolveColor = (source) =>
  COLOR_MAP[(source || '').toLowerCase()] || COLOR_MAP.default;

// ============================================================
// Core: get or create next global problemId (atomic)
// ============================================================

/**
 * Returns the next available global problemId.
 * Reads the current max from MasterProblem and increments.
 * Safe for sequential (non-concurrent) import scripts.
 */
let _cachedNextId = null;

async function getNextProblemId() {
  if (_cachedNextId === null) {
    const latest = await MasterProblem.findOne().sort({ problemId: -1 }).select('problemId').lean();
    _cachedNextId = latest ? latest.problemId + 1 : 10001;
  }
  return _cachedNextId++;
}

// ============================================================
// Core: deduplicate-and-upsert problem batch
// ============================================================

/**
 * Given a list of raw problems from the JSON, resolve each to a masterProblemId:
 *   - If a MasterProblem with the same titleKey already exists → reuse it
 *   - Otherwise → insert a new MasterProblem
 *
 * Returns a Map<titleKey, masterProblemId>
 *
 * Uses bulkWrite for the new insertions to minimise round-trips.
 */
async function resolveMasterProblems(rawProblems) {
  const titleKeys = rawProblems.map((p) => toTitleKey(p.title));

  // 1. Fetch all existing master problems matching these title keys in ONE query
  const existing = await MasterProblem.find({ titleKey: { $in: titleKeys } })
    .select('problemId titleKey')
    .lean();

  const existingMap = new Map(); // titleKey → masterProblemId
  for (const doc of existing) {
    existingMap.set(doc.titleKey, doc.problemId);
  }

  // 2. Identify which ones are truly new
  const newProblems = rawProblems.filter((p) => !existingMap.has(toTitleKey(p.title)));

  // 3. Deduplicate newProblems by titleKey (same problem can appear multiple times in one step)
  const seenKeys = new Set();
  const uniqueNewProblems = newProblems.filter((p) => {
    const key = toTitleKey(p.title);
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  let insertedCount = 0;

  if (uniqueNewProblems.length > 0) {
    // 4. Assign new IDs and build upsert documents
    const inserts = [];
    for (const p of uniqueNewProblems) {
      const titleKey = toTitleKey(p.title);
      const problemId = await getNextProblemId();
      inserts.push({
        updateOne: {
          filter: { titleKey },
          update: {
            $setOnInsert: {
              problemId,
              title: p.title,
              titleKey,
              difficulty: p.difficulty,
              platform: p.platform || '',
              link: p.link || p.problemUrl || '',
              youtubeUrl: p.youtubeUrl || '',
              articleUrl: p.articleUrl || '',
              links: p.links || {},
              videos: p.videos || [],
              editorials: p.editorials || [],
              tags: p.tags || [],
              active: true,
            },
          },
          upsert: true,
        },
      });
      existingMap.set(titleKey, problemId);
    }

    // 4. bulkWrite with ordered:false so one failure doesn't block others
    const result = await MasterProblem.bulkWrite(inserts, { ordered: false });
    insertedCount = result.upsertedCount;

    // 4b. Merge new links/videos/editorials into existing problems
    const existingProblems = rawProblems.filter((p) => existingMap.has(toTitleKey(p.title)));
    const mergeOps = [];
    for (const p of existingProblems) {
      const titleKey = toTitleKey(p.title);
      const mergeUpdate = {};

      // Merge links object
      if (p.links && typeof p.links === 'object') {
        const linkEntries = Object.entries(p.links).filter(([, v]) => v);
        if (linkEntries.length > 0) {
          const linkSet = {};
          for (const [k, v] of linkEntries) linkSet[`links.${k}`] = v;
          mergeUpdate['$set'] = { ...mergeUpdate['$set'], ...linkSet };
        }
      }

      // Merge from flat link field (backward compat)
      if (p.link || p.problemUrl) {
        const url = p.link || p.problemUrl;
        const plat = (p.platform || '').toLowerCase();
        if (plat === 'leetcode' || plat === 'geeksforgeeks' || plat === 'hackerrank' ||
            plat === 'codechef' || plat === 'codeforces' || plat === 'cses') {
          if (!mergeUpdate['$set']) mergeUpdate['$set'] = {};
          mergeUpdate['$set'][`links.${plat}`] = url;
        }
      }

      // Merge videos (avoid duplicates by URL)
      if (p.videos && Array.isArray(p.videos)) {
        const validVideos = p.videos.filter((v) => v && v.url);
        if (validVideos.length > 0) {
          mergeUpdate['$addToSet'] = { ...mergeUpdate['$addToSet'] };
          mergeUpdate['$addToSet']['videos'] = { $each: validVideos };
        }
      } else if (p.youtubeUrl) {
        mergeUpdate['$addToSet'] = { ...mergeUpdate['$addToSet'] };
        mergeUpdate['$addToSet']['videos'] = {
          title: `${p.title} Solution`,
          platform: 'YouTube',
          url: p.youtubeUrl,
        };
      }

      // Merge editorials (avoid duplicates by URL)
      if (p.editorials && Array.isArray(p.editorials)) {
        const validEds = p.editorials.filter((e) => e && e.url);
        if (validEds.length > 0) {
          mergeUpdate['$addToSet'] = { ...mergeUpdate['$addToSet'] };
          mergeUpdate['$addToSet']['editorials'] = { $each: validEds };
        }
      } else if (p.articleUrl) {
        mergeUpdate['$addToSet'] = { ...mergeUpdate['$addToSet'] };
        mergeUpdate['$addToSet']['editorials'] = {
          platform: p.platform || 'General',
          url: p.articleUrl,
          title: `${p.title} Editorial`,
        };
      }

      if (Object.keys(mergeUpdate).length > 0) {
        mergeOps.push({
          updateOne: {
            filter: { titleKey },
            update: mergeUpdate,
          },
        });
      }
    }

    if (mergeOps.length > 0) {
      await MasterProblem.bulkWrite(mergeOps, { ordered: false });
    }
  }

  return { resolvedMap: existingMap, newCount: insertedCount, reuseCount: existing.length };
}

// ============================================================
// Core: build SheetProblem mappings with bulkWrite
// ============================================================

/**
 * For a given step, create SheetProblem mapping rows.
 * Uses updateOne + upsert so re-running is safe (idempotent).
 */
async function createSheetProblemMappings(sheetId, stepId, resolvedProblems) {
  if (resolvedProblems.length === 0) return 0;

  const ops = resolvedProblems.map((p, idx) => ({
    updateOne: {
      filter: { sheetId, stepId, masterProblemId: p.masterProblemId },
      update: {
        $setOnInsert: {
          sheetId,
          stepId,
          masterProblemId: p.masterProblemId,
          orderInStep: idx + 1,
        },
      },
      upsert: true,
    },
  }));

  const result = await SheetProblem.bulkWrite(ops, { ordered: false });
  return result.upsertedCount;
}

// ============================================================
// Main import function
// ============================================================

async function importSheet(jsonFilePath) {
  const absPath = path.resolve(jsonFilePath);

  // ---- Validate file ----
  if (!fs.existsSync(absPath)) {
    console.error(`\n❌ File not found: ${absPath}`);
    process.exit(1);
  }

  let sheetData;
  try {
    sheetData = JSON.parse(fs.readFileSync(absPath, 'utf-8'));
  } catch (e) {
    console.error(`\n❌ Invalid JSON in ${absPath}:`, e.message);
    process.exit(1);
  }

  // ---- Validate required fields ----
  const required = ['title', 'steps'];
  for (const field of required) {
    if (!sheetData[field]) {
      console.error(`\n❌ Missing required field in JSON: "${field}"`);
      process.exit(1);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`  📥  Importing: ${sheetData.title}`);
  console.log('═'.repeat(60));

  // ============================================================
  // STEP 1: Create / find DsaSheet
  // ============================================================
  const slug = sheetData.slug || toSlug(sheetData.title);
  const color = sheetData.color || resolveColor(sheetData.source);

  const sheet = await DsaSheet.findOneAndUpdate(
    { slug },
    {
      $setOnInsert: {
        slug,
        title: sheetData.title,
        description: sheetData.description || sheetData.title,
        source: sheetData.source || '',
        icon: sheetData.icon || 'Code2',
        color,
        tags: sheetData.tags || [],
        active: true,
        totalProblems: 0,
      },
    },
    { upsert: true, new: true }
  );

  const isNewSheet = sheet.createdAt.getTime() === sheet.updatedAt.getTime();
  console.log(`\n${isNewSheet ? '✅ Created' : '⚠️  Already exists'} sheet: "${sheet.title}" [${slug}]`);
  console.log(`   MongoDB _id: ${sheet._id}`);

  // ============================================================
  // STEP 2: Process steps one by one
  // ============================================================
  let totalNewProblems = 0;
  let totalReusedProblems = 0;
  let totalMappingsCreated = 0;
  let totalProblemsInSheet = 0;

  for (let stepIdx = 0; stepIdx < sheetData.steps.length; stepIdx++) {
    const stepData = sheetData.steps[stepIdx];
    const stepNumber = stepData.stepNumber ?? stepIdx + 1;
    const rawProblems = stepData.problems || [];

    process.stdout.write(`\n  📂  Step ${stepNumber}: "${stepData.title}" (${rawProblems.length} problems)`);

    // ---- Create / find DsaStep ----
    const step = await DsaStep.findOneAndUpdate(
      { sheetId: sheet._id, stepNumber },
      {
        $setOnInsert: {
          sheetId: sheet._id,
          stepNumber,
          title: stepData.title,
          totalProblems: rawProblems.length,
        },
      },
      { upsert: true, new: true }
    );

    if (rawProblems.length === 0) {
      console.log(' — skipped (no problems)');
      continue;
    }

    // ---- Resolve MasterProblems (dedup check) ----
    const { resolvedMap, newCount, reuseCount } = await resolveMasterProblems(rawProblems);

    // Build resolved problem list with masterProblemId
    const resolvedProblems = rawProblems.map((p) => ({
      ...p,
      masterProblemId: resolvedMap.get(toTitleKey(p.title)),
    }));

    // ---- Create SheetProblem mappings ----
    const mappingsCreated = await createSheetProblemMappings(sheet._id, step._id, resolvedProblems);

    // ---- Update DsaStep.totalProblems ----
    await DsaStep.updateOne(
      { _id: step._id },
      { $set: { totalProblems: rawProblems.length } }
    );

    totalNewProblems += newCount;
    totalReusedProblems += reuseCount;
    totalMappingsCreated += mappingsCreated;
    totalProblemsInSheet += rawProblems.length;

    process.stdout.write(`\n     ↳ ${newCount} new  |  ${reuseCount} reused  |  ${mappingsCreated} mappings created\n`);
  }

  // ============================================================
  // STEP 3: Update DsaSheet.totalProblems
  // ============================================================
  await DsaSheet.updateOne(
    { _id: sheet._id },
    { $set: { totalProblems: totalProblemsInSheet } }
  );

  // ============================================================
  // Summary
  // ============================================================
  console.log('\n' + '─'.repeat(60));
  console.log('  📊  Import Summary');
  console.log('─'.repeat(60));
  console.log(`  Sheet          : ${sheetData.title}`);
  console.log(`  Steps          : ${sheetData.steps.length}`);
  console.log(`  Total problems : ${totalProblemsInSheet}`);
  console.log(`  New problems   : ${totalNewProblems}  (added to MasterProblem)`);
  console.log(`  Reused problems: ${totalReusedProblems}  (existing problemId reused)`);
  console.log(`  Mappings made  : ${totalMappingsCreated}  (SheetProblem rows)`);
  console.log('─'.repeat(60));
  console.log(`\n  ✅  Done! Re-run anytime — fully idempotent.\n`);
}

// ============================================================
// Entry point
// ============================================================

async function main() {
  const jsonArg = process.argv[2];

  if (!jsonArg) {
    console.error('\n❌  Usage: node seed/importSingleSheet.js <path-to-sheet.json>');
    console.error('    Example: node seed/importSingleSheet.js ./seed/data/striverA2Z.json\n');
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('\n❌  MONGODB_URI not set in .env');
    process.exit(1);
  }

  console.log('\n🔌  Connecting to MongoDB…');
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log(`✅  Connected: ${mongoose.connection.host}`);

  try {
    await importSheet(jsonArg);
  } catch (err) {
    console.error('\n❌  Import failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌  Disconnected.\n');
  }
}

main();
