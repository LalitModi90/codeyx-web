"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../../../../components/OnboardingProvider';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import {
  Home, User, FolderGit2, Layers, BookOpen, FileCode2, ClipboardList,
  Trophy, HelpCircle, MessageSquare, Settings, LogOut, Sun, Moon,
  ChevronDown, Sparkles, RefreshCw, Activity, Award, Globe, Flame,
  Zap, ExternalLink, ArrowRight, ChevronRight, TrendingUp, Search,
  BarChart3, Calendar, CheckCircle2, Target, Star, Bell, XCircle,
  Hash, Code, Percent, GitPullRequest, GitFork, GitCommit, Users,
  Heart, Shield, Trophy as TrophyIcon, ArrowUpDown, Filter, Eye,
  Hourglass, Brain, ChevronUp, Lock, Globe2
} from 'lucide-react';
// SVG Platform Logos
const platformLogos: Record<string, React.ReactNode> = {
  leetcode: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.483 0a1.39 1.39 0 0 0-.961.438L1.416 11.499a1.39 1.39 0 0 0 0 1.968l3.345 3.344a1.39 1.39 0 0 0 1.968 0l1.01-1.01a1.39 1.39 0 0 0 0-1.968l-2.355-2.355L12.5 4.364l4.242 4.243-2.355 2.355a1.39 1.39 0 0 0 0 1.968l1.01 1.01a1.39 1.39 0 0 0 1.968 0l6.737-6.737a1.39 1.39 0 0 0 0-1.968L14.444.438A1.39 1.39 0 0 0 13.483 0z" fill="#FFA116" />
      <path d="M16.037 18.233a1.39 1.39 0 0 0-.961.438l-4.14 4.14a1.39 1.39 0 0 0 0 1.968l1.01 1.01a1.39 1.39 0 0 0 1.968 0l4.14-4.14a1.39 1.39 0 0 0 0-1.968l-1.01-1.01a1.39 1.39 0 0 0-.961-.438z" fill="#FFA116" />
    </svg>
  ),
  codeforces: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex items-end gap-[1.5px]" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="4.5" height="12" rx="1.5" fill="#318CE7" />
      <rect x="9.5" y="4" width="4.5" height="18" rx="1.5" fill="#EF4444" />
      <rect x="17" y="7" width="4.5" height="15" rx="1.5" fill="#FBBF24" />
    </svg>
  ),
  codechef: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm-3 7c0-1.66 1.34-3 3-3s3 1.34 3 3H9z" fill="#B9770E" />
      <path d="M8 20h8v2H8z" fill="#B9770E" />
    </svg>
  ),
  atcoder: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 22h5l3-6h4l3 6h5L12 2zm-1 10l2-4 2 4h-4z" fill="#ffffff" stroke="#00A0E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  hackerrank: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 4h4v3H8v10h1v3H5V4zm14 0h-4v3h1v10h-1v3h4V4zm-7 7h2v2h-2v-2z" fill="#2EC866" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="#ffffff" />
    </svg>
  ),
};

// Commits Over Time Coordinates (Last 30 Days)
const commitPoints = [
  { label: "May 16", value: 150 },
  { label: "May 23", value: 450 },
  { label: "May 30", value: 300 },
  { label: "Jun 6", value: 500 },
  { label: "Jun 13", value: 400 },
  { label: "Jun 16", value: 520 },
];

// Repository Growth Coordinates
const growthPoints = [
  { label: "Dec '23", value: 10 },
  { label: "Jan '24", value: 18 },
  { label: "Feb '24", value: 25 },
  { label: "Mar '24", value: 30 },
  { label: "Apr '24", value: 38 },
  { label: "May '24", value: 45 },
  { label: "Jun '24", value: 60 },
];

// All Repositories Data
const repositoriesList = [
  { name: 'CodeSync', desc: 'A platform to track coding progress and analyze performance across platforms.', stars: 128, forks: 24, updated: '2d ago', tech: 'TypeScript', isPublic: true, demoUrl: 'https://codesync.dev', commits: 450 },
  { name: 'AlgoVisualizer', desc: 'Visualize algorithms and data structures with interactive animations.', stars: 96, forks: 18, updated: '3d ago', tech: 'JavaScript', isPublic: true, demoUrl: 'https://algo.dev', commits: 380 },
  { name: 'DevAI Chat', desc: 'AI powered developer assistant for coding help and productivity.', stars: 88, forks: 15, updated: '5d ago', tech: 'TypeScript', isPublic: true, demoUrl: 'https://devai.chat', commits: 320 },
  { name: 'Portfolio Website', desc: 'Personal developer portfolio website built with modern technologies.', stars: 72, forks: 12, updated: '1w ago', tech: 'Next.js', isPublic: true, demoUrl: 'https://portfolio.dev', commits: 280 },
  { name: 'TaskFlow', desc: 'A productivity app to manage tasks and collaborate with teams.', stars: 64, forks: 10, updated: '1w ago', tech: 'React', isPublic: true, demoUrl: 'https://taskflow.dev', commits: 190 },
  { name: 'Modern-CSS-Library', desc: 'An ultra-light glassmorphism utility class layout toolkit.', stars: 45, forks: 5, updated: '2w ago', tech: 'CSS', isPublic: false, demoUrl: 'https://cssglass.com', commits: 80 },
  { name: 'Quick-Scraper', desc: 'Robust async node tool to pull user handle telemetry from CP platforms.', stars: 38, forks: 8, updated: '3w ago', tech: 'Python', isPublic: true, demoUrl: null, commits: 120 },
  { name: 'CP-Leaderboard', desc: 'Realtime scraping sync engine rendering elite ranking cards.', stars: 22, forks: 3, updated: '4w ago', tech: 'C++', isPublic: false, demoUrl: null, commits: 60 }
];

const monthlyCommitsDataset = [
  { label: 'Jan', value: 240, height: 'h-[40%]', info: '240 commits - Initial skeleton wrappers built.' },
  { label: 'Feb', value: 310, height: 'h-[52%]', info: '310 commits - Analytics engine completed.' },
  { label: 'Mar', value: 450, height: 'h-[75%]', info: '450 commits - Interactive heatmaps integrated.' },
  { label: 'Apr', value: 380, height: 'h-[64%]', info: '380 commits - Multi-platform scrapers synchronized.' },
  { label: 'May', value: 520, height: 'h-[86%]', info: '520 commits - Clerk OAuth & premium dark styles.' },
  { label: 'Jun', value: 600, height: 'h-[100%]', info: '600 commits - Maximum contributions peak logged!' },
];

const activeHoursDataset = [
  { label: '12AM', pct: 15, commits: 38, focus: 'Late Night Focus' },
  { label: '4AM', pct: 5, commits: 12, focus: 'Off-Peak Hours' },
  { label: '8AM', pct: 30, commits: 110, focus: 'Morning Warmup' },
  { label: '12PM', pct: 60, commits: 280, focus: 'Afternoon Flow' },
  { label: '4PM', pct: 75, commits: 390, focus: 'Pre-Dinner Drive' },
  { label: '8PM', pct: 95, commits: 520, focus: 'Peak Creative Sprint' },
  { label: '11PM', pct: 88, commits: 440, focus: 'Midnight Session' },
];

const languagesMap: Record<string, { pct: string, numPct: number, projects: number, commits: number, color: string, strokeColor: string, desc: string, repos: string[] }> = {
  'TypeScript': { pct: '35%', numPct: 35, projects: 12, commits: 1420, color: '#a855f7', strokeColor: '#a855f7', desc: 'Used extensively in enterprise dashboards, custom APIs, and backend telemetry wrappers.', repos: ['CodeSync', 'DevAI Chat', 'Quick-Scraper'] },
  'Python': { pct: '20%', numPct: 20, projects: 8, commits: 640, color: '#3b82f6', strokeColor: '#3b82f6', desc: 'Powering analytical data scrapers, machine learning models, and automated pipeline scripts.', repos: ['AlgoVisualizer', 'Quick-Scraper'] },
  'JavaScript': { pct: '18%', numPct: 18, projects: 9, commits: 580, color: '#eab308', strokeColor: '#eab308', desc: 'Utilized across responsive web components and interactive framer motion modules.', repos: ['AlgoVisualizer', 'TaskFlow'] },
  'C++': { pct: '10%', numPct: 10, projects: 4, commits: 210, color: '#10b981', strokeColor: '#10b981', desc: 'Leveraged for performance-critical engines, real-time CP solutions, and data parsers.', repos: ['CP-Leaderboard'] },
  'CSS / Styling': { pct: '8%', numPct: 8, projects: 11, commits: 180, color: '#ec4899', strokeColor: '#ec4899', desc: 'Sleek custom CSS rules, glassmorphic utilities, and beautiful layouts styling cards.', repos: ['Modern-CSS-Library', 'Portfolio Website'] }
};

const performanceDataMap: Record<string, { consistency: string, consistencySub: string, trend: string, trendSub: string, aiInsight: string, aiSub: string }> = {
  '7D': { consistency: '98.5%', consistencySub: '▲ Perfect uptime score', trend: '12 commits/day avg', trendSub: '▲ 15% increase vs last week', aiInsight: 'Peak Productivity', aiSub: 'AI Recommendation: Morning Sprints are highly effective!' },
  '30D': { consistency: '96.2%', consistencySub: '▲ Consistent logging score', trend: '15 commits/day avg', trendSub: '▲ 8% increase vs last month', aiInsight: 'Optimal Output', aiSub: 'AI Recommendation: Midnight commits show high focus intensity.' },
  '90D': { consistency: '94.8%', consistencySub: '▲ Strong performance track', trend: '18 commits/day avg', trendSub: '▲ 12% growth across quarters', aiInsight: 'Quarterly Peak', aiSub: 'AI Recommendation: Weekend coding sessions yield 40% more PR merges.' }
};

// Skeleton Loader Component
const SkeletonLoader = () => {
  return (
    <div className="space-y-6 animate-pulse select-none">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="h-28 bg-[#0f141d]/50 border border-white/5 rounded-2xl" />
        <div className="h-28 bg-[#0f141d]/50 border border-white/5 rounded-2xl" />
        <div className="h-28 bg-[#0f141d]/50 border border-white/5 rounded-2xl" />
      </div>
      <div className="h-60 bg-[#0f141d]/50 border border-white/5 rounded-2xl w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="h-44 bg-[#0f141d]/50 border border-white/5 rounded-2xl" />
        <div className="h-44 bg-[#0f141d]/50 border border-white/5 rounded-2xl" />
      </div>
    </div>
  );
};

export default function GitHubDashboard() {
  const { profile } = useOnboarding();
  const { isLoaded, isSignedIn, user } = useUser();
  const { openUserProfile } = useClerk();

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState('Overview');
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedRange, setSelectedRange] = useState('May 16 - Jun 16, 2024');
  const [hoveredLinePoint, setHoveredLinePoint] = useState<number | null>(null);
  const [hoveredGrowthPoint, setHoveredGrowthPoint] = useState<number | null>(null);
  const [hoveredDonutSegment, setHoveredDonutSegment] = useState<string | null>(null);
  const [hoveredPRSegment, setHoveredPRSegment] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  // Search, Filter, Sort States for Repositories Tab
  const [repoSearch, setRepoSearch] = useState('');
  const [repoLanguage, setRepoLanguage] = useState('All');
  const [repoSort, setRepoSort] = useState('stars');

  // Interactive Custom States for Languages and Performance
  const [selectedLanguageHover, setSelectedLanguageHover] = useState('TypeScript');
  const [performanceRange, setPerformanceRange] = useState('30D');

  // Interactive Contributions States
  const [hoveredHeatmapDay, setHoveredHeatmapDay] = useState<{ date: string; count: number } | null>(null);
  const [hoveredMonthBar, setHoveredMonthBar] = useState<string | null>(null);
  const [hoveredHourBar, setHoveredHourBar] = useState<string | null>(null);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDark = theme === 'dark';
  const bg = isDark ? 'bg-[#080710]' : 'bg-[#f4f5f8]';
  const sidebar = isDark ? 'bg-[#0b0a12]' : 'bg-white';
  const card = isDark ? 'bg-[#0f141d] border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]' : 'bg-white border-gray-200 shadow-md';
  const border = isDark ? 'border-white/5' : 'border-gray-200';
  const muted = isDark ? 'text-gray-500' : 'text-gray-400';
  const txt = isDark ? 'text-white' : 'text-gray-900';

  const displayName = isLoaded && isSignedIn && user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (profile.firstName ? `${profile.firstName} ${profile.lastName}` : 'Ankit Kumar');
  const displayAvatar = isLoaded && isSignedIn && user?.imageUrl ? user.imageUrl : null;
  const displayInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

  // Connected Platforms Sidebar
  const connectedPlatforms = [
    { name: 'LeetCode', key: 'leetcode', href: '/dashboard/platforms/leetcode' },
    { name: 'Codeforces', key: 'codeforces', href: '/dashboard/platforms/leetcode' },
    { name: 'CodeChef', key: 'codechef', href: '/dashboard/platforms/leetcode' },
    { name: 'AtCoder', key: 'atcoder', href: '/dashboard/platforms/leetcode' },
    { name: 'HackerRank', key: 'hackerrank', href: '/dashboard/platforms/leetcode' },
    { name: 'GitHub', key: 'github', href: '/dashboard/platforms/github', active: true },
  ];

  const handleTabChange = (tab: string) => {
    setIsLoadingTab(true);
    setActiveTab(tab);
    setTimeout(() => {
      setIsLoadingTab(false);
    }, 450); // Premium skeleton flow
  };

  // Dynamically generate exact Gregorian calendar data grouped by month
  const monthsData = React.useMemo(() => {
    const monthsMap = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
    const result: {
      label: string;
      weeks: ({ date: string; count: number; dayOfWeek: number } | null)[][];
    }[] = [];

    for (let m = 0; m < 13; m++) {
      const monthLabel = monthsMap[m];
      const selectedYearVal = m < 8 ? 2023 : 2024;
      const actualMonthIdx = (m + 4) % 12;
      const firstDay = new Date(selectedYearVal, actualMonthIdx, 1);
      const lastDay = new Date(selectedYearVal, actualMonthIdx + 1, 0);

      const weeksList: ({ date: string; count: number; dayOfWeek: number } | null)[][] = [];
      let currentWeek: ({ date: string; count: number; dayOfWeek: number } | null)[] = Array(7).fill(null);

      let curr = new Date(firstDay);
      while (curr <= lastDay) {
        const dayOfWeek = curr.getDay();
        const dateStr = curr.toISOString().split('T')[0];

        let count = 0;
        const seed = curr.getDate() * (m + 2);
        if (seed % 3 === 0) count = 10;
        else if (seed % 4 === 0) count = 7;
        else if (seed % 5 === 0) count = 4;
        else if (seed % 7 === 0) count = 2;
        else if (seed % 11 === 0) count = 1;

        currentWeek[dayOfWeek] = { date: dateStr, count, dayOfWeek };

        if (dayOfWeek === 6 || curr.getTime() === lastDay.getTime()) {
          weeksList.push(currentWeek);
          currentWeek = Array(7).fill(null);
        }

        curr.setDate(curr.getDate() + 1);
      }

      result.push({ label: monthLabel, weeks: weeksList });
    }
    return result;
  }, []);

  const getColor = (count: number) => {
    if (count === 0) return '#161b22';
    if (count < 2) return '#0e4429';
    if (count < 4) return '#006d32';
    if (count < 7) return '#26a641';
    if (count < 9) return '#39d353';
    return '#7ee787';
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [activeTab, isLoadingTab]);

  // Filter & Sort logic
  const filteredRepos = repositoriesList.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(repoSearch.toLowerCase()) || repo.desc.toLowerCase().includes(repoSearch.toLowerCase());
    const matchesLanguage = repoLanguage === 'All' || repo.tech === repoLanguage;
    return matchesSearch && matchesLanguage;
  }).sort((a, b) => {
    if (repoSort === 'stars') return b.stars - a.stars;
    if (repoSort === 'forks') return b.forks - a.forks;
    if (repoSort === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const currentLang = languagesMap[selectedLanguageHover] || languagesMap['TypeScript'];
  const currentPerf = performanceDataMap[performanceRange] || performanceDataMap['30D'];
  const activePoint = hoveredGrowthPoint !== null ? { ...growthPoints[hoveredGrowthPoint], x: 58 * hoveredGrowthPoint, y: 95 - (growthPoints[hoveredGrowthPoint].value * 1.3), commits: 150 + hoveredGrowthPoint * 80, lang: hoveredGrowthPoint % 2 === 0 ? 'TypeScript' : 'Python' } : null;

  const handleLineMouseMove = (e: React.MouseEvent<SVGSVGElement>, pointsCount: number, setter: (idx: number | null) => void) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xVal = e.clientX - rect.left;
    const pct = xVal / rect.width;
    const index = Math.min(pointsCount - 1, Math.max(0, Math.round(pct * (pointsCount - 1))));
    setter(index);
  };

  return (
    <div className={"h-screen flex " + bg + " " + txt + " transition-colors duration-300 font-sans overflow-hidden max-w-[1920px] mx-auto"}>
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className={`hidden lg:flex flex-col w-56 border-r ${border} ${sidebar} flex-shrink-0 z-30`}>
        <div className="px-5 pt-6 pb-5 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.35)]">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">CodeSync</span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto pt-2 scrollbar-none">
          {[
            { icon: Home, label: 'Overview', href: '/dashboard' },
            { icon: Layers, label: 'Platforms', href: '/dashboard/platforms/leetcode', active: true },
            { icon: FileCode2, label: 'Problems', href: '#' },
            { icon: Trophy, label: 'Contests', href: '#' },
            { icon: Flame, label: 'Streaks', href: '#' },
            { icon: Activity, label: 'Analytics', href: '#' },
            { icon: Globe, label: 'Compare', href: '#' },
            { icon: Calendar, label: 'Calendar', href: '#' },
            { icon: Award, label: 'Achievements', href: '#' },
            { icon: User, label: 'Friends', href: '#' },
            { icon: BookOpen, label: 'Resume Builder', href: '#' },
            { icon: Settings, label: 'Settings', href: '#' },
          ].map((item, idx) => (
            <Link 
              key={idx} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group ${
                item.active 
                  ? 'bg-purple-600 text-white shadow-[0_4px_12px_rgba(147,51,234,0.3)]' 
                  : `text-gray-400 hover:text-white hover:bg-white/[0.04]`
              }`}
            >
              <item.icon size={15} className={item.active ? 'text-white' : 'text-gray-400 group-hover:text-purple-400 transition-colors'} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Connected Platforms Left Sidebar */}
        <div className="p-4 border-t border-white/5 bg-[#0b0a12]">
          <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest block mb-3 pl-1">Connected Platforms</span>
          <div className="space-y-2">
            {connectedPlatforms.map((plat) => (
              <Link 
                key={plat.key} 
                href={plat.href}
                className="flex items-center justify-between group cursor-pointer py-1 px-1 rounded-lg hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${plat.active ? 'bg-purple-500 ring-2 ring-purple-500/20' : 'bg-emerald-400'}`} />
                  <span className={`text-xs font-bold ${plat.active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{plat.name}</span>
                </div>
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
              </Link>
            ))}
          </div>

          <button className="mt-4 w-full py-2 bg-[#12111a] border border-white/5 hover:border-purple-500/30 rounded-xl text-[10px] font-bold text-gray-400 hover:text-white transition-all flex items-center justify-center gap-1.5">
            <span>+ Connect Platform</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* HEADER NAVBAR */}
        <header className={`h-16 px-6 border-b ${border} flex items-center justify-between backdrop-blur-md z-50`}>
          <div>
            <h1 className="text-sm font-extrabold text-white flex items-center gap-1">
              GitHub Dashboard
            </h1>
            <p className={`text-[9px] ${muted} mt-0.5`}>Real-time developer contribution tracking and code analytics.</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Date filter dropdown */}
            <div className="relative">
              <button className="px-3 py-1.5 bg-[#0f141d] border border-white/5 rounded-xl text-[10px] font-extrabold text-gray-300 flex items-center gap-1.5 hover:bg-white/[0.03] transition-all">
                <Calendar size={12} className="text-purple-400" />
                <span>{selectedRange}</span>
                <ChevronDown size={10} className="text-gray-500" />
              </button>
            </div>

            {/* Notification */}
            <button className="w-8 h-8 rounded-xl bg-[#0f141d] border border-white/5 hover:border-white/10 flex items-center justify-center relative text-gray-400 hover:text-white transition-all">
              <Bell size={14} />
              <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-purple-500" />
            </button>

            {/* User profile Clerk */}
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 pl-1 pr-3 py-1 bg-[#0f141d] border border-white/5 rounded-full hover:bg-white/[0.02] hover:border-white/10 transition-all cursor-pointer"
              >
                {displayAvatar ? (
                  <img src={displayAvatar} alt={displayName} className="w-6 h-6 rounded-full object-cover border border-purple-500/30" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center border border-purple-500/30">
                    <span className="text-[10px] font-extrabold text-white">{displayInitials}</span>
                  </div>
                )}
                <div className="text-left">
                  <div className="text-[10px] font-extrabold text-white leading-tight">{displayName}</div>
                  <div className="text-[8px] text-gray-500 font-semibold leading-none">View Profile</div>
                </div>
                <ChevronDown size={10} className="text-gray-500 ml-1" />
              </button>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT GRID */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* MAIN COLUMN (SCROLLABLE) */}
          <main className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-none pb-16">
            
            {/* BACK TO PLATFORMS NAVIGATOR */}
            <div className="flex items-center mb-1 animate-fade-in">
              <Link 
                href="/dashboard/platforms/leetcode" 
                className="inline-flex items-center gap-1.5 text-[10px] font-black text-gray-500 hover:text-purple-400 uppercase tracking-widest transition-colors group cursor-pointer"
              >
                <ArrowRight size={12} className="rotate-180 text-gray-500 group-hover:text-purple-400 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span>Back to Platforms</span>
              </Link>
            </div>

            {/* PLATFORM HEADER */}
            <div className={`${card} rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                  {platformLogos.github}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-white capitalize">GitHub</h2>
                    <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[8px] font-extrabold text-emerald-400 uppercase tracking-widest">Connected</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-semibold text-gray-400">
                    <span>Username: <span className="text-white font-extrabold">ankitkumar01</span></span>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    <span>Joined GitHub since Jun 2022</span>
                  </div>
                </div>
              </div>
              
              <button className="px-4 py-2 bg-[#161b22] hover:bg-[#21262d] text-white rounded-xl text-[10px] font-extrabold transition-all border border-white/5 flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                <RefreshCw size={11} className="animate-spin-slow" />
                <span>Refresh Data</span>
              </button>
            </div>

            {/* TOP NAVIGATION TABS */}
            <div className="border-b border-white/5 flex items-center gap-6">
              {['Overview', 'Repositories', 'Contributions', 'Languages', 'Activity', 'Open Source', 'Performance'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`pb-3.5 text-xs font-bold transition-all relative ${
                    activeTab === tab ? 'text-purple-400 font-extrabold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{tab}</span>
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeTabIndicator" 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" 
                    />
                  )}
                </button>
              ))}
            </div>

            {/* DYNAMIC TAB COMPONENT TRANSITION */}
            <div className="relative min-h-[400px]">
              <AnimatePresence mode="wait">
                {isLoadingTab ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <SkeletonLoader />
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    {/* TAB CONTENT IMPLEMENTATIONS */}

                    {/* OVERVIEW SUMMARY DASHBOARD */}
                    {activeTab === 'Overview' && (
                      <div className="space-y-6">
                        {/* Summary Grid stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { title: 'Total Repositories', value: '42', sub: '▲ 4 this month', color: 'text-purple-400', icon: FolderGit2 },
                            { title: 'Total Stars Received', value: '1.2K', sub: '▲ 86 this month', color: 'text-yellow-500', icon: Star },
                            { title: 'Total Commits Logged', value: '2.45K', sub: '▲ 180 this month', color: 'text-blue-400', icon: FileCode2 },
                            { title: 'Contribution Streak', value: '156 days', sub: '🔥 Best: 210 days', color: 'text-orange-500', icon: Flame },
                          ].map((stat, idx) => (
                            <div key={idx} className={`${card} rounded-2xl p-4 border flex flex-col justify-between hover:border-white/10 transition-all`}>
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{stat.title}</span>
                                <stat.icon size={14} className={stat.color} />
                              </div>
                              <div className="mt-3">
                                <span className="text-xl font-extrabold text-white tracking-tight">{stat.value}</span>
                                <span className="block text-[8.5px] text-gray-400 font-semibold mt-0.5">{stat.sub}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Heatmap summary */}
                        <div className={`${card} rounded-2xl p-5 border`}>
                          <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                            <span className="text-xs font-black text-purple-400 uppercase tracking-wider">Contribution Heatmap</span>
                            <span className="text-[8px] text-gray-500 font-bold">Gregorian 12-Month Matrix</span>
                          </div>
                          <div ref={scrollContainerRef} className="overflow-x-auto pt-2 pb-1 scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent">
                            <div className="flex items-start gap-3.5 min-w-max pr-2">
                              {monthsData.map((month, mIdx) => (
                                <div key={mIdx} className="flex flex-col gap-1.5">
                                  <div className="flex gap-[3.5px]">
                                    {month.weeks.map((week, wIdx) => (
                                      <div key={wIdx} className="flex flex-col gap-[3.5px]">
                                        {week.map((cell, cIdx) => {
                                          if (!cell) return <div key={cIdx} className="w-[9px] h-[9px] bg-transparent rounded-[1.5px]" />;
                                          const cellColor = getColor(cell.count);
                                          return (
                                            <div
                                              key={cIdx}
                                              className="w-[9px] h-[9px] rounded-[1.5px] transition-all hover:scale-125 cursor-pointer relative group"
                                              style={{ backgroundColor: cellColor }}
                                            >
                                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 bg-[#0b0a12] border border-purple-500/20 px-2 py-1 rounded-lg text-[8px] font-mono text-purple-300 shadow-xl whitespace-nowrap">
                                                {cell.count} commits on {new Date(cell.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ))}
                                  </div>
                                  <span className="text-[9px] font-extrabold text-gray-300 uppercase tracking-widest pl-0.5">{month.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Top Repositories Preview */}
                        <div className="space-y-3">
                          <span className="text-xs font-black text-purple-400 uppercase tracking-wider block">Top Showcase Repositories</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {repositoriesList.slice(0, 3).map(repo => (
                              <div key={repo.name} className={`${card} rounded-2xl p-4 border flex flex-col justify-between hover:border-purple-500/30 transition-all`}>
                                <div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-extrabold text-white">{repo.name}</span>
                                    <span className="text-[8px] font-bold text-gray-500 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full">Public</span>
                                  </div>
                                  <p className="text-[9.5px] text-gray-500 font-semibold mt-2 line-clamp-2 leading-relaxed">{repo.desc}</p>
                                </div>
                                <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between">
                                  <span className="text-[8px] font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded">{repo.tech}</span>
                                  <span className="text-[8.5px] text-gray-500 font-semibold">{repo.updated}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* REPOSITORIES WORKSPACE */}
                    {activeTab === 'Repositories' && (
                      <div className="space-y-6">
                        {/* Search, Filter, Sort Controls */}
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-[#0b0a12]/60 border border-white/5 p-4 rounded-2xl">
                          <div className="flex-1 w-full relative">
                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input 
                              type="text" 
                              placeholder="Search repositories by name or description..."
                              value={repoSearch}
                              onChange={e => setRepoSearch(e.target.value)}
                              className="w-full bg-[#0f141d] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500/40 font-semibold transition-all"
                            />
                          </div>

                          <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-1.5 bg-[#0f141d] border border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-gray-400">
                              <Filter size={12} className="text-purple-400" />
                              <select 
                                value={repoLanguage}
                                onChange={e => setRepoLanguage(e.target.value)}
                                className="bg-transparent text-gray-300 font-extrabold focus:outline-none cursor-pointer"
                              >
                                <option value="All">All Languages</option>
                                <option value="TypeScript">TypeScript</option>
                                <option value="JavaScript">JavaScript</option>
                                <option value="React">React</option>
                                <option value="Next.js">Next.js</option>
                                <option value="CSS">CSS</option>
                                <option value="Python">Python</option>
                                <option value="C++">C++</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-1.5 bg-[#0f141d] border border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-gray-400">
                              <ArrowUpDown size={12} className="text-purple-400" />
                              <select 
                                value={repoSort}
                                onChange={e => setRepoSort(e.target.value)}
                                className="bg-transparent text-gray-300 font-extrabold focus:outline-none cursor-pointer"
                              >
                                <option value="stars">Stars Count</option>
                                <option value="forks">Forks Count</option>
                                <option value="name">Alphabetical</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Repos Grid */}
                        {filteredRepos.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {filteredRepos.map(repo => (
                              <div key={repo.name} className={`${card} rounded-2xl p-4 border flex flex-col justify-between hover:border-purple-500/30 transition-all group`}>
                                <div>
                                  <div className="flex justify-between items-center gap-2">
                                    <span className="text-xs font-extrabold text-white truncate group-hover:text-purple-400 transition-colors">{repo.name}</span>
                                    <span className={`text-[7.5px] font-black px-1.5 py-0.5 rounded-full border leading-none ${
                                      repo.isPublic 
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    }`}>
                                      {repo.isPublic ? 'Public' : 'Private'}
                                    </span>
                                  </div>
                                  <p className="text-[9.5px] text-gray-500 font-semibold mt-2.5 line-clamp-3 leading-relaxed">{repo.desc}</p>
                                </div>

                                <div className="mt-4 pt-3.5 border-t border-white/5 space-y-3">
                                  <div className="flex justify-between items-center text-[8.5px] font-mono font-bold text-gray-500">
                                    <span className="flex items-center gap-1"><Star size={10} className="text-yellow-500" />{repo.stars} stars</span>
                                    <span className="flex items-center gap-1"><GitFork size={10} className="text-purple-400" />{repo.forks} forks</span>
                                  </div>

                                  <div className="flex items-center justify-between text-[7.5px] font-extrabold text-gray-400 bg-white/[0.01] border border-white/5 p-2 rounded-lg">
                                    <span>Language: <span className="text-white">{repo.tech}</span></span>
                                    <span>Commits: <span className="text-purple-400">{repo.commits}</span></span>
                                  </div>

                                  <div className="flex items-center gap-2 pt-1">
                                    <button className="flex-1 py-1.5 bg-[#161b22] hover:bg-[#21262d] border border-white/5 hover:border-purple-500/20 text-white rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 transition-all">
                                      <span>Repository</span>
                                      <ExternalLink size={8} />
                                    </button>
                                    {repo.demoUrl && (
                                      <Link href={repo.demoUrl} target="_blank" className="p-1.5 bg-purple-600/10 border border-purple-500/20 hover:border-purple-500/40 rounded-lg text-purple-400 hover:text-white transition-all flex items-center justify-center">
                                        <Eye size={12} />
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-[#0f141d]/50 border border-white/5 rounded-2xl">
                            <span className="text-xs text-gray-500 font-extrabold">No repositories match your filter selection.</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* CONTRIBUTIONS WORKSPACE */}
                    {activeTab === 'Contributions' && (() => {
                      const monthlyCommitsDataset = [
                        { label: 'Jan', value: 240, height: 'h-[40%]', info: '240 commits - Initial skeleton wrappers built.' },
                        { label: 'Feb', value: 310, height: 'h-[52%]', info: '310 commits - Analytics engine completed.' },
                        { label: 'Mar', value: 450, height: 'h-[75%]', info: '450 commits - Interactive heatmaps integrated.' },
                        { label: 'Apr', value: 380, height: 'h-[64%]', info: '380 commits - Multi-platform scrapers synchronized.' },
                        { label: 'May', value: 520, height: 'h-[86%]', info: '520 commits - Clerk OAuth & premium dark styles.' },
                        { label: 'Jun', value: 600, height: 'h-[100%]', info: '600 commits - Maximum contributions peak logged!' },
                      ];

                      const activeHoursDataset = [
                        { label: '12AM', pct: 15, commits: 38, focus: 'Late Night Focus' },
                        { label: '4AM', pct: 5, commits: 12, focus: 'Off-Peak Hours' },
                        { label: '8AM', pct: 30, commits: 110, focus: 'Morning Warmup' },
                        { label: '12PM', pct: 60, commits: 280, focus: 'Afternoon Flow' },
                        { label: '4PM', pct: 75, commits: 390, focus: 'Pre-Dinner Drive' },
                        { label: '8PM', pct: 95, commits: 520, focus: 'Peak Creative Sprint' },
                        { label: '11PM', pct: 88, commits: 440, focus: 'Midnight Session' },
                      ];

                      return (
                        <div className="space-y-6">
                          {/* Top Heatmap Matrix */}
                          <div className={`${card} rounded-2xl p-5 border`}>
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                              <span className="text-xs font-black text-purple-400 uppercase tracking-wider">GitHub heatmap (gregorian perfect)</span>
                              <span className="text-[8.5px] font-mono text-emerald-400">Total Commits: 2.45K</span>
                            </div>
                            
                            <div ref={scrollContainerRef} className="overflow-x-auto pt-2 pb-1 scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent">
                              <div className="flex items-start gap-3.5 min-w-max pr-2">
                                {monthsData.map((month, mIdx) => (
                                  <div key={mIdx} className="flex flex-col gap-1.5">
                                    <div className="flex gap-[3.5px]">
                                      {month.weeks.map((week, wIdx) => (
                                        <div key={wIdx} className="flex flex-col gap-[3.5px]">
                                          {week.map((cell, cIdx) => {
                                            if (!cell) return <div key={cIdx} className="w-[9px] h-[9px] bg-transparent rounded-[1.5px]" />;
                                            const cellColor = getColor(cell.count);
                                            return (
                                              <div
                                                key={cIdx}
                                                className="w-[9px] h-[9px] rounded-[1.5px] transition-all hover:scale-125 cursor-pointer relative group"
                                                style={{ backgroundColor: cellColor }}
                                                onMouseEnter={() => setHoveredHeatmapDay({ date: cell.date, count: cell.count })}
                                                onMouseLeave={() => setHoveredHeatmapDay(null)}
                                              />
                                            );
                                          })}
                                        </div>
                                      ))}
                                    </div>
                                    <span className="text-[9px] font-extrabold text-gray-300 uppercase tracking-widest pl-0.5">{month.label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Heatmap Tooltip Summary Bar */}
                            <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between min-h-[30px] bg-[#0b0a12]/40 rounded-xl px-4 py-2 border border-white/[0.02]">
                              {hoveredHeatmapDay ? (
                                <div className="flex items-center gap-2 text-[9.5px] font-bold text-gray-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                                  <span>
                                    Selected: <span className="text-purple-400 font-extrabold">{hoveredHeatmapDay.count} commits</span> logged on <span className="text-white font-extrabold">{new Date(hoveredHeatmapDay.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[9px] text-gray-500 font-extrabold flex items-center gap-1">
                                  <Sparkles size={11} className="text-purple-400/80 animate-pulse" />
                                  <span>Move your mouse cursor over matrix cells to inspect daily commit telemetry.</span>
                                </span>
                              )}
                              <div className="flex items-center gap-1.5 text-[8.5px] font-extrabold text-gray-500">
                                <span>Less</span>
                                <div className="w-2.5 h-2.5 rounded-[1px] bg-[#161b22]" />
                                <div className="w-2.5 h-2.5 rounded-[1px] bg-[#0e4429]" />
                                <div className="w-2.5 h-2.5 rounded-[1px] bg-[#006d32]" />
                                <div className="w-2.5 h-2.5 rounded-[1px] bg-[#26a641]" />
                                <div className="w-2.5 h-2.5 rounded-[1px] bg-[#39d353]" />
                                <div className="w-2.5 h-2.5 rounded-[1px] bg-[#7ee787]" />
                                <span>More</span>
                              </div>
                            </div>
                          </div>

                          {/* Commits trends and active hours */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            
                            {/* Interactive Monthly commits bar */}
                            <div className={`${card} rounded-2xl p-5 border flex flex-col justify-between relative overflow-hidden`}>
                              <div className="mb-4 flex items-center justify-between">
                                <div>
                                  <span className="text-xs font-black text-purple-400 uppercase tracking-wider block">Commits per Month</span>
                                  <span className="text-[8px] text-gray-500 mt-0.5 block">Last 6 Months logged activity</span>
                                </div>
                                <span className="text-[8px] text-gray-500 font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">Interactive Bars</span>
                              </div>

                              {/* Monthly Bar chart */}
                              <div className="h-40 flex items-end justify-between gap-3 pt-6 select-none relative">
                                {monthlyCommitsDataset.map(m => (
                                  <div 
                                    key={m.label} 
                                    onMouseEnter={() => setHoveredMonthBar(m.label)}
                                    onMouseLeave={() => setHoveredMonthBar(null)}
                                    className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative"
                                  >
                                    {/* Tooltip on Hover */}
                                    {hoveredMonthBar === m.label && (
                                      <div className="absolute bottom-full mb-2 bg-[#0b0a12]/95 border border-purple-500/30 p-2 rounded-lg shadow-2xl z-50 pointer-events-none text-center min-w-[120px] transition-all">
                                        <span className="text-[9px] font-black text-white block">{m.label} Commits</span>
                                        <span className="text-[10px] font-black text-purple-400 block font-mono mt-0.5">{m.value} logged</span>
                                      </div>
                                    )}

                                    <div className={`w-full rounded-xl flex items-end h-32 overflow-hidden border transition-all duration-200 ${
                                      hoveredMonthBar === m.label 
                                        ? 'border-purple-500 bg-[#21262d] scale-x-[1.05]' 
                                        : 'border-white/5 bg-[#161b22]'
                                    }`}>
                                      <div className={`w-full bg-gradient-to-t from-purple-600 to-indigo-500 rounded-b-xl ${m.height} group-hover:brightness-110 transition-all`} />
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-500">{m.label}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Dynamic Month Details */}
                              <div className="mt-4 pt-3 border-t border-white/5 min-h-[36px]">
                                {hoveredMonthBar ? (
                                  <p className="text-[9.5px] text-gray-400 font-semibold leading-relaxed">
                                    <span className="text-purple-400 font-black uppercase tracking-wider mr-1.5">Info:</span>
                                    {monthlyCommitsDataset.find(m => m.label === hoveredMonthBar)?.info}
                                  </p>
                                ) : (
                                  <span className="text-[8.5px] text-gray-500 font-extrabold block">Hover over individual monthly bars to inspect detailed release milestones.</span>
                                )}
                              </div>
                            </div>

                            {/* Active hours bar chart */}
                            <div className={`${card} rounded-2xl p-5 border flex flex-col justify-between relative`}>
                              <div className="mb-4 flex items-center justify-between">
                                <div>
                                  <span className="text-xs font-black text-purple-400 uppercase tracking-wider block">Active Coding Hours</span>
                                  <span className="text-[8px] text-gray-500 mt-0.5 block">Commit concentration based on time of day</span>
                                </div>
                                <span className="text-[8px] text-gray-500 font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">Interactive Hours</span>
                              </div>

                              <div className="h-40 flex items-end justify-between gap-1.5 pt-6 select-none relative">
                                {activeHoursDataset.map(h => (
                                  <div 
                                    key={h.label} 
                                    onMouseEnter={() => setHoveredHourBar(h.label)}
                                    onMouseLeave={() => setHoveredHourBar(null)}
                                    className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative"
                                  >
                                    {/* Tooltip on Hover */}
                                    {hoveredHourBar === h.label && (
                                      <div className="absolute bottom-full mb-2 bg-[#0b0a12]/95 border border-pink-500/30 p-2 rounded-lg shadow-2xl z-50 pointer-events-none text-center min-w-[100px] transition-all">
                                        <span className="text-[9px] font-black text-white block">{h.label} Focus</span>
                                        <span className="text-[10px] font-black text-pink-400 block font-mono mt-0.5">{h.commits} Commits</span>
                                      </div>
                                    )}

                                    <div className={`w-full rounded-lg flex items-end h-32 overflow-hidden border transition-all duration-200 ${
                                      hoveredHourBar === h.label 
                                        ? 'border-pink-500 bg-[#21262d] scale-x-[1.05]' 
                                        : 'border-white/5 bg-[#161b22]'
                                    }`}>
                                      <div 
                                        className="w-full bg-gradient-to-t from-pink-500 to-rose-500 rounded-b-lg group-hover:brightness-110 transition-all"
                                        style={{ height: `${h.pct}%` }}
                                      />
                                    </div>
                                    <span className="text-[7.5px] font-bold text-gray-500">{h.label}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Dynamic Hour Details */}
                              <div className="mt-4 pt-3 border-t border-white/5 min-h-[36px]">
                                {hoveredHourBar ? (
                                  <p className="text-[9.5px] text-gray-400 font-semibold leading-relaxed">
                                    <span className="text-pink-400 font-black uppercase tracking-wider mr-1.5">Focus Grade:</span>
                                    {activeHoursDataset.find(h => h.label === hoveredHourBar)?.focus} — <span className="text-white font-extrabold">{activeHoursDataset.find(h => h.label === hoveredHourBar)?.pct}% productivity efficiency peak</span>.
                                  </p>
                                ) : (
                                  <span className="text-[8.5px] text-gray-500 font-extrabold block">Hover over timezone focus bars to inspect productivity classifications.</span>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>
                      );
                    })()}                        {/* LANGUAGES WORKSPACE */}
                    {activeTab === 'Languages' && (
                      <div className="space-y-6">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                            
                            {/* Left Donut widget */}
                            <div className={`${card} lg:col-span-5 rounded-2xl p-5 border flex flex-col justify-between`}>
                              <div className="mb-4 pb-2 border-b border-white/5">
                                <span className="text-xs font-black text-purple-400 uppercase tracking-wider">Interactive Language Donut</span>
                              </div>

                              <div className="flex items-center justify-center py-6">
                                <div className="relative w-40 h-40">
                                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="3" />
                                    
                                    {/* TypeScript Segment */}
                                    <circle 
                                      cx="18" cy="18" r="15.915" fill="none" 
                                      stroke="#a855f7" strokeWidth={selectedLanguageHover === 'TypeScript' ? '4.5' : '3.5'} 
                                      strokeDasharray="35 65" strokeDashoffset="0"
                                      className="transition-all duration-300 cursor-pointer hover:stroke-purple-400"
                                      onMouseEnter={() => setSelectedLanguageHover('TypeScript')}
                                    />
                                    {/* Python Segment */}
                                    <circle 
                                      cx="18" cy="18" r="15.915" fill="none" 
                                      stroke="#3b82f6" strokeWidth={selectedLanguageHover === 'Python' ? '4.5' : '3.5'} 
                                      strokeDasharray="20 80" strokeDashoffset="-35"
                                      className="transition-all duration-300 cursor-pointer hover:stroke-blue-400"
                                      onMouseEnter={() => setSelectedLanguageHover('Python')}
                                    />
                                    {/* JavaScript Segment */}
                                    <circle 
                                      cx="18" cy="18" r="15.915" fill="none" 
                                      stroke="#eab308" strokeWidth={selectedLanguageHover === 'JavaScript' ? '4.5' : '3.5'} 
                                      strokeDasharray="18 82" strokeDashoffset="-55"
                                      className="transition-all duration-300 cursor-pointer hover:stroke-yellow-400"
                                      onMouseEnter={() => setSelectedLanguageHover('JavaScript')}
                                    />
                                    {/* C++ Segment */}
                                    <circle 
                                      cx="18" cy="18" r="15.915" fill="none" 
                                      stroke="#10b981" strokeWidth={selectedLanguageHover === 'C++' ? '4.5' : '3.5'} 
                                      strokeDasharray="10 90" strokeDashoffset="-73"
                                      className="transition-all duration-300 cursor-pointer hover:stroke-emerald-400"
                                      onMouseEnter={() => setSelectedLanguageHover('C++')}
                                    />
                                    {/* CSS Segment */}
                                    <circle 
                                      cx="18" cy="18" r="15.915" fill="none" 
                                      stroke="#ec4899" strokeWidth={selectedLanguageHover === 'CSS / Styling' ? '4.5' : '3.5'} 
                                      strokeDasharray="8 92" strokeDashoffset="-83"
                                      className="transition-all duration-300 cursor-pointer hover:stroke-pink-400"
                                      onMouseEnter={() => setSelectedLanguageHover('CSS / Styling')}
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center select-none text-center p-2">
                                    <span className="text-[9.5px] font-black text-gray-500 uppercase tracking-widest leading-none">Hover Slice</span>
                                    <span className="text-xs font-black text-white mt-1 block leading-tight truncate max-w-[80px]">{selectedLanguageHover}</span>
                                    <span className="text-base font-extrabold text-purple-400 font-mono mt-0.5 leading-none">{currentLang.pct}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right telemetry table */}
                            <div className={`${card} lg:col-span-7 rounded-2xl p-5 border flex flex-col justify-between`}>
                              <div className="mb-4 pb-2 border-b border-white/5 flex items-center justify-between">
                                <span className="text-xs font-black text-purple-400 uppercase tracking-wider">Usage & Project Metrics</span>
                                <span className="text-[8px] text-gray-500 font-bold">Hover rows to analyze</span>
                              </div>

                              <div className="space-y-2">
                                {Object.entries(languagesMap).map(([name, l]) => (
                                  <div 
                                    key={name} 
                                    onMouseEnter={() => setSelectedLanguageHover(name)}
                                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                                      selectedLanguageHover === name 
                                        ? 'border-purple-500/40 bg-purple-500/5 shadow-md scale-[1.01]' 
                                        : 'border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.02]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: l.color }} />
                                      <span className="text-xs font-extrabold text-white">{name}</span>
                                    </div>

                                    <div className="flex items-center gap-5 text-[9.5px] font-mono font-bold text-gray-400">
                                      <span>Usage: <span className="text-white">{l.pct}</span></span>
                                      <span>Projects: <span className="text-purple-400">{l.projects}</span></span>
                                      <span>Commits: <span className="text-emerald-400">{l.commits}</span></span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>

                          {/* Dynamic Active Language Details Card */}
                          <div className={`${card} rounded-2xl p-5 border shadow-2xl relative overflow-hidden group`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/[0.02] rounded-full blur-2xl pointer-events-none" />
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles size={14} className="text-purple-400 animate-pulse" />
                              <span className="text-xs font-black text-white uppercase tracking-wider">
                                {selectedLanguageHover} Usage Insights
                              </span>
                            </div>

                            <p className="text-[10px] text-gray-400 font-semibold leading-relaxed max-w-3xl">
                              {currentLang.desc}
                            </p>

                            <div className="mt-4 pt-3.5 border-t border-white/5 flex flex-wrap items-center gap-2.5">
                              <span className="text-[8.5px] font-black text-gray-500 uppercase tracking-widest mr-1">Active Repositories:</span>
                              {currentLang.repos.map(r => (
                                <span 
                                  key={r} 
                                  className="px-2.5 py-1 bg-[#161b22] hover:bg-[#21262d] border border-white/5 hover:border-purple-500/20 text-white rounded-lg text-[9px] font-extrabold transition-all cursor-pointer shadow-[0_0_8px_rgba(255,255,255,0.02)]"
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                    )}

                    {/* ACTIVITY WORKSPACE */}
                    {activeTab === 'Activity' && (
                      <div className="space-y-5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-purple-400 uppercase tracking-wider">GitHub Activity Feed</span>
                          <span className="text-[8px] text-gray-500 font-bold">Realtime telemetries scraper</span>
                        </div>

                        <div className="space-y-3">
                          {[
                            { text: 'Pushed 5 commits to CodeSync frontend page scraper', time: '2 hours ago', type: 'commit', repo: 'CodeSync' },
                            { text: 'Opened Pull Request #14 inside devai-chat branch configurations', time: '4 hours ago', type: 'pr_open', repo: 'DevAI-Chat' },
                            { text: 'Merged Pull Request #12: Fix resolve auth rate limits', time: '1 day ago', type: 'pr_merge', repo: 'CodeSync' },
                            { text: 'Created repository quick-scraper tool under MIT License', time: '2 days ago', type: 'create', repo: 'quick-scraper' },
                            { text: 'Starred freeCodeCamp/freeCodeCamp public organization', time: '3 days ago', type: 'star', repo: 'freeCodeCamp' },
                          ].map((act, idx) => (
                            <div key={idx} className={`${card} rounded-xl p-3.5 border flex items-center justify-between group hover:border-purple-500/20 transition-all`}>
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                  {act.type === 'commit' && <GitCommit size={14} />}
                                  {act.type.includes('pr') && <GitPullRequest size={14} />}
                                  {act.type === 'create' && <FolderGit2 size={14} />}
                                  {act.type === 'star' && <Star size={14} />}
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-gray-200 group-hover:text-purple-400 transition-colors block">{act.text}</span>
                                  <span className="text-[8px] text-gray-500 font-semibold block mt-1">{act.time}</span>
                                </div>
                              </div>
                              <span className="text-[8.5px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">{act.repo}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* OPEN SOURCE WORKSPACE */}
                    {activeTab === 'Open Source' && (
                      <div className="space-y-6">
                        {/* OSS Summary numbers */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {[
                            { label: 'OSS Repos Contributed', value: '32', color: 'text-purple-400', sub: '▲ 4 this month' },
                            { label: 'Merged Pull Requests', value: '96', color: 'text-emerald-400', sub: '75% Merged rate' },
                            { label: 'Contribution Score', value: '9.8 / 10', color: 'text-yellow-500', sub: 'Top 1.5% globally' },
                            { label: 'Top Org Contribution', value: 'Vercel, Next.js', color: 'text-blue-400', sub: '5 contributions' },
                          ].map((stat, idx) => (
                            <div key={idx} className={`${card} rounded-2xl p-4 border flex flex-col justify-between hover:border-white/10 transition-all`}>
                              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">{stat.label}</span>
                              <div className="mt-3">
                                <span className="text-lg font-extrabold text-white font-mono">{stat.value}</span>
                                <span className={`block text-[8.5px] ${stat.color} font-bold mt-1`}>{stat.sub}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* OSS Achievements with beautiful badges */}
                        <div className="space-y-3">
                          <span className="text-xs font-black text-purple-400 uppercase tracking-wider block">OSS Achievements & Badges</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                              { name: 'Pull Shark', desc: 'Opened 50+ pull requests on public repositories.', badge: '🦈 Pull Shark Badge', color: 'from-purple-600 to-indigo-600' },
                              { name: 'Star Gazer', desc: 'Received 100+ stars across public repositories.', badge: '⭐ Star Gazer Badge', color: 'from-yellow-600 to-amber-600' },
                              { name: 'Code Contributor', desc: 'Contributed code to 25+ public organizations.', badge: '🏆 Contributor Medal', color: 'from-emerald-600 to-teal-600' },
                            ].map(ach => (
                              <div key={ach.name} className={`${card} rounded-2xl p-4 border flex flex-col justify-between relative overflow-hidden group`}>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
                                <div>
                                  <span className="text-xs font-extrabold text-white block">{ach.name}</span>
                                  <p className="text-[9.5px] text-gray-500 font-semibold mt-1.5 leading-relaxed">{ach.desc}</p>
                                </div>
                                <div className={`mt-4 w-full py-1.5 bg-gradient-to-r ${ach.color} text-white rounded-xl text-[9px] font-black uppercase tracking-widest text-center shadow-[0_0_10px_rgba(255,255,255,0.05)]`}>
                                  {ach.badge}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'Performance' && (
                      <div className="space-y-6">
                          
                          {/* Timeframe Range Selector */}
                          <div className="flex justify-between items-center bg-[#0b0a12]/60 border border-white/5 p-3 rounded-2xl">
                            <span className="text-xs font-black text-purple-400 uppercase tracking-wider pl-1">Performance Timeframe</span>
                            <div className="flex gap-1.5 bg-[#0f141d] p-1 border border-white/5 rounded-xl">
                              {['7D', '30D', '90D'].map(range => (
                                <button
                                  key={range}
                                  onClick={() => setPerformanceRange(range)}
                                  className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                                    performanceRange === range 
                                      ? 'bg-purple-600 text-white shadow-md' 
                                      : 'text-gray-400 hover:text-white'
                                  }`}
                                >
                                  {range}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Premium Telemetries consistency */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className={`${card} rounded-2xl p-5 border flex flex-col justify-between hover:border-purple-500/20 transition-all`}>
                              <span className="text-[8.5px] font-black text-gray-500 uppercase tracking-widest leading-none">Commit Consistency Score</span>
                              <div className="py-4">
                                <span className="text-3xl font-extrabold text-white tracking-tight">{currentPerf.consistency}</span>
                                <span className="block text-[8.5px] text-emerald-400 font-bold mt-1.5">{currentPerf.consistencySub}</span>
                              </div>
                            </div>

                            <div className={`${card} rounded-2xl p-5 border flex flex-col justify-between hover:border-purple-500/20 transition-all`}>
                              <span className="text-[8.5px] font-black text-gray-500 uppercase tracking-widest leading-none">Weekly Contribution Trends</span>
                              <div className="py-4">
                                <span className="text-3xl font-extrabold text-white tracking-tight">{currentPerf.trend}</span>
                                <span className="block text-[8.5px] text-purple-400 font-bold mt-1.5">{currentPerf.trendSub}</span>
                              </div>
                            </div>

                            {/* AI INSIGHTS CARD */}
                            <div className={`${card} rounded-2xl p-5 border flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/20 transition-all`}>
                              <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
                              <span className="text-[8.5px] font-black text-purple-400 uppercase tracking-widest leading-none flex items-center gap-1">
                                <Brain size={12} className="text-purple-400 animate-pulse" />
                                <span>AI Telemetry Insight</span>
                              </span>
                              <div className="py-3">
                                <span className="text-xs font-extrabold text-white block">{currentPerf.aiSub}</span>
                                <span className="text-lg font-black text-purple-300 block mt-1">{currentPerf.aiInsight}</span>
                              </div>
                            </div>
                          </div>

                          {/* Repo Growth Chart preview */}
                          <div className={`${card} rounded-2xl p-5 border relative overflow-hidden`}>
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                              <div>
                                <span className="text-xs font-black text-purple-400 uppercase tracking-wider block">Repository Growth Track</span>
                                <span className="text-[8px] text-gray-500 mt-0.5 block">Hover across the path to track milestones</span>
                              </div>
                              <span className="text-[8px] font-mono text-gray-500 font-bold">Widescreen linear trajectory</span>
                            </div>

                            {/* Interactive SVG Spline */}
                            <div className="h-44 relative pt-4 select-none">
                              <svg 
                                viewBox="0 0 350 120" 
                                className="w-full h-full overflow-visible"
                                onMouseMove={(e) => handleLineMouseMove(e, growthPoints.length, setHoveredGrowthPoint)}
                                onMouseLeave={() => setHoveredGrowthPoint(null)}
                              >
                                <defs>
                                  <linearGradient id="growthGlow" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                                  </linearGradient>
                                </defs>

                                <line x1="0" y1="100" x2="350" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                <line x1="0" y1="60" x2="350" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                <line x1="0" y1="20" x2="350" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                                <path 
                                  d="M 0 110 L 0 95 L 58 85 L 116 75 L 174 65 L 232 50 L 290 35 L 348 15 L 348 110 Z" 
                                  fill="url(#growthGlow)" 
                                />
                                <path 
                                  d="M 0 95 Q 29 90 58 85 Q 87 80 116 75 Q 145 70 174 65 Q 203 57.5 232 50 Q 261 42.5 290 35 Q 319 25 348 15" 
                                  fill="none" stroke="#a855f7" strokeWidth="2.5" 
                                />

                                {/* Interactive dashed guide line */}
                                {activePoint && (
                                  <>
                                    <line 
                                      x1={activePoint.x} y1="0" x2={activePoint.x} y2="100" 
                                      stroke="rgba(168,85,247,0.4)" strokeWidth="1.5" strokeDasharray="3 3" 
                                    />
                                    <circle 
                                      cx={activePoint.x} cy={activePoint.y} r="5" 
                                      fill="#a855f7" stroke="#ffffff" strokeWidth="2"
                                      className="shadow-2xl animate-pulse"
                                    />
                                  </>
                                )}
                              </svg>

                              {/* Interactive HTML Tooltip inside chart */}
                              {activePoint && (
                                <div 
                                  className="absolute bg-[#0b0a12]/95 border border-purple-500/30 p-2.5 rounded-xl shadow-2xl z-50 pointer-events-none transition-all duration-100 flex flex-col gap-1 text-[9.5px]"
                                  style={{ 
                                    left: `${Math.min(75, Math.max(5, (activePoint.x / 350) * 100))}%`,
                                    top: '15px'
                                  }}
                                >
                                  <span className="font-extrabold text-white uppercase tracking-wider">{activePoint.label}</span>
                                  <div className="flex flex-col gap-0.5 text-gray-400 font-semibold font-mono">
                                    <span>Repositories: <span className="text-white font-extrabold">{activePoint.value}</span></span>
                                    <span>Commits Made: <span className="text-purple-400 font-extrabold">{activePoint.commits}</span></span>
                                    <span>Top Language: <span className="text-emerald-400 font-extrabold">{activePoint.lang}</span></span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                    )}

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </main>

          {/* RIGHT SIDEBAR COLUMN */}
          <aside className="hidden xl:flex flex-col w-72 border-l border-white/5 bg-[#0b0a12]/50 p-5 space-y-6 overflow-y-auto scrollbar-none flex-shrink-0 z-20">
            
            {/* GitHub Streak Widget */}
            <div className="bg-[#0f141d] border border-white/5 rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-extrabold text-orange-400 uppercase tracking-wider flex items-center gap-1">
                  <Flame size={12} className="text-orange-500 animate-pulse" />
                  <span>GitHub Streak</span>
                </span>
                <span className="text-[7.5px] font-bold text-gray-500">Best: 210 days</span>
              </div>

              <div className="mt-2">
                <span className="text-2xl font-extrabold text-white font-mono block leading-none">156 days</span>
                <span className="text-[8px] text-gray-500 font-bold mt-1.5 block leading-none">Keep it up! 🔥</span>
              </div>

              {/* Mini activity heatmap */}
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                <div className="flex gap-[2px] justify-between">
                  {Array.from({ length: 19 }).map((_, cIdx) => (
                    <div key={cIdx} className="flex flex-col gap-[2px]">
                      {Array.from({ length: 3 }).map((_, rIdx) => {
                        const seed = cIdx * 3 + rIdx;
                        let cellColor = '#161b22';
                        if (seed % 3 === 0) cellColor = '#0e4429';
                        if (seed % 4 === 0) cellColor = '#006d32';
                        if (seed % 5 === 0) cellColor = '#26a641';
                        if (seed % 7 === 0) cellColor = '#39d353';
                        return (
                          <div 
                            key={rIdx} 
                            className="w-[8px] h-[8px] rounded-[1px] transition-transform duration-100 hover:scale-110 cursor-pointer"
                            style={{ backgroundColor: cellColor }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center text-[7px] text-gray-500 font-bold select-none pt-0.5">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>
              </div>
            </div>

            {/* Recent Commits */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-extrabold text-gray-500 uppercase tracking-widest leading-none">Recent Commits</span>
                <span className="text-[8px] font-extrabold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer">View All</span>
              </div>

              <div className="space-y-3.5 pl-1.5">
                {[
                  { name: 'Fix: resolve auth issue in Clerk callback', date: '2h ago' },
                  { name: 'Update dashboard UI bento grids layout', date: '5h ago' },
                  { name: 'Fix: resolve api rate limiting on repo fetch', date: '1d ago' },
                  { name: 'Refactor API scraper integrations', date: '2d ago' },
                  { name: 'Improve performance scrollbar scroll-left', date: '3d ago' },
                ].map((c, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3 group cursor-pointer">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] mt-1.5 flex-shrink-0" />
                      <span className="text-[10px] font-bold text-gray-300 group-hover:text-purple-400 transition-colors leading-relaxed truncate max-w-[170px]">
                        {c.name}
                      </span>
                    </div>
                    <span className="text-[8px] font-mono text-gray-500 font-bold flex-shrink-0 mt-0.5">
                      {c.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Source Achievements */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-extrabold text-gray-500 uppercase tracking-widest leading-none">Open Source Achievements</span>
              </div>

              <div className="space-y-2.5">
                {[
                  { name: 'Pull Shark', desc: 'Opened 50+ pull requests on public repositories.', icon: GitPullRequest, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
                  { name: 'Star Gazer', desc: 'Received 100+ stars across public repositories.', icon: Star, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
                  { name: 'Code Contributor', desc: 'Contributed code to 25+ public organizations.', icon: Award, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                ].map((ach, idx) => (
                  <div key={idx} className={`flex items-center gap-3 bg-[#0f141d]/60 border border-white/5 p-3 rounded-xl hover:border-purple-500/20 transition-all group`}>
                    <div className={`p-2.5 rounded-xl ${ach.color} border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-250`}>
                      <ach.icon size={13} />
                    </div>
                    <div>
                      <span className="text-[9.5px] font-extrabold text-white block leading-tight">{ach.name}</span>
                      <span className="text-[8px] text-gray-500 font-bold leading-normal mt-0.5 block">{ach.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contribution Milestones */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-extrabold text-gray-500 uppercase tracking-widest leading-none">Contribution Milestones</span>
              </div>

              <div className="space-y-3 bg-[#0f141d]/50 border border-white/5 p-4 rounded-xl">
                {[
                  { label: '1,000 Commits Limit', current: 920, target: 1000, pct: 92, color: 'from-purple-500 to-indigo-500' },
                  { label: '500 Pull Requests', current: 360, target: 500, pct: 72, color: 'from-blue-500 to-cyan-500' },
                  { label: '100 Repository Stars', current: 88, target: 100, pct: 88, color: 'from-amber-500 to-orange-500' },
                ].map((m, idx) => (
                  <div key={idx} className="space-y-1.5 last:mb-0">
                    <div className="flex justify-between items-center text-[8.5px] font-bold text-gray-400">
                      <span>{m.label}</span>
                      <span className="font-mono text-white">{m.pct}%</span>
                    </div>
                    
                    {/* Glowing Progress bar */}
                    <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5 relative">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-500`}
                        style={{ width: `${m.pct}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[7.5px] font-mono text-gray-500 font-bold">
                      <span>{m.current} completed</span>
                      <span>Target: {m.target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </aside>

        </div>

      </div>

    </div>
  );
}
