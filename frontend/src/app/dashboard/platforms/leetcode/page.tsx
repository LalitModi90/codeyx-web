"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../../../../components/OnboardingProvider';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import TopNavbar from '../../../../components/shared/TopNavbar';
import { platformService } from '../../../../services/platform.service';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import {
  Home, User, FolderGit2, Layers, BookOpen, FileCode2, ClipboardList,
  Trophy, HelpCircle, MessageSquare, Settings, LogOut, Sun, Moon,
  ChevronDown, Sparkles, RefreshCw, Activity, Award, Globe, Flame,
  Zap, ExternalLink, ArrowRight, ChevronRight, TrendingUp,
  BarChart3, Calendar, CheckCircle2, Target, Star, Bell, XCircle,
  Hash, Code, Percent
} from 'lucide-react';

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

export default function PlatformsDashboard({ params }: { params?: { platform?: string } }) {
  const { profile } = useOnboarding();
  const { isLoaded, isSignedIn, user } = useUser();
  const { openUserProfile } = useClerk();
  
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activePlatform, setActivePlatform] = useState<string>(params?.platform || 'leetcode');
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedRange, setSelectedRange] = useState('May 16 - Jun 16, 2024');
  const [hoveredLinePoint, setHoveredLinePoint] = useState<number | null>(null);
  const [hoveredRatingPoint, setHoveredRatingPoint] = useState<number | null>(null);
  const [hoveredDonutSegment, setHoveredDonutSegment] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [hovTopic, setHovTopic] = useState<number | null>(null);
  const [hovBar, setHovBar] = useState<number | null>(null);
  const [hovAccSeg, setHovAccSeg] = useState<string | null>(null);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [realtimeData, setRealtimeData] = useState<any>(null);
  const [allConnectedPlatforms, setAllConnectedPlatforms] = useState<any[]>([]);
  const [isFetchingPlatform, setIsFetchingPlatform] = useState(true);

  useEffect(() => {
    const userId = user?.id || profile?.clerkId;
    if (userId) {
      setIsFetchingPlatform(true);
      Promise.all([
        platformService.getPlatformStats(activePlatform, userId),
        platformService.getAllPlatformStats(userId)
      ])
        .then(([statsRes, allRes]: any) => {
          if (statsRes.data?.stats) {
            setRealtimeData(statsRes.data.stats);
          } else {
            setRealtimeData(null);
          }

          const platformsArray = Array.isArray(allRes) ? allRes : (Array.isArray(allRes.data) ? allRes.data : (allRes.data?.data || []));
          if (platformsArray && platformsArray.length > 0) {
            setAllConnectedPlatforms(platformsArray);
          } else {
            setAllConnectedPlatforms([]);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch platform stats", err);
          setRealtimeData(null);
          setAllConnectedPlatforms([]);
        })
        .finally(() => {
          setIsFetchingPlatform(false);
        });
    } else {
      setIsFetchingPlatform(false);
    }
  }, [activePlatform, user?.id, profile?.clerkId]);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tab: string) => {
    setIsLoadingTab(true);
    setActiveTab(tab);
    setTimeout(() => {
      setIsLoadingTab(false);
    }, 450);
  };

  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);

  const handlePlatformChange = (platKey: string) => {
    setActivePlatform(platKey);
    setActiveTab('Overview'); // reset tab
    setShowPlatformDropdown(false);
  };

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

  // Dynamically generate exact Gregorian calendar data grouped by month
  const monthsData = React.useMemo(() => {
    const monthsMap = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Map the unix timestamps to YYYY-MM-DD
    let calendarMap: Record<string, number> = {};
    if (realtimeData?.calendar) {
      Object.entries(realtimeData.calendar).forEach(([timestamp, count]) => {
        const date = new Date(parseInt(timestamp) * 1000);
        const dateStr = date.toISOString().split('T')[0];
        calendarMap[dateStr] = count as number;
      });
    }

    const result: {
      label: string;
      weeks: ({ date: string; count: number; dayOfWeek: number } | null)[][];
    }[] = [];

    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const monthLabel = monthsMap[m];
      const firstDay = new Date(y, m, 1);
      const lastDay = new Date(y, m + 1, 0);

      const weeksList: ({ date: string; count: number; dayOfWeek: number } | null)[][] = [];
      let currentWeek: ({ date: string; count: number; dayOfWeek: number } | null)[] = Array(7).fill(null);

      let curr = new Date(firstDay);
      while (curr <= lastDay) {
        const dayOfWeek = curr.getDay();
        
        // Construct YYYY-MM-DD locally to avoid timezone shifts
        const yStr = curr.getFullYear();
        const mStr = String(curr.getMonth() + 1).padStart(2, '0');
        const dStr = String(curr.getDate()).padStart(2, '0');
        const dateStr = `${yStr}-${mStr}-${dStr}`;
        
        const count = calendarMap[dateStr] || 0;

        currentWeek[dayOfWeek] = { date: dateStr, count, dayOfWeek };

        if (dayOfWeek === 6 || curr.getTime() === lastDay.getTime()) {
          weeksList.push([...currentWeek]);
          currentWeek = Array(7).fill(null);
        }
        curr.setDate(curr.getDate() + 1);
      }
      result.push({ label: monthLabel, weeks: weeksList });
    }

    return result;
  }, [selectedYear, realtimeData]);

  // Color mapping logic matching GitHub's contribution levels
  const getColor = (count: number) => {
    if (count === 0) return '#161b22'; // Inactive
    if (count < 2) return '#0e4429';   // Level 1
    if (count < 4) return '#006d32';   // Level 2
    if (count < 7) return '#26a641';   // Level 3
    if (count < 9) return '#39d353';   // Level 4
    return '#7ee787';                  // Level 5
  };

  // Scroll to latest month when selectedYear changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [selectedYear]);

  // Connected Platforms Sidebar Map
  const connectedPlatforms = [
    { name: 'LeetCode', key: 'leetcode', connected: true },
    { name: 'Codeforces', key: 'codeforces', connected: true },
    { name: 'CodeChef', key: 'codechef', connected: true },
    { name: 'AtCoder', key: 'atcoder', connected: true },
    { name: 'HackerRank', key: 'hackerrank', connected: true },
  ];

  // SVG Platform Logos
  const platformLogos: Record<string, React.ReactNode> = {
    leetcode: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 5.842l-5.7 5.7a1.373 1.373 0 0 0 0 1.942l5.7 5.7 5.406 5.406a1.374 1.374 0 0 0 1.942 0l1.01-1.01a1.374 1.374 0 0 0 0-1.942l-5.406-5.406-5.7-5.7 5.7-5.7 5.406-5.406a1.374 1.374 0 0 0 0-1.942l-1.01-1.01A1.374 1.374 0 0 0 13.483 0zM21.275 14.502a1.374 1.374 0 0 0-.961.438l-4.14 4.14a1.374 1.374 0 0 0 0 1.942l1.01 1.01a1.374 1.374 0 0 0 1.942 0l4.14-4.14a1.374 1.374 0 0 0 0-1.942l-1.01-1.01a1.374 1.374 0 0 0-.981-.438z" fill="#FFA116" />
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

  // FULL MULTI-PLATFORM DYNAMIC CONFIGURATION ENGINE
  // UI Configuration mapping for stats icons and colors
  const StatIcons: Record<string, any> = {
    solved: { icon: FileCode2, iconColor: 'text-purple-400' },
    rating: { icon: Trophy, iconColor: 'text-yellow-500' },
    rank: { icon: Globe, iconColor: 'text-blue-400' },
    streak: { icon: Flame, iconColor: 'text-orange-500' },
    reputation: { icon: Star, iconColor: 'text-amber-500' },
    repos: { icon: FolderGit2, iconColor: 'text-emerald-400' },
    followers: { icon: User, iconColor: 'text-pink-400' }
  };

  const TopicIcons = [Hash, Code, FileCode2, Layers, Percent, Target];
  const TopicColors = [
    'text-purple-400 bg-purple-500/10',
    'text-indigo-400 bg-indigo-500/10',
    'text-pink-400 bg-pink-500/10',
    'text-blue-400 bg-blue-500/10',
    'text-emerald-400 bg-emerald-500/10',
    'text-amber-400 bg-amber-500/10'
  ];

  const currentData = React.useMemo(() => {
    // If no real data is fetched yet, return a safe empty state skeleton
    const emptyState = {
      username: 'Connecting...',
      memberSince: 'N/A',
      country: 'N/A',
      stats: [
        { title: 'Total Solved', value: '0', sub: 'Syncing', subColor: 'text-gray-500', ...StatIcons.solved },
        { title: 'Rating', value: '0', sub: 'Syncing', subColor: 'text-gray-500', ...StatIcons.rating },
        { title: 'Global Rank', value: '-', sub: 'Syncing', subColor: 'text-gray-500', ...StatIcons.rank },
        { title: 'Streak', value: '0 days', sub: 'Syncing', subColor: 'text-gray-500', ...StatIcons.streak },
        { title: 'Reputation', value: '0', sub: 'Syncing', subColor: 'text-gray-500', ...StatIcons.reputation },
      ],
      donut: { easy: 0, medium: 0, hard: 0, total: 0, labelEasy: 'Easy', labelMed: 'Med', labelHard: 'Hard' },
      linePoints: [],
      contests: [],
      submissions: [],
      topics: [],
      performance: [],
      skills: { advanced: [], intermediate: [], fundamental: [] }
    };

    if (!realtimeData) return emptyState;

    const d = realtimeData;
    
    // Dynamically build the object based on available real data
    const config = { ...emptyState };
    config.username = d.username || d.raw?.login || 'Connected';
    config.country = d.country || 'N/A';
    
    if (activePlatform === 'leetcode') {
      config.stats = [
        { title: 'Total Solved', value: d.totalSolved?.toLocaleString() || '0', sub: 'From LeetCode', subColor: 'text-emerald-400', ...StatIcons.solved },
        { title: 'Contest Rating', value: d.rating > 0 ? d.rating.toLocaleString() : 'Unrated', sub: d.rating > 0 ? 'Current' : 'No Contests', subColor: d.rating > 0 ? 'text-yellow-400' : 'text-gray-500', ...StatIcons.rating },
        { title: 'Global Ranking', value: d.rank?.toLocaleString() || '-', sub: 'Global', subColor: 'text-blue-400', ...StatIcons.rank },
        { title: 'Current Streak', value: `${d.streak || 0} days`, sub: 'Keep it up!', subColor: 'text-orange-400', ...StatIcons.streak },
        { title: 'Reputation', value: d.reputation?.toLocaleString() || '0', sub: 'Total', subColor: 'text-amber-400', ...StatIcons.reputation }
      ];
      config.donut = { easy: d.easy || 0, medium: d.medium || 0, hard: d.hard || 0, total: d.totalSolved || 0, labelEasy: 'Easy', labelMed: 'Medium', labelHard: 'Hard' };
      config.linePoints = d.linePoints || [];
      config.contests = d.contests || [];
      config.submissions = d.submissions || [];
      
      // Process topics safely adding icons and colors
      if (d.topics && Array.isArray(d.topics)) {
        const maxCount = Math.max(...d.topics.map((t: any) => t.count), 1);
        config.topics = d.topics.map((t: any, i: number) => ({
          ...t,
          icon: TopicIcons[i % TopicIcons.length],
          color: TopicColors[i % TopicIcons.length],
          pct: `${Math.round((t.count / maxCount) * 100)}%`
        }));
      }

      config.skills = d.raw?.matchedUser?.tagProblemCounts || { advanced: [], intermediate: [], fundamental: [] };

      config.performance = [
        { label: 'Contests Attended', value: (d.contests?.length || 0).toString(), desc: 'Active' },
        { label: 'Rating', value: d.rating?.toString() || '0', desc: 'Current' },
      ];
    } else if (activePlatform === 'codechef') {
      config.stats = [
        { title: 'Stars', value: `${d.stars || 0}★`, sub: 'CodeChef', subColor: 'text-yellow-400', ...StatIcons.reputation },
        { title: 'Contest Rating', value: d.rating?.toLocaleString() || '0', sub: 'Current', subColor: 'text-emerald-400', ...StatIcons.rating },
        { title: 'Global Ranking', value: d.globalRank?.toLocaleString() || '-', sub: 'Global', subColor: 'text-blue-400', ...StatIcons.rank },
      ];
    } else if (activePlatform === 'github') {
      config.stats = [
        { title: 'Public Repos', value: d.publicRepos?.toLocaleString() || '0', sub: 'Repositories', subColor: 'text-emerald-400', ...StatIcons.repos },
        { title: 'Followers', value: d.followers?.toLocaleString() || '0', sub: 'Network', subColor: 'text-pink-400', ...StatIcons.followers },
        { title: 'Total Stars', value: d.totalStars?.toLocaleString() || '0', sub: 'Earned', subColor: 'text-amber-400', ...StatIcons.reputation },
        { title: 'Total Forks', value: d.totalForks?.toLocaleString() || '0', sub: 'Forks', subColor: 'text-blue-400', ...StatIcons.rank },
      ];
    } else if (activePlatform === 'codeforces') {
      config.stats = [
        { title: 'Contest Rating', value: d.rating?.toLocaleString() || '0', sub: 'Current', subColor: 'text-emerald-400', ...StatIcons.rating },
        { title: 'Global Ranking', value: d.rank?.toLocaleString() || '-', sub: 'Global', subColor: 'text-blue-400', ...StatIcons.rank },
        { title: 'Max Rating', value: d.maxRating?.toLocaleString() || '0', sub: 'Best', subColor: 'text-yellow-400', ...StatIcons.reputation },
      ];
    }

    return config;
  }, [realtimeData, activePlatform]);

  const handleLineMouseMove = (e: React.MouseEvent<SVGSVGElement>, pointsCount: number, setter: (idx: number | null) => void) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xVal = e.clientX - rect.left;
    const pct = xVal / rect.width;
    const index = Math.min(pointsCount - 1, Math.max(0, Math.round(pct * (pointsCount - 1))));
    setter(index);
  };

  return (
    <div className="min-h-screen bg-[#09090B] font-sans overflow-x-hidden selection:bg-[#FF8A00]/30 pb-20">
      <TopNavbar />

      <main className="max-w-[1600px] mx-auto px-6 pt-8 flex flex-col gap-8 relative">
        
        {/* Full Screen Connect CTA Overlay */}
        {!isFetchingPlatform && !realtimeData && (
          <div className="absolute inset-0 z-[60] flex items-start justify-center pt-40 backdrop-blur-xl bg-[#09090B]/60 rounded-3xl mt-8 mx-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="flex flex-col items-center justify-center p-12 bg-[#111216]/95 border border-white/10 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#FF8A00]/10 to-transparent opacity-50" />
              <div className="w-24 h-24 bg-[#0f141d] border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,138,0,0.15)] relative z-10">
                 <span className="scale-[2.5] opacity-80 flex items-center justify-center">{platformLogos[activePlatform]}</span>
              </div>
              <h3 className="text-3xl font-black text-white mb-3 relative z-10 capitalize">Connect Your Platform</h3>
              <p className="text-base font-semibold text-gray-400 max-w-[400px] mx-auto mb-8 relative z-10">
                Link your account to Coderyx to sync your progress, track your stats, and build your developer profile.
              </p>
              <Link href="/settings/integrations" className="relative z-10 px-10 py-4 rounded-xl bg-gradient-to-r from-[#FF8A00] to-orange-500 hover:from-orange-500 hover:to-[#FF8A00] text-black text-sm font-black shadow-[0_0_20px_rgba(255,138,0,0.3)] hover:shadow-[0_0_30px_rgba(255,138,0,0.5)] transition-all flex items-center gap-2">
                Connect Account <ExternalLink size={18} />
              </Link>
            </motion.div>
          </div>
        )}
        {/* PLATFORM TOP BANNER */}
        <div className="bg-[#111216]/60 backdrop-blur-2xl border border-white/5 rounded-[24px] p-6 lg:p-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 relative z-50 overflow-visible shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF8A00]/5 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] -ml-20 -mb-20 pointer-events-none" />
          
          {/* Identity Section */}
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-24 h-24 rounded-[20px] bg-gradient-to-b from-[#18181f] to-black border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(255,138,0,0.15)] relative group">
              <div className="absolute inset-0 bg-[#FF8A00]/5 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="scale-[2.2] relative z-10 text-white">{platformLogos[activePlatform]}</div>
              <div className="absolute -bottom-3 px-3 py-1 bg-[#FF8A00]/20 border border-[#FF8A00]/30 rounded-md text-[10px] font-black text-[#FF8A00] uppercase tracking-wider flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                <Award size={12} /> {activePlatform === 'leetcode' ? 'Knight' : activePlatform === 'codeforces' ? 'Expert' : activePlatform === 'codechef' ? '4-Star' : activePlatform === 'hackerrank' ? 'Gold' : 'Pro'}
              </div>
            </div>

            <div className="pl-2">
              <div className="flex items-center gap-4 mb-2">
                <button 
                  onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
                  className="flex items-center gap-2 group outline-none"
                >
                  <h2 className="text-4xl font-black text-white capitalize tracking-tight group-hover:text-[#FF8A00] transition-colors leading-none">
                    {activePlatform}
                  </h2>
                  <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:border-[#FF8A00]/30 transition-all">
                    <ChevronDown size={14} className={`text-gray-400 group-hover:text-[#FF8A00] transition-all ${showPlatformDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {realtimeData ? (
                  <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest leading-none">Connected</span>
                  </div>
                ) : !isFetchingPlatform ? (
                  <div className="px-3 py-1.5 rounded-full bg-gray-500/10 border border-gray-500/20 flex items-center gap-2">
                    <XCircle size={12} className="text-gray-400" />
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest leading-none">Not Connected</span>
                  </div>
                ) : null}
              </div>
              
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="text-xl font-bold text-gray-200 leading-none">{displayName}</div>
                <div className="text-sm font-semibold text-gray-500 leading-none">@{currentData.username}</div>
              </div>
              <div className="flex items-center gap-5 mt-4">
                {currentData.country && currentData.country !== 'N/A' && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold bg-white/[0.02] px-2.5 py-1.5 rounded-lg border border-white/5">
                    <Globe size={14} className="text-blue-400" /> {currentData.country}
                  </div>
                )}
                {currentData.memberSince && currentData.memberSince !== 'N/A' && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold bg-white/[0.02] px-2.5 py-1.5 rounded-lg border border-white/5">
                    <Calendar size={14} className="text-purple-400" /> Joined {currentData.memberSince}
                  </div>
                )}
              </div>
            </div>
            
            {/* Platform Dropdown */}
            <AnimatePresence>
              {showPlatformDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-32 top-24 mt-3 w-64 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-2 border z-[100] bg-[#111216]/95 border-white/10 backdrop-blur-xl"
                >
                  <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest block mb-2 px-2 pt-1">Your Connected Platforms</span>
                  {connectedPlatforms.filter(plat => allConnectedPlatforms.some(db => db.platform === plat.key)).map(plat => (
                    plat.key === 'github' ? (
                      <Link 
                        key={plat.key} 
                        href="/dashboard/platforms/github"
                        className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/[0.04] transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                            {platformLogos[plat.key]}
                          </div>
                          <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{plat.name}</span>
                        </div>
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      </Link>
                    ) : (
                      <button 
                        key={plat.key}
                        onClick={() => handlePlatformChange(plat.key)}
                        className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all group outline-none ${activePlatform === plat.key ? 'bg-white/[0.05]' : 'hover:bg-white/[0.04]'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 flex items-center justify-center transition-all ${activePlatform === plat.key ? 'opacity-100 scale-110' : 'opacity-70 group-hover:opacity-100'}`}>
                            {platformLogos[plat.key]}
                          </div>
                          <span className={`text-sm font-bold transition-colors ${activePlatform === plat.key ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{plat.name}</span>
                        </div>
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      </button>
                    )
                  ))}

                  {connectedPlatforms.filter(plat => allConnectedPlatforms.some(db => db.platform === plat.key)).length === 0 && (
                    <div className="px-3 py-4 text-xs text-gray-500 font-semibold text-center w-full">
                      No connected platforms.
                    </div>
                  )}

                  <div className="h-px w-full bg-white/5 my-1" />
                  <Link href="/settings/integrations" className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] transition-all text-xs font-semibold">
                    Manage Integrations <ExternalLink size={12} />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Stats Summary (Circles & Ranks) */}
          <div className="flex items-center gap-10 lg:gap-14 z-10 border-l border-white/5 pl-10">
            <div className="flex flex-col justify-center relative">
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-[2px] h-10 bg-[#FF8A00] rounded-full shadow-[0_0_10px_#FF8A00]" />
              <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">{currentData.stats[2]?.title || 'Global Rank'}</span>
              <span className="text-3xl font-black text-white leading-none mb-2">{currentData.stats[2]?.value || '25,632'}</span>
              <span className="text-[11px] font-bold text-[#FF8A00] bg-[#FF8A00]/10 px-2 py-0.5 rounded w-fit">{currentData.stats[2]?.sub || 'Top 1.70%'}</span>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">{currentData.stats[1]?.title || 'Contest Rating'}</span>
              <span className="text-3xl font-black text-white leading-none mb-2">{currentData.stats[1]?.value || '1,846'}</span>
              <span className="text-[11px] font-bold text-[#FF8A00] bg-[#FF8A00]/10 px-2 py-0.5 rounded w-fit">{currentData.stats[1]?.sub || 'Top 3.46%'}</span>
            </div>
            
            <div className="w-px h-20 bg-white/5 mx-2" />

            {/* Circular Stats */}
            <div className="flex items-center gap-8">
              {[
                { label: currentData.stats[0]?.title || 'Total Solved', val: currentData.stats[0]?.value || '1,248', desc: 'Solved Problems', color: '#22c55e', icon: CheckCircle2 },
                { label: currentData.stats[3]?.title || 'Current Streak', val: currentData.stats[3]?.value || '312', desc: 'Last 365 Days', color: '#3b82f6', icon: Flame },
                { label: currentData.stats[4]?.title || 'Max Streak', val: currentData.stats[4]?.value || '28', desc: 'Best Record', color: '#f59e0b', icon: Activity },
                { label: currentData.stats[5]?.title || 'Reputation', val: currentData.stats[5]?.value || '82.4%', desc: 'Community', color: '#a855f7', icon: Target },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center group">
                  <div className="relative w-[72px] h-[72px] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 absolute inset-0 drop-shadow-xl">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
                      <circle 
                        cx="18" cy="18" r="16" fill="none" 
                        stroke={stat.color} 
                        strokeWidth="2.5" 
                        strokeDasharray="100" 
                        strokeDashoffset={100 - (Math.random() * 40 + 60)} 
                        strokeLinecap="round" 
                        style={{ filter: `drop-shadow(0 0 4px ${stat.color}80)` }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <stat.icon size={14} style={{ color: stat.color }} className="mb-1" />
                      <span className="text-sm font-black text-white leading-none">{stat.val}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-gray-300 whitespace-nowrap leading-none mb-1.5">{stat.label}</span>
                  <span className="text-[9px] font-bold text-gray-500 whitespace-nowrap leading-none">{stat.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
          
          {/* LEFT VERTICAL NAVIGATION */}
          <aside className="lg:col-span-2 xl:col-span-2 bg-[#101014]/50 border border-white/5 rounded-2xl p-2.5 flex flex-col gap-1 sticky top-24 backdrop-blur-md shadow-xl">
            {[
              { id: 'Overview', icon: Home },
              { id: 'Problems', icon: FileCode2 },
              { id: 'Contests', icon: Trophy },
              { id: 'Submissions', icon: ClipboardList },
              { id: 'Discuss', icon: MessageSquare },
              { id: 'Badges', icon: Award },
              { id: 'Activity', icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-[12px] text-sm font-bold transition-all duration-300 relative group ${
                  activeTab === tab.id 
                    ? 'text-[#FF8A00] shadow-[0_0_20px_rgba(255,138,0,0.15)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="verticalTabIndicator" 
                    className="absolute inset-0 rounded-[12px] bg-gradient-to-r from-[#FF8A00]/20 to-transparent border border-[#FF8A00]/50" 
                  />
                )}
                <tab.icon size={16} strokeWidth={2.5} className={activeTab === tab.id ? 'text-[#FF8A00] relative z-10' : 'text-gray-500 group-hover:text-white transition-colors relative z-10'} />
                <span className="relative z-10">{tab.id}</span>
              </button>
            ))}
          </aside>

          {/* RIGHT CONTENT AREA */}
          <div className="lg:col-span-10 xl:col-span-10 min-w-0">
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
                    key={`${activePlatform}-${activeTab}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="space-y-6"
                  >
                    {/* OVERVIEW TAB */}
                    {activeTab === 'Overview' && (
                      <div className="space-y-6">

              {/* STATS ROW */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {currentData.stats.map((stat, idx) => (
                  <div 
                    key={idx} 
                    className={`${card} rounded-2xl p-4 border flex items-center gap-3.5 hover:border-white/10 transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)]`}
                  >
                    <div className="w-11 h-11 rounded-[10px] bg-white/[0.03] border border-white/5 flex items-center justify-center flex-shrink-0">
                      <stat.icon size={18} className={stat.iconColor} />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-[10px] font-semibold text-gray-400 mb-0.5">{stat.title}</span>
                      <span className="text-lg font-black text-white tracking-tight leading-none">{stat.value}</span>
                      <span className={`text-[9px] font-bold ${stat.subColor} mt-1 leading-none`}>{stat.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ROW 2: Problems Solved, Solved Over Time */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                
                {/* Problems Solved Donut card */}
                <div className={`${card} xl:col-span-5 rounded-2xl p-5 border flex flex-col justify-between`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">
                      {activePlatform === 'github' ? 'Contributions Breakdown' : 'Problems Solved'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-6 justify-center flex-1 py-4">
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        {currentData.donut.total > 0 ? (
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'easy', value: currentData.donut.easy, fill: '#22c55e' },
                                { name: 'medium', value: currentData.donut.medium, fill: '#eab308' },
                                { name: 'hard', value: currentData.donut.hard, fill: '#ef4444' }
                              ]}
                              innerRadius={36}
                              outerRadius={50}
                              dataKey="value"
                              stroke="none"
                              onMouseEnter={(_, index) => {
                                const keys = ['easy', 'medium', 'hard'];
                                setHoveredDonutSegment(keys[index]);
                              }}
                              onMouseLeave={() => setHoveredDonutSegment(null)}
                            >
                              {[
                                { name: 'easy', value: currentData.donut.easy, fill: '#22c55e' },
                                { name: 'medium', value: currentData.donut.medium, fill: '#eab308' },
                                { name: 'hard', value: currentData.donut.hard, fill: '#ef4444' }
                              ].map((entry, index) => {
                                const isActive = hoveredDonutSegment === entry.name;
                                return (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.fill}
                                    style={{
                                      filter: isActive ? `drop-shadow(0px 0px 6px ${entry.fill})` : 'none',
                                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                      transformOrigin: 'center',
                                      transition: 'all 0.3s ease'
                                    }}
                                  />
                                );
                              })}
                            </Pie>
                          </PieChart>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                            <div className="w-12 h-12 rounded-full border-[3px] border-white/5 border-t-white/10 mb-2" />
                            <span className="text-[8px] font-bold uppercase tracking-widest">No Data</span>
                          </div>
                        )}
                      </ResponsiveContainer>
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
                        <span className="text-lg font-extrabold text-white leading-none">
                          {currentData.donut.total > 0 ? (
                            <>
                              {hoveredDonutSegment === 'easy' && currentData.donut.easy}
                              {hoveredDonutSegment === 'medium' && currentData.donut.medium}
                              {hoveredDonutSegment === 'hard' && currentData.donut.hard}
                              {!hoveredDonutSegment && currentData.donut.total}
                            </>
                          ) : '0'}
                        </span>
                        <span className="text-[7px] text-gray-500 uppercase font-extrabold mt-1">
                          {hoveredDonutSegment ? `${hoveredDonutSegment}` : 'Total'}
                        </span>
                      </div>
                    </div>

                    {/* Legend list */}
                    <div className="flex-1 space-y-2">
                      {[
                        { id: 'easy', label: currentData.donut.labelEasy, count: currentData.donut.easy, pct: '24.7%', color: 'bg-emerald-500' },
                        { id: 'medium', label: currentData.donut.labelMed, count: currentData.donut.medium, pct: '52.9%', color: 'bg-yellow-500' },
                        { id: 'hard', label: currentData.donut.labelHard, count: currentData.donut.hard, pct: '22.4%', color: 'bg-red-500' },
                      ].map((seg) => (
                        <div 
                          key={seg.id} 
                          className={`flex items-center justify-between py-1 px-1.5 rounded-lg transition-all ${
                            hoveredDonutSegment === seg.id ? 'bg-white/[0.04]' : ''
                          }`}
                          onMouseEnter={() => setHoveredDonutSegment(seg.id)}
                          onMouseLeave={() => setHoveredDonutSegment(null)}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${seg.color}`} />
                            <span className="text-[9px] text-gray-300 font-bold truncate max-w-[50px]">{seg.label}</span>
                          </div>
                          <span className="text-[9px] font-mono text-gray-400">{seg.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* View Problems Link */}
                  <Link href="#" className="text-[9px] font-extrabold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-wider mt-2 inline-flex items-center gap-1">
                    <span>{activePlatform === 'github' ? 'View Repositories' : 'View Problems'}</span>
                    <ArrowRight size={10} />
                  </Link>
                </div>

                {/* Solved Over Time Line Chart */}
                <div className={`${card} xl:col-span-7 rounded-2xl p-5 border flex flex-col justify-between`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">
                      {activePlatform === 'github' ? 'Contribution History' : 'Solved Over Time'}
                    </h3>
                    <select className="text-[9px] bg-transparent border border-white/5 text-gray-400 font-extrabold focus:outline-none rounded-lg px-2 py-0.5">
                      <option>All Time</option>
                    </select>
                  </div>

                  {(() => {
                    const solvedData = monthsData.map(m => {
                      let sum = 0;
                      m.weeks.forEach(w => w.forEach(d => { if (d) sum += d.count; }));
                      return { label: m.label, value: sum };
                    });
                    
                    return (
                      <div className="flex-1 min-h-[140px] pt-4 select-none relative z-10">
                        {solvedData && solvedData.some(d => d.value > 0) ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={solvedData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.2}/>
                                </linearGradient>
                              </defs>
                              <XAxis 
                                dataKey="label" 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 8, fontWeight: 700, fontFamily: 'monospace' }}
                                dy={10}
                              />
                              <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#4b5563', fontSize: 8, fontWeight: 700, fontFamily: 'monospace' }}
                                tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
                              />
                              <RechartsTooltip 
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="bg-purple-950/90 border border-purple-500/20 rounded-xl px-2.5 py-1.5 shadow-2xl">
                                        <span className="text-[10px] font-mono text-purple-300 font-extrabold block">
                                          {payload[0].value} <span className="text-[7px] text-purple-400/70">Solved</span>
                                        </span>
                                        <span className="text-[7px] text-gray-500 uppercase font-extrabold mt-0.5 block">
                                          {payload[0].payload.label}
                                        </span>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                                cursor={{ fill: 'rgba(168,85,247,0.05)' }}
                              />
                              <Bar 
                                dataKey="value" 
                                fill="url(#colorValue)"
                                radius={[4, 4, 0, 0]}
                                barSize={24}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 font-bold uppercase tracking-widest border border-dashed border-white/5 rounded-xl min-h-[140px]">
                            Not Enough Data
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

              </div>

              {/* ROW 3: Contest Performance, Recent Contests table, Recent Submissions list */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                
                {/* Contest Performance Stats */}
                <div className={`${card} xl:col-span-2 rounded-2xl p-4 border flex flex-col justify-between h-[320px]`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">
                      {activePlatform === 'github' ? 'Repository Performance' : 'Contest Performance'}
                    </h3>
                  </div>

                  <div className="flex-1 space-y-4 py-2">
                    {currentData.performance.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-white/[0.03] pb-2 last:border-none last:pb-0">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-white/[0.02] flex items-center justify-center text-gray-500">
                            {idx === 0 ? <Calendar size={10} /> : idx === 1 ? <Globe size={10} /> : idx === 2 ? <Trophy size={10} /> : <Target size={10} />}
                          </div>
                          <span className="text-[10px] text-gray-400 font-semibold">{item.label}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-black text-white">{item.value.split(' ')[0]}</span>
                          {item.desc.includes('▲') ? (
                            <span className="text-[8px] text-emerald-400 font-bold">{item.desc.split(' ')[1]} {item.desc.split(' ')[2]}</span>
                          ) : (
                            <span className="text-[8px] text-gray-500 font-bold">{item.value.split(' ')[1] || ''}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link href="#" className="text-[9px] font-extrabold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer mt-3 inline-flex items-center gap-1">
                    <span>{activePlatform === 'github' ? 'View GitHub Profile' : 'View Contest History'}</span>
                    <ArrowRight size={10} />
                  </Link>
                </div>

                {/* Recent Contests Table */}
                <div className={`${card} xl:col-span-4 rounded-2xl p-4 border flex flex-col justify-between h-[320px]`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">
                      {activePlatform === 'github' ? 'Open Source & Projects' : 'Recent Contests'}
                    </h3>
                    <span className="text-[9px] font-extrabold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer">View All →</span>
                  </div>

                  <div className="flex-1 overflow-x-auto select-none">
                    {currentData.contests && currentData.contests.length > 0 ? (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/5 text-[8px] font-extrabold uppercase tracking-wider text-gray-500">
                            <th className="pb-2 font-semibold">Contest</th>
                            <th className="pb-2 font-semibold text-center">Rank</th>
                            <th className="pb-2 font-semibold text-center">Rating Change</th>
                            <th className="pb-2 font-semibold text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentData.contests.map((c: any, idx: number) => (
                            <tr key={idx} className="border-b border-white/[0.02] last:border-none text-[9px] text-gray-300 hover:bg-white/[0.01]">
                              <td className="py-2.5 font-semibold text-gray-300 truncate max-w-[120px]">{c.name}</td>
                              <td className="py-2.5 text-center font-mono font-medium">{c.rank}</td>
                              <td className={`py-2.5 text-center font-mono font-bold ${c.isPositive ? 'text-emerald-400' : 'text-rose-500'}`}>
                                {c.change}
                              </td>
                              <td className="py-2.5 text-right font-mono text-gray-500">{c.date.split(',')[0]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 font-bold uppercase tracking-widest border border-dashed border-white/5 rounded-xl min-h-[140px]">
                        Not Enough Data
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating History Line Chart */}
                <div className={`${card} xl:col-span-3 rounded-2xl p-4 border flex flex-col justify-between group h-[320px]`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">
                      Rating History
                    </h3>
                    <div className="px-2 py-0.5 rounded border border-white/5 bg-white/[0.02] text-[9px] text-gray-400 flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                      <span>All Time</span>
                      <ChevronDown size={10} />
                    </div>
                  </div>

                  {(() => {
                    return (
                      <div className="flex-1 min-h-[140px] pt-4 select-none relative z-10">
                        {currentData.linePoints && currentData.linePoints.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={currentData.linePoints} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                              <XAxis 
                                dataKey="label" 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 7, fontWeight: 700, fontFamily: 'monospace' }}
                                tickFormatter={(val) => val.split(' ')[0].toUpperCase()}
                                dy={10}
                              />
                              <YAxis
                                domain={['dataMin - 100', 'dataMax + 100']}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#4b5563', fontSize: 8, fontWeight: 700, fontFamily: 'monospace' }}
                                tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
                              />
                              <RechartsTooltip 
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="bg-yellow-950/90 border border-yellow-500/20 rounded-xl px-2.5 py-1.5 shadow-2xl">
                                        <span className="text-[10px] font-mono text-yellow-300 font-extrabold block">
                                          {payload[0].value} <span className="text-[7px] text-yellow-500/70">Rating</span>
                                        </span>
                                        <span className="text-[7px] text-gray-400 uppercase font-extrabold mt-0.5 block">
                                          {payload[0].payload.label}
                                        </span>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                                cursor={{ stroke: 'rgba(234,179,8,0.2)', strokeWidth: 1.5, strokeDasharray: '2 2' }}
                              />
                              <Line 
                                type="linear" 
                                dataKey="value" 
                                stroke="#eab308" 
                                strokeWidth={2.5}
                                dot={{ r: 3.5, fill: '#0f141d', stroke: '#eab308', strokeWidth: 2 }}
                                activeDot={{ r: 6, fill: '#eab308', stroke: '#0f141d', strokeWidth: 2 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 font-bold uppercase tracking-widest border border-dashed border-white/5 rounded-xl min-h-[140px]">
                            Not Enough Data
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Recent Submissions list */}
                <div className={`${card} xl:col-span-3 rounded-2xl p-4 border flex flex-col justify-between h-[320px]`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">
                      {activePlatform === 'github' ? 'Recent Activity / Commits' : 'Recent Submissions'}
                    </h3>
                    <span className="text-[9px] font-extrabold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer">View All →</span>
                  </div>

                  <div className="flex-1 space-y-2.5 select-none overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent pr-1">
                    {currentData.submissions && currentData.submissions.length > 0 ? (
                      currentData.submissions.map((sub: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.03] transition-all">
                          <div className="flex items-center gap-2 max-w-[170px]">
                            {sub.success ? (
                              <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                            ) : (
                              <XCircle size={13} className="text-rose-500 flex-shrink-0" />
                            )}
                            <div className="truncate">
                              <span className="text-[9px] font-bold text-white block truncate leading-tight">{sub.name}</span>
                              <span className="text-[7px] text-gray-500 font-semibold leading-none">{sub.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {activePlatform === 'github' ? (
                              <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full ${
                                sub.diff === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                sub.diff === 'Medium' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              }`}>
                                {sub.diff === 'Easy' ? 'Issue Closed' : sub.diff === 'Medium' ? 'Commit' : 'PR Merged'}
                              </span>
                            ) : (
                              <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full ${
                                sub.diff === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                sub.diff === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                'bg-red-500/10 text-red-500 border border-red-500/20'
                              }`}>
                                {sub.diff}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 font-bold uppercase tracking-widest border border-dashed border-white/5 rounded-xl min-h-[140px]">
                        Not Enough Data
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* ROW 4: TOP SOLVED TOPICS, DIFFICULTY BARS, ACCURACY */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                
                {/* LeetCode Skills Component */}
                {(() => {
                  
                  const renderSkillCategory = (title: string, color: string, data: any[], key: string) => {
                    if (!data || data.length === 0) return null;
                    const isExpanded = expandedSkill === key;
                    const displayData = isExpanded ? data : data.slice(0, 3);
                    const hasMore = data.length > 3;

                    return (
                      <div className="mb-4 last:mb-0">
                        <div className="flex items-center gap-2 mb-2.5">
                          <div className={`w-1 h-1 rounded-full ${color}`} />
                          <h4 className="text-[11px] font-bold text-white tracking-wide">{title}</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {displayData.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.05] hover:bg-white/[0.08] transition-colors cursor-default group">
                              <span className="text-[10px] font-medium text-gray-300 group-hover:text-white transition-colors">{item.tagName}</span>
                              <span className="text-[9px] font-mono text-gray-500">x{item.problemsSolved}</span>
                            </div>
                          ))}
                        </div>
                        {hasMore && (
                          <div 
                            className="text-center mt-2"
                          >
                            <button 
                              onClick={() => setExpandedSkill(isExpanded ? null : key)}
                              className="text-[10px] text-gray-400 hover:text-white transition-colors"
                            >
                              {isExpanded ? 'Show less' : 'Show more'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  };

                  return (
                    <div className={`${card} xl:col-span-12 rounded-2xl p-5 border flex flex-col`}>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-sm text-white tracking-wide">Skills</h3>
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
                        <div>{renderSkillCategory('Advanced', 'bg-rose-500', currentData.skills?.advanced, 'advanced')}</div>
                        <div>{renderSkillCategory('Intermediate', 'bg-yellow-500', currentData.skills?.intermediate, 'intermediate')}</div>
                        <div>{renderSkillCategory('Fundamental', 'bg-emerald-500', currentData.skills?.fundamental, 'fundamental')}</div>
                        
                        {(!currentData.skills?.advanced?.length && !currentData.skills?.intermediate?.length && !currentData.skills?.fundamental?.length) && (
                          <div className="md:col-span-3 flex items-center justify-center h-full min-h-[150px]">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">No Skills Data</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}



              </div>
                    </div>
                  )}

                  {/* PROBLEMS TAB */}
                  {activeTab === 'Problems' && (
                    <div className="space-y-5">
                      {/* Summary stats row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: currentData.donut.labelEasy, count: currentData.donut.easy, hex: '#22c55e', bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
                          { label: currentData.donut.labelMed, count: currentData.donut.medium, hex: '#eab308', bg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' },
                          { label: currentData.donut.labelHard, count: currentData.donut.hard, hex: '#ef4444', bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
                          { label: 'Total Solved', count: currentData.donut.total, hex: '#a855f7', bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
                        ].map((d, i) => (
                          <div key={i} className={`${card} rounded-2xl p-4 border flex flex-col gap-1`}>
                            <span className={`text-[9px] font-extrabold uppercase tracking-widest ${d.bg.split(' ')[2]}`}>{d.label}</span>
                            <span className="text-2xl font-black text-white">{d.count}</span>
                            <div className="h-1 rounded-full bg-white/[0.03] mt-1">
                              <div className="h-full rounded-full" style={{ width: `${(d.count / currentData.donut.total) * 100}%`, backgroundColor: d.hex, boxShadow: `0 0 8px ${d.hex}60` }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 gap-5">
                        {/* Difficulty Breakdown */}
                        <div className={`${card} rounded-2xl p-5 border flex flex-col justify-between`}>
                          <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400 mb-4">Difficulty Breakdown</h3>
                          <div className="space-y-5">
                            {currentData.donut.total > 0 ? (
                              [
                                { label: currentData.donut.labelEasy, count: currentData.donut.easy, total: currentData.donut.total, hex: '#22c55e' },
                                { label: currentData.donut.labelMed, count: currentData.donut.medium, total: currentData.donut.total, hex: '#eab308' },
                                { label: currentData.donut.labelHard, count: currentData.donut.hard, total: currentData.donut.total, hex: '#ef4444' },
                              ].map(diff => (
                                <div key={diff.label}>
                                  <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[10px] font-bold text-gray-300">{diff.label}</span>
                                    <span className="text-[10px] font-mono font-bold" style={{ color: diff.hex }}>{diff.count} <span className="text-gray-500 font-normal">/ {diff.total}</span></span>
                                  </div>
                                  <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(diff.count/diff.total)*100}%`, backgroundColor: diff.hex, boxShadow: `0 0 10px ${diff.hex}80` }} />
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="w-full flex items-center justify-center py-10">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">No Breakdown Available</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CONTESTS TAB */}
                  {activeTab === 'Contests' && (
                    <div className="space-y-5">
                      {/* Stats row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className={`${card} rounded-2xl p-5 border flex flex-col justify-center items-center text-center group relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Trophy size={28} className="text-yellow-500 mb-2 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                          <span className="text-[9px] font-extrabold text-gray-500 uppercase tracking-widest mb-1">Contest Rating</span>
                          <span className="text-2xl font-black text-white tracking-tighter">{currentData.stats[1]?.value}</span>
                          <span className={`text-[9px] font-bold mt-1 ${currentData.stats[1]?.subColor}`}>{currentData.stats[1]?.sub}</span>
                        </div>
                        {currentData.performance.map((item, idx) => (
                          <div key={idx} className={`${card} rounded-2xl p-4 border flex flex-col gap-1`}>
                            <span className="text-[9px] font-extrabold text-gray-500 uppercase tracking-widest">{item.label}</span>
                            <span className="text-xl font-black text-white">{item.value}</span>
                            <span className="text-[9px] font-semibold text-gray-500">{item.desc}</span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 gap-5">
                        {/* Full Contest History */}
                        <div className={`${card} rounded-2xl p-5 border flex flex-col`}>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">Contest History</h3>
                          </div>
                          <div className="flex-1 overflow-x-auto select-none">
                            {currentData.contests.length > 0 ? (
                              <table className="w-full text-left">
                                <thead>
                                  <tr className="border-b border-white/5 text-[8px] font-extrabold uppercase tracking-wider text-gray-500">
                                    <th className="pb-2">Contest</th>
                                    <th className="pb-2 text-center">Rank</th>
                                    <th className="pb-2 text-center">Rating Δ</th>
                                    <th className="pb-2 text-right">Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {currentData.contests.map((c: any, idx: number) => (
                                    <tr key={idx} className="border-b border-white/[0.02] last:border-none text-[10px] text-gray-300 hover:bg-white/[0.01] transition-colors">
                                      <td className="py-3 font-semibold text-gray-200 truncate max-w-[160px]">{c.name}</td>
                                      <td className="py-3 text-center font-mono font-medium">{c.rank}</td>
                                      <td className={`py-3 text-center font-mono font-bold ${c.isPositive ? 'text-emerald-400' : 'text-rose-500'}`}>{c.change}</td>
                                      <td className="py-3 text-right font-mono text-gray-500 text-[9px]">{c.date}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div className="flex items-center justify-center h-full min-h-[100px]">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">No Contest History</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBMISSIONS TAB */}
                  {activeTab === 'Submissions' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 gap-5">
                        {/* Submissions Feed */}
                        <div className={`${card} rounded-2xl p-5 border flex flex-col h-[600px]`}>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">Live Submission Feed</h3>
                            <button className="text-[9px] font-extrabold text-gray-400 hover:text-white transition-colors">Filter</button>
                          </div>
                          <div className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-none">
                            {currentData.submissions.length > 0 ? (
                              currentData.submissions.map((sub: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] transition-colors group">
                                  <div className="flex items-center gap-3">
                                    {sub.success ? <CheckCircle2 size={16} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]" /> : <XCircle size={16} className="text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]" />}
                                    <div>
                                      <h4 className="text-[11px] font-bold text-white group-hover:text-purple-400 transition-colors cursor-pointer">{sub.name}</h4>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[8px] text-gray-500">{sub.date}</span>
                                        <span className="text-[8px] text-gray-600">•</span>
                                        <span className="text-[8px] text-blue-400 font-mono">C++</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right flex flex-col items-end">
                                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${sub.success ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>{sub.status || (sub.success ? 'Accepted' : 'Wrong Answer')}</span>
                                    {sub.success && <span className="text-[8px] text-gray-500 font-mono mt-1">12ms • 14.2MB</span>}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="flex items-center justify-center h-full min-h-[150px]">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">No Recent Submissions</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DSA TOPICS TAB */}
                  {activeTab === 'DSA Topics' && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">Topic-Wise Mastery</h3>
                        <div className="px-2 py-1 rounded border border-white/5 bg-white/[0.02] text-[9px] text-gray-400 flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                          <span>Sort by Mastery</span>
                          <ChevronDown size={10} />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {currentData.topics && currentData.topics.length > 0 ? (
                          currentData.topics.map((topic: any, idx: number) => (
                            <div key={idx} className={`${card} rounded-2xl p-5 border hover:border-purple-500/30 transition-all duration-300 group`}>
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${topic.color} transition-transform group-hover:scale-110`}>
                                    <topic.icon size={18} />
                                  </div>
                                  <div>
                                    <h4 className="text-[11px] font-extrabold text-white leading-tight">{topic.name}</h4>
                                    <span className="text-[9px] text-gray-500 font-semibold">{topic.count} problems solved</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-black text-white">{topic.pct}</span>
                                  <span className="block text-[7px] font-extrabold text-gray-500 uppercase tracking-widest mt-0.5">Mastery</span>
                                </div>
                              </div>
                              
                              <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden mt-4">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${topic.color.split(' ')[0].replace('text-', 'bg-')}`} 
                                  style={{ width: topic.pct, boxShadow: `0 0 10px currentColor` }} 
                                />
                              </div>
                              
                              <div className="flex justify-between items-center mt-3">
                                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Strong</span>
                                <button className="text-[8px] font-bold text-purple-400 hover:text-white transition-colors">Practice More →</button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full flex items-center justify-center py-12">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">No Topics Found</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PERFORMANCE TAB */}
                  {activeTab === 'Performance' && (
                    <div className="space-y-5">
                      {/* AI Insight Hero */}
                      <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden flex items-center gap-6">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                          <Sparkles size={32} />
                        </div>
                        <div>
                          <h3 className="font-black text-sm text-white uppercase tracking-wider mb-2">AI Performance Insight — {activePlatform}</h3>
                          <p className="text-[11px] text-gray-400 leading-relaxed max-w-2xl">
                            You've attended <strong className="text-indigo-400">{currentData.performance[0]?.value} contests</strong> on {activePlatform} with a best rank of <strong className="text-emerald-400">{currentData.performance[2]?.value}</strong>. 
                            Your current rating is <strong className="text-yellow-400">{currentData.performance[3]?.value}</strong> — consistently improving. 
                            Keep focusing on Hard problems to push your percentile ranking even higher.
                          </p>
                        </div>
                      </div>

                      {/* Performance Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {currentData.performance.map((item, idx) => (
                          <div key={idx} className={`${card} rounded-2xl p-5 border flex flex-col gap-2 hover:border-purple-500/20 transition-all group`}>
                            <div className="flex items-center gap-2 text-gray-500">
                              {idx === 0 ? <Calendar size={14} /> : idx === 1 ? <Globe size={14} /> : idx === 2 ? <Trophy size={14} /> : <Target size={14} />}
                              <span className="text-[9px] font-extrabold uppercase tracking-widest">{item.label}</span>
                            </div>
                            <span className="text-2xl font-black text-white group-hover:text-purple-300 transition-colors">{item.value}</span>
                            <span className={`text-[9px] font-bold ${item.desc.includes('▲') ? 'text-emerald-400' : 'text-gray-500'}`}>{item.desc}</span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Speed Analytics */}
                        <div className={`${card} rounded-2xl p-5 border flex flex-col`}>
                          <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400 mb-4">Speed Analytics</h3>
                          <div className="space-y-4 flex-1">
                            {[
                              { label: `Avg Time (${currentData.donut.labelEasy})`, time: '4m 12s', trend: '-12s', isGood: true },
                              { label: `Avg Time (${currentData.donut.labelMed})`, time: '14m 45s', trend: '-1m 20s', isGood: true },
                              { label: `Avg Time (${currentData.donut.labelHard})`, time: '42m 10s', trend: '+5m 10s', isGood: false },
                            ].map((stat, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-gray-400">
                                    <Target size={14} />
                                  </div>
                                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide">{stat.label}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-mono font-black text-white block">{stat.time}</span>
                                  <span className={`text-[8px] font-bold mt-0.5 block ${stat.isGood ? 'text-emerald-400' : 'text-rose-400'}`}>{stat.trend} this week</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Top Solved Topics Summary */}
                        <div className={`${card} rounded-2xl p-5 border flex flex-col`}>
                          <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400 mb-4">Top Solved Topics</h3>
                          <div className="space-y-3 flex-1">
                            {currentData.topics.map((topic: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-3">
                                <span className="text-[10px] text-gray-400 w-32 truncate">{topic.name}</span>
                                <div className="flex-1 h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                                    style={{ width: topic.pct }}
                                  />
                                </div>
                                <span className="text-[10px] font-mono text-white w-8 text-right">{topic.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GLOBAL RANKING TAB */}
                  {activeTab === 'Global Ranking' && (
                    <div className="space-y-5">
                      {/* Ranking Hero */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                          { title: 'Global Rank', value: currentData.stats[2]?.value || '—', icon: Globe, color: 'blue', sub: currentData.stats[2]?.sub },
                          { title: 'Country Rank', value: '412', icon: Target, color: 'emerald', sub: 'India' },
                          { title: 'Percentile', value: currentData.performance[1]?.desc?.split('Top ')[1] ? `Top ${currentData.performance[1].desc.split('Top ')[1]}` : 'Top 5%', icon: Percent, color: 'purple', sub: 'globally' }
                        ].map((stat, idx) => (
                          <div key={idx} className={`${card} rounded-2xl p-6 border flex items-center justify-between relative overflow-hidden`}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl" style={{ backgroundColor: idx === 0 ? 'rgba(59,130,246,0.1)' : idx === 1 ? 'rgba(16,185,129,0.1)' : 'rgba(168,85,247,0.1)' }} />
                            <div>
                              <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest block mb-2">{stat.title}</span>
                              <span className="text-3xl font-black text-white tracking-tighter">{stat.value}</span>
                              {stat.sub && <span className="text-[9px] font-bold text-emerald-400 block mt-1">{stat.sub}</span>}
                            </div>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: idx === 0 ? 'rgba(59,130,246,0.1)' : idx === 1 ? 'rgba(16,185,129,0.1)' : 'rgba(168,85,247,0.1)', border: idx === 0 ? '1px solid rgba(59,130,246,0.2)' : idx === 1 ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(168,85,247,0.2)' }}>
                              <stat.icon size={20} style={{ color: idx === 0 ? '#60a5fa' : idx === 1 ? '#34d399' : '#c084fc' }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* All platform stats */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {currentData.stats.map((stat, idx) => (
                          <div key={idx} className={`${card} rounded-2xl p-4 border flex flex-col gap-1 hover:border-white/10 transition-all`}>
                            <span className="text-[9px] font-extrabold text-gray-500 uppercase tracking-widest">{stat.title}</span>
                            <span className="text-lg font-black text-white">{stat.value}</span>
                            <span className={`text-[9px] font-bold ${stat.subColor}`}>{stat.sub}</span>
                          </div>
                        ))}
                      </div>

                      {/* Leaderboard Table */}
                      <div className={`${card} rounded-2xl p-5 border flex flex-col`}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">Friends Leaderboard — {activePlatform}</h3>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 rounded bg-white/[0.05] text-[9px] font-bold text-white hover:bg-white/[0.1] transition-colors">Global</button>
                            <button className="px-3 py-1 rounded bg-purple-500 text-[9px] font-bold text-white hover:bg-purple-600 transition-colors shadow-[0_0_10px_rgba(168,85,247,0.4)]">Friends</button>
                          </div>
                        </div>

                        <div className="flex-1 overflow-x-auto select-none">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-white/5 text-[8px] font-extrabold uppercase tracking-wider text-gray-500">
                                <th className="pb-3 pl-2">Rank</th>
                                <th className="pb-3">User</th>
                                <th className="pb-3 text-center">Rating</th>
                                <th className="pb-3 text-center">Solved</th>
                                <th className="pb-3 text-right pr-2">Trend</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                { rank: 1, name: 'tourist_pro', rating: String(Number(currentData.performance[3]?.value.replace(',','') || 2134) + 276), solved: String(currentData.donut.total + 390), trend: '▲', color: 'emerald' },
                                { rank: 2, name: 'alex_coder', rating: String(Number(currentData.performance[3]?.value.replace(',','') || 2134) + 56), solved: String(currentData.donut.total + 135), trend: '▲', color: 'emerald' },
                                { rank: 3, name: currentData.username, rating: currentData.performance[3]?.value || '2,134', solved: String(currentData.donut.total), trend: '▲', color: 'purple', isSelf: true },
                                { rank: 4, name: 'jessica_dev', rating: String(Number(currentData.performance[3]?.value.replace(',','') || 2134) - 284), solved: String(currentData.donut.total - 130), trend: '▼', color: 'rose' },
                                { rank: 5, name: 'samuel_hacks', rating: String(Number(currentData.performance[3]?.value.replace(',','') || 2134) - 414), solved: String(currentData.donut.total - 240), trend: '▲', color: 'emerald' },
                              ].map((user) => (
                                <tr key={user.rank} className={`border-b border-white/[0.02] last:border-none text-[10px] transition-colors ${(user as any).isSelf ? 'bg-purple-500/5' : 'hover:bg-white/[0.01]'}`}>
                                  <td className="py-3 pl-2 font-mono font-black text-gray-400">#{user.rank}</td>
                                  <td className={`py-3 font-bold ${(user as any).isSelf ? 'text-purple-400' : 'text-white'}`}>{user.name} {(user as any).isSelf && '(You)'}</td>
                                  <td className="py-3 text-center font-mono font-bold text-yellow-400">{user.rating}</td>
                                  <td className="py-3 text-center font-mono font-semibold text-gray-300">{user.solved}</td>
                                  <td className={`py-3 text-right font-black pr-2`} style={{ color: user.color === 'emerald' ? '#34d399' : user.color === 'purple' ? '#c084fc' : '#f87171' }}>{user.trend}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}
