import { Request, Response } from 'express';
import { Project } from '../models/project.model';
import { ApiResponse } from '../utils/ApiResponse';
import { getSocketIo } from '../socket';
import { redisClient } from '../config/redis.config';

export const createProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId || req.body.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const project = await Project.create({ ...req.body, userId });

    await redisClient.del(`projects:${userId}`);
    getSocketIo().to(userId).emit('project.created', project);
    getSocketIo().emit(`public.project.created.${userId}`, project);

    return res.status(201).json(new ApiResponse(201, project, 'Project created'));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const cached = await redisClient.get(`projects:${userId}`);
    if (cached) {
      return res.status(200).json(new ApiResponse(200, JSON.parse(cached), 'Projects (cache)'));
    }

    const projects = await Project.find({ userId }).sort({ createdAt: -1 });
    await redisClient.set(`projects:${userId}`, JSON.stringify(projects), 'EX', 3600);

    return res.status(200).json(new ApiResponse(200, projects, 'Projects fetched'));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await Project.find({}).sort({ createdAt: -1 }).limit(50);
    return res.status(200).json(new ApiResponse(200, projects, 'All public projects fetched'));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
