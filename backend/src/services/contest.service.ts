import { withRetry } from '../utils/retry';
import { Contest } from '../models/Contest';

export const fetchAndStoreContests = async () => {
    console.log('[Cron] Fetching latest contests...');
    const mergedContests: any[] = [];
    const seenUrls = new Set();
    const currentDate = new Date();

    const addContest = (contest: any) => {
        if (!contest.url || seenUrls.has(contest.url)) return;
        if (isNaN(contest.startTime.getTime())) return;
        
        // Include upcoming, live, and past contests (up to 30 days old)
        const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (contest.startTime >= thirtyDaysAgo) {
            seenUrls.add(contest.url);
            mergedContests.push(contest);
        }
    };

    // Helper for timeout with fetch
    const fetchWithTimeout = async (url: string, options: any = {}, timeoutMs = 5000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    };

    // 1. Fetch Kontests API (Aggregator)
    try {
        const fetchKontests = async () => {
            const data = await fetchWithTimeout('https://kontests.net/api/v1/all');
            if (!data || !Array.isArray(data)) throw new Error('Invalid response');
            return data;
        };
        const kData = await withRetry(fetchKontests, 2, 1000);
        kData.forEach((c: any) => {
            addContest({
                name: c.name,
                site: c.site || 'Unknown',
                startTime: new Date(c.start_time),
                endTime: new Date(c.end_time),
                duration: c.duration || '',
                url: c.url,
                status: c.status === 'CODING' ? 'CODING' : 'BEFORE'
            });
        });
    } catch (err: any) {
        console.error('[Cron] Kontests API failed:', err.message);
    }

    // 2. Fetch Codeforces (Official API)
    try {
        const fetchCF = async () => {
            const data = await fetchWithTimeout('https://codeforces.com/api/contest.list?gym=false');
            if (!data || data.status !== 'OK') throw new Error('Invalid CF response');
            return data.result;
        };
        const cfData = await withRetry(fetchCF, 2, 1000);
        cfData.forEach((c: any) => {
            const startTime = new Date(c.startTimeSeconds * 1000);
            const endTime = new Date((c.startTimeSeconds + c.durationSeconds) * 1000);
            addContest({
                name: c.name,
                site: 'Codeforces',
                startTime,
                endTime,
                duration: c.durationSeconds.toString(),
                url: `https://codeforces.com/contest/${c.id}`,
                status: c.phase === 'CODING' ? 'CODING' : 'BEFORE'
            });
        });
    } catch (err: any) {
        console.error('[Cron] Codeforces API failed:', err.message);
    }

    // 3. Fetch LeetCode (GraphQL)
    try {
        const fetchLC = async () => {
            const query = `query { allContests { title titleSlug startTime duration isVirtual } }`;
            const data = await fetchWithTimeout('https://leetcode.com/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            return data.data.allContests;
        };
        const lcData = await withRetry(fetchLC, 2, 1000);
        lcData.forEach((c: any) => {
            if (c.isVirtual) return; // Skip virtuals
            const startTime = new Date(c.startTime * 1000);
            const endTime = new Date((c.startTime + c.duration) * 1000);
            const status = (currentDate >= startTime && currentDate <= endTime) ? 'CODING' : 'BEFORE';
            addContest({
                name: c.title,
                site: 'LeetCode',
                startTime,
                endTime,
                duration: c.duration.toString(),
                url: `https://leetcode.com/contest/${c.titleSlug}`,
                status
            });
        });
    } catch (err: any) {
        console.error('[Cron] LeetCode API failed:', err.message);
    }

    // 4. Fetch CodeChef (Official JSON API)
    try {
        const fetchCC = async () => {
            const data = await fetchWithTimeout(
                'https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=premium',
                {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CodeyxBot',
                        'Accept': 'application/json'
                    }
                }
            );
            if (!data || data.status === 'error') throw new Error('Invalid CodeChef response');
            return data;
        };
        const ccData = await withRetry(fetchCC, 2, 1000);
        const allCC = [...(ccData.present_contests || []), ...(ccData.future_contests || [])];
        allCC.forEach((c: any) => {
            const startStr = c.contest_start_date_iso || c.contest_start_date;
            const endStr = c.contest_end_date_iso || c.contest_end_date;
            const startTime = new Date(startStr);
            const endTime = new Date(endStr);
            const status = (currentDate >= startTime && currentDate <= endTime) ? 'CODING' : 'BEFORE';
            
            addContest({
                name: c.contest_name,
                site: 'CodeChef',
                startTime,
                endTime,
                duration: (c.contest_duration * 60).toString(),
                url: `https://www.codechef.com/${c.contest_code}`,
                status
            });
        });
    } catch (err: any) {
        console.error('[Cron] CodeChef API failed:', err.message);
    }

    // 5. Fetch AtCoder (Kenkoooo JSON API)
    try {
        const fetchAC = async () => {
            const data = await fetchWithTimeout('https://kenkoooo.com/atcoder/resources/contests.json');
            if (!data || !Array.isArray(data)) throw new Error('Invalid AtCoder response');
            return data;
        };
        const acData = await withRetry(fetchAC, 2, 1000);
        acData.forEach((c: any) => {
            const startTime = new Date(c.start_epoch_second * 1000);
            const endTime = new Date((c.start_epoch_second + c.duration_second) * 1000);
            const status = (currentDate >= startTime && currentDate <= endTime) ? 'CODING' : 'BEFORE';
            
            addContest({
                name: c.title,
                site: 'AtCoder',
                startTime,
                endTime,
                duration: c.duration_second.toString(),
                url: `https://atcoder.jp/contests/${c.id}`,
                status
            });
        });
    } catch (err: any) {
        console.error('[Cron] AtCoder API failed:', err.message);
    }

    // Sort all merged contests by nearest
    mergedContests.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    if (mergedContests.length > 0) {
        try {
            await Contest.deleteMany({});
            await Contest.insertMany(mergedContests);
            console.log(`[Cron] Successfully stored ${mergedContests.length} contests in DB.`);
        } catch (dbErr: any) {
            console.error('[Cron] DB Storage failed:', dbErr.message);
        }
        return mergedContests;
    } else {
        console.warn('[Cron] No contests found across any APIs!');
        return [];
    }
};
