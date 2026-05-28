"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, Globe, Star, GitFork, Users, Code2, 
  MapPin, LinkIcon, Flame, ExternalLink, Calendar,
  ArrowUpRight, LayoutGrid, CheckCircle, Info, Sparkles, BookOpen
} from 'lucide-react';
import { projectService } from '@/services/project.service';
import TopNavbar from '@/components/shared/TopNavbar';

interface Cell { date: string; count: number; }

const getLanguageColor = (lang: string) => {
  const m: Record<string, string> = {
    TypeScript:'#3178c6', JavaScript:'#f1e05a', Python:'#3572A5',
    Go:'#00ADD8', Java:'#b07219', 'C++':'#f34b7d', Rust:'#dea584',
    HTML:'#e34c26', CSS:'#563d7c', Vue:'#41b883', Ruby:'#701516',
    'C#':'#178600', Dart:'#00B4AB', Shell:'#89e051', Swift:'#fa7343',
  };
  return m[lang] || '#8b949e';
};

const getHeatmapColor = (count: number) => {
  if (count === 0) return 'bg-[#161B22]/60 border border-white/[0.03] hover:bg-white/[0.04]';
  if (count <= 2)  return 'bg-[#0E4429] border border-[#006D32]/30 hover:bg-[#006D32]/70';
  if (count <= 5)  return 'bg-[#006D32]/70 border border-[#26A641]/30 hover:bg-[#26A641]/60';
  if (count <= 10) return 'bg-[#26A641] border border-[#39D353]/40 hover:bg-[#39D353]/80';
  return 'bg-[#39D353] border border-[#39D353]/60 hover:scale-110';
};

export default function PortfolioPage({ params }: { params: { username: string } }) {
  const { username } = params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReadme, setSelectedReadme] = useState<string | null>(null);
  const [readmeRepo, setReadmeRepo] = useState<string>('');

  const fetchPortfolio = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectService.getPublicPortfolio(username);
      if (res.data) {
        setData(res.data);
      } else {
        setError('Developer portfolio not found');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) fetchPortfolio();
  }, [username]);

  // Derived contribution data
  const calendarCells = useMemo(() => {
    if (!data?.githubStats?.metadata?.extra?.heatmap) return [];
    const dateMap: Record<string, number> = {};
    data.githubStats.metadata.extra.heatmap.forEach((d: any) => { dateMap[d.date] = d.count; });
    const cells = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      cells.push({ date: dateStr, count: dateMap[dateStr] || 0 });
    }
    return cells;
  }, [data]);

  const weeks: Cell[][] = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  const activeDays = calendarCells.filter(c => c.count > 0).length;

  const totalOSSStars = useMemo(() => {
    if (!data?.projects) return 0;
    return data.projects.reduce((acc: number, p: any) => acc + (p.stars || 0), 0);
  }, [data]);

  const totalOSSForks = useMemo(() => {
    if (!data?.projects) return 0;
    return data.projects.reduce((acc: number, p: any) => acc + (p.forks || 0), 0);
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] text-[var(--text-main)] font-sans pb-20 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-t-[#58A6FF] border-[#161B22] animate-spin" />
          <span className="text-xs font-black text-[#58A6FF] uppercase tracking-wider animate-pulse">
            Loading Developer Portfolio...
          </span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    const isProfileDeleted = error?.toLowerCase().includes('not found') || error?.toLowerCase().includes('no longer exists') || error?.toLowerCase().includes('404');

    return (
      <div className="min-h-screen bg-[#050816] text-[var(--text-main)] font-sans pb-20 flex flex-col relative overflow-hidden">
        {/* Decorative gradients */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#58a6ff02_1px,transparent_1px),linear-gradient(to_bottom,#58a6ff02_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        {isProfileDeleted && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
        )}

        <TopNavbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto gap-5 relative z-10">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl ${isProfileDeleted ? 'bg-red-500/10 border border-red-500/25 text-red-500/60 shadow-red-500/5' : 'bg-[#58A6FF]/10 border border-[#58A6FF]/25 text-[#58A6FF]/60 shadow-[#58A6FF]/5'}`}>
            <Info className="w-10 h-10" />
          </div>
          
          {isProfileDeleted ? (
            <>
              <h2 className="text-2xl font-black text-white tracking-tight">Profile Deleted</h2>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                This developer profile no longer exists.
              </p>
              <p className="text-xs text-gray-500 max-w-xs">
                In compliance with global privacy regulations, all associated repositories, comments, followers, and dynamic analytics have been permanently wiped from the Codeyx platform.
              </p>
              <a href="/explore-projects" className="mt-4 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-black uppercase text-xs hover:bg-white/10 transition-all">
                Explore Other Developers
              </a>
            </>
          ) : (
            <>
              <h2 className="text-xl font-black text-white">No public repositories found</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Connect GitHub to load analytics and showcase projects on your portfolio.
              </p>
              <a href="/dashboard/platforms/github" className="px-5 py-2.5 rounded-xl bg-[#58A6FF] text-black font-black uppercase text-xs hover:bg-[#79B8FF] transition-all">
                Connect GitHub to load analytics
              </a>
            </>
          )}
        </div>
      </div>
    );
  }

  const { user, profile, githubStats, projects } = data;
  const featuredProjects = projects.filter((p: any) => p.featured);
  const regularProjects  = projects.filter((p: any) => !p.featured);

  return (
    <div className="min-h-screen bg-[#050816] text-[var(--text-main)] font-sans pb-20 overflow-x-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#58a6ff03_1px,transparent_1px),linear-gradient(to_bottom,#58a6ff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-transparent blur-[160px] rounded-full pointer-events-none" />
      
      <TopNavbar />

      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-8 space-y-8 relative z-10">

        {/* ── PROFILE HERO ── */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-6 md:p-8 rounded-3xl border bg-[#0D1117]/80 border-[#30363D] backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-center gap-6"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#58A6FF]/40 to-transparent" />
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#58A6FF]/30 to-[#1F6FEB]/10 blur-md scale-110 animate-pulse" />
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
              alt={username}
              className="relative w-24 h-24 rounded-2xl border-2 border-[#58A6FF]/40 shadow-2xl object-cover"
            />
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-1.5">
              <h1 className="text-2xl font-black tracking-tight text-white">{user.firstName} {user.lastName}</h1>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#58A6FF]/10 border border-[#58A6FF]/25 text-[#58A6FF] text-[8px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(88,166,255,0.1)]">
                <Sparkles className="w-2 h-2" />Verified Dev
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium">@{username}</p>
            <p className="text-xs text-gray-300 mt-2 max-w-lg leading-relaxed">{profile.bio}</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
              {profile.location && (
                <span className="flex items-center gap-1 text-[10px] text-gray-500 font-bold">
                  <MapPin className="w-3.5 h-3.5" />{profile.location}
                </span>
              )}
              {profile.socialLinks?.github && (
                <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white font-bold">
                  <Github className="w-3.5 h-3.5" />GitHub
                </a>
              )}
              {githubStats?.metadata?.streak > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-orange-400 font-black">
                  <Flame className="w-3.5 h-3.5" />{githubStats.metadata.streak} Day Streak
                </span>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 w-full md:w-auto md:min-w-[240px]">
            {[
              { label: 'Public Projects', value: projects.length, color: 'text-[#58A6FF]' },
              { label: 'Total Stars',     value: totalOSSStars, color: 'text-yellow-400' },
              { label: 'Total Forks',     value: totalOSSForks, color: 'text-purple-400' },
            ].map(m => (
              <div key={m.label} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-center">
                <span className={`text-lg font-black ${m.color}`}>{m.value}</span>
                <p className="text-[7px] text-gray-500 uppercase font-black tracking-widest mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        </motion.header>

        {/* ── HEATMAP ── */}
        {calendarCells.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl border bg-[#0D1117]/80 border-[#30363D] backdrop-blur-md shadow-2xl relative overflow-hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-white">Contribution Heatmap</h3>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span>Total: <b className="text-emerald-400">{githubStats?.metadata?.extra?.totalContributions || 0}</b></span>
                <span>Active Days: <b className="text-[#58A6FF]">{activeDays}</b></span>
              </div>
            </div>
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-[3px] min-w-max">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((cell, di) => (
                      <div
                        key={di}
                        className={`w-[10px] h-[10px] rounded-[2px] cursor-pointer transition-all duration-150 ${getHeatmapColor(cell.count)}`}
                        title={`${cell.count} contributions on ${cell.date}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── FEATURED PROJECTS ── */}
        {featuredProjects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" /> Featured Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredProjects.map(proj => (
                <div key={proj._id} className="p-6 rounded-3xl border bg-[#0D1117]/90 border-[#FF8A00]/30 shadow-[0_15px_40px_rgba(255,138,0,0.05)] relative overflow-hidden flex flex-col gap-4 group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8A00]/5 rounded-full blur-2xl" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center">
                        <Code2 className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-white group-hover:text-orange-400 transition-colors">{proj.title}</h3>
                        <span className="text-[8px] font-black uppercase tracking-widest text-orange-400 px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                          ⭐ Featured
                        </span>
                      </div>
                    </div>
                    {proj.deploymentStatus === 'Active' && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase animate-pulse">
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed flex-1">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.techStack?.map((t: string) => (
                      <span key={t} className="px-2 py-0.5 bg-white/[0.03] border border-white/5 rounded text-[9px] font-bold text-gray-400">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-yellow-400 font-bold"><Star className="w-3.5 h-3.5" />{proj.stars}</span>
                      <span className="flex items-center gap-1 text-gray-500 font-bold"><GitFork className="w-3.5 h-3.5" />{proj.forks}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {proj.githubUrl && (
                        <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-bold text-white transition-all flex items-center gap-1.5">
                          <Github className="w-3.5 h-3.5" /> Code
                        </a>
                      )}
                      {proj.liveUrl && (
                        <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-orange-500 text-black hover:opacity-90 text-xs font-black uppercase transition-all flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" /> Live
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROJECT SHOWCASE GRID ── */}
        <div className="space-y-4">
          <h2 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[#58A6FF]" /> Project Showcase
          </h2>

          {regularProjects.length === 0 && featuredProjects.length === 0 ? (
            <div className="p-12 border border-dashed border-[#30363D] bg-white/[0.01] rounded-3xl text-center flex flex-col items-center gap-2 max-w-sm mx-auto">
              <BookOpen className="w-10 h-10 text-gray-700" />
              <p className="text-sm font-bold text-gray-400">No public projects linked yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularProjects.map(proj => (
                <div key={proj._id} className="p-5 rounded-2xl border bg-[#0D1117]/80 border-[#30363D] hover:border-[#58A6FF]/30 hover:shadow-2xl transition-all flex flex-col gap-4 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#58A6FF]/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-[#58A6FF]/10 border border-[#58A6FF]/20 flex items-center justify-center">
                        <Code2 className="w-5 h-5 text-[#58A6FF]" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-white truncate max-w-[140px]">{proj.title}</h4>
                        <span className="text-[7.5px] font-black uppercase tracking-widest text-[#58A6FF]">
                          {proj.deploymentProvider || 'GitHub Source'}
                        </span>
                      </div>
                    </div>
                    {proj.deploymentStatus === 'Active' && (
                      <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[7px] font-black uppercase animate-pulse">
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">{proj.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {proj.techStack?.slice(0, 4).map((t: string) => (
                      <span key={t} className="px-1.5 py-0.5 bg-white/[0.03] border border-white/5 rounded text-[8px] font-bold text-gray-400">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2.5 text-[10px]">
                      <span className="flex items-center gap-0.5 text-yellow-500 font-bold"><Star className="w-3 h-3" />{proj.stars}</span>
                      <span className="flex items-center gap-0.5 text-gray-500 font-bold"><GitFork className="w-3 h-3" />{proj.forks}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {proj.githubUrl && (
                        <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-white transition-all">
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {proj.liveUrl && (
                        <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-[#58A6FF]/10 border border-[#58A6FF]/20 text-[#58A6FF] hover:bg-[#58A6FF]/20 transition-all">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
