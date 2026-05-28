import { Request, Response } from 'express';
import { Project } from '../models/project.model';
import { PlatformStats } from '../models/platformStats.model';
import { Profile } from '../models/profile.model';
import { User } from '../models/user.model';
import { ApiResponse } from '../utils/ApiResponse';
import { getSocketIo } from '../socket';
import { redisClient } from '../config/redis.config';
import { FallbackManager } from '../services/fallbackManager';
import { uploadBase64ToCloudinary } from '../utils/cloudinary';

/**
 * Automatically import and sync repositories as projects for a user.
 * This runs after a successful GitHub platform synchronization.
 */
export const syncGithubReposAsProjects = async (userId: string, username: string, repos: any[]) => {
  try {
    if (!repos || !Array.isArray(repos)) return;

    console.log(`[Auto Project Import] Syncing ${repos.length} repos for user ${userId} (@${username})...`);

    // Fetch existing imported repository projects
    const existingProjects = await Project.find({ userId, isRepo: true });
    const existingMap = new Map(existingProjects.map(p => [p.repoName, p]));

    const activeRepoNames = new Set(repos.map(r => r.name));

    // Remove projects whose repositories have been deleted on GitHub
    for (const project of existingProjects) {
      if (!activeRepoNames.has(project.repoName)) {
        console.log(`[Auto Project Import] Removing deleted repository project: ${project.repoName}`);
        await Project.deleteOne({ _id: project._id });
      }
    }

    // Add or update repositories
    for (const repo of repos) {
      const existing = existingMap.get(repo.name);
      
      const techStack = [repo.language].filter(l => l && l !== 'Unknown');
      if (Array.isArray(repo.topics)) {
        repo.topics.forEach((t: string) => {
          if (!techStack.includes(t)) techStack.push(t);
        });
      }

      if (existing) {
        // Update stats and fields if not custom modified
        existing.stars = repo.stars || 0;
        existing.forks = repo.forks || 0;
        existing.deploymentProvider = repo.deploymentProvider || 'Source Only';
        existing.deploymentStatus = repo.hasDeployment ? 'Active' : '';
        if (!existing.liveUrl || existing.liveUrl === '') {
          existing.liveUrl = repo.homepage || '';
        }
        await existing.save();
      } else {
        // Create new project
        await Project.create({
          userId,
          title: repo.name,
          repoName: repo.name,
          isRepo: true,
          description: repo.description || `Public GitHub repository for ${repo.name}`,
          githubUrl: `https://github.com/${username}/${repo.name}`,
          liveUrl: repo.homepage || '',
          techStack,
          stars: repo.stars || 0,
          forks: repo.forks || 0,
          visibility: (repo.visibility && repo.visibility.toLowerCase() === 'public') ? 'public' : 'private',
          deploymentStatus: repo.hasDeployment ? 'Active' : '',
          deploymentProvider: repo.deploymentProvider || 'Source Only',
        });
      }
    }

    // Invalidate Cache
    await redisClient.del(`projects:${userId}`);
    getSocketIo().to(userId).emit('projects.synced', { success: true });
    console.log(`[Auto Project Import] Completed auto-import for user ${userId}.`);
  } catch (error: any) {
    console.error('[Auto Project Import Error]', error.message);
  }
};

/**
 * Handle manual project creation
 */
export const createProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId || req.body.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { title, description, githubUrl, liveUrl, techStack, screenshotUrl, visibility, featured, isRepo, repoName } = req.body;

    let uploadedScreenshotUrl = screenshotUrl || '';
    if (screenshotUrl && screenshotUrl.startsWith('data:')) {
      try {
        uploadedScreenshotUrl = await uploadBase64ToCloudinary(screenshotUrl, userId);
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
      }
    }

    const project = await Project.create({
      userId,
      title,
      description: description || '',
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      techStack: Array.isArray(techStack) ? techStack : (techStack ? techStack.split(',').map((s: string) => s.trim()) : []),
      screenshotUrl: uploadedScreenshotUrl,
      visibility: visibility || 'private',
      featured: featured || false,
      isRepo: isRepo || false,
      repoName: repoName || '',
    });

    await redisClient.del(`projects:${userId}`);
    getSocketIo().to(userId).emit('project.created', project);

    return res.status(201).json(new ApiResponse(201, project, 'Project created successfully'));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Fetch all projects for the owner
 */
export const getProjects = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const cached = await redisClient.get(`projects:${userId}`);
    if (cached) {
      return res.status(200).json(new ApiResponse(200, JSON.parse(cached), 'Projects fetched (cached)'));
    }

    const projects = await Project.find({ userId }).sort({ featured: -1, createdAt: -1 });
    await redisClient.set(`projects:${userId}`, JSON.stringify(projects), 'EX', 3600);

    return res.status(200).json(new ApiResponse(200, projects, 'Projects fetched'));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update an existing project
 */
export const updateProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    const { projectId } = req.params;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found or unauthorized' });
    }

    if (req.body.screenshotUrl && req.body.screenshotUrl.startsWith('data:')) {
      try {
        req.body.screenshotUrl = await uploadBase64ToCloudinary(req.body.screenshotUrl, userId);
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
      }
    }

    const fields = [
      'title', 'description', 'githubUrl', 'liveUrl', 'techStack', 
      'screenshotUrl', 'visibility', 'featured', 'deploymentStatus', 'deploymentProvider'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'techStack' && typeof req.body[field] === 'string') {
          project.techStack = req.body[field].split(',').map((s: string) => s.trim());
        } else {
          (project as any)[field] = req.body[field];
        }
      }
    });

    await project.save();
    await redisClient.del(`projects:${userId}`);
    getSocketIo().to(userId).emit('project.updated', project);

    return res.status(200).json(new ApiResponse(200, project, 'Project updated successfully'));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Toggle project visibility
 */
export const toggleVisibility = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    const { projectId } = req.params;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    project.visibility = project.visibility === 'public' ? 'private' : 'public';
    await project.save();

    await redisClient.del(`projects:${userId}`);
    getSocketIo().to(userId).emit('project.updated', project);

    return res.status(200).json(new ApiResponse(200, project, `Project visibility changed to ${project.visibility}`));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Toggle project featured status
 */
export const toggleFeatured = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    const { projectId } = req.params;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    project.featured = !project.featured;
    await project.save();

    await redisClient.del(`projects:${userId}`);
    getSocketIo().to(userId).emit('project.updated', project);

    return res.status(200).json(new ApiResponse(200, project, `Project featured state updated`));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a project
 */
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    const { projectId } = req.params;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const result = await Project.deleteOne({ _id: projectId, userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Project not found or unauthorized' });
    }

    await redisClient.del(`projects:${userId}`);
    getSocketIo().to(userId).emit('project.deleted', { projectId });

    return res.status(200).json(new ApiResponse(200, null, 'Project deleted successfully'));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Fetch public portfolio details by developer username
 */
export const getPublicPortfolio = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    // Find GitHub platform stats where username matches
    const githubStatsDoc = await PlatformStats.findOne({
      platform: 'github',
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    });

    if (!githubStatsDoc) {
      return res.status(404).json({ success: false, message: 'Developer portfolio not found.' });
    }

    const { userId } = githubStatsDoc;

    // Fetch related profiles
    const [profile, user, projects] = await Promise.all([
      Profile.findOne({ userId }),
      User.findOne({ clerkUserId: userId }),
      Project.find({ userId, visibility: 'public' }).sort({ featured: -1, createdAt: -1 })
    ]);

    const portfolioData = {
      username: githubStatsDoc.username,
      user: user ? {
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl || githubStatsDoc.stats?.avatar || '',
      } : {
        firstName: githubStatsDoc.stats?.name || githubStatsDoc.username,
        lastName: '',
        avatarUrl: githubStatsDoc.stats?.avatar || '',
      },
      profile: profile || {
        bio: githubStatsDoc.stats?.metadata?.extra?.bio || 'Open Source Contributor',
        location: githubStatsDoc.stats?.metadata?.extra?.location || '',
        socialLinks: { github: `https://github.com/${githubStatsDoc.username}` },
        publicSettings: { isPublic: true, showProjects: true, showSkills: true }
      },
      githubStats: githubStatsDoc.stats,
      projects
    };

    return res.status(200).json(new ApiResponse(200, portfolioData, 'Public portfolio fetched successfully'));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Trigger an explicit GitHub repo project synchronization
 */
export const syncGithubProjectsExplicit = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Find connected github profile
    const githubStatsDoc = await PlatformStats.findOne({ userId, platform: 'github' });
    if (!githubStatsDoc || !githubStatsDoc.username) {
      return res.status(400).json({ success: false, message: 'GitHub account is not connected.' });
    }

    const manager = FallbackManager.getInstance();
    const profile = await manager.resolveProfile('github', githubStatsDoc.username, true);
    
    // Auto import/sync
    const repos = profile?.metadata?.extra?.repositories || [];
    await syncGithubReposAsProjects(userId, githubStatsDoc.username, repos);

    const updatedProjects = await Project.find({ userId }).sort({ featured: -1, createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, updatedProjects, 'GitHub projects synchronized successfully'));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPublicProjects = async (req: Request, res: Response) => {
  try {
    const projects = await Project.aggregate([
      { $match: { visibility: 'public' } },
      { $sort: { featured: -1, createdAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'clerkUserId',
          as: 'userInfo'
        }
      },
      {
        $lookup: {
          from: 'platformstats',
          let: { uid: '$userId' },
          pipeline: [
            { $match: { $expr: { $and: [ { $eq: ['$userId', '$$uid'] }, { $eq: ['$platform', 'github'] } ] } } }
          ],
          as: 'githubInfo'
        }
      },
      {
        $project: {
          title: 1,
          userId: 1,
          repoName: 1,
          isRepo: 1,
          description: 1,
          githubUrl: 1,
          liveUrl: 1,
          techStack: 1,
          screenshotUrl: 1,
          visibility: 1,
          featured: 1,
          stars: 1,
          forks: 1,
          createdAt: 1,
          ratings: 1,
          author: {
            username: { $ifNull: [ { $arrayElemAt: ['$githubInfo.username', 0] }, 'developer' ] },
            name: { $concat: [ { $ifNull: [{ $arrayElemAt: ['$userInfo.firstName', 0] }, 'Developer'] }, ' ', { $ifNull: [{ $arrayElemAt: ['$userInfo.lastName', 0] }, ''] } ] },
            avatarUrl: { $ifNull: [ { $arrayElemAt: ['$userInfo.avatarUrl', 0] }, '' ] }
          }
        }
      }
    ]);

    return res.status(200).json(new ApiResponse(200, projects, 'All public projects fetched successfully'));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Add or update comment and rating for a project
 */
export const addProjectRating = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    const { projectId } = req.params;
    const { rating, comment, username, userAvatar } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Initialize ratings array if it doesn't exist
    if (!project.ratings) {
      project.ratings = [];
    }

    // Check if user already rated this project
    const existingIndex = project.ratings.findIndex((r: any) => r.userId === userId);
    if (existingIndex > -1) {
      // Update existing rating
      project.ratings[existingIndex].rating = rating;
      project.ratings[existingIndex].comment = comment || '';
      project.ratings[existingIndex].username = username || 'Anonymous';
      project.ratings[existingIndex].userAvatar = userAvatar || '';
      project.ratings[existingIndex].createdAt = new Date();
    } else {
      // Add new rating
      project.ratings.push({
        userId,
        username: username || 'Anonymous',
        userAvatar: userAvatar || '',
        rating,
        comment: comment || '',
        createdAt: new Date()
      } as any);
    }

    await project.save();

    // Clear project cache
    await redisClient.del(`projects:${project.userId}`);

    return res.status(200).json(new ApiResponse(200, project, 'Rating submitted successfully'));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

