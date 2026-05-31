import { Request, Response } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { PlatformStats } from '../models/platformStats.model';
import { Profile } from '../models/profile.model';
import { User } from '../models/user.model';

// ─── Helper: compute radar axes and weighted Codeyx Score ────────────────────
function buildUserEntry(clerkUser: any, userStats: any[], userProfile?: any) {
    let totalSolved = 0;
    let combinedRating = 0;
    let contestsCount = 0;
    let highestStreak = 0;
    const platformBreakdown: Record<string, { rating: number; solved: number; contests: number }> = {};

    userStats.forEach((s: any) => {
        const pRating  = s.rating     || 0;
        const pSolved  = s.totalSolved || 0;
        let   pContests = 0;

        // We only sum up specific external platforms for totalSolved/combinedRating to avoid double counting
        // since 'codeyx' platform tracks the aggregate overall platform activity.
        if (s.platform !== 'codeyx' && s.platform !== 'github') {
            totalSolved     += pSolved;
            combinedRating  += pRating;
        }

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
            
            if (s.stats.streak && s.stats.streak > highestStreak) {
                highestStreak = s.stats.streak;
            }
        }
        contestsCount += pContests;

        platformBreakdown[s.platform] = { rating: pRating, solved: pSolved, contests: pContests };
    });

    if (contestsCount === 0 && totalSolved > 0) contestsCount = Math.ceil(totalSolved / 25);

    // ── 1. Competitive Programming Score (Max 80 points) ───────────────────
    const maxRating   = 3000;  // Adjusted from 10000 to 3000 (standard high rating)
    const maxSolved   = 1000;  // Adjusted from 3000 to 1000
    const maxContests = 100;   // Adjusted from 500 to 100

    // Rating is heavily weighted
    const contestRatingScore = Math.min(40, (combinedRating / maxRating) * 40); // 40%
    
    // Solved problems 
    const problemsSolvedScore = Math.min(25, (totalSolved / maxSolved) * 25); // 25%
    
    // Accuracy scales slightly with how many problems they solved (shows they maintain accuracy over time)
    const accuracyScore = Math.min(10, (Math.min(totalSolved, 200) / 200) * 10); // 10%
    
    // Consistency scales with contests
    const consistencyScore = Math.min(3, (contestsCount / maxContests) * 3); // 3%
    
    // Speed proxy: assuming more contests = better speed
    const speedScore = Math.min(2, (Math.min(contestsCount, 50) / 50) * 2); // 2%

    const competitiveScore = contestRatingScore + problemsSolvedScore + accuracyScore + consistencyScore + speedScore;

    // ── 2. Developer Engineering & Reputation Score (Max 20 points) ─────────────────────
    const githubData = userStats.find(s => s.platform === 'github');
    const repos = githubData?.stats?.repos || 0;
    const stars = githubData?.stats?.totalStars || 0;
    
    const githubContributions = Math.min(7, (repos / 20) * 7); // up to 7 pts for 20+ repos
    const openSourceActivity = Math.min(5, (stars / 50) * 5); // up to 5 pts for 50+ stars
    const liveProjects = (userProfile?.projects?.length || 0) > 0 ? 5 : 0; // currently 0 since not fetched
    const portfolioQuality = (userProfile?.bio?.length || 0) > 20 ? 3 : 0; // up to 3 pts for good bio

    const developerScore = githubContributions + openSourceActivity + liveProjects + portfolioQuality;

    // ── Final Global Codeyx Score (0-100) ──────────────────────────────────
    const codeyxScore = Math.round(competitiveScore + developerScore);

    // Old Radar Stats (Mapping for frontend compatibility)
    const problemSolving = Math.min(100, Math.round((problemsSolvedScore / 20) * 100));
    const contestAxis    = Math.min(100, Math.round((contestRatingScore / 35) * 100));
    const speed          = Math.min(100, Math.round((speedScore / 2) * 100));
    const accuracy       = Math.min(100, Math.round((accuracyScore / 10) * 100));
    const consistency    = Math.min(100, Math.round((consistencyScore / 3) * 100));

    const externalPlatforms = Object.keys(platformBreakdown).filter(p => p !== 'codeyx');
    const hasConnected = externalPlatforms.length > 0;
    const hasData      = hasConnected && (totalSolved > 0 || combinedRating > 0);

    // Friendly display name: prioritize Mongoose profile name, fallback to Clerk
    const firstName = clerkUser.firstName || '';
    const lastName  = clerkUser.lastName  || '';
    const clerkFullName = `${firstName} ${lastName}`.trim();
    const fullName  = userProfile?.name || clerkFullName || 'Anonymous Developer';
    
    const email     = (clerkUser.emailAddresses?.[0]?.emailAddress) || '';
    const emailPrefix = email ? email.split('@')[0] : null;
    
    // Strict DB username check with email prefix fallback
    const username = userProfile?.username || clerkUser.username || emailPrefix || null;
    const avatarUrl = clerkUser.imageUrl || clerkUser.profileImageUrl || '';

    const isPublic = userProfile?.publicSettings?.isPublic !== false;

    return {
        userId:    clerkUser.id,
        username,
        user:      fullName || username,
        rating:    codeyxScore,
        rawCombinedRating: combinedRating,
        problems:  totalSolved,
        streak:    highestStreak,
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
        const rawLeaderboardData = clerkUsers.map((cu: any) =>
            buildUserEntry(cu, statsByUser[cu.id] || [], profilesByUser[cu.id])
        );

        // Pass 2: Finalize usernames without any automatic changing/shifting
        const leaderboardData = rawLeaderboardData.map((u: any) => {
            const profile = profilesByUser[u.userId];
            if (profile?.username) {
                u.username = profile.username;
            }
            // If profile.username doesn't exist, it already has the default emailPrefix from buildUserEntry
            // We intentionally do NOT run any deduplication or shifting logic here as per user request.
            return u;
        });

        // 4. Only keep users who have at least one connected platform (Stats are required)
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

        // Fetch user directly from local DB for speed, fallback to Clerk if missing
        let clerkUser: any = await User.findOne({ clerkUserId: userId }).lean();
        
        if (!clerkUser) {
            const rawUser = await clerkClient.users.getUser(userId as string);
            if (!rawUser) return res.status(404).json({ success: false, message: 'User not found' });
            clerkUser = {
                id: rawUser.id,
                firstName: rawUser.firstName,
                lastName: rawUser.lastName,
                emailAddresses: rawUser.emailAddresses,
                username: rawUser.username,
                imageUrl: rawUser.imageUrl,
            };
        } else {
            clerkUser = {
                id: clerkUser.clerkUserId,
                firstName: clerkUser.firstName,
                lastName: clerkUser.lastName,
                emailAddresses: [{ emailAddress: clerkUser.email }],
                username: clerkUser.username,
                imageUrl: clerkUser.avatarUrl,
            };
        }

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
