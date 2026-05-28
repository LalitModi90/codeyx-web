"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, RefreshCw, FolderGit2, GitFork, Star, Users, 
  Code2, GitPullRequest, Activity, Layers, Rocket, Brain,
  ChevronLeft, ChevronRight, AlertCircle, ExternalLink,
  Calendar, Flame, Eye, BookOpen, ArrowUpRight
} from 'lucide-react';
import { animate } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { platformService } from '@/services/platform.service';
import TopNavbar from '../../../../components/shared/TopNavbar';

// ── Sub-Components ───────────────────────────────────────────────────────────
import GHProfileHeader    from '../../../../components/github/ProfileHeader';
import GHHeatmap          from '../../../../components/github/ContributionHeatmap';
import GHRepos            from '../../../../components/github/PinnedRepositories';
import GHRepoAnalytics    from '../../../../components/github/RepositoryAnalytics';
import GHTechStack        from '../../../../components/github/TechnologyStack';
import GHActivity         from '../../../../components/github/ActivityFeed';
import GHPullRequests     from '../../../../components/github/PullRequestAnalytics';
import GHOpenSource       from '../../../../components/github/OSSContributions';
import GHProjects         from '../../../../components/github/ProjectShowcase';
import GHDeployments      from '../../../../components/github/DeploymentAnalytics';
import GHAIInsights       from '../../../../components/github/AIInsights';

const getLanguageColor = (lang: string) => {
  const m: Record<string, string> = {
    TypeScript:'#3178c6', JavaScript:'#f1e05a', Python:'#3572A5',
    Go:'#00ADD8', Java:'#b07219', 'C++':'#f34b7d', Rust:'#dea584',
    HTML:'#e34c26', CSS:'#563d7c', Vue:'#41b883', Ruby:'#701516',
    'C#':'#178600', Dart:'#00B4AB', Shell:'#89e051', Swift:'#fa7343',
  };
  return m[lang] || '#8b949e';
};

const AnimatedCounter = ({ value, prefix = '' }: { value: number; prefix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const ctrl = animate(0, value, { duration: 1.4, ease: 'easeOut', onUpdate: v => setCount(Math.floor(v)) });
    return () => ctrl.stop();
  }, [value]);
  return <>{prefix}{count.toLocaleString()}</>;
};

const getLangColor = getLanguageColor;

const NAV_TABS = [
  { id: 'Overview',       icon: Home },
  { id: 'Repositories',   icon: FolderGit2 },
  { id: 'Contributions',  icon: Calendar },
  { id: 'Pull Requests',  icon: GitPullRequest },
  { id: 'Organizations',  icon: Users },
  { id: 'Activity',       icon: Activity },
  { id: 'Analytics',      icon: Layers },
];

export default function GitHubPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab]   = useState('Overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [gitHandle, setGitHandle]   = useState<string | null>(null);
  const [gitCache, setGitCache]     = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectInput, setConnectInput] = useState('');
  const [loading, setLoading]       = useState(true);
  const [syncing, setSyncing]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState('Never synced');

  const fetchData = async (userId: string) => {
    setLoading(true); setError(null);
    try {
      const res = await platformService.getPlatformStats('github', userId);
      const doc = res.data?.data || res.data;
      if (doc?.platform === 'github' && doc?.username) {
        setGitHandle(doc.username);
        setGitCache(doc);
        if (doc.lastSyncedAt) setLastSyncedTime(new Date(doc.lastSyncedAt).toLocaleString());
      } else { setGitHandle(null); }
    } catch (e: any) { setError('Unable to fetch GitHub data.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user?.id) fetchData(user.id); }, [user?.id]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectInput.trim() || !user?.id) return;
    setIsConnecting(true); setError(null);
    try {
      await platformService.connectPlatform(user.id, 'github', connectInput.trim());
      await fetchData(user.id);
    } catch (e: any) { setError(e.message || 'Failed to connect GitHub'); }
    finally { setIsConnecting(false); }
  };

  const handleSync = async () => {
    if (!gitHandle || !user?.id) return;
    setSyncing(true); setError(null);
    try {
      await platformService.syncPlatform('github', user.id);
      await fetchData(user.id);
      setLastSyncedTime(new Date().toLocaleString());
    } catch (e: any) { setError('Sync failed. Showing cached data.'); }
    finally { setSyncing(false); }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const extra       = useMemo(() => gitCache?.stats?.metadata?.extra || {}, [gitCache]);
  const repositories= useMemo(() => extra.repositories || [], [extra]);
  const heatmapRaw  = useMemo(() => extra.heatmap || [], [extra]);
  const languages   = useMemo(() => (extra.languages || []).map((l: any) => ({
    ...l, color: getLanguageColor(l.language)
  })), [extra]);
  const organizations = useMemo(() => extra.organizations || [], [extra]);
  const events      = useMemo(() => extra.events || [], [extra]);

  const profile = useMemo(() => {
    if (!gitCache) return null;
    return {
      avatarUrl:      gitCache.stats?.avatar || '',
      name:           gitCache.stats?.name   || gitCache.username,
      bio:            extra.bio              || 'Open Source Contributor',
      company:        extra.company          || '',
      location:       extra.location         || '',
      blog:           extra.blog             || '',
      publicRepos:    gitCache.totalSolved   || 0,
      followers:      gitCache.stats?.followers || 0,
      following:      extra.followingCount   || 0,
      totalStars:     extra.totalStars       || 0,
      totalForks:     extra.totalForks       || 0,
      commitsCount:   extra.commitsCount     || 0,
      prsCount:       extra.prsCount         || 0,
      issuesCount:    extra.issuesCount      || 0,
      totalContributions: extra.totalContributions || 0,
      streak:         gitCache.stats?.metadata?.streak || 0,
    };
  }, [gitCache, extra]);

  // ── Heatmap cells ─────────────────────────────────────────────────────────
  const calendarCells = useMemo(() => {
    const dateMap: Record<string, number> = {};
    heatmapRaw.forEach((d: any) => { dateMap[d.date] = d.count; });
    const cells = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      cells.push({ date: dateStr, count: dateMap[dateStr] || 0 });
    }
    return cells;
  }, [heatmapRaw]);

  return (
    <div className="min-h-screen bg-[#050816] text-[var(--text-main)] font-sans pb-20 overflow-x-hidden relative">
      {/* Grid bg */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#58a6ff04_1px,transparent_1px),linear-gradient(to_bottom,#58a6ff04_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/8 to-transparent blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-slate-500/6 to-transparent blur-[150px] rounded-full pointer-events-none" />

      <TopNavbar />

      <main className="max-w-[1680px] mx-auto px-4 md:px-6 pt-8 relative z-10">

        {/* ── SKELETON ── */}
        {loading && gitHandle && (
          <div className="flex flex-col gap-6 w-full animate-pulse mt-4">
            <div className="h-44 bg-[#161B22]/60 border border-[#30363D] rounded-3xl w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3 h-[500px] bg-[#161B22]/60 border border-[#30363D] rounded-3xl" />
              <div className="lg:col-span-9 h-[500px] bg-[#161B22]/60 border border-[#30363D] rounded-3xl" />
            </div>
          </div>
        )}

        {/* ── CONNECT CARD ── */}
        {!gitHandle && !loading && (
          <div className="flex items-center justify-center min-h-[75vh]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="max-w-md w-full p-8 rounded-3xl bg-[#0D1117]/90 border border-[#30363D] shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-44 h-44 bg-gradient-to-br from-[#58A6FF]/15 to-transparent rounded-full blur-2xl" />
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#58A6FF]/60 to-transparent" />
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#30363D] bg-[#161B22]">
                <FolderGit2 className="w-10 h-10 text-[#58A6FF]" />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-2 text-center">Connect GitHub</h2>
              <p className="text-xs text-gray-400 mb-7 leading-relaxed text-center">
                Import your real repositories, contribution graph, language analytics, and deployment showcase.
              </p>
              <form onSubmit={handleConnect} className="flex flex-col gap-3">
                <input
                  type="text"
                  value={connectInput}
                  onChange={e => setConnectInput(e.target.value)}
                  placeholder="Enter GitHub Username (e.g. torvalds)"
                  className="px-4 py-3 text-xs bg-white/[0.03] border border-[#30363D] rounded-xl focus:outline-none focus:border-[#58A6FF] focus:bg-[#58A6FF]/5 text-center tracking-wider font-bold transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full py-3 text-xs font-black tracking-wider uppercase rounded-xl bg-[#58A6FF] hover:bg-[#79B8FF] text-black flex items-center justify-center gap-2 transition-all"
                >
                  {isConnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : (
                    <><span>Link GitHub Portfolio</span><ArrowUpRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
                {error && <p className="text-[10px] text-red-400 font-bold text-center">{error}</p>}
              </form>
            </motion.div>
          </div>
        )}

        {/* ── SYNCING TOAST ── */}
        <AnimatePresence>
          {syncing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 right-6 bg-[#161B22] border border-[#58A6FF]/30 p-4 rounded-2xl flex items-center gap-3 shadow-2xl z-50 backdrop-blur-md"
            >
              <RefreshCw className="w-5 h-5 text-[#58A6FF] animate-spin" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-[#58A6FF] uppercase tracking-wider">Syncing GitHub analytics...</span>
                <span className="text-[9px] text-gray-500 mt-0.5">Updating repositories & contributions...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── DASHBOARD ── */}
        {!loading && gitHandle && profile && (
          <div className="space-y-6">

            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-[10px] text-amber-200 font-bold">{error}</span>
                </div>
                <button onClick={handleSync} className="px-2.5 py-1 text-[9px] font-black uppercase bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded border border-amber-500/30 transition-all">
                  Retry
                </button>
              </motion.div>
            )}

            {/* Profile Hero */}
            <GHProfileHeader
              profile={profile}
              username={gitHandle}
              syncing={syncing}
              onSync={handleSync}
              lastSyncedTime={lastSyncedTime}
            />

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* Sidebar */}
              <aside className={`lg:sticky lg:top-24 transition-all duration-300 ${sidebarCollapsed ? 'lg:col-span-1' : 'lg:col-span-2'}`}>
                <div className="bg-[#0D1117]/80 border border-[#30363D] rounded-3xl p-3 flex flex-col gap-1 backdrop-blur-md shadow-2xl">
                  <div className="flex items-center justify-between px-3 py-1.5 mb-1">
                    {!sidebarCollapsed && (
                      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Navigation</span>
                    )}
                    <button
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      className="ml-auto p-1 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all"
                    >
                      {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {NAV_TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      title={tab.id}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all duration-200 w-full text-left group ${
                        activeTab === tab.id
                          ? 'text-[#58A6FF] bg-[#58A6FF]/[0.06] border border-[#58A6FF]/20 shadow-[0_0_12px_rgba(88,166,255,0.05)]'
                          : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                      }`}
                    >
                      <tab.icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-[#58A6FF]' : 'text-gray-500'}`} />
                      {!sidebarCollapsed && <span>{tab.id}</span>}
                    </button>
                  ))}
                </div>
              </aside>

              {/* Main Content */}
              <div className={`${sidebarCollapsed ? 'lg:col-span-11' : 'lg:col-span-10'} space-y-6`}>

                {/* ── OVERVIEW ── */}
                {activeTab === 'Overview' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <GHHeatmap calendarCells={calendarCells} totalContributions={profile.totalContributions} streak={profile.streak} />
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <GHRepoAnalytics profile={profile} repositories={repositories} />
                      <GHTechStack languages={languages} />
                    </div>
                    <GHAIInsights profile={profile} languages={languages} repositories={repositories} />
                  </motion.div>
                )}

                {/* ── REPOSITORIES ── */}
                {activeTab === 'Repositories' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <GHProjects repositories={repositories} userId={user?.id} />
                  </motion.div>
                )}

                {/* ── CONTRIBUTIONS ── */}
                {activeTab === 'Contributions' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <GHHeatmap calendarCells={calendarCells} totalContributions={profile.totalContributions} streak={profile.streak} expanded />
                  </motion.div>
                )}

                {/* ── PULL REQUESTS ── */}
                {activeTab === 'Pull Requests' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <GHPullRequests prsCount={profile.prsCount} commitsCount={profile.commitsCount} issuesCount={profile.issuesCount} repositories={repositories} />
                  </motion.div>
                )}

                {/* ── ORGANIZATIONS ── */}
                {activeTab === 'Organizations' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <GHOpenSource organizations={organizations} repositories={repositories} profile={profile} />
                  </motion.div>
                )}

                {/* ── ACTIVITY ── */}
                {activeTab === 'Activity' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <GHActivity events={events} repositories={repositories} />
                  </motion.div>
                )}

                {/* ── ANALYTICS ── */}
                {activeTab === 'Analytics' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <GHTechStack languages={languages} expanded />
                    <GHDeployments repositories={repositories} />
                    <GHAIInsights profile={profile} languages={languages} repositories={repositories} />
                  </motion.div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* No data state */}
        {!loading && gitHandle && !profile && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <BookOpen className="w-12 h-12 text-[#58A6FF]/30" />
            <p className="text-sm font-bold text-gray-400">No GitHub data synced yet</p>
            <button onClick={handleSync} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#58A6FF] text-black text-xs font-black uppercase hover:bg-[#79B8FF] transition-all">
              <RefreshCw className="w-3.5 h-3.5" /><span>Sync Now</span>
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
