#!/usr/bin/env node
'use strict';

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const URI = process.env.MONGODB_URI || 'mongodb+srv://codeyxAdmin:Ruchika7878@cluster0.bubjmca.mongodb.net/codeyx';

// ──────────────────────────────────────────────────────────
// Platform URL builders (auto-generate links from title)
// ──────────────────────────────────────────────────────────
const PLATFORM_URLS = {
  leetcode: (title) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    return `https://leetcode.com/problems/${slug}/`;
  },
  geeksforgeeks: (title) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    return `https://www.geeksforgeeks.org/${slug}/`;
  },
  neetcode: (title) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    return `https://neetcode.io/problems/${slug}`;
  },
  interviewbit: (title) => {
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `https://www.interviewbit.com/problems/${slug}/`;
  },
};

const platformMap = {
  leetcode: 'LeetCode',
  geeksforgeeks: 'GeeksforGeeks',
  hackerrank: 'HackerRank',
  codechef: 'CodeChef',
  codeforces: 'CodeForces',
  atcoder: 'AtCoder',
  neetcode: 'NeetCode',
  codingninjas: 'Coding Ninjas',
  interviewbit: 'InterviewBit',
  spoj: 'SPOJ',
  cses: 'CSES',
};

async function migrate() {
  await mongoose.connect(URI);
  const db = mongoose.connection.db;
  console.log('✅ Connected to MongoDB');

  const problems = await db.collection('masterproblems').find({}).toArray();
  console.log(`📊 Found ${problems.length} master problems`);

  let updated = 0;
  let skipped = 0;

  for (const prob of problems) {
    const title = prob.title || '';
    const titleKey = (prob.titleKey || title.toLowerCase().trim());
    const platform = (prob.platform || '').toLowerCase();
    const existingLink = prob.link || '';

    const updates = {};
    const setObj = {};

    // ── Build `links` sub-document ──
    const links = { ...(prob.links || {}) };
    let linksChanged = false;

    // If `link` exists but `links.leetcode` is empty, fill it
    if (existingLink && !links.leetcode) {
      links.leetcode = existingLink;
      linksChanged = true;
    }

    // Auto-generate LeetCode URL if missing
    if (!links.leetcode && title) {
      links.leetcode = PLATFORM_URLS.leetcode(title);
      linksChanged = true;
    }

    // If platform is known, ensure that specific link is set
    if (platform === 'leetcode' && existingLink && !links.leetcode) {
      links.leetcode = existingLink;
      linksChanged = true;
    }
    if ((platform === 'geeksforgeeks' || platform === 'gfg') && !links.geeksforgeeks) {
      links.geeksforgeeks = existingLink || PLATFORM_URLS.geeksforgeeks(title);
      linksChanged = true;
    }
    if (platform === 'hackerrank' && !links.hackerrank) {
      links.hackerrank = existingLink;
      linksChanged = true;
    }
    if (platform === 'codechef' && !links.codechef) {
      links.codechef = existingLink;
      linksChanged = true;
    }
    if (platform === 'codeforces' && !links.codeforces) {
      links.codeforces = existingLink;
      linksChanged = true;
    }
    if (platform === 'cses' && existingLink && !links.cses) {
      links.cses = existingLink;
      linksChanged = true;
    }

    // Auto-generate NeetCode and InterviewBit links
    if (!links.neetcode && title) {
      links.neetcode = PLATFORM_URLS.neetcode(title);
      linksChanged = true;
    }
    if (!links.interviewbit && title) {
      links.interviewbit = PLATFORM_URLS.interviewbit(title);
      linksChanged = true;
    }

    if (linksChanged) {
      setObj['links'] = links;
    }

    // ── Build `videos` array ──
    const existingVideos = prob.videos || [];
    if (prob.youtubeUrl && !existingVideos.some(v => v.url === prob.youtubeUrl)) {
      existingVideos.push({
        title: `${title} Solution`,
        platform: 'YouTube',
        url: prob.youtubeUrl,
      });
      setObj['videos'] = existingVideos;
    }

    // ── Build `editorials` array ──
    let existingEditorials = prob.editorials || [];

    // Remove stale LeetCode editorial entries that were incorrectly added
    // (editorials should point to editorial content, NOT LeetCode solution pages)
    const leetCodeSolutionSuffix = links.leetcode ? links.leetcode + 'solution/' : null;
    const priorLen = existingEditorials.length;
    existingEditorials = existingEditorials.filter(e => {
      if (e.url && leetCodeSolutionSuffix && e.url === leetCodeSolutionSuffix) return false;
      if (e.url && e.url.includes('leetcode.com/problems/') && e.url.includes('/solution')) return false;
      return true;
    });
    if (existingEditorials.length !== priorLen) {
      setObj['editorials'] = existingEditorials;
    }

    if (prob.articleUrl && !existingEditorials.some(e => e.url === prob.articleUrl)) {
      existingEditorials.push({
        platform: platformMap[platform] || platform || 'General',
        url: prob.articleUrl,
        title: `${title} Editorial`,
      });
      setObj['editorials'] = existingEditorials;
    }

    // ── Apply updates ──
    if (Object.keys(setObj).length > 0) {
      await db.collection('masterproblems').updateOne(
        { _id: prob._id },
        { $set: setObj }
      );
      updated++;
      console.log(`  ✅ "${title}" — updated: ${Object.keys(setObj).join(', ')}`);
    } else {
      skipped++;
    }
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`  Migration Complete`);
  console.log(`═══════════════════════════════════════`);
  console.log(`  Total problems : ${problems.length}`);
  console.log(`  Updated        : ${updated}`);
  console.log(`  Skipped        : ${skipped}`);
  console.log(`═══════════════════════════════════════\n`);

  await mongoose.disconnect();
  console.log('🔌 Disconnected.');
}

migrate().catch(e => { console.error(e); process.exit(1); });
