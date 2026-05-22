"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../../../../components/OnboardingProvider';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import TopNavbar from '../../../../components/shared/TopNavbar';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
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

export default function PlatformsDashboard() {
  const { profile } = useOnboarding();
  const { isLoaded, isSignedIn, user } = useUser();
  const { openUserProfile } = useClerk();
  
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activePlatform, setActivePlatform] = useState<string>('leetcode');
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedRange, setSelectedRange] = useState('May 16 - Jun 16, 2024');
  const [hoveredLinePoint, setHoveredLinePoint] = useState<number | null>(null);
  const [hoveredRatingPoint, setHoveredRatingPoint] = useState<number | null>(null);
  const [hoveredDonutSegment, setHoveredDonutSegment] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [hovTopic, setHovTopic] = useState<number | null>(null);
  const [hovBar, setHovBar] = useState<number | null>(null);
  const [hovAccSeg, setHovAccSeg] = useState<string | null>(null);

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
    
    let calendarMap: Record<string, number> = {};

    const result: {
      label: string;
      weeks: ({ date: string; count: number; dayOfWeek: number } | null)[][];
    }[] = [];

    // Loop through every month of the selected year
    for (let m = 0; m < 12; m++) {
      const monthLabel = monthsMap[m];
      const firstDay = new Date(selectedYear, m, 1);
      const lastDay = new Date(selectedYear, m + 1, 0);

      const weeksList: ({ date: string; count: number; dayOfWeek: number } | null)[][] = [];
      let currentWeek: ({ date: string; count: number; dayOfWeek: number } | null)[] = Array(7).fill(null);

      let curr = new Date(firstDay);
      while (curr <= lastDay) {
        const dayOfWeek = curr.getDay();
        const dateStr = curr.toISOString().split('T')[0];

        let count = 0;

        // Mock green density levels matching mockup
        if (count === 0) {
          const seed = curr.getDate() * (m + 1);
          if (selectedYear === 2024) {
            if (seed % 3 === 0) count = 10;
            else if (seed % 4 === 0) count = 7;
            else if (seed % 5 === 0) count = 4;
            else if (seed % 7 === 0) count = 2;
            else if (seed % 11 === 0) count = 1;
          } else if (selectedYear === 2023) {
            if (seed % 5 === 0) count = 8;
            else if (seed % 7 === 0) count = 4;
            else if (seed % 9 === 0) count = 1;
          } else {
            if (seed % 8 === 0) count = 6;
            else if (seed % 11 === 0) count = 2;
          }
        }

        // Place cell in its correct weekday index (0 = Sun, 6 = Sat)
        currentWeek[dayOfWeek] = { date: dateStr, count, dayOfWeek };

        // Start a new week column on Saturday or the last day of the month
        if (dayOfWeek === 6 || curr.getTime() === lastDay.getTime()) {
          weeksList.push(currentWeek);
          currentWeek = Array(7).fill(null);
        }

        curr.setDate(curr.getDate() + 1);
      }

      result.push({ label: monthLabel, weeks: weeksList });
    }

    return result;
  }, [selectedYear]);

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
  const platformData: Record<string, {
    username: string;
    memberSince: string;
    stats: any[];
    donut: { easy: number; medium: number; hard: number; total: number; labelEasy: string; labelMed: string; labelHard: string };
    linePoints: { label: string; value: number }[];
    contests: any[];
    submissions: any[];
    topics: any[];
    performance: any[];
  }> = {
    leetcode: {
      username: 'ankit_kumar',
      memberSince: 'Jul 2022',
      stats: [
        { title: 'Total Solved', value: '850', sub: '▲ 37 this month', subColor: 'text-emerald-400', icon: FileCode2, iconColor: 'text-purple-400' },
        { title: 'Contest Rating', value: '2,134', sub: '▲ 123', subColor: 'text-emerald-400', icon: Trophy, iconColor: 'text-yellow-500' },
        { title: 'Global Ranking', value: '42,157', sub: '▲ 2,567', subColor: 'text-emerald-400', icon: Globe, iconColor: 'text-blue-400' },
        { title: 'Current Streak', value: '120 days', sub: '🔥 Keep it up!', subColor: 'text-orange-400', icon: Flame, iconColor: 'text-orange-500' },
        { title: 'Max Streak', value: '156 days', sub: '📅 Dec 2023', subColor: 'text-pink-400', icon: Calendar, iconColor: 'text-pink-500' },
        { title: 'Reputation', value: '12,450', sub: '▲ 980', subColor: 'text-emerald-400', icon: Star, iconColor: 'text-amber-500' },
      ],
      donut: { easy: 210, medium: 450, hard: 190, total: 850, labelEasy: 'Easy', labelMed: 'Medium', labelHard: 'Hard' },
      linePoints: [
        { label: "Dec '23", value: 420 },
        { label: "Jan '24", value: 500 },
        { label: "Feb '24", value: 580 },
        { label: "Mar '24", value: 650 },
        { label: "Apr '24", value: 720 },
        { label: "May '24", value: 780 },
        { label: "Jun '24", value: 850 },
      ],
      contests: [
        { name: 'Biweekly Contest 125', rank: '1,234', change: '+32', date: '8 Jun, 2024', isPositive: true },
        { name: 'Weekly Contest 351', rank: '2,345', change: '+18', date: '2 Jun, 2024', isPositive: true },
        { name: 'Weekly Contest 124', rank: '3,456', change: '-12', date: '25 May, 2024', isPositive: false },
        { name: 'Weekly Contest 350', rank: '1,876', change: '+28', date: '19 May, 2024', isPositive: true },
        { name: 'Biweekly Contest 123', rank: '2,987', change: '+15', date: '11 May, 2024', isPositive: true },
      ],
      submissions: [
        { name: 'Valid Parentheses', date: '16 Jun, 11:24 AM', diff: 'Easy', status: 'Accepted', success: true },
        { name: 'Merge Intervals', date: '16 Jun, 10:15 AM', diff: 'Medium', status: 'Accepted', success: true },
        { name: 'Regular Expression Matching', date: '15 Jun, 09:45 PM', diff: 'Hard', status: 'Wrong Answer', success: false },
        { name: 'Kth Largest Element in Array', date: '15 Jun, 08:30 PM', diff: 'Medium', status: 'Accepted', success: true },
        { name: 'Longest Substring Without Repeating...', date: '15 Jun, 07:10 PM', diff: 'Medium', status: 'Accepted', success: true },
      ],
      topics: [
        { name: 'Array', count: 123, pct: '82%', icon: Hash, color: 'text-purple-400 bg-purple-500/10' },
        { name: 'Dynamic Programming', count: 98, pct: '65%', icon: Code, color: 'text-indigo-400 bg-indigo-500/10' },
        { name: 'String', count: 85, pct: '56%', icon: FileCode2, color: 'text-pink-400 bg-pink-500/10' },
        { name: 'Hash Table', count: 70, pct: '46%', icon: Layers, color: 'text-blue-400 bg-blue-500/10' },
        { name: 'Two Pointers', count: 65, pct: '43%', icon: Percent, color: 'text-emerald-400 bg-emerald-500/10' },
        { name: 'Binary Search', count: 60, pct: '40%', icon: Target, color: 'text-amber-400 bg-amber-500/10' },
      ],
      performance: [
        { label: 'Contests Attended', value: '32', desc: 'Active participant' },
        { label: 'Global Ranking (Avg)', value: '18,725', desc: 'Top 8.4% globally' },
        { label: 'Best Global Rank', value: '1,234', desc: 'Weekly Contest 351' },
        { label: 'Contest Rating', value: '2,134', desc: '▲ 123 change' },
      ],
    },
    codeforces: {
      username: 'ankit_cf',
      memberSince: 'Oct 2022',
      stats: [
        { title: 'Total Solved', value: '1,350', sub: '▲ 78 this month', subColor: 'text-emerald-400', icon: FileCode2, iconColor: 'text-purple-400' },
        { title: 'Contest Rating', value: '1,942', sub: '▲ 82', subColor: 'text-emerald-400', icon: Trophy, iconColor: 'text-yellow-500' },
        { title: 'Global Ranking', value: '12,845', sub: '▲ 1,845', subColor: 'text-emerald-400', icon: Globe, iconColor: 'text-blue-400' },
        { title: 'Current Streak', value: '85 days', sub: '🔥 Consistent!', subColor: 'text-orange-400', icon: Flame, iconColor: 'text-orange-500' },
        { title: 'Max Streak', value: '124 days', sub: '📅 Oct 2023', subColor: 'text-pink-400', icon: Calendar, iconColor: 'text-pink-500' },
        { title: 'Reputation', value: '8,420', sub: '▲ 340', subColor: 'text-emerald-400', icon: Star, iconColor: 'text-amber-500' },
      ],
      donut: { easy: 512, medium: 658, hard: 180, total: 1350, labelEasy: 'A-B Div2', labelMed: 'C-D Div2', labelHard: 'E+ Div2' },
      linePoints: [
        { label: "Dec '23", value: 820 },
        { label: "Jan '24", value: 910 },
        { label: "Feb '24", value: 1010 },
        { label: "Mar '24", value: 1100 },
        { label: "Apr '24", value: 1180 },
        { label: "May '24", value: 1260 },
        { label: "Jun '24", value: 1350 },
      ],
      contests: [
        { name: 'CF Round 950 (Div 2)', rank: '842', change: '+45', date: '6 Jun, 2024', isPositive: true },
        { name: 'CF Round 948 (Div 2)', rank: '1,120', change: '+22', date: '31 May, 2024', isPositive: true },
        { name: 'Educational Round 165', rank: '2,045', change: '-18', date: '20 May, 2024', isPositive: false },
        { name: 'CF Round 945 (Div 2)', rank: '954', change: '+38', date: '12 May, 2024', isPositive: true },
        { name: 'CF Round 943 (Div 3)', rank: '124', change: '+85', date: '4 May, 2024', isPositive: true },
      ],
      submissions: [
        { name: 'Watermelon', date: '16 Jun, 12:45 PM', diff: 'Easy', status: 'Accepted', success: true },
        { name: 'Theatre Square', date: '16 Jun, 09:12 AM', diff: 'Easy', status: 'Accepted', success: true },
        { name: 'Registration System', date: '14 Jun, 05:40 PM', diff: 'Medium', status: 'Accepted', success: true },
        { name: 'String Task', date: '13 Jun, 11:22 PM', diff: 'Easy', status: 'Accepted', success: true },
        { name: 'Beautiful Matrix', date: '12 Jun, 08:30 PM', diff: 'Easy', status: 'Accepted', success: true },
      ],
      topics: [
        { name: 'Math', count: 240, pct: '92%', icon: Hash, color: 'text-purple-400 bg-purple-500/10' },
        { name: 'Greedy', count: 198, pct: '80%', icon: Target, color: 'text-indigo-400 bg-indigo-500/10' },
        { name: 'Dynamic Programming', count: 185, pct: '74%', icon: Code, color: 'text-pink-400 bg-pink-500/10' },
        { name: 'Sorting', count: 145, pct: '60%', icon: Layers, color: 'text-blue-400 bg-blue-500/10' },
        { name: 'Graphs', count: 120, pct: '50%', icon: Percent, color: 'text-emerald-400 bg-emerald-500/10' },
        { name: 'Trees', count: 90, pct: '38%', icon: FileCode2, color: 'text-amber-400 bg-amber-500/10' },
      ],
      performance: [
        { label: 'Contests Attended', value: '45', desc: 'Active participant' },
        { label: 'Global Ranking (Avg)', value: '12,845', desc: 'Top 5.2% globally' },
        { label: 'Best Global Rank', value: '124', desc: 'CF Round 943' },
        { label: 'Contest Rating', value: '1,942', desc: '▲ 82 change' },
      ],
    },
    codechef: {
      username: 'ankit_cc',
      memberSince: 'Jan 2023',
      stats: [
        { title: 'Total Solved', value: '542', sub: '▲ 28 this month', subColor: 'text-emerald-400', icon: FileCode2, iconColor: 'text-purple-400' },
        { title: 'Contest Rating', value: '1,854', sub: '▲ 64', subColor: 'text-emerald-400', icon: Trophy, iconColor: 'text-yellow-500' },
        { title: 'Global Ranking', value: '8,921', sub: '▲ 924', subColor: 'text-emerald-400', icon: Globe, iconColor: 'text-blue-400' },
        { title: 'Current Streak', value: '32 days', sub: '🔥 Great progress!', subColor: 'text-orange-400', icon: Flame, iconColor: 'text-orange-500' },
        { title: 'Max Streak', value: '64 days', sub: '📅 Mar 2024', subColor: 'text-pink-400', icon: Calendar, iconColor: 'text-pink-500' },
        { title: 'Reputation', value: '2,840', sub: '▲ 180', subColor: 'text-emerald-400', icon: Star, iconColor: 'text-amber-500' },
      ],
      donut: { easy: 180, medium: 290, hard: 72, total: 542, labelEasy: '1-Star', labelMed: '2-3 Star', labelHard: '4+ Star' },
      linePoints: [
        { label: "Dec '23", value: 310 },
        { label: "Jan '24", value: 350 },
        { label: "Feb '24", value: 390 },
        { label: "Mar '24", value: 430 },
        { label: "Apr '24", value: 470 },
        { label: "May '24", value: 510 },
        { label: "Jun '24", value: 542 },
      ],
      contests: [
        { name: 'Starters 135 (Div 2)', rank: '421', change: '+38', date: '5 Jun, 2024', isPositive: true },
        { name: 'Starters 134 (Div 2)', rank: '682', change: '+18', date: '29 May, 2024', isPositive: true },
        { name: 'Starters 133 (Div 2)', rank: '1,042', change: '-10', date: '22 May, 2024', isPositive: false },
        { name: 'Starters 132 (Div 2)', rank: '512', change: '+25', date: '15 May, 2024', isPositive: true },
        { name: 'Starters 131 (Div 3)', rank: '45', change: '+72', date: '8 May, 2024', isPositive: true },
      ],
      submissions: [
        { name: 'Chef and Dolls', date: '16 Jun, 10:45 AM', diff: 'Easy', status: 'Accepted', success: true },
        { name: 'Chef and Subarrays', date: '15 Jun, 04:30 PM', diff: 'Medium', status: 'Accepted', success: true },
        { name: 'Lucky Four', date: '14 Jun, 09:20 AM', diff: 'Easy', status: 'Accepted', success: true },
        { name: 'ATM Machine', date: '12 Jun, 03:15 PM', diff: 'Easy', status: 'Accepted', success: true },
        { name: 'Turbo Sort', date: '11 Jun, 11:10 AM', diff: 'Easy', status: 'Accepted', success: true },
      ],
      topics: [
        { name: 'Sorting', count: 82, pct: '85%', icon: Layers, color: 'text-purple-400 bg-purple-500/10' },
        { name: 'Basic Programming', count: 76, pct: '80%', icon: FileCode2, color: 'text-indigo-400 bg-indigo-500/10' },
        { name: 'Arrays', count: 72, pct: '75%', icon: Hash, color: 'text-pink-400 bg-pink-500/10' },
        { name: 'Recursion', count: 54, pct: '56%', icon: Target, color: 'text-blue-400 bg-blue-500/10' },
        { name: 'DP', count: 48, pct: '50%', icon: Code, color: 'text-emerald-400 bg-emerald-500/10' },
        { name: 'Graphs', count: 30, pct: '30%', icon: Percent, color: 'text-amber-400 bg-amber-500/10' },
      ],
      performance: [
        { label: 'Contests Attended', value: '25', desc: 'Active participant' },
        { label: 'Global Ranking (Avg)', value: '8,921', desc: 'Top 7.4% globally' },
        { label: 'Best Global Rank', value: '45', desc: 'Starters 131' },
        { label: 'Contest Rating', value: '1,854', desc: '▲ 64 change' },
      ],
    },
    atcoder: {
      username: 'ankit_ac',
      memberSince: 'Feb 2023',
      stats: [
        { title: 'Total Solved', value: '210', sub: '▲ 15 this month', subColor: 'text-emerald-400', icon: FileCode2, iconColor: 'text-purple-400' },
        { title: 'Contest Rating', value: '1,421', sub: '▲ 45', subColor: 'text-emerald-400', icon: Trophy, iconColor: 'text-yellow-500' },
        { title: 'Global Ranking', value: '28,154', sub: '▲ 1,245', subColor: 'text-emerald-400', icon: Globe, iconColor: 'text-blue-400' },
        { title: 'Current Streak', value: '12 days', sub: '🔥 ABC Ready!', subColor: 'text-orange-400', icon: Flame, iconColor: 'text-orange-500' },
        { title: 'Max Streak', value: '28 days', sub: '📅 Jan 2024', subColor: 'text-pink-400', icon: Calendar, iconColor: 'text-pink-500' },
        { title: 'Reputation', value: '1,120', sub: '▲ 90', subColor: 'text-emerald-400', icon: Star, iconColor: 'text-amber-500' },
      ],
      donut: { easy: 90, medium: 105, hard: 15, total: 210, labelEasy: 'ABC A-B', labelMed: 'ABC C-D', labelHard: 'ABC E-F' },
      linePoints: [
        { label: "Dec '23", value: 110 },
        { label: "Jan '24", value: 130 },
        { label: "Feb '24", value: 150 },
        { label: "Mar '24", value: 165 },
        { label: "Apr '24", value: 180 },
        { label: "May '24", value: 195 },
        { label: "Jun '24", value: 210 },
      ],
      contests: [
        { name: 'ABC 355', rank: '842', change: '+22', date: '8 Jun, 2024', isPositive: true },
        { name: 'ABC 354', rank: '1,120', change: '+12', date: '1 Jun, 2024', isPositive: true },
        { name: 'ABC 353', rank: '2,045', change: '-8', date: '25 May, 2024', isPositive: false },
        { name: 'ABC 352', rank: '954', change: '+19', date: '18 May, 2024', isPositive: true },
        { name: 'ABC 351', rank: '450', change: '+32', date: '11 May, 2024', isPositive: true },
      ],
      submissions: [
        { name: 'A - Slot', date: '16 Jun, 09:30 AM', diff: 'Easy', status: 'Accepted', success: true },
        { name: 'B - Keyboard', date: '15 Jun, 04:15 PM', diff: 'Easy', status: 'Accepted', success: true },
        { name: 'C - T-shirt', date: '14 Jun, 11:20 AM', diff: 'Medium', status: 'Accepted', success: true },
        { name: 'D - Poisonous Full-Course', date: '12 Jun, 08:15 PM', diff: 'Medium', status: 'Accepted', success: true },
        { name: 'E - Outer Space', date: '11 Jun, 03:10 PM', diff: 'Hard', status: 'Wrong Answer', success: false },
      ],
      topics: [
        { name: 'Math', count: 45, pct: '75%', icon: Hash, color: 'text-purple-400 bg-purple-500/10' },
        { name: 'DFS', count: 38, pct: '63%', icon: Target, color: 'text-indigo-400 bg-indigo-500/10' },
        { name: 'BFS', count: 32, pct: '53%', icon: Layers, color: 'text-pink-400 bg-pink-500/10' },
        { name: 'DP', count: 30, pct: '50%', icon: Code, color: 'text-blue-400 bg-blue-500/10' },
        { name: 'Sorting', count: 25, pct: '41%', icon: FileCode2, color: 'text-emerald-400 bg-emerald-500/10' },
        { name: 'Brute Force', count: 20, pct: '33%', icon: Percent, color: 'text-amber-400 bg-amber-500/10' },
      ],
      performance: [
        { label: 'Contests Attended', value: '18', desc: 'Active participant' },
        { label: 'Global Ranking (Avg)', value: '28,154', desc: 'Top 12.4% globally' },
        { label: 'Best Global Rank', value: '450', desc: 'ABC 351' },
        { label: 'Contest Rating', value: '1,421', desc: '▲ 45 change' },
      ],
    },
    hackerrank: {
      username: 'ankit_hr',
      memberSince: 'May 2021',
      stats: [
        { title: 'Total Solved', value: '420', sub: '▲ 18 this month', subColor: 'text-emerald-400', icon: FileCode2, iconColor: 'text-purple-400' },
        { title: 'Contest Rating', value: '2,050', sub: '▲ 92', subColor: 'text-emerald-400', icon: Trophy, iconColor: 'text-yellow-500' },
        { title: 'Global Ranking', value: '6,120', sub: '▲ 312', subColor: 'text-emerald-400', icon: Globe, iconColor: 'text-blue-400' },
        { title: 'Current Streak', value: '60 days', sub: '🔥 Golden Badge!', subColor: 'text-orange-400', icon: Flame, iconColor: 'text-orange-500' },
        { title: 'Max Streak', value: '92 days', sub: '📅 Dec 2022', subColor: 'text-pink-400', icon: Calendar, iconColor: 'text-pink-500' },
        { title: 'Reputation', value: '5,430', sub: '▲ 240', subColor: 'text-emerald-400', icon: Star, iconColor: 'text-amber-500' },
      ],
      donut: { easy: 180, medium: 200, hard: 40, total: 420, labelEasy: 'Bronze', labelMed: 'Silver', labelHard: 'Gold' },
      linePoints: [
        { label: "Dec '23", value: 290 },
        { label: "Jan '24", value: 310 },
        { label: "Feb '24", value: 330 },
        { label: "Mar '24", value: 350 },
        { label: "Apr '24", value: 370 },
        { label: "May '24", value: 395 },
        { label: "Jun '24", value: 420 },
      ],
      contests: [
        { name: 'Hack Interview VI', rank: '124', change: '+45', date: '6 Jun, 2024', isPositive: true },
        { name: 'Week of Code 35', rank: '240', change: '+32', date: '1 Jun, 2024', isPositive: true },
        { name: 'WoC 34', rank: '582', change: '-12', date: '25 May, 2024', isPositive: false },
        { name: 'HourRank 24', rank: '180', change: '+28', date: '18 May, 2024', isPositive: true },
        { name: 'HourRank 23', rank: '92', change: '+56', date: '11 May, 2024', isPositive: true },
      ],
      submissions: [
        { name: 'Solve Me First', date: '16 Jun, 10:30 AM', diff: 'Easy', status: 'Accepted', success: true },
        { name: 'Simple Array Sum', date: '15 Jun, 03:15 PM', diff: 'Easy', status: 'Accepted', success: true },
        { name: 'Compare the Triplets', date: '14 Jun, 11:20 AM', diff: 'Easy', status: 'Accepted', success: true },
        { name: 'A Very Big Sum', date: '12 Jun, 07:15 PM', diff: 'Easy', status: 'Accepted', success: true },
        { name: 'Diagonal Difference', date: '11 Jun, 02:10 PM', diff: 'Easy', status: 'Accepted', success: true },
      ],
      topics: [
        { name: 'Algorithms', count: 150, pct: '92%', icon: Code, color: 'text-purple-400 bg-purple-500/10' },
        { name: 'Java', count: 98, pct: '65%', icon: Layers, color: 'text-indigo-400 bg-indigo-500/10' },
        { name: 'Python', count: 85, pct: '56%', icon: FileCode2, color: 'text-pink-400 bg-pink-500/10' },
        { name: 'SQL', count: 70, pct: '46%', icon: Hash, color: 'text-blue-400 bg-blue-500/10' },
        { name: 'Data Structures', count: 65, pct: '43%', icon: Target, color: 'text-emerald-400 bg-emerald-500/10' },
        { name: 'C++', count: 40, pct: '26%', icon: Percent, color: 'text-amber-400 bg-amber-500/10' },
      ],
      performance: [
        { label: 'Contests Attended', value: '42', desc: 'Active participant' },
        { label: 'Global Ranking (Avg)', value: '6,120', desc: 'Top 4.1% globally' },
        { label: 'Best Global Rank', value: '92', desc: 'HourRank 23' },
        { label: 'Contest Rating', value: '2,050', desc: '▲ 92 change' },
      ],
    },
    github: {
      username: 'LalitModi90',
      memberSince: 'Jan 2020',
      stats: [
        { title: 'Total Commits', value: '2,840', sub: '▲ 240 this month', subColor: 'text-emerald-400', icon: FileCode2, iconColor: 'text-purple-400' },
        { title: 'Contributions', value: 'Top 2%', sub: '▲ 18%', subColor: 'text-emerald-400', icon: Trophy, iconColor: 'text-yellow-500' },
        { title: 'Global Rank', value: '18', sub: '▲ 4', subColor: 'text-emerald-400', icon: Globe, iconColor: 'text-blue-400' },
        { title: 'Current Streak', value: '180 days', sub: '🔥 Super Active!', subColor: 'text-orange-400', icon: Flame, iconColor: 'text-orange-500' },
        { title: 'Max Streak', value: '210 days', sub: '📅 Dec 2023', subColor: 'text-pink-400', icon: Calendar, iconColor: 'text-pink-500' },
        { title: 'Stars Earned', value: '15.4k', sub: '▲ 1.2k', subColor: 'text-emerald-400', icon: Star, iconColor: 'text-amber-500' },
      ],
      donut: { easy: 650, medium: 820, hard: 1370, total: 2840, labelEasy: 'Issues', labelMed: 'PRs Merged', labelHard: 'Commits' },
      linePoints: [
        { label: "Dec '23", value: 1950 },
        { label: "Jan '24", value: 2100 },
        { label: "Feb '24", value: 2250 },
        { label: "Mar '24", value: 2400 },
        { label: "Apr '24", value: 2550 },
        { label: "May '24", value: 2700 },
        { label: "Jun '24", value: 2840 },
      ],
      contests: [
        { name: 'Hacktoberfest 2024', rank: 'Top Contributor', change: '+120 Stars', date: '31 Oct, 2024', isPositive: true },
        { name: 'Google Summer of Code', rank: 'Student Dev', change: '+3 PRs', date: '15 Sep, 2024', isPositive: true },
        { name: 'Global Hackathon', rank: '12', change: '+500 Stars', date: '25 Aug, 2024', isPositive: true },
        { name: 'OpenSource Sprint', rank: '3', change: '+8 PRs', date: '12 Jul, 2024', isPositive: true },
        { name: 'Spring CodeJam', rank: '42', change: '+30 commits', date: '11 Jun, 2024', isPositive: true },
      ],
      submissions: [
        { name: 'Update page.tsx layout config', date: '16 Jun, 06:12 PM', diff: 'Medium', status: 'Accepted', success: true },
        { name: 'Fix relative import path issue', date: '16 Jun, 05:40 PM', diff: 'Easy', status: 'Accepted', success: true },
        { name: 'Refactor platform selector engine', date: '15 Jun, 11:22 PM', diff: 'Hard', status: 'Accepted', success: true },
        { name: 'Merge remote-tracking branch', date: '14 Jun, 09:15 AM', diff: 'Easy', status: 'Accepted', success: true },
        { name: 'Initialize workspace components', date: '12 Jun, 03:30 PM', diff: 'Medium', status: 'Accepted', success: true },
      ],
      topics: [
        { name: 'TypeScript', count: 450, pct: '95%', icon: Code, color: 'text-purple-400 bg-purple-500/10' },
        { name: 'JavaScript', count: 380, pct: '84%', icon: Layers, color: 'text-indigo-400 bg-indigo-500/10' },
        { name: 'Next.js', count: 320, pct: '74%', icon: Hash, color: 'text-pink-400 bg-pink-500/10' },
        { name: 'React', count: 280, pct: '62%', icon: Target, color: 'text-blue-400 bg-blue-500/10' },
        { name: 'Python', count: 210, pct: '48%', icon: FileCode2, color: 'text-emerald-400 bg-emerald-500/10' },
        { name: 'CSS', count: 180, pct: '40%', icon: Percent, color: 'text-amber-400 bg-amber-500/10' },
      ],
      performance: [
        { label: 'Projects Built', value: '42', desc: 'Active developer' },
        { label: 'Contributions (Avg)', value: '185/mo', desc: 'Top 2.1% globally' },
        { label: 'Best Project Star count', value: '1,240', desc: 'CodeSync App' },
        { label: 'Weekly Commits', value: '45 commits', desc: '▲ 12 change' },
      ],
    },
  };

  const currentData = platformData[activePlatform] || platformData['leetcode'];

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

      <main className="max-w-[1600px] mx-auto px-6 pt-8 flex flex-col gap-8">
        
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
                <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest leading-none">Connected</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="text-xl font-bold text-gray-200 leading-none">{displayName}</div>
                <div className="text-sm font-semibold text-gray-500 leading-none">@{currentData.username}</div>
              </div>
              <div className="flex items-center gap-5 mt-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold bg-white/[0.02] px-2.5 py-1.5 rounded-lg border border-white/5">
                  <img src="https://cdn-icons-png.flaticon.com/512/323/323315.png" className="w-4 h-4 opacity-80" alt="India" /> India
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold bg-white/[0.02] px-2.5 py-1.5 rounded-lg border border-white/5">
                  <Calendar size={14} className="text-purple-400" /> Joined {currentData.memberSince}
                </div>
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
                  <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest block mb-2 px-2 pt-1">Switch Platform</span>
                  {connectedPlatforms.map(plat => (
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

              {/* ROW 2: Problems Solved, Solved Over Time, Streak Heatmap */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                
                {/* Problems Solved Donut card */}
                <div className={`${card} xl:col-span-4 rounded-2xl p-5 border flex flex-col justify-between`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">
                      {activePlatform === 'github' ? 'Contributions Breakdown' : 'Problems Solved'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-6 justify-center flex-1 py-4">
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
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
                      </ResponsiveContainer>
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
                        <span className="text-lg font-extrabold text-white leading-none">
                          {hoveredDonutSegment === 'easy' && currentData.donut.easy}
                          {hoveredDonutSegment === 'medium' && currentData.donut.medium}
                          {hoveredDonutSegment === 'hard' && currentData.donut.hard}
                          {!hoveredDonutSegment && currentData.donut.total}
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
                <div className={`${card} xl:col-span-4 rounded-2xl p-5 border flex flex-col justify-between`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">
                      {activePlatform === 'github' ? 'Contribution History' : 'Solved Over Time'}
                    </h3>
                    <select className="text-[9px] bg-transparent border border-white/5 text-gray-400 font-extrabold focus:outline-none rounded-lg px-2 py-0.5">
                      <option>All Time</option>
                    </select>
                  </div>

                  <div className="flex-1 min-h-[140px] pt-4 select-none relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={currentData.linePoints} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="label" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6b7280', fontSize: 8, fontWeight: 600, fontFamily: 'monospace' }}
                          tickFormatter={(val) => val.split(' ')[0]}
                          dy={10}
                        />
                        <RechartsTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-purple-950/90 border border-purple-500/20 rounded-xl px-2.5 py-1.5 shadow-2xl">
                                  <span className="text-[10px] font-mono text-purple-300 font-extrabold block">
                                    {payload[0].value}
                                  </span>
                                  <span className="text-[7px] text-gray-500 uppercase font-extrabold mt-0.5 block">
                                    {payload[0].payload.label}
                                  </span>
                                </div>
                              );
                            }
                            return null;
                          }}
                          cursor={{ stroke: 'rgba(168,85,247,0.3)', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#a855f7" 
                          strokeWidth={2.5}
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                          activeDot={{ r: 6, fill: '#a855f7', stroke: 'rgba(168,85,247,0.4)', strokeWidth: 4 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Streak Heatmap calendar */}
                <div className={`${card} xl:col-span-4 rounded-2xl p-5 border flex flex-col justify-between`}>
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <span>{activePlatform === 'github' ? 'Contribution Calendar' : 'Streak Heatmap'}</span>
                    </h3>
                    <div className="flex items-center gap-2">
                      {/* Year Switcher */}
                      <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="text-[9px] bg-purple-950/40 border border-purple-500/20 text-purple-400 font-bold focus:outline-none cursor-pointer rounded-lg px-2 py-0.5 hover:bg-purple-900/35 transition-all shadow-[0_0_8px_rgba(139,92,246,0.15)]"
                      >
                        <option value={2024} className="bg-[#0f1419] text-white">2024</option>
                        <option value={2023} className="bg-[#0f1419] text-white">2023</option>
                        <option value={2022} className="bg-[#0f1419] text-white">2022</option>
                      </select>
                      <span className="text-[10px] font-bold text-orange-400 inline-flex items-center gap-0.5">
                        <Flame size={10} className="text-orange-500 animate-pulse" />
                        <span>120d</span>
                      </span>
                    </div>
                  </div>

                  <div 
                    ref={scrollContainerRef}
                    className="flex-1 overflow-x-auto pt-2 pb-1 scrollbar-thin scrollbar-thumb-purple-500/25 scrollbar-track-transparent scroll-smooth"
                  >
                    <div className="flex items-start gap-3.5 min-w-max pr-2">
                      {monthsData.map((month) => (
                        <div key={month.label} className="flex flex-col gap-1.5">
                          <div className="flex gap-[3.5px]">
                            {month.weeks.map((week, wIdx) => (
                              <div key={wIdx} className="flex flex-col gap-[3.5px]">
                                {week.map((cell, cIdx) => {
                                  if (!cell) {
                                    return (
                                      <div 
                                        key={cIdx} 
                                        className="w-[9px] h-[9px] bg-transparent pointer-events-none rounded-[1.5px]" 
                                      />
                                    );
                                  }
                                  const cellColor = getColor(cell.count);
                                  return (
                                    <div
                                      key={cIdx}
                                      className="w-[9px] h-[9px] rounded-[1.5px] transition-all duration-150 hover:scale-125 cursor-pointer relative group"
                                      style={{ 
                                        backgroundColor: cellColor,
                                        boxShadow: cell.count > 4 ? `0 0 5px ${cellColor}40` : undefined
                                      }}
                                    >
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 bg-[#0b0a12]/95 border border-purple-500/20 px-2 py-1 rounded-lg text-[8px] font-mono text-purple-300 shadow-xl whitespace-nowrap pointer-events-none">
                                        {cell.count} on {new Date(cell.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                          <span className="text-[9px] font-extrabold text-gray-300 uppercase tracking-widest pl-0.5">
                            {month.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* ROW 3: Contest Performance, Recent Contests table, Recent Submissions list */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                
                {/* Contest Performance Stats */}
                <div className={`${card} xl:col-span-2 rounded-2xl p-4 border flex flex-col justify-between`}>
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
                <div className={`${card} xl:col-span-4 rounded-2xl p-4 border flex flex-col justify-between`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">
                      {activePlatform === 'github' ? 'Open Source & Projects' : 'Recent Contests'}
                    </h3>
                    <span className="text-[9px] font-extrabold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer">View All →</span>
                  </div>

                  <div className="flex-1 overflow-x-auto select-none">
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
                        {currentData.contests.map((c, idx) => (
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
                  </div>
                </div>

                {/* Rating History Line Chart */}
                <div className={`${card} xl:col-span-3 rounded-2xl p-4 border flex flex-col justify-between group`}>
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
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={currentData.linePoints} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35}/>
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
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
                                    <div className="bg-purple-950/90 border border-purple-500/20 rounded-xl px-2.5 py-1.5 shadow-2xl">
                                      <span className="text-[10px] font-mono text-purple-300 font-extrabold block">
                                        {payload[0].value}
                                      </span>
                                      <span className="text-[7px] text-gray-500 uppercase font-extrabold mt-0.5 block">
                                        {payload[0].payload.label}
                                      </span>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                              cursor={{ stroke: 'rgba(168,85,247,0.3)', strokeWidth: 1.5, strokeDasharray: '2 2' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#a855f7" 
                              strokeWidth={2.5}
                              fillOpacity={1} 
                              fill="url(#ratingGradient)" 
                              activeDot={{ r: 5, fill: '#0f141d', stroke: '#a855f7', strokeWidth: 2.5 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  })()}
                </div>

                {/* Recent Submissions list */}
                <div className={`${card} xl:col-span-3 rounded-2xl p-4 border flex flex-col justify-between`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">
                      {activePlatform === 'github' ? 'Recent Activity / Commits' : 'Recent Submissions'}
                    </h3>
                    <span className="text-[9px] font-extrabold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer">View All →</span>
                  </div>

                  <div className="flex-1 space-y-2.5 select-none">
                    {currentData.submissions.map((sub, idx) => (
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
                    ))}
                  </div>
                </div>

              </div>

              {/* ROW 4: TOP SOLVED TOPICS, DIFFICULTY BARS, ACCURACY */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                
                {/* Top Solved Topics — interactive hover bars */}
                {(() => {
                  const topics = currentData.topics;
                  const maxCount = Math.max(...topics.map((t: any) => t.count));
                  return (
                    <div className={`${card} xl:col-span-4 rounded-2xl p-4 border flex flex-col justify-between`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">Top Solved Topics</h3>
                        <span className="text-[9px] font-extrabold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer">View All →</span>
                      </div>
                      <div className="flex-1 space-y-2.5 mt-1">
                        {topics.map((topic: any, idx: number) => {
                          const pct = (topic.count / maxCount) * 100;
                          const isHov = hovTopic === idx;
                          return (
                            <div
                              key={idx}
                              className={`flex items-center gap-3 px-2 py-1.5 rounded-xl cursor-pointer transition-all duration-200 ${isHov ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'}`}
                              onMouseEnter={() => setHovTopic(idx)}
                              onMouseLeave={() => setHovTopic(null)}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${topic.color} ${isHov ? 'scale-110' : ''}`}>
                                <topic.icon size={13} />
                              </div>
                              <span className={`text-[10px] w-28 truncate font-bold transition-colors ${isHov ? 'text-white' : 'text-gray-400'}`}>{topic.name}</span>
                              <div className="flex-1 h-2 bg-white/[0.03] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${pct}%`,
                                    background: isHov
                                      ? 'linear-gradient(90deg,#a855f7,#7c3aed)'
                                      : 'rgba(168,85,247,0.55)',
                                    boxShadow: isHov ? '0 0 12px rgba(168,85,247,0.7)' : undefined,
                                  }}
                                />
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className={`text-[10px] font-mono font-bold transition-colors ${isHov ? 'text-purple-300' : 'text-white'}`}>{topic.count}</span>
                                {isHov && (
                                  <span className="text-[8px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-full border border-purple-500/20">{topic.pct}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Problems by Difficulty Over Time — interactive stacked bars */}
                {(() => {
                  const barData = currentData.linePoints.map((p: any, i: number) => ({
                    label: p.label.split(' ')[0],
                    e: Math.round(p.value * 0.247),
                    m: Math.round(p.value * 0.529),
                    h: Math.round(p.value * 0.224),
                    total: p.value,
                  }));
                  const maxTotal = Math.max(...barData.map((b: any) => b.e + b.m + b.h));
                  return (
                    <div className={`${card} xl:col-span-4 rounded-2xl p-4 border flex flex-col`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">Problems by Difficulty Over Time</h3>
                      </div>
                      <div className="flex items-center gap-4 mb-3 text-[8px] font-bold text-gray-400 uppercase">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-emerald-500" />{currentData.donut.labelEasy}</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-yellow-500" />{currentData.donut.labelMed}</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-rose-500" />{currentData.donut.labelHard}</div>
                      </div>

                      {hovBar !== null && (
                        <div className="mb-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between animate-fade-in">
                          <span className="text-[9px] font-extrabold text-gray-300 uppercase tracking-wider">{currentData.linePoints[hovBar]?.label}</span>
                          <div className="flex gap-3">
                            <span className="text-[9px] font-bold text-emerald-400">{currentData.donut.labelEasy}: <span className="font-mono">{barData[hovBar]?.e}</span></span>
                            <span className="text-[9px] font-bold text-yellow-400">{currentData.donut.labelMed}: <span className="font-mono">{barData[hovBar]?.m}</span></span>
                            <span className="text-[9px] font-bold text-rose-400">{currentData.donut.labelHard}: <span className="font-mono">{barData[hovBar]?.h}</span></span>
                          </div>
                        </div>
                      )}

                      <div className="flex-1 min-h-[120px] pt-2 relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <XAxis 
                              dataKey="label" 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#6b7280', fontSize: 7, fontWeight: 700, fontFamily: 'monospace' }}
                              tickFormatter={(val) => val.toUpperCase()}
                              dy={10}
                            />
                            <RechartsTooltip 
                              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 shadow-2xl backdrop-blur-xl">
                                      <span className="text-[9px] font-extrabold text-gray-300 uppercase tracking-wider block mb-1">{label}</span>
                                      <div className="flex gap-3">
                                        <span className="text-[9px] font-bold text-emerald-400">{currentData.donut.labelEasy}: <span className="font-mono">{payload.find(p => p.dataKey === 'e')?.value}</span></span>
                                        <span className="text-[9px] font-bold text-yellow-400">{currentData.donut.labelMed}: <span className="font-mono">{payload.find(p => p.dataKey === 'm')?.value}</span></span>
                                        <span className="text-[9px] font-bold text-rose-400">{currentData.donut.labelHard}: <span className="font-mono">{payload.find(p => p.dataKey === 'h')?.value}</span></span>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="e" stackId="a" fill="#22c55e" radius={[0, 0, 2, 2]} />
                            <Bar dataKey="m" stackId="a" fill="#eab308" />
                            <Bar dataKey="h" stackId="a" fill="#ef4444" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })()}

                {/* Accuracy — interactive donut with hover segments */}
                {(() => {
                  const total = currentData.donut.total;
                  const accepted = Math.round(total * 0.924);
                  const wrong = Math.round(total * 0.056);
                  const tle = Math.round(total * 0.02);
                  const allSubs = accepted + wrong + tle;
                  const segs = [
                    { id: 'accepted', label: 'Accepted', value: accepted, color: '#22c55e', stroke: '#22c55e', da: `${(accepted/allSubs)*100} ${100-(accepted/allSubs)*100}`, offset: '0' },
                    { id: 'wrong', label: 'Wrong Answer', value: wrong, color: '#f87171', stroke: '#ef4444', da: `${(wrong/allSubs)*100} ${100-(wrong/allSubs)*100}`, offset: `-${(accepted/allSubs)*100}` },
                    { id: 'tle', label: 'Time Limit', value: tle, color: '#fb923c', stroke: '#f97316', da: `${(tle/allSubs)*100} ${100-(tle/allSubs)*100}`, offset: `-${((accepted+wrong)/allSubs)*100}` },
                  ];
                  const activeRate = hovAccSeg ? segs.find(s => s.id === hovAccSeg) : null;
                  return (
                    <div className={`${card} xl:col-span-4 rounded-2xl p-4 border flex items-center justify-between gap-4`}>
                      <div className="flex-1 flex flex-col items-center">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400 mb-3 self-start">Accuracy</h3>
                        <div className="relative w-32 h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={segs}
                                innerRadius={36}
                                outerRadius={50}
                                dataKey="value"
                                stroke="none"
                                onMouseEnter={(_, index) => {
                                  setHovAccSeg(segs[index].id);
                                }}
                                onMouseLeave={() => setHovAccSeg(null)}
                              >
                                {segs.map((entry, index) => {
                                  const isActive = hovAccSeg === entry.id;
                                  return (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={entry.color}
                                      style={{
                                        filter: isActive ? `drop-shadow(0px 0px 6px ${entry.color})` : 'none',
                                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                        transformOrigin: 'center',
                                        transition: 'all 0.3s ease'
                                      }}
                                    />
                                  );
                                })}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                            <span className="text-base font-black leading-none" style={{ color: activeRate ? activeRate.color : '#ffffff' }}>
                              {activeRate ? `${Math.round((activeRate.value/allSubs)*100)}%` : '92.4%'}
                            </span>
                            <span className="text-[6px] text-gray-500 font-bold uppercase text-center leading-tight mt-0.5">
                              {activeRate ? activeRate.label : <>Acceptance<br/>Rate</>}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-3">
                          {segs.map(seg => (
                            <div
                              key={seg.id}
                              className={`flex items-center gap-1 cursor-pointer transition-opacity ${hovAccSeg && hovAccSeg !== seg.id ? 'opacity-40' : 'opacity-100'}`}
                              onMouseEnter={() => setHovAccSeg(seg.id)}
                              onMouseLeave={() => setHovAccSeg(null)}
                            >
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
                              <span className="text-[7px] font-bold text-gray-400">{seg.label.split(' ')[0]}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex-1 space-y-2.5 pt-2">
                        {[
                          { label: 'Total Submissions', value: allSubs.toLocaleString(), seg: null, color: 'text-white' },
                          { label: 'Accepted', value: accepted.toLocaleString(), seg: 'accepted', color: 'text-emerald-400' },
                          { label: 'Wrong Answer', value: wrong.toLocaleString(), seg: 'wrong', color: 'text-rose-400' },
                          { label: 'Time Limit Exceeded', value: tle.toLocaleString(), seg: 'tle', color: 'text-orange-400' },
                        ].map((row, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between px-2 py-1 rounded-lg transition-all cursor-pointer ${hovAccSeg === row.seg && row.seg ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'}`}
                            onMouseEnter={() => row.seg && setHovAccSeg(row.seg)}
                            onMouseLeave={() => setHovAccSeg(null)}
                          >
                            <span className="text-[9px] text-gray-400 font-semibold">{row.label}</span>
                            <span className={`text-[10px] font-mono font-bold ${row.color}`}>{row.value}</span>
                          </div>
                        ))}
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

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Difficulty Breakdown */}
                        <div className={`${card} rounded-2xl p-5 border flex flex-col justify-between`}>
                          <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400 mb-4">Difficulty Breakdown</h3>
                          <div className="space-y-5">
                            {[
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
                            ))}
                          </div>
                        </div>

                        {/* Sheet Progress Widget */}
                        <div className={`${card} rounded-2xl p-6 border flex flex-col justify-between group relative`}>
                          
                          <div className="flex items-center gap-8 z-0">
                            {/* Circular Progress */}
                            <div className="relative w-[130px] h-[130px] flex-shrink-0">
                              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                {/* Track */}
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
                                {/* Progress */}
                                <circle 
                                  cx="18" 
                                  cy="18" 
                                  r="15.915" 
                                  fill="none" 
                                  stroke="#f97316" 
                                  strokeWidth="3.5" 
                                  strokeDasharray="72 28"
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center flex-col pt-1">
                                <span className="text-[32px] font-bold text-white tracking-tight leading-none">72%</span>
                                <span className="text-[11px] text-gray-400 mt-1 font-medium">Completed</span>
                              </div>
                            </div>

                            {/* Vertical Separator */}
                            <div className="w-[1px] h-24 bg-white/10 hidden sm:block" />
                            
                            {/* Stats Right */}
                            <div className="space-y-5 pl-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-white w-10 text-left leading-none">328</span>
                                <span className="text-[13px] text-emerald-500 font-medium">Solved</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-white w-10 text-left leading-none">127</span>
                                <span className="text-[13px] text-[#f97316] font-medium">Remaining</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-white w-10 text-left leading-none">455</span>
                                <span className="text-[13px] text-gray-400 font-medium">Total</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-4 mt-6 z-10 relative">
                            <button className="flex-1 bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white text-sm font-semibold py-[11px] rounded-[10px] hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                              Resume Sheet
                            </button>
                            <button className="flex-1 bg-transparent border border-white/10 hover:bg-white/[0.04] text-gray-200 text-sm font-semibold py-[11px] rounded-[10px] transition-all">
                              Continue Last Problem
                            </button>
                          </div>
                        </div>

                        {/* Trend Widget */}
                        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
                          <div>
                            <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-400 mb-1">Solving Trend</h3>
                            <p className="text-[10px] text-gray-400">Based on {currentData.stats[0].sub} — activity up this month.</p>
                          </div>
                          <div className="mt-4 flex items-end gap-2 text-indigo-400">
                            <TrendingUp size={24} />
                            <span className="text-3xl font-black text-white leading-none">24<span className="text-sm text-indigo-400">%</span></span>
                          </div>
                          <div className="mt-4 pt-3 border-t border-white/5 flex justify-between">
                            <span className="text-[9px] text-gray-400">This month</span>
                            <span className="text-[9px] font-extrabold text-emerald-400">{currentData.stats[0].sub}</span>
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

                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                        {/* Full Contest History */}
                        <div className={`${card} rounded-2xl p-5 border lg:col-span-3 flex flex-col`}>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">Contest History</h3>
                          </div>
                          <div className="flex-1 overflow-x-auto select-none">
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
                                {currentData.contests.map((c, idx) => (
                                  <tr key={idx} className="border-b border-white/[0.02] last:border-none text-[10px] text-gray-300 hover:bg-white/[0.01] transition-colors">
                                    <td className="py-3 font-semibold text-gray-200 truncate max-w-[160px]">{c.name}</td>
                                    <td className="py-3 text-center font-mono font-medium">{c.rank}</td>
                                    <td className={`py-3 text-center font-mono font-bold ${c.isPositive ? 'text-emerald-400' : 'text-rose-500'}`}>{c.change}</td>
                                    <td className="py-3 text-right font-mono text-gray-500 text-[9px]">{c.date}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Upcoming Contests */}
                        <div className={`${card} rounded-2xl p-5 border lg:col-span-2 flex flex-col`}>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">Upcoming</h3>
                          </div>
                          <div className="space-y-2 flex-1 overflow-y-auto pr-1 scrollbar-none">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex flex-col items-center justify-center text-purple-400 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-colors flex-shrink-0">
                                    <span className="text-[7px] font-bold uppercase leading-none mb-0.5">Jun</span>
                                    <span className="text-[11px] font-black leading-none">{18 + i}</span>
                                  </div>
                                  <div>
                                    <h4 className="text-[10px] font-extrabold text-white">Contest {350 + i}</h4>
                                    <span className="text-[8px] text-gray-500 font-semibold">In {i * 2} days</span>
                                  </div>
                                </div>
                                <button className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-[8px] font-extrabold text-purple-300 hover:text-white transition-colors">Register</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBMISSIONS TAB */}
                  {activeTab === 'Submissions' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Submissions Feed */}
                        <div className={`${card} rounded-2xl p-5 border lg:col-span-2 flex flex-col h-[400px]`}>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">Live Submission Feed</h3>
                            <button className="text-[9px] font-extrabold text-gray-400 hover:text-white transition-colors">Filter</button>
                          </div>
                          <div className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-none">
                            {currentData.submissions.map((sub: any, idx: number) => (
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
                            ))}
                          </div>
                        </div>

                        {/* Language Usage & Heatmap placeholder */}
                        <div className="space-y-5 flex flex-col h-[400px]">
                          <div className={`${card} rounded-2xl p-5 border flex-1 flex flex-col`}>
                            <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400 mb-4">Language Usage</h3>
                            <div className="flex-1 flex items-center justify-center gap-4">
                               <div className="relative w-24 h-24">
                                 <ResponsiveContainer width="100%" height="100%">
                                   <PieChart>
                                     <Pie
                                       data={[
                                         { name: 'C++', value: 60, fill: '#3b82f6' },
                                         { name: 'Python', value: 25, fill: '#eab308' },
                                         { name: 'Java', value: 15, fill: '#ef4444' }
                                       ]}
                                       innerRadius={28}
                                       outerRadius={40}
                                       dataKey="value"
                                       stroke="none"
                                     >
                                       {[
                                         { name: 'C++', value: 60, fill: '#3b82f6' },
                                         { name: 'Python', value: 25, fill: '#eab308' },
                                         { name: 'Java', value: 15, fill: '#ef4444' }
                                       ].map((entry, index) => (
                                         <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity cursor-pointer" />
                                       ))}
                                     </Pie>
                                     <RechartsTooltip
                                       content={({ active, payload }) => {
                                         if (active && payload && payload.length) {
                                           return (
                                             <div className="bg-purple-950/90 border border-purple-500/20 rounded-lg px-2 py-1 shadow-xl">
                                               <span className="text-[10px] font-bold text-white flex items-center gap-1.5">
                                                 <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
                                                 {payload[0].name}: {payload[0].value}%
                                               </span>
                                             </div>
                                           );
                                         }
                                         return null;
                                       }}
                                     />
                                   </PieChart>
                                 </ResponsiveContainer>
                               </div>
                               <div className="space-y-2">
                                 <div className="flex items-center gap-2 text-[9px] font-bold text-gray-300"><div className="w-2 h-2 rounded bg-blue-500"/>C++ (60%)</div>
                                 <div className="flex items-center gap-2 text-[9px] font-bold text-gray-300"><div className="w-2 h-2 rounded bg-yellow-500"/>Python (25%)</div>
                                 <div className="flex items-center gap-2 text-[9px] font-bold text-gray-300"><div className="w-2 h-2 rounded bg-rose-500"/>Java (15%)</div>
                               </div>
                            </div>
                          </div>
                          <div className={`${card} rounded-2xl p-5 border flex-1 flex flex-col justify-center items-center relative overflow-hidden`}>
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
                             <Activity size={24} className="text-gray-500 mb-2" />
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Daily Activity<br/>Heatmap rendering...</span>
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
                        {currentData.topics.map((topic: any, idx: number) => (
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
                        ))}
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
