import { Request, Response } from 'express';
import { Suggestion } from '../models/suggestion.model';
import { normalizeUniversityName } from './university.controller';

export const addCustomSuggestion = async (req: Request, res: Response) => {
  try {
    const { category, name } = req.body;
    const userId = (req as any).auth?.userId || req.body.userId;

    if (!category || !name) {
      return res.status(400).json({ success: false, message: 'Category and name are required' });
    }

    const normalizedName = normalizeUniversityName(name);

    const existing = await Suggestion.findOne({ category, normalizedName });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Suggestion already exists', data: existing });
    }

    const suggestion = await Suggestion.create({
      category,
      name,
      normalizedName,
      verified: false,
      createdBy: userId
    });

    res.status(201).json({ success: true, data: suggestion });
  } catch (error: any) {
    console.error('Error adding suggestion:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getSuggestions = async (req: Request, res: Response) => {
  try {
    const { category, query } = req.query;
    
    let filter: any = {};
    if (category) filter.category = category;
    
    // Fetch all for the category, verified first
    const suggestions = await Suggestion.find(filter).limit(200).sort({ verified: -1, name: 1 }).lean();
    
    if (query && typeof query === 'string' && suggestions.length > 0) {
      const FuseModule = await import('fuse.js');
      const Fuse = FuseModule.default || FuseModule;
      const fuse = new (Fuse as any)(suggestions, {
        keys: ['name', 'normalizedName'],
        threshold: 0.3,
        includeScore: true,
      });
      const results = fuse.search(query);
      return res.status(200).json({ success: true, data: results.map((r: any) => r.item) });
    }
    
    res.status(200).json({ success: true, data: suggestions });
  } catch (error: any) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
