import { Request, Response } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { PlatformStats } from '../models/platformStats.model';
import { Profile } from '../models/profile.model';
import { User } from '../models/user.model';
import { getSocketIo } from '../socket';

// ─── Helper: compute radar axes and weighted Codeyx Score ─────────────────
// Codeyx Score (0-100) = Competitive Score (70pts) + Developer Score (30pts)
function buildUserEntry(clerkUser: any, userStats: any[], userProfile?: any) {
    let totalSolved = 0;
    let leetcodeRating = 0;
    let codeforcesRating = 0;
    let codechefRating = 0;
    let contestsCount = 0;
    let highestStreak = 0;
    const platformBreakdown: Record<string, { rating: number; solved: number; contests: number }> = {};

    userStats.forEach((s: any) => {
        const pRating  = s.rating     || 0;
        const pSolved  = s.totalSolved || 0;
        let   pContests = 0;

        if (s.platform === 'leetcode') {
            leetcodeRating = pRating;
            totalSolved += pSolved;
            if (s.stats?.contestAttend !== undefined) {
                pContests = s.stats.contestAttend;
            } else if (s.stats?.raw?.userContestRankingHistory) {
                pContests = (s.stats.raw.userContestRankingHistory || []).filter((c: any) => c.attended === true || c.rating > 0).length;
            } else if (Array.isArray(s.stats?.contests)) {
                pContests = s.stats.contests.length;
            }
        } else if (s.platform === 'codeforces') {
            codeforcesRating = pRating;
            totalSolved += pSolved;
            pContests = s.stats?.ratingCount || 0;
        } else if (s.platform === 'codechef') {
            codechefRating = pRating;
            totalSolved += pSolved;
            pContests = Array.isArray(s.stats?.contests) ? s.stats.contests.length : (parseInt(s.stats?.contests) || 0);
        }
        // github and codeyx don't add to competitive score

        if (s.stats?.streak && s.stats.streak > highestStreak) {
            highestStreak = s.stats.streak;
        }

        contestsCount += pContests;
        platformBreakdown[s.platform] = { rating: pRating, solved: pSolved, contests: pContests };
    });

    // ── 1. COMPETITIVE SCORE (0-70 pts) ─────────────────────────────────────
    // LeetCode Rating: 0-3500 → 0-20 pts
    const lcScore   = Math.min(20, (leetcodeRating / 3500) * 20);
    // Codeforces Rating: 0-3500 → 0-20 pts  
    const cfScore   = Math.min(20, (codeforcesRating / 3500) * 20);
    // CodeChef Rating: 0-3500 → 0-10 pts
    const ccScore   = Math.min(10, (codechefRating / 3500) * 10);
    // Problems Solved: 0-2000 → 0-15 pts
    const solvedScore = Math.min(15, (totalSolved / 2000) * 15);
    // Contests Participated: 0-200 → 0-5 pts
    const contestScore = Math.min(5, (contestsCount / 200) * 5);

    const competitiveScore = lcScore + cfScore + ccScore + solvedScore + contestScore;

    // ── 2. DEVELOPER SCORE (0-30 pts) ────────────────────────────────────────
    const githubData = userStats.find(s => s.platform === 'github');
    const repos  = githubData?.stats?.repos || 0;
    const stars  = githubData?.stats?.totalStars || 0;
    const commits = githubData?.stats?.totalCommits || githubData?.stats?.contributions || 0;

    // Repos: 0-50 → 0-10 pts
    const repoScore    = Math.min(10, (repos / 50) * 10);
    // Stars: 0-100 → 0-8 pts
    const starScore    = Math.min(8, (stars / 100) * 8);
    // Commits: 0-500 → 0-7 pts
    const commitScore  = Math.min(7, (commits / 500) * 7);
    // Profile quality: bio + college → 0-5 pts
    const bioScore     = (userProfile?.bio?.length || 0) > 20 ? 3 : 0;
    const collegeScore = (userProfile?.college?.length || 0) > 2 ? 2 : 0;

    const developerScore = repoScore + starScore + commitScore + bioScore + collegeScore;

    // ── FINAL CODEYX SCORE (0-100) ────────────────────────────────────────────
    const codeyxScore = Math.min(100, Math.round(competitiveScore + developerScore));

    // ── RADAR STATS (normalized 0-100 for each axis) ─────────────────────────
    const combinedRating = leetcodeRating + codeforcesRating + codechefRating;
    const problemSolving = Math.min(100, Math.round((totalSolved / 2000) * 100));
    const contestAxis    = Math.min(100, Math.round((combinedRating / 7000) * 100));
    const speed          = Math.min(100, Math.round((contestsCount / 100) * 100));
    const accuracy       = Math.min(100, Math.round((Math.max(leetcodeRating, codeforcesRating, codechefRating) / 3500) * 100));
    const consistency    = Math.min(100, Math.round((highestStreak / 365) * 100));

    const externalPlatforms = Object.keys(platformBreakdown).filter(p => p !== 'codeyx');
    const hasConnected = externalPlatforms.length > 0;
    // hasData: true if any competitive platform data OR github has repos/commits
    const githubHasData = (repos > 0 || stars > 0 || commits > 0);
    const hasData = hasConnected && (totalSolved > 0 || combinedRating > 0 || githubHasData);

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
            // Ensure username is never null. Fallback to a default name.
            if (!u.username) {
                // If email prefix failed, use a part of their user ID
                u.username = `user_${u.userId.substring(u.userId.length - 6)}`;
            }
            return u;
        });

        // 4. Sort purely by Codeyx Score (highest first)
        // Users with no data have score=0 → naturally go to bottom
        leaderboardData.sort((a: any, b: any) => {
            if (b.rating !== a.rating) return b.rating - a.rating;       // Score DESC
            if (b.problems !== a.problems) return b.problems - a.problems; // Tie: problems DESC
            return b.rawCombinedRating - a.rawCombinedRating;             // Tie: rating DESC
        });

        // 5. Assign rank badges
        const rankedUsers = leaderboardData.map((item: any, index: number) => {
            const rank = index + 1;
            let badge = 'shield', badgeColor = 'text-blue-500';
            if      (rank === 1) { badge = 'crown';   badgeColor = 'text-yellow-500'; }
            else if (rank === 2) { badge = 'crown';   badgeColor = 'text-purple-500'; }
            else if (rank === 3) { badge = 'crown';   badgeColor = 'text-[#FF8A00]'; }
            else if (rank <= 6)  { badge = 'diamond'; badgeColor = 'text-emerald-500'; }
            return { ...item, rank, badge, badgeColor };
        });

        // 6. Broadcast via Socket.io so all connected clients get real-time update
        try {
            const socketIo = getSocketIo();
            socketIo.emit('leaderboard_updated', { data: rankedUsers, updatedAt: new Date().toISOString() });
        } catch (_) { /* socket not ready, ignore */ }

        return res.json({ success: true, data: rankedUsers, updatedAt: new Date().toISOString() });
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
