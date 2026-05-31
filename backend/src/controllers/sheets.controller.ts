import { Request, Response } from 'express';
import { DsaSheet } from '../models/DsaSheet';
import { DsaStep } from '../models/DsaStep';
import { SheetProblem } from '../models/SheetProblem';
import { MasterProblem } from '../models/MasterProblem';
import { ApiResponse } from '../utils/ApiResponse';

function deriveColorClasses(color: string) {
  const match = color.match(/from-(\w+)-/);
  const base = match ? match[1] : 'purple';
  return {
    text: `text-${base}-400`,
    bg: `bg-${base}-500/10`,
  };
}

export const getAllSheets = async (req: Request, res: Response) => {
  try {
    const sheets = await DsaSheet.find({ active: true })
      .select('slug title description source totalProblems icon color tags')
      .sort({ createdAt: 1 })
      .lean();

    const data = sheets.map((sheet) => {
      const classes = deriveColorClasses(sheet.color);
      return {
        _id: sheet._id,
        slug: sheet.slug,
        title: sheet.title,
        desc: sheet.description,
        problems: sheet.totalProblems,
        icon: sheet.icon,
        color: sheet.color,
        text: classes.text,
        bg: classes.bg,
        tags: sheet.tags,
      };
    });

    console.log(`[sheets] Returning ${data.length} sheets`);
    return res.status(200).json(new ApiResponse(200, data));
  } catch (error: any) {
    console.error('[sheets] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/sheets/:slug
// Returns full sheet data with steps and problems
// ---------------------------------------------------------------------------
export const getSheetBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const sheet = await DsaSheet.findOne({ slug, active: true }).lean();
    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Sheet not found' });
    }

    const steps = await DsaStep.find({ sheetId: sheet._id })
      .sort({ stepNumber: 1 })
      .lean();
    console.log(`[sheets:${slug}] Steps found: ${steps.length}`);

    const stepIds = steps.map((s) => s._id);

    const sheetProblems = await SheetProblem.find({ stepId: { $in: stepIds } })
      .sort({ orderInStep: 1 })
      .lean();
    console.log(`[sheets:${slug}] SheetProblem mappings: ${sheetProblems.length}`);

    const masterProblemIds = [...new Set(sheetProblems.map((sp) => sp.masterProblemId))];
    console.log(`[sheets:${slug}] Unique masterProblemIds: ${masterProblemIds.length}`);
    const masterProblems = await MasterProblem.find({ problemId: { $in: masterProblemIds }, active: true })
      .lean();

    const mpMap = new Map<number, typeof masterProblems[0]>();
    for (const mp of masterProblems) {
      mpMap.set(mp.problemId, mp);
    }

    const stepsWithProblems = steps.map((step) => {
      const stepProblemRefs = sheetProblems.filter(
        (sp) => sp.stepId.toString() === step._id.toString()
      );

      const problems = stepProblemRefs.map((sp) => {
        const mp = mpMap.get(sp.masterProblemId);
        if (!mp) return null;
        return {
          problemId: mp.problemId,
          name: mp.title,
          difficulty: mp.difficulty,
          platform: mp.platform,
          link: mp.link,
          links: mp.links || {},
          youtubeUrl: mp.youtubeUrl || '',
          articleUrl: mp.articleUrl || '',
          videos: mp.videos || [],
          editorials: mp.editorials || [],
          tags: mp.tags || [],
        };
      }).filter((p): p is NonNullable<typeof p> => p !== null);

      return {
        id: step.stepNumber,
        title: step.title,
        total: step.totalProblems,
        stepId: step._id,
        problems,
      };
    });

    const totalProblems = sheetProblems.length;

    return res.status(200).json(
      new ApiResponse(200, {
        _id: sheet._id,
        slug: sheet.slug,
        title: sheet.title,
        description: sheet.description,
        total: totalProblems,
        source: sheet.source,
        icon: sheet.icon,
        color: sheet.color,
        tags: sheet.tags,
        steps: stepsWithProblems,
      })
    );
  } catch (error: any) {
    console.error('[sheets:getSheetBySlug] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin routes

export const createSheet = async (req: Request, res: Response) => {
  try {
    const sheetData = req.body;
    if (!sheetData.slug) {
      sheetData.slug = sheetData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    const sheet = await DsaSheet.create(sheetData);
    return res.status(201).json({ success: true, data: sheet });
  } catch (error: any) {
    console.error('[sheets:create] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSheet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (updateData.title && !updateData.slug) {
      updateData.slug = updateData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    
    const sheet = await DsaSheet.findByIdAndUpdate(id, updateData, { new: true });
    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Sheet not found' });
    }
    return res.status(200).json({ success: true, data: sheet });
  } catch (error: any) {
    console.error('[sheets:update] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSheet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sheet = await DsaSheet.findByIdAndDelete(id);
    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Sheet not found' });
    }
    // Note: In a real system, you might want to also delete related DsaStep and SheetProblem documents
    return res.status(200).json({ success: true, message: 'Sheet deleted successfully' });
  } catch (error: any) {
    console.error('[sheets:delete] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

