import { Request, Response } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { PlatformStats } from '../models/platformStats.model';
import { Profile } from '../models/profile.model';

// ─── Helper: compute radar axes and weighted Codeyx Score ────────────────────
function buildUserEntry(clerkUser: any, userStats: any[], userProfile?: any) {
    let totalSolved = 0;
    let combinedRating = 0;
    let contestsCount = 0;
    const platformBreakdown: Record<string, { rating: number; solved: number; contests: number }> = {};

    userStats.forEach((s: any) => {
        const pRating  = s.rating     || 0;
        const pSolved  = s.totalSolved || 0;
        let   pContests = 0;

        totalSolved     += pSolved;
        combinedRating  += pRating;

        if (s.stats) {
            if (s.platform === 'leetcode') {
                if (s.stats.contestAttend !== undefined) {
                    pContests = s.stats.contestAttend;
                } else if (s.stats.raw && s.stats.raw.userContestRankingHistory) {
                    const history = s.stats.raw.userContestRankingHistory || [];
                    pContests = history.filter((c: any) => c.attended === true || c.rating > 0).length;
                } else if (Array.isArray(s.stats.contests)) {
                    pContests = s.stats.contests.length;
                }
            }
            else if (s.platform === 'codeforces' && s.stats.ratingCount)    pContests = s.stats.ratingCount;
            else if (s.platform === 'codechef'   && s.stats.contests)       pContests = Array.isArray(s.stats.contests) ? s.stats.contests.length : (parseInt(s.stats.contests) || 0);
        }
        contestsCount += pContests;

        platformBreakdown[s.platform] = { rating: pRating, solved: pSolved, contests: pContests };
    });

    if (contestsCount === 0 && totalSolved > 0) contestsCount = Math.ceil(totalSolved / 25);

    // ── 5 Radar Axes (0–100) ───────────────────────────────────────────────
    const maxRating   = 10000;
    const maxSolved   = 3000;
    const maxContests = 500;

    const problemSolving = Math.min(100, Math.round((totalSolved   / maxSolved)   * 100));
    const contestAxis    = Math.min(100, Math.round((combinedRating / maxRating)   * 100));
    const speed          = Math.min(100, Math.round(40 + (totalSolved / 100)));
    const accuracy       = Math.min(100, Math.round(50 + (combinedRating / 200)));
    const consistency    = Math.min(100, Math.round(((contestsCount / maxContests) * 100) + 20));

    // ── Weighted Codeyx Score (primary rank metric, 0–100) ─────────────────
    // Contest Rating/Ranking (45% - Absolute Highest Weight!) | Problem Solving (25%) | Accuracy (15%) | Consistency (10%) | Speed (5%)
    const codeyxScore = Math.round(
        contestAxis    * 0.45 +
        problemSolving * 0.25 +
        accuracy       * 0.15 +
        consistency    * 0.10 +
        speed          * 0.05
    );

    const hasConnected = Object.keys(platformBreakdown).length > 0;
    const hasData      = hasConnected && (totalSolved > 0 || combinedRating > 0);

    // Friendly display name from Clerk user object
    const firstName = clerkUser.firstName || '';
    const lastName  = clerkUser.lastName  || '';
    const fullName  = `${firstName} ${lastName}`.trim();
    const email     = (clerkUser.emailAddresses?.[0]?.emailAddress) || '';
    const username  = clerkUser.username || email.split('@')[0] || clerkUser.id;
    const avatarUrl = clerkUser.imageUrl || clerkUser.profileImageUrl || '';

    const isPublic = userProfile?.publicSettings?.isPublic !== false;

    return {
        userId:    clerkUser.id,
        username,
        user:      fullName || username,
        rating:    codeyxScore,
        rawCombinedRating: combinedRating,
        problems:  totalSolved,
        contests:  contestsCount,
        winRate:   totalSolved > 0 ? Math.min(85, Math.round(50 + (totalSolved / 100))) : 0,
        avatarUrl,
        isVerified: false,          // extend with premium check later
        hasConnected,
        hasData,
        isPublic,
        college:   userProfile?.college || '',
        platformBreakdown,
        radarStats: hasData ? { problemSolving, speed, accuracy, consistency, contest: contestAxis } : null,
    };
}

// ─── GET /api/leaderboard ────────────────────────────────────────────────────
export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        // 1. Fetch ALL Clerk users (source of truth)
        const clerkResponse = await clerkClient.users.getUserList({ limit: 500 });
        const clerkUsers = Array.isArray(clerkResponse) ? clerkResponse : (clerkResponse as any).data ?? clerkResponse;

        if (!clerkUsers || clerkUsers.length === 0) {
            return res.json({ success: true, data: [] });
        }

        // 2. Fetch ALL platform stats from DB
        const allStats = await PlatformStats.find().lean();
        const statsByUser: Record<string, any[]> = {};
        allStats.forEach((s: any) => {
            if (!statsByUser[s.userId]) statsByUser[s.userId] = [];
            statsByUser[s.userId].push(s);
        });

        // Fetch ALL profiles from DB
        const allProfiles = await Profile.find().lean();
        const profilesByUser: Record<string, any> = {};
        allProfiles.forEach((p: any) => {
            profilesByUser[p.userId] = p;
        });

        // 3. Build leaderboard entries for every Clerk user
        const leaderboardData = clerkUsers.map((cu: any) =>
            buildUserEntry(cu, statsByUser[cu.id] || [], profilesByUser[cu.id])
        );

        // 4. Only keep users who have at least one connected platform
        const activeUsers = leaderboardData.filter((u: any) => u.hasConnected);

        // 5. Sort: highest codeyxScore first; ties broken by problems solved
        activeUsers.sort((a: any, b: any) => {
            if (b.rating !== a.rating) return b.rating - a.rating;
            return b.problems - a.problems;
        });

        // 6. Assign rank badges
        const rankedUsers = activeUsers.map((item: any, index: number) => {
            const rank = index + 1;
            let badge = 'shield', badgeColor = 'text-blue-500';
            if      (rank === 1) { badge = 'crown';   badgeColor = 'text-yellow-500'; }
            else if (rank === 2) { badge = 'crown';   badgeColor = 'text-purple-500'; }
            else if (rank === 3) { badge = 'crown';   badgeColor = 'text-[#FF8A00]'; }
            else if (rank <= 6)  { badge = 'diamond'; badgeColor = 'text-emerald-500'; }
            return { ...item, rank, badge, badgeColor };
        });

        return res.json({ success: true, data: rankedUsers });
    } catch (err: any) {
        console.error('Leaderboard Fetch Error:', err.message);
        return res.status(500).json({ success: false, message: 'Server Error fetching leaderboard' });
    }
};

// ─── GET /api/leaderboard/user/:userId ───────────────────────────────────────
export const getUserLeaderboardProfile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // Fetch user directly from Clerk (always up to date)
        const clerkUser = await clerkClient.users.getUser(userId as string);
        if (!clerkUser) return res.status(404).json({ success: false, message: 'User not found' });

        const stats = await PlatformStats.find({ userId }).lean();
        const userProfile = await Profile.findOne({ userId }).lean();
        const entry = buildUserEntry(clerkUser, stats, userProfile);
        return res.json({ success: true, data: entry });
    } catch (err: any) {
        console.error('User Leaderboard Profile Error:', err.message);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ─── GET /api/leaderboard/debug ──────────────────────────────────────────────
export const debugLeaderboard = async (req: Request, res: Response) => {
    try {
        const clerkResponse = await clerkClient.users.getUserList({ limit: 100 });
        const clerkUsers = Array.isArray(clerkResponse) ? clerkResponse : (clerkResponse as any).data ?? clerkResponse;

        const stats = await PlatformStats.find({}, 'userId platform username totalSolved rating').lean();

        const clerkIds    = clerkUsers.map((u: any) => u.id);
        const statUserIds = [...new Set(stats.map((s: any) => s.userId))];
        const matched     = statUserIds.filter(id => clerkIds.includes(id));
        const unmatched   = statUserIds.filter(id => !clerkIds.includes(id));

        return res.json({
            success: true,
            clerkUsers: clerkUsers.map((u: any) => ({
                id: u.id,
                name: `${u.firstName} ${u.lastName}`,
                email: u.emailAddresses?.[0]?.emailAddress,
                username: u.username,
            })),
            platformStats: stats,
            matchedUserIds: matched,
            unmatchedStatUserIds: unmatched,
            summary: `${clerkUsers.length} Clerk users | ${stats.length} platform stats | ${unmatched.length} orphan stats`,
        });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
