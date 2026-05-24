import { Request, Response } from 'express';


// In-memory cache to avoid hitting external APIs constantly
let cachedContests: any[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

export const getGlobalContests = async (req: Request, res: Response) => {
    try {
        const now = Date.now();
        if (cachedContests.length > 0 && (now - cacheTimestamp < CACHE_DURATION)) {
            console.log('Serving contests from cache');
            return res.json({ success: true, data: cachedContests });
        }

        console.log('Fetching contests from external APIs (Cache miss)');
        
        let kontestsData: any[] = [];
        try {
            const res1 = await fetch('https://kontests.net/api/v1/all');
            kontestsData = await res1.json();
        } catch (e: any) {
            console.error('Kontests API Error:', e.message);
        }

        let cfData: any[] = [];
        try {
            const res2 = await fetch('https://codeforces.com/api/contest.list?gym=false');
            const data2 = await res2.json();
            if (data2.status === 'OK') {
                cfData = data2.result;
            }
        } catch (e: any) {
            console.error('Codeforces API Error:', e.message);
        }

        const mergedContests: any[] = [];
        const seenNames = new Set();
        const currentDate = new Date();

        // Process Codeforces (High Reliability)
        cfData.forEach((c: any) => {
            if (seenNames.has(c.name)) return;
            seenNames.add(c.name);
            
            const startDate = new Date(c.startTimeSeconds * 1000);
            let status = 'Upcoming';
            if (c.phase === 'CODING') status = 'Live';
            else if (c.phase === 'FINISHED') status = 'Past';

            // Limit past contests to 30 days
            if (status === 'Past' && currentDate.getTime() - startDate.getTime() > 1000 * 60 * 60 * 24 * 30) return;

            mergedContests.push({
                name: c.name,
                plat: 'Codeforces',
                type: 'Rated',
                diff: c.name.includes('Div. 1') ? 'Hard' : c.name.includes('Div. 2') ? 'Medium' : 'Easy',
                diffColor: c.name.includes('Div. 1') ? 'text-rose-500' : c.name.includes('Div. 2') ? 'text-[#FF8A00]' : 'text-emerald-400',
                part: '-',
                date: startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                time: startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                iconColor: 'text-blue-500',
                status: status,
                isBookmarked: false,
                isMyContest: false,
                timestamp: startDate.getTime(),
                url: `https://codeforces.com/contest/${c.id}`
            });
        });

        // Process Kontests (Aggregator)
        kontestsData.forEach((c: any) => {
            if (seenNames.has(c.name)) return;
            seenNames.add(c.name);
            
            const startDate = new Date(c.start_time);
            const endDate = new Date(c.end_time);
            let status = 'Upcoming';
            if (c.status === 'CODING' || (currentDate >= startDate && currentDate <= endDate)) {
                status = 'Live';
            } else if (currentDate > endDate) {
                status = 'Past';
            }

            // Limit past contests to 30 days
            if (status === 'Past' && currentDate.getTime() - startDate.getTime() > 1000 * 60 * 60 * 24 * 30) return;

            let plat = c.site;
            let iconColor = 'text-gray-400';
            let diffColor = 'text-[#FF8A00]';
            if (plat.toLowerCase().includes('leetcode')) { iconColor = 'text-yellow-500'; diffColor = 'text-emerald-400'; }
            if (plat.toLowerCase().includes('codechef')) { iconColor = 'text-[#FF8A00]'; diffColor = 'text-rose-500'; }
            if (plat.toLowerCase().includes('atcoder')) { iconColor = 'text-gray-300'; diffColor = 'text-[#FF8A00]'; }
            if (plat.toLowerCase().includes('hacker')) { iconColor = 'text-emerald-500'; diffColor = 'text-emerald-400'; }

            mergedContests.push({
                name: c.name,
                plat: plat,
                type: 'Contest',
                diff: plat.toLowerCase().includes('leetcode') ? 'Easy' : 'Medium',
                diffColor: diffColor,
                part: '-',
                date: startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                time: startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                iconColor: iconColor,
                status: status,
                isBookmarked: false,
                isMyContest: false,
                timestamp: startDate.getTime(),
                url: c.url
            });
        });

        // Sort by relevance (Live -> Upcoming -> Past)
        mergedContests.sort((a, b) => {
           if (a.status === 'Live' && b.status !== 'Live') return -1;
           if (b.status === 'Live' && a.status !== 'Live') return 1;
           if (a.status === 'Upcoming' && b.status === 'Upcoming') return a.timestamp - b.timestamp;
           if (a.status === 'Past' && b.status === 'Past') return b.timestamp - a.timestamp;
           if (a.status === 'Upcoming' && b.status === 'Past') return -1;
           return 1;
        });

        // Update Cache
        cachedContests = mergedContests;
        cacheTimestamp = now;

        return res.json({ success: true, data: mergedContests });
    } catch (error: any) {
        console.error("Global contests fetch error:", error.message);
        res.status(500).json({ success: false, message: 'Server Error while fetching contests' });
    }
};

let kontestCache: any = null;
let kontestCacheTime = 0;

import { redis } from '../utils/redis';
import { Contest } from '../models/Contest';
import { fetchAndStoreContests } from '../services/contest.service';

export const getUpcomingContests = async (req: Request, res: Response) => {
    try {
        // 1. Try fetching from Redis Cache
        const cachedData = await redis.get('contests_upcoming');
        if (cachedData) {
            const parsed = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
            if (Array.isArray(parsed) && parsed.length > 0) {
                console.log('Serving upcoming contests from Redis cache');
                return res.json({ success: true, data: parsed });
            }
        }

        console.log('Cache miss: Fetching from MongoDB...');
        // 2. Try fetching from MongoDB
        let contests = await Contest.find().sort({ startTime: 1 }).lean();
        
        // 3. If MongoDB is empty (First run), trigger manual fetch
        if (!contests || contests.length === 0) {
            console.log('MongoDB empty: Triggering background fetch service...');
            const freshData = await fetchAndStoreContests();
            if (freshData && freshData.length > 0) {
                contests = freshData as any;
            } else {
                return res.status(503).json({ success: false, message: 'Service Unavailable. APIs failed.' });
            }
        }

        // 4. Update Redis Cache (Cache for 2 hours)
        await redis.set('contests_upcoming', JSON.stringify(contests));
        await redis.expire('contests_upcoming', 2 * 60 * 60);

        return res.json({ success: true, data: contests });

    } catch (error: any) {
        console.error("Contests API error:", error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch contests' });
    }
};
