import { Request, Response } from 'express';
import { University } from '../models/university.model';

// Normalization Helper
export const normalizeUniversityName = (name: string): string => {
  let normalized = name.toLowerCase();
  
  // Remove special characters except spaces
  normalized = normalized.replace(/[^a-z0-9\s]/g, ' ');
  
  // Normalize common abbreviations
  normalized = normalized.replace(/\b(iit)\b/g, 'indian institute of technology');
  normalized = normalized.replace(/\b(nit)\b/g, 'national institute of technology');
  normalized = normalized.replace(/\b(iiit)\b/g, 'indian institute of information technology');
  normalized = normalized.replace(/\b(bits)\b/g, 'birla institute of technology and science');
  
  // Trim spaces and remove multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
};

export const getUniversities = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    
    let filter = {};
    if (query && typeof query === 'string') {
      filter = {
        name: { $regex: query, $options: 'i' }
      };
    }
    
    // We can use Fuse.js in memory if we fetch all (with limit) or rely on regex
    const universities = await University.find(filter).limit(100).sort({ verified: -1, name: 1 });
    
    if (query && typeof query === 'string' && universities.length > 0) {
      const FuseModule = await import('fuse.js');
      const Fuse = FuseModule.default || FuseModule;
      const fuse = new (Fuse as any)(universities.map((u: any) => u.toObject()), {
        keys: ['name', 'shortName', 'city'],
        threshold: 0.3,
        includeScore: true,
      });
      const results = fuse.search(query);
      return res.status(200).json({ success: true, data: results.map((r: any) => r.item) });
    }
    
    res.status(200).json({ success: true, data: universities });
  } catch (error: any) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const addUniversity = async (req: Request, res: Response) => {
  try {
    const { name, shortName, city, state, country } = req.body;
    const userId = (req as any).auth?.userId || req.body.userId;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const normalizedName = normalizeUniversityName(name);

    // Exact Match Check
    const existing = await University.findOne({ normalizedName });
    if (existing) {
      return res.status(409).json({ success: false, message: 'University already exists', data: existing });
    }

    // Similarity Check
    // Fetch recent/all universities to check similarity (simplified)
    const allUniversities = await University.find({}, 'name normalizedName').lean();
    
    const FuseModule = await import('fuse.js');
    const Fuse = FuseModule.default || FuseModule;
    const fuse = new (Fuse as any)(allUniversities as any[], {
      keys: ['normalizedName'],
      includeScore: true,
      threshold: 0.2 // low threshold for strict similarity
    });
    
    const similar = fuse.search(normalizedName);
    if (similar.length > 0 && similar[0].score !== undefined && similar[0].score < 0.15) { // Score closer to 0 is better match
      return res.status(409).json({ 
        success: false, 
        message: 'Similar institution already exists', 
        similar: similar.slice(0, 3).map((s: any) => s.item)
      });
    }

    const newUniversity = await University.create({
      name,
      normalizedName,
      shortName,
      city,
      state,
      country: country || 'India',
      verified: false, // Community added
      createdBy: userId,
    });

    res.status(201).json({ success: true, data: newUniversity });
  } catch (error: any) {
    console.error('Error adding university:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin route to verify/merge
export const verifyUniversity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    
    const university = await University.findByIdAndUpdate(id, { verified }, { new: true });
    if (!university) {
      return res.status(404).json({ success: false, message: 'University not found' });
    }
    
    res.status(200).json({ success: true, data: university });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
