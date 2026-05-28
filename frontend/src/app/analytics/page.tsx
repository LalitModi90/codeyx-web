"use client";
import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import TopNavbar from '../../components/shared/TopNavbar';
import Link from 'next/link';
import { progressService } from '../../services/progress.service';
import { patternsService } from '../../services/patterns.service';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts';
import {
  ArrowLeft, Zap, Target, Flame, BrainCircuit,
  TrendingUp, Clock, AlertTriangle, CheckCircle2,
  Circle, Trophy, BookOpen, Loader2, Star, Layers, Activity, LayoutDashboard
} from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const diffColors: Record<string, string> = {
  Easy: '#34D399', Medium: '#FBBF24', Hard: '#FB7185',
};

const diffBg: Record<string, string> = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Hard: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

function formatDateAgo(dateVal: string | Date | null) {
  if (!dateVal) return 'Never';
  const d = new Date(dateVal);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHrs = Math.floor(diffMs / 3600000);
  if (diffHrs < 1) return 'Just now';
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function HeatmapCell({ count, maxCount }: { count: number; maxCount: number }) {
  const intensity = maxCount > 0 ? Math.min(count / maxCount, 1) : 0;
  let bg = 'bg-[#1a1a2e]';
  if (count > 0 && intensity <= 0.25) bg = 'bg-emerald-900/60';
  else if (count > 0 && intensity <= 0.5) bg = 'bg-emerald-700/70';
  else if (count > 0 && intensity <= 0.75) bg = 'bg-emerald-500/70';
  else if (count > 0) bg = 'bg-emerald-400/80';
  return (
    <div
      className={`w-3 h-3 rounded-sm ${bg} transition-colors`}
      title={`${count} problem${count !== 1 ? 's' : ''}`}
    />
  );
}

export default function GlobalAnalyticsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<'overall' | 'sheets' | 'patterns'>('overall');
  const [sheetsData, setSheetsData] = useState<any[]>([]);
  const [patternAnalytics, setPatternAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState<'completion' | 'name' | 'remaining'>('completion');
  const [patternSort, setPatternSort] = useState<'completion' | 'name' | 'remaining'>('completion');

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    (async () => {
      setIsLoading(true);
      try {
        const [sheetsRes, patternsRes] = await Promise.all([
          progressService.getAllProgress(),
          patternsService.getPatternAnalytics(),
        ]);
        
        const sData = (sheetsRes as any)?.data || sheetsRes || [];
        setSheetsData(Array.isArray(sData) ? sData : []);
        
        setPatternAnalytics((patternsRes as any)?.data || patternsRes);
      } catch (e) {
        console.error('[Analytics] fetch error:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isLoaded, isSignedIn]);

  const sortedSheets = useMemo(() => {
    const list = [...sheetsData];
    if (sortOption === 'completion') list.sort((a, b) => b.progressPercentage - a.progressPercentage);
    else if (sortOption === 'name') list.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortOption === 'remaining') list.sort((a, b) => b.remainingProblems - a.remainingProblems);
    return list;
  }, [sheetsData, sortOption]);

  const sortedPatterns = useMemo(() => {
    if (!patternAnalytics?.patternStats) return [];
    const list = [...patternAnalytics.patternStats];
    if (patternSort === 'completion') list.sort((a, b) => b.completionPercentage - a.completionPercentage);
    else if (patternSort === 'name') list.sort((a, b) => a.patternTitle.localeCompare(b.patternTitle));
    else if (patternSort === 'remaining') list.sort((a, b) => b.remainingProblems - a.remainingProblems);
    return list;
  }, [patternAnalytics?.patternStats, patternSort]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0B0C10] text-[#FAFAFA] font-sans">
        <TopNavbar />
        <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={32} className="text-[#FF8A00] animate-spin" /></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0B0C10] text-[#FAFAFA] font-sans">
        <TopNavbar />
        <div className="max-w-[1400px] mx-auto px-6 pt-20 text-center">
          <Target size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Sign in to view your analytics.</p>
          <Link href="/dashboard" className="text-[#FF8A00] text-sm mt-4 inline-block">← Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Sheets Stats
  const sheetsSolved = sheetsData.reduce((acc, curr) => acc + (curr.solvedProblems || 0), 0);
  const sheetsTotal = sheetsData.reduce((acc, curr) => acc + (curr.totalProblems || 0), 0);
  const sheetsOverallPct = sheetsTotal > 0 ? Math.round((sheetsSolved / sheetsTotal) * 100) : 0;
  
  const sheetsBarData = sortedSheets.slice(0, 10).map(s => ({
    name: s.title.length > 18 ? s.title.slice(0, 16) + '…' : s.title,
    completion: s.progressPercentage,
    solved: s.solvedProblems,
    total: s.totalProblems,
  }));

  // Pattern Stats
  const d = patternAnalytics;
  const patternsTotalSolved = d?.totalSolved || 0;
  const patternsTotalProblems = d?.totalProblems || 0;
  const patternsCompletionPct = d?.completionPercentage || 0;
  
  const pieData = [
    { name: 'Easy', value: d?.difficultySolved?.Easy || 0, color: '#34D399' },
    { name: 'Medium', value: d?.difficultySolved?.Medium || 0, color: '#FBBF24' },
    { name: 'Hard', value: d?.difficultySolved?.Hard || 0, color: '#FB7185' },
  ].filter(p => p.value > 0);

  const patternBarData = sortedPatterns.slice(0, 10).map((p: any) => ({
    name: p.patternTitle.length > 18 ? p.patternTitle.slice(0, 16) + '…' : p.patternTitle,
    completion: p.completionPercentage,
    solved: p.solvedProblems,
    total: p.totalProblems,
  }));

  const weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const weeklyChartData = (d?.weeklyProgress || []).map((w: any) => ({
    day: weekDays[new Date(w.date).getDay()],
    solved: w.solved,
    date: w.date,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 shadow-xl shadow-black/40">
          <p className="text-xs text-gray-400 mb-1">{label}</p>
          {payload.map((pld: any, i: number) => (
            <p key={i} className="text-sm font-bold text-white">{pld.name}: {pld.value}{pld.name === 'completion' || pld.name === 'Completion' ? '%' : ''}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#FAFAFA] font-sans overflow-x-hidden selection:bg-[#FF8A00]/30 pb-20">
      <TopNavbar />

      <main className="max-w-[1400px] mx-auto px-4 md:px-6 pt-6 md:pt-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8A00]/20 to-orange-500/5 border border-[#FF8A00]/20 flex items-center justify-center">
            <TrendingUp size={20} className="text-[#FF8A00]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Global Analytics Dashboard</h1>
            <p className="text-xs md:text-sm text-gray-500">Track your progress across all Sheets and Patterns</p>
          </div>
        </div>

        {/* ─── TABS ─── */}
        <div className="flex items-center gap-2 mb-8 bg-[#111216]/60 p-1.5 rounded-xl border border-white/5 w-fit">
          <button
            onClick={() => setActiveTab('overall')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'overall' ? 'bg-[#FF8A00] text-black shadow-[0_0_15px_rgba(255,138,0,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard size={14} /> Overall
          </button>
          <button
            onClick={() => setActiveTab('sheets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'sheets' ? 'bg-[#FF8A00] text-black shadow-[0_0_15px_rgba(255,138,0,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers size={14} /> Sheets
          </button>
          <button
            onClick={() => setActiveTab('patterns')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'patterns' ? 'bg-[#FF8A00] text-black shadow-[0_0_15px_rgba(255,138,0,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BrainCircuit size={14} /> Patterns
          </button>
        </div>

        {activeTab === 'overall' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Overall Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#111216]/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} className="text-[#FF8A00]" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Progress</span>
                </div>
                <p className="text-3xl font-extrabold text-white">{Math.max(sheetsSolved, patternsTotalSolved)}</p>
                <p className="text-[10px] text-gray-500 mt-1">Unique problems solved</p>
              </div>
              
              <div className="bg-[#111216]/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Flame size={14} className="text-orange-400" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Current Streak</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-extrabold text-orange-400">{d?.currentStreak || 0}</p>
                  <span className="text-xs text-gray-500">days</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Best: {d?.longestStreak || 0}d</p>
              </div>

              <div className="bg-[#111216]/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={14} className="text-blue-400" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Sheets</span>
                </div>
                <p className="text-3xl font-extrabold text-blue-400">{sheetsData.filter(s => s.solvedProblems > 0).length}</p>
                <p className="text-[10px] text-gray-500 mt-1">Out of {sheetsData.length} sheets</p>
              </div>

              <div className="bg-[#111216]/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BrainCircuit size={14} className="text-emerald-400" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Patterns</span>
                </div>
                <p className="text-3xl font-extrabold text-emerald-400">{(d?.patternStats || []).filter((p: any) => p.solvedProblems > 0).length}</p>
                <p className="text-[10px] text-gray-500 mt-1">Out of {d?.totalPatterns || 0} patterns</p>
              </div>
            </div>

            {/* Heatmap */}
            <div className="bg-[#111216]/40 border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                <Activity size={16} className="text-orange-400" /> Overall Activity Heatmap
              </h3>
              <p className="text-[11px] text-gray-500 mb-6">Last 365 days of problem solving activity across the platform.</p>
              
              {(d?.heatmapData || []).some((h: any) => h.count > 0) ? (
                <>
                  <div className="overflow-x-auto pb-2">
                    <div className="flex gap-1" style={{ minWidth: '700px' }}>
                      {[0,1,2,3,4,5,6,7,8,9,10,11].map(monthIdx => {
                        const monthData = (d?.heatmapData || []).filter((h: any) => {
                          const m = new Date(h.date).getMonth();
                          return m === monthIdx;
                        });
                        return (
                          <div key={monthIdx} className="flex flex-col gap-1 flex-1">
                            <span className="text-[10px] text-gray-600 mb-1">{MONTHS[monthIdx]}</span>
                            <div className="flex flex-wrap gap-1">
                              {monthData.map((h: any, i: number) => (
                                <HeatmapCell key={i} count={h.count} maxCount={Math.max(...(d?.heatmapData || []).map((x: any) => x.count), 1)} />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-4">
                    <span className="text-[10px] text-gray-600">Less</span>
                    <div className="w-4 h-4 rounded-sm bg-[#1a1a2e]" />
                    <div className="w-4 h-4 rounded-sm bg-emerald-900/60" />
                    <div className="w-4 h-4 rounded-sm bg-emerald-700/70" />
                    <div className="w-4 h-4 rounded-sm bg-emerald-500/70" />
                    <div className="w-4 h-4 rounded-sm bg-emerald-400/80" />
                    <span className="text-[10px] text-gray-600">More</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Flame size={40} className="text-gray-700 mb-3" />
                  <p className="text-sm font-bold text-gray-400">No activity data yet</p>
                  <p className="text-xs text-gray-600 mt-1">Your solving heatmap will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'sheets' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sheets Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-[#111216]/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} className="text-[#FF8A00]" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Solved</span>
                </div>
                <p className="text-3xl font-extrabold text-white">{sheetsSolved}</p>
                <p className="text-[10px] text-gray-500 mt-1">across all sheets</p>
              </div>

              <div className="bg-[#111216]/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={14} className="text-[#FF8A00]" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Overall Completion</span>
                </div>
                <p className="text-3xl font-extrabold text-[#FF8A00]">{sheetsOverallPct}%</p>
                <div className="h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#FF8A00] to-orange-400 rounded-full transition-all duration-700" style={{ width: `${sheetsOverallPct}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-[#111216]/40 border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Top Sheets by Completion</h3>
              <p className="text-[11px] text-gray-500 mb-6">Highest completion %</p>
              {sheetsBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={sheetsBarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="completion" fill="#FF8A00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-gray-600 text-xs">No sheet data yet</div>
              )}
            </div>

            <div className="bg-[#111216]/40 border border-white/5 rounded-2xl overflow-hidden mb-8">
              <div className="p-5 border-b border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">All Sheets</h3>
                  <p className="text-[10px] text-gray-500">Sheet-wise completion breakdown</p>
                </div>
                <div className="flex items-center gap-2">
                  {['completion', 'name', 'remaining'].map(s => (
                    <button
                      key={s}
                      onClick={() => setSortOption(s as any)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        sortOption === s ? 'bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/30' : 'text-gray-400 bg-white/5 border border-white/10 hover:text-white'
                      }`}
                    >
                      {s === 'completion' ? 'By %' : s === 'name' ? 'A-Z' : 'Remaining'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-white/5">
                {sortedSheets.length === 0 && (
                  <div className="p-8 text-center text-sm text-gray-500">No sheets found</div>
                )}
                {sortedSheets.map((s: any) => (
                  <Link
                    key={s.sheetId}
                    href={`/sheets/${s.slug}`}
                    className="flex items-center gap-3 md:gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs md:text-sm font-bold text-white group-hover:text-[#FF8A00] transition-colors truncate">{s.title}</span>
                        {s.progressPercentage >= 100 && <Trophy size={12} className="text-amber-400 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 max-w-[200px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              s.progressPercentage >= 80 ? 'bg-emerald-400' :
                              s.progressPercentage >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                            }`}
                            style={{ width: `${s.progressPercentage}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                          <span className="font-bold text-white">{s.solvedProblems}/{s.totalProblems}</span>
                          <span className={`font-bold ${
                            s.progressPercentage >= 80 ? 'text-emerald-400' :
                            s.progressPercentage >= 50 ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {s.progressPercentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Pattern Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#111216]/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} className="text-[#FF8A00]" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Solved</span>
                </div>
                <p className="text-3xl font-extrabold text-white">{patternsTotalSolved}</p>
                <p className="text-[10px] text-gray-500 mt-1">of {patternsTotalProblems} problems</p>
              </div>

              <div className="bg-[#111216]/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BrainCircuit size={14} className="text-emerald-400" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Patterns</span>
                </div>
                <p className="text-3xl font-extrabold text-emerald-400">{d?.patternsCompleted || 0}</p>
                <p className="text-[10px] text-gray-500 mt-1">of {d?.totalPatterns || 0} completed</p>
              </div>

              <div className="bg-[#111216]/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={14} className="text-[#FF8A00]" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Completion</span>
                </div>
                <p className="text-3xl font-extrabold text-[#FF8A00]">{patternsCompletionPct}%</p>
                <div className="h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#FF8A00] to-orange-400 rounded-full transition-all duration-700" style={{ width: `${patternsCompletionPct}%` }} />
                </div>
              </div>
              
              <div className="bg-[#111216]/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={14} className="text-blue-400" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Avg / Day</span>
                </div>
                <p className="text-3xl font-extrabold text-blue-400">{d?.avgProblemsPerDay || 0}</p>
                <p className="text-[10px] text-gray-500 mt-1">problems per day</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pattern Difficulty Pie */}
              <div className="bg-[#111216]/40 border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Difficulty Distribution</h3>
                <p className="text-[11px] text-gray-500 mb-6">Easy / Medium / Hard solved breakdown</p>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        formatter={(value: string) => <span className="text-xs text-gray-400">{value}</span>}
                        iconType="circle"
                        iconSize={8}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-gray-600 text-xs">No solved problems yet</div>
                )}
              </div>

              {/* Weekly Trend */}
              <div className="bg-[#111216]/40 border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Weekly Progress</h3>
                <p className="text-[11px] text-gray-500 mb-6">Problems solved per day</p>
                {weeklyChartData.some((w: any) => w.solved > 0) ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={weeklyChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF8A00" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#FF8A00" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="solved" stroke="#FF8A00" strokeWidth={2} fill="url(#colorSolved)" dot={{ fill: '#FF8A00', r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-gray-600 text-xs">No activity this week</div>
                )}
              </div>
            </div>
            
            {/* WEAK & STRONG PATTERNS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className={`bg-[#111216]/40 border rounded-2xl p-5 ${(d?.weakPatterns || []).length > 0 ? 'border-rose-500/20' : 'border-white/5'}`}>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-rose-400" /> Needs Practice
                </h3>
                <p className="text-[10px] text-gray-500 mb-4">Patterns under 30% completion</p>
                {(d?.weakPatterns || []).length > 0 ? (
                  <div className="space-y-3">
                    {d.weakPatterns.map((wp: any) => (
                      <Link key={wp.patternId || wp.title} href={`/patterns/${wp.patternId}`} className="block bg-[#0B0C10] border border-white/5 rounded-xl p-3.5 hover:border-rose-500/30 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white">{wp.title}</span>
                          <span className="text-[10px] font-bold text-rose-400">{wp.percentage}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${wp.percentage}%` }} />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-emerald-400 font-bold text-xs">All patterns above 30%!</div>
                )}
              </div>
              <div className={`bg-[#111216]/40 border rounded-2xl p-5 ${(d?.strongPatterns || []).length > 0 ? 'border-emerald-500/20' : 'border-white/5'}`}>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Trophy size={14} className="text-emerald-400" /> Mastered
                </h3>
                <p className="text-[10px] text-gray-500 mb-4">Patterns above 80% completion</p>
                {(d?.strongPatterns || []).length > 0 ? (
                  <div className="space-y-3">
                    {d.strongPatterns.map((sp: any) => (
                      <Link key={sp.patternId || sp.title} href={`/patterns/${sp.patternId}`} className="block bg-[#0B0C10] border border-white/5 rounded-xl p-3.5 hover:border-emerald-500/30 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white">{sp.title}</span>
                          <span className="text-[10px] font-bold text-emerald-400">{sp.percentage}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${sp.percentage}%` }} />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500 text-xs">No patterns mastered yet</div>
                )}
              </div>
            </div>

            {/* Pattern-wise list */}
            <div className="bg-[#111216]/40 border border-white/5 rounded-2xl overflow-hidden mb-8">
              <div className="p-5 border-b border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">All Patterns</h3>
                  <p className="text-[10px] text-gray-500">Pattern-wise completion breakdown</p>
                </div>
                <div className="flex items-center gap-2">
                  {['completion', 'name', 'remaining'].map(s => (
                    <button
                      key={s}
                      onClick={() => setPatternSort(s as any)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        patternSort === s ? 'bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/30' : 'text-gray-400 bg-white/5 border border-white/10 hover:text-white'
                      }`}
                    >
                      {s === 'completion' ? 'By %' : s === 'name' ? 'A-Z' : 'Remaining'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-white/5">
                {sortedPatterns.map((p: any) => (
                  <Link
                    key={p.patternId}
                    href={`/patterns/${p.patternId}`}
                    className="flex items-center gap-3 md:gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs md:text-sm font-bold text-white group-hover:text-[#FF8A00] transition-colors truncate">{p.patternTitle}</span>
                        {p.categoryTitle && <span className="text-[9px] text-gray-600 hidden sm:inline">{p.categoryTitle}</span>}
                        {p.completionPercentage >= 100 && <Trophy size={12} className="text-amber-400 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 max-w-[200px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              p.completionPercentage >= 80 ? 'bg-emerald-400' :
                              p.completionPercentage >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                            }`}
                            style={{ width: `${p.completionPercentage}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                          <span className="font-bold text-white">{p.solvedProblems}/{p.totalProblems}</span>
                          <span className={`font-bold ${
                            p.completionPercentage >= 80 ? 'text-emerald-400' :
                            p.completionPercentage >= 50 ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {p.completionPercentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
