"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../../../components/OnboardingProvider';
import { useUser, useClerk } from '@clerk/nextjs';
import { 
  Home as HomeIcon, 
  User, 
  Layers, 
  FolderGit2,
  BookOpen, 
  FileCode2, 
  ClipboardList, 
  Trophy, 
  HelpCircle, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  ChevronDown, 
  Sparkles, 
  RefreshCw, 
  Flame,
  Check,
  Zap,
  Terminal,
  ExternalLink,
  Plus,
  Play,
  ArrowRight,
  ListTodo,
  Bell,
  Code2,
  Calendar,
  AlertTriangle,
  MapPin,
  Mail,
  Twitter,
  Linkedin,
  Link2,
  Globe,
  Share2,
  Lock,
  ChevronRight,
  Award
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { profile, resetOnboarding } = useOnboarding();
  const { isLoaded, isSignedIn, user } = useUser();
  const { openUserProfile } = useClerk();
  
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [isProfilePublic, setIsProfilePublic] = useState(true);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    document.documentElement.classList.toggle('dark');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  };

  // Resolved user profiles
  const displayName = isLoaded && isSignedIn && user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : (profile.firstName ? `${profile.firstName} ${profile.lastName}` : 'Lalit Modi');

  const displayUsername = profile.username || (isLoaded && isSignedIn && user?.username) || 'lalitmodi';
  const displayAvatar = isLoaded && isSignedIn && user?.imageUrl ? user.imageUrl : null;
  const displayInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

  const clerkAppearance = {
    variables: {
      colorPrimary: "#FF8A00",
      colorBackground: theme === 'dark' ? "#0f172a" : "#ffffff",
      colorText: theme === 'dark' ? "#ffffff" : "#0f172a",
    }
  };

  // Theme styling definitions
  const bgClass = theme === 'dark' ? 'bg-[#09090B] text-[#FAFAFA]' : 'bg-[#FAFAFA] text-[#18181B]';
  const sidebarBgClass = theme === 'dark' ? 'bg-[#111113]' : 'bg-[#F4F4F5]';
  const cardBgClass = theme === 'dark' ? 'bg-[#101014]' : 'bg-[#FFFFFF]';
  const borderColorClass = theme === 'dark' ? 'border-[rgba(255,255,255,0.06)]' : 'border-[#E4E4E7]';
  const mutedTextClass = theme === 'dark' ? 'text-[#A1A1AA]' : 'text-[#71717A]';
  const innerBgClass = theme === 'dark' ? 'bg-[#09090B] border-white/5' : 'bg-[#F4F4F5] border-[#E4E4E7]';

  return (
    <div className={`min-h-screen flex ${bgClass} transition-colors duration-300 overflow-hidden font-sans`}>
      
      {/* LEFT SIDEBAR (Sticky) */}
      <aside className={`hidden lg:flex flex-col w-60 border-r ${borderColorClass} ${sidebarBgClass} p-4 flex-shrink-0 relative z-20`}>
        
        {/* Company Logotype */}
        <div className="flex items-center justify-start h-16 relative overflow-hidden mb-6 -mx-2">
          <img 
            src={theme === 'dark' ? '/assets/logo-dark-them.png' : '/assets/logo-light-Them.png'} 
            alt="Coderyx Logo" 
            className="h-28 w-auto object-contain absolute left-0 top-1/2 -translate-y-1/2 mt-1" 
          />
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto scrollbar-thin">
          <div className={`text-[9px] font-bold ${mutedTextClass} uppercase tracking-wider px-2.5 mb-2`}>Core Workspace</div>
          <Link href="/dashboard/home" className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all bg-orange-500/10 border ${borderColorClass} text-orange-400`}>
            <HomeIcon size={15} />
            Home
          </Link>
          <Link href="/dashboard" className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs ${mutedTextClass} hover:text-orange-500 hover:bg-orange-500/5 transition-all`}>
            <User size={15} />
            Dashboard
          </Link>

          <a href="#" className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs ${mutedTextClass} hover:text-orange-500 hover:bg-orange-500/5 transition-all`}>
            <FolderGit2 size={15} />
            My Workspace
          </a>

          <div className={`text-[9px] font-bold ${mutedTextClass} uppercase tracking-wider px-2.5 pt-4 mb-2`}>Problem Solving</div>
          <a href="#" className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs ${mutedTextClass} hover:text-orange-500 hover:bg-orange-500/5 transition-all`}>
            <BookOpen size={15} />
            Explore Sheets
          </a>
          <a href="#" className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs ${mutedTextClass} hover:text-orange-500 hover:bg-orange-500/5 transition-all`}>
            <FileCode2 size={15} />
            My Sheets
          </a>
          <a href="#" className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs ${mutedTextClass} hover:text-orange-500 hover:bg-orange-500/5 transition-all`}>
            <ClipboardList size={15} />
            Notes
          </a>
          <a href="#" className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs ${mutedTextClass} hover:text-orange-500 hover:bg-orange-500/5 transition-all`}>
            <Trophy size={15} />
            Contests
          </a>
          <a href="#" className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs ${mutedTextClass} hover:text-orange-500 hover:bg-orange-500/5 transition-all`}>
            <Trophy size={15} className="text-amber-500" />
            Leaderboard
          </a>

          <div className={`text-[9px] font-bold ${mutedTextClass} uppercase tracking-wider px-2.5 pt-4 mb-2`}>System</div>
          <a href="#" className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs ${mutedTextClass} hover:text-orange-500 hover:bg-orange-500/5 transition-all`}>
            <HelpCircle size={15} />
            Help Center
          </a>
          <a href="#" className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs ${mutedTextClass} hover:text-orange-500 hover:bg-orange-500/5 transition-all`}>
            <MessageSquare size={15} />
            Feedback
          </a>
          <button 
            onClick={() => {
              openUserProfile({ appearance: clerkAppearance });
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs ${mutedTextClass} hover:text-orange-500 hover:bg-orange-500/5 transition-all text-left`}
          >
            <Settings size={15} />
            Edit Profile
          </button>
          <button 
            onClick={resetOnboarding}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-500/80 hover:bg-red-500/5 transition-all text-left`}
          >
            <Settings size={15} className="text-red-500/80" />
            Reset Onboarding
          </button>
          <a href="/login" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-500 hover:bg-red-500/5 transition-all">
            <LogOut size={15} />
            Logout
          </a>
        </nav>
      </aside>

      {/* CORE WORKSPACE CONTENT AND TOP BAR */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
        

        {/* SIMPLIFIED 2-COLUMN PREMIUM WORKSPACE */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* COLUMN 1: USER DETAILS PANEL (All details clearly visible) */}
            <div className="md:col-span-1 space-y-6">
              
              {/* User Profile Card */}
              <div className={`border ${borderColorClass} ${cardBgClass} rounded-3xl p-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-full blur-2xl"></div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full border-4 border-orange-500/30 bg-zinc-800 flex items-center justify-center overflow-hidden mb-4">
                    {displayAvatar ? (
                      <img src={displayAvatar} alt="Lalit" className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} className="text-zinc-400" />
                    )}
                  </div>
                  
                  <h2 className="text-lg font-black tracking-tight">{displayName}</h2>
                  <p className="text-xs text-orange-400 font-mono">@{displayUsername}</p>
                  
                  <p className={`text-xs ${mutedTextClass} mt-3 leading-relaxed`}>
                    Competitive Programmer and SDE enthusiast. Solving algorithms day by day.
                  </p>
                </div>

                <div className="border-t border-white/5 my-4"></div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Location</span>
                    <span className="font-medium flex items-center gap-1">
                      🇮🇳 India
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-zinc-500 flex-shrink-0">College</span>
                    <span className="font-medium text-right max-w-[150px] leading-tight">
                      Parul Institute of Engineering & Technology
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Degree</span>
                    <span className="font-medium">{profile.degree || 'Bachelor of Technology'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Branch</span>
                    <span className="font-medium">{profile.branch || 'Computer Science'}</span>
                  </div>
                </div>

                <div className="border-t border-white/5 my-4"></div>

                {/* Social Profiles */}
                <div className="flex items-center justify-center gap-4 text-zinc-500">
                  <Mail size={16} className="hover:text-orange-500 cursor-pointer" />
                  <Twitter size={16} className="hover:text-orange-500 cursor-pointer" />
                  <Linkedin size={16} className="hover:text-orange-500 cursor-pointer" />
                  <Link2 size={16} className="hover:text-orange-500 cursor-pointer" />
                </div>
              </div>

              {/* Quick Status / Streaks */}
              <div className={`border ${borderColorClass} ${cardBgClass} rounded-2xl p-5 space-y-4`}>
                <h3 className="font-black text-xs uppercase tracking-wider text-orange-400">Streak Status</h3>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400">
                    <Flame size={20} />
                  </div>
                  <div>
                    <p className="text-lg font-black leading-tight">284 Days</p>
                    <p className="text-[10px] text-zinc-500">Current Streak</p>
                  </div>
                </div>
              </div>

            </div>

            {/* COLUMN 2 & 3: CODING PLATFORMS & STATS DETAILS */}
            <div className="md:col-span-2 space-y-6">
              
              {/* CONNECTED PLATFORMS DETAILS (Shows handles and metrics beautifully) */}
              <div className={`border ${borderColorClass} ${cardBgClass} rounded-3xl p-6 space-y-4`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-sm text-orange-400 flex items-center gap-1.5">
                    <Code2 size={16} />
                    Connected Coding Platforms
                  </h3>
                  <button 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-1 text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-1 rounded-full hover:bg-orange-500/20 transition-all"
                  >
                    <RefreshCw size={10} className={isRefreshing ? 'animate-spin' : ''} />
                    {isRefreshing ? 'Syncing...' : 'Sync'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { platform: "LeetCode", handle: displayUsername, solved: "372 Problems", rating: "1840 Rank", active: true, color: "from-[#FFB800]/10 to-[#FF8A00]/10 border-orange-500/20" },
                    { platform: "CodeChef", handle: "star_modi", solved: "82 Problems", rating: "1110 (Max: 1110)", active: true, color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20" },
                    { platform: "HackerRank", handle: displayUsername, solved: "4 Problems", rating: "Gold Badge", active: true, color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20" },
                    { platform: "Codeforces", handle: "modi_codes", solved: "120 Problems", rating: "Pupil", active: false, color: "from-purple-500/10 to-pink-500/10 border-purple-500/20" }
                  ].map((plat, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border bg-gradient-to-br ${plat.color} flex flex-col justify-between h-28 hover:scale-[1.01] transition-all`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-sm">{plat.platform}</h4>
                          <p className="text-[10px] text-zinc-500 mt-0.5">@{plat.handle}</p>
                        </div>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${plat.active ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                          {plat.active ? 'Connected' : 'Offline'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-xs font-mono pt-3 border-t border-white/5">
                        <span className="text-zinc-400">{plat.solved}</span>
                        <span className="font-bold text-orange-400">{plat.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ENLARGED SUBMISSION HEATMAP */}
              <div className={`border ${borderColorClass} ${cardBgClass} rounded-3xl p-6 space-y-4`}>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-orange-400">Submission Heatmap</span>
                  <div className="flex gap-4 font-mono text-[10px]">
                    <div>Max Streak: <span className="font-bold text-orange-400">68 Days</span></div>
                    <div>Current Streak: <span className="font-bold text-emerald-400">25 Days</span></div>
                  </div>
                </div>

                {/* Grid */}
                <div className="overflow-x-auto py-4 pr-2 scrollbar-thin [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar-track]:bg-[#131316] [&::-webkit-scrollbar-track]:border [&::-webkit-scrollbar-track]:border-[#27272a] [&::-webkit-scrollbar-track]:rounded-md [&::-webkit-scrollbar-thumb]:bg-white [&::-webkit-scrollbar-thumb]:rounded-md hover:[&::-webkit-scrollbar-thumb]:bg-zinc-200">
                  <div className="flex items-end gap-2.5 min-w-[500px]">
                    {[
                      { m: "Nov", cols: [[null, null, null, null, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]] },
                      { m: "Dec", cols: [[0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,2], [0,0,0,0,0,0,0]] },
                      { m: "Jan", cols: [[0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,3,0], [0,0,0,0,0,0,0]] },
                      { m: "Feb", cols: [[0,0,0,0,0,0,0], [0,2,3,2,0,4,3], [0,0,4,2,0,1,0], [2,1,0,0,3,2,4]] },
                      { m: "Mar", cols: [[4,2,3,4,3,2,2], [3,4,1,2,4,3,1], [2,3,4,4,3,2,3], [4,2,1,3,4,2,2], [3,4,2,1,3,2,4]] },
                      { m: "Apr", cols: [[0,2,3,1,0,0,3], [1,0,2,4,3,0,1], [2,3,0,0,2,1,4], [0,4,2,3,1,0,0]] },
                      { m: "May", cols: [[0,0,3,2,0,1,3], [2,3,4,1,0,2,3], [3,2,1,null,null,null,null]] }
                    ].map((month, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <div className="flex gap-1">
                          {month.cols.map((col, cIdx) => (
                            <div key={cIdx} className="flex flex-col gap-1">
                              {col.map((val, bIdx) => {
                                if (val === null) {
                                  return <div key={bIdx} className="w-3.5 h-3.5 bg-transparent pointer-events-none"></div>;
                                }
                                return (
                                  <div 
                                    key={bIdx} 
                                    className={`w-3.5 h-3.5 rounded-[3px] transition-all hover:scale-110 cursor-pointer ${
                                      val === 0 ? (theme === 'dark' ? 'bg-[#212124]' : 'bg-slate-200') :
                                      val === 1 ? 'bg-[#0e4429]' :
                                      val === 2 ? 'bg-[#006d32]' :
                                      val === 3 ? 'bg-[#26a641]' :
                                      'bg-[#39d353] shadow-[0_0_8px_rgba(57,211,83,0.45)]'
                                    }`}
                                  ></div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 mt-1">{month.m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* DSA TOPIC STRENGTHS (Simple progress meters) */}
              <div className={`border ${borderColorClass} ${cardBgClass} rounded-3xl p-6 space-y-4`}>
                <h3 className="font-black text-sm text-orange-400">DSA Topic Breakdown</h3>
                
                <div className="space-y-3.5">
                  {[
                    { name: "Arrays", solved: 118, color: "bg-blue-500", pct: 90 },
                    { name: "String", solved: 78, color: "bg-blue-500/80", pct: 70 },
                    { name: "Hash Map & Set", solved: 60, color: "bg-blue-500/70", pct: 60 },
                    { name: "Dynamic Programming", solved: 28, color: "bg-orange-500", pct: 35 }
                  ].map((topic, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold">{topic.name}</span>
                        <span className="font-mono font-bold text-orange-400">{topic.solved} solved</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                        <div className={`h-full ${topic.color}`} style={{ width: `${topic.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
