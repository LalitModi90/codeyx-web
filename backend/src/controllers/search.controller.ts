import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Contest } from '../models/Contest';
import { PlatformStats } from '../models/platformStats.model';
import { Project } from '../models/project.model';
import { clerkClient } from '@clerk/clerk-sdk-node';

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { query, type = 'all', limit = '5' } = req.query;
    const searchQuery = String(query || '').trim();
    const resultLimit = parseInt(String(limit), 10);

    if (!searchQuery) {
      return res.status(200).json({ success: true, data: { users: [], contests: [], projects: [] } });
    }

    // Build regex for case-insensitive partial match
    const regex = new RegExp(searchQuery, 'i');

    const results: any = {};

    // 1. Search Users (Search by Clerk fields + PlatformStats)
    if (type === 'all' || type === 'users') {
      const userResultsMap = new Map();

      // a) Native Clerk Search (Fetch and filter locally for perfect regex matching)
      try {
        const clerkResponse = await clerkClient.users.getUserList({ limit: 100 });
        const clerkUsers = Array.isArray(clerkResponse) ? clerkResponse : (clerkResponse as any).data ?? [];
        
        const matchedClerkUsers = clerkUsers.filter((u: any) => {
          const uName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
          const uEmail = u.emailAddresses?.[0]?.emailAddress || '';
          const uUsername = u.username || '';
          return regex.test(uName) || regex.test(uEmail) || regex.test(uUsername);
        });

        matchedClerkUsers.slice(0, resultLimit).forEach((u: any) => {
          const username = u.username || u.emailAddresses?.[0]?.emailAddress?.split('@')[0] || '';
          userResultsMap.set(u.id, {
            id: u.id,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || username || 'Coder',
            avatar: u.imageUrl || u.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
            type: 'user'
          });
        });
      } catch (clerkErr) {
        console.error('[Search API] Clerk user search error:', clerkErr);
      }

      // b) Fallback: Search by Connected Platform Usernames (e.g., LeetCode ID)
      if (userResultsMap.size < resultLimit) {
        const matchedStats = await PlatformStats.find({ username: regex }).limit(resultLimit);
        matchedStats.forEach(stat => {
          if (!userResultsMap.has(stat.userId)) {
            userResultsMap.set(stat.userId, {
              id: stat.userId,
              name: stat.username, // Use platform username as fallback name
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${stat.userId}`,
              type: 'user'
            });
          }
        });
      }

      results.users = Array.from(userResultsMap.values()).slice(0, resultLimit);
    }

    // 2. Search Contests (Search by contest name or platform site)
    if (type === 'all' || type === 'contests') {
      const contests = await Contest.find({
        $or: [
          { name: regex },
          { site: regex }
        ]
      })
      .select('_id name site startTime url')
      .sort({ startTime: 1 })
      .limit(resultLimit);

      results.contests = contests.map(c => ({
        id: c._id,
        name: c.name,
        platform: c.site,
        startTime: c.startTime,
        url: c.url,
        type: 'contest'
      }));
    }

    // 3. Search Projects (Search by title, description, or tech stack)
    if (type === 'all' || type === 'projects') {
      const projects = await Project.find({
        $or: [
          { title: regex },
          { description: regex },
          { techStack: { $in: [regex] } }
        ]
      })
      .select('_id title description techStack liveUrl')
      .limit(resultLimit);

      results.projects = projects.map(p => ({
        id: p._id,
        name: p.title,
        description: p.description,
        techStack: p.techStack,
        url: p.liveUrl || `/projects/${p._id}`,
        type: 'project'
      }));
    }

    return res.status(200).json({
      success: true,
      data: results
    });

  } catch (error: any) {
    console.error('[Search API Error]:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error during search' });
  }
};
