"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useClerk, SignInButton, SignedOut, SignedIn } from '@clerk/nextjs';
import { Search, Sun, Moon, Bell, ChevronDown, Briefcase, RefreshCw, Activity, ExternalLink, LogOut, User, Settings, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const platformsList = [
  { id: 'leetcode', name: 'LeetCode', connected: true, score: '1257', icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 5.842l-5.7 5.7a1.373 1.373 0 0 0 0 1.942l5.7 5.7 5.406 5.406a1.374 1.374 0 0 0 1.942 0l1.01-1.01a1.374 1.374 0 0 0 0-1.942l-5.406-5.406-5.7-5.7 5.7-5.7 5.406-5.406a1.374 1.374 0 0 0 0-1.942l-1.01-1.01A1.374 1.374 0 0 0 13.483 0zM21.275 14.502a1.374 1.374 0 0 0-.961.438l-4.14 4.14a1.374 1.374 0 0 0 0 1.942l1.01 1.01a1.374 1.374 0 0 0 1.942 0l4.14-4.14a1.374 1.374 0 0 0 0-1.942l-1.01-1.01a1.374 1.374 0 0 0-.981-.438z" fill="#FFA116" /></svg> },
  { id: 'codeforces', name: 'Codeforces', connected: true, score: '1890', icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="12" width="4.5" height="10" rx="1.5" fill="#FFC120" /><rect x="9.75" y="2" width="4.5" height="20" rx="1.5" fill="#1085C5" /><rect x="16.5" y="7" width="4.5" height="15" rx="1.5" fill="#F1393A" /></svg> },
  { id: 'gfg', name: 'GeeksforGeeks', connected: true, score: '1475', icon: <svg viewBox="0 0 100 100" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M48.5,12.5 C28,12.5 11,29.5 11,50 C11,70.5 28,87.5 48.5,87.5 L48.5,70.5 C37,70.5 28,61.5 28,50 C28,38.5 37,29.5 48.5,29.5 L48.5,12.5 Z M51.5,12.5 L51.5,29.5 C63,29.5 72,38.5 72,50 C72,61.5 63,70.5 51.5,70.5 L51.5,87.5 C72,87.5 89,70.5 89,50 C89,29.5 72,12.5 51.5,12.5 Z" fill="#2F8D46" /></svg> },
  { id: 'codechef', name: 'CodeChef', connected: false, score: '0', icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#8B4513" /><text x="12" y="16.5" fill="white" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">CC</text></svg> },
  { id: 'hackerrank', name: 'HackerRank', connected: true, score: '980', icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 0L1.608 6v12L12 24l10.392-6V6L12 0zm5.662 16.12l-1.57.906v-3.793h-8.18v3.793l-1.57-.906V7.88l1.57-.906v3.793h8.18V6.974l1.57.906v8.24z" fill="#2EC866" /></svg> },
  { id: 'atcoder', name: 'AtCoder', connected: false, score: '0', icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11" fill="white" /><path d="M12 4l-6 14h3.5l1.5-4h4l1.5-4h3.5L12 4zm-1.8 7.5L12 7l1.8 4.5h-3.6z" fill="#222" /></svg> },
  { id: 'hackerearth', name: 'HackerEarth', connected: false, score: '0', icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#2A3D4C" /><text x="12" y="16" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">HE</text></svg> },
  { id: 'codingninjas', name: 'Coding Ninjas', connected: true, score: '760', icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="6" fill="#F05136" /><text x="12" y="16" fill="white" fontSize="12" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">CN</text></svg> },
];

const initialActiveSheets = [
  { id: 'striver-a2z', name: 'Striver A2Z DSA Sheet', progress: 72 },
  { id: 'love-babbar', name: 'Love Babbar Sheet', progress: 41 },
  { id: 'neetcode-150', name: 'Neetcode 150', progress: 35 },
  { id: 'blind-75', name: 'Blind 75', progress: 28 },
];

export default function TopNavbar() {
  const { user, isLoaded } = useUser();
  const { openUserProfile } = useClerk();
  const pathname = usePathname();

  const [activeSheets, setActiveSheets] = React.useState(initialActiveSheets);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light') {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
      } else {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activeSheets');
      if (saved) {
        setActiveSheets(JSON.parse(saved));
      } else {
        localStorage.setItem('activeSheets', JSON.stringify(initialActiveSheets));
      }

      const handleWorkspaceUpdate = (e: any) => {
        if (e.detail) {
          setActiveSheets(e.detail);
        }
      };

      const handleScroll = () => {
        setIsScrolled(window.scrollY > 20);
      };

      window.addEventListener('workspaceUpdated', handleWorkspaceUpdate);
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('workspaceUpdated', handleWorkspaceUpdate);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  const userName = isLoaded && user?.firstName ? user.firstName : 'Lalit';
  const userImage = isLoaded && user?.imageUrl ? user.imageUrl : null;
  const defaultUsername = isLoaded && user ? (user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || user.firstName?.toLowerCase() || 'lalitmodi') : 'lalitmodi';
  const [displayUsername, setDisplayUsername] = React.useState(defaultUsername);

  React.useEffect(() => {
    if (isLoaded && user) {
       setDisplayUsername(localStorage.getItem('codeyx_username') || defaultUsername);
    }
  }, [isLoaded, user, defaultUsername]);

  React.useEffect(() => {
    const handleProfileUpdate = (e: any) => {
      if (e.detail) {
        setDisplayUsername(e.detail);
      }
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const cardBg = "bg-gray-50 dark:bg-[#101014]";
  const border = "border-gray-200 dark:border-white/5";

  return (
    <>
    {/* Spacer to maintain document flow */}
    <div className="h-16 w-full shrink-0" />
    <div className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ease-in-out flex justify-center w-full ${isScrolled ? 'pt-4 px-4' : 'pt-0 px-0'}`}>
      <nav className={`transition-all duration-700 ease-in-out flex items-center border ${border} backdrop-blur-xl bg-white/90 dark:bg-[#09090B]/90 ${isScrolled ? 'h-14 px-8 rounded-full shadow-2xl shadow-[#FF8A00]/10 border-gray-200 dark:border-white/10' : 'h-16 w-full px-4 rounded-none justify-between border-t-0 border-l-0 border-r-0'}`}>
      {/* Left: Branding & Search */}
      <div className={`flex items-center gap-0 overflow-hidden transition-all duration-700 ease-in-out whitespace-nowrap ${isScrolled ? 'max-w-0 opacity-0' : 'max-w-[500px] opacity-100'}`}>
        <Link href="/dashboard" className="flex items-center group pr-2">
          <div className="relative h-16 w-32 transition-transform group-hover:scale-105 scale-[1.5] origin-left">
            <Image src="/assets/logo-dark-them.png" alt="Codeyx Logo" fill className="object-contain object-left" />
          </div>
        </Link>

        <div className="hidden md:flex items-center relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#A1A1AA] w-4 h-4 group-focus-within:text-[#FF8A00] transition-colors" />
          <input
            type="text"
            placeholder="Search any problem or topic..."
            className={`w-64 ${cardBg} border ${border} rounded-xl py-2 pl-10 pr-3 text-xs text-black dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#FF8A00]/50 transition-all`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-gray-500 dark:text-[#A1A1AA] font-bold border border-gray-200 dark:border-white/10 px-1.5 py-0.5 rounded">Ctrl K</span>
        </div>
      </div>

      {/* Center: Nav Links */}
      <div className={`hidden xl:flex items-center gap-7 transition-all duration-700 ease-in-out ${isScrolled ? 'mx-auto' : 'absolute left-1/2 -translate-x-1/2'}`}>
        {[
          { label: 'Home', href: '/dashboard', isPrivate: true },
          { label: 'Explore Sheets', href: '/explore-sheets', isPrivate: false },
          { label: 'My Workspace', href: '/workspace', isWorkspace: true, hasDropdown: true, isPrivate: true },
          { label: 'Platforms', href: '/dashboard/platforms/leetcode', isPlatforms: true, hasDropdown: true, isPrivate: true },
          { label: 'Projects', href: '/explore-projects', isPrivate: false },
          { label: 'Contests', href: '/contests', isPrivate: false },
          { label: 'Leaderboard', href: '/leaderboard', isPrivate: false },
          { label: 'Profile', href: '/profile', isPrivate: true },
        ].map((item, i) => {
          const isActive = pathname === item.href || (pathname.startsWith('/sheets') && item.label === 'My Workspace') || (pathname === '/dashboard' && item.label === 'Home') || (pathname.startsWith('/dashboard/platforms') && item.label === 'Platforms') || (pathname.startsWith('/projects') && item.label === 'Projects') || (pathname.startsWith('/contests') && item.label === 'Contests') || (pathname.startsWith('/leaderboard') && item.label === 'Leaderboard') || (pathname.startsWith('/profile') && item.label === 'Profile');

          if (item.isPrivate && !user) {
            return (
              <div key={i} className="relative group/nav py-5">
                <Link href="/login">
                  <button className="text-xs font-semibold flex items-center gap-1 transition-all text-gray-400 opacity-50 hover:opacity-100 hover:text-white cursor-pointer">
                    {item.label}
                    <Lock size={12} className="ml-0.5" />
                  </button>
                </Link>
              </div>
            );
          }

          return (
            <div key={i} className="relative group/nav py-5">
              <Link href={item.href || '#'} className={`text-xs font-semibold flex items-center gap-1 transition-all ${isActive ? 'text-[#FF8A00]' : 'text-gray-500 dark:text-[#A1A1AA] hover:text-black dark:text-white'}`}>
                {item.label}
                {item.hasDropdown && <ChevronDown size={12} className={`opacity-70 transition-transform ${item.isPlatforms ? 'group-hover/nav:rotate-180' : ''}`} />}
                {isActive && (
                  <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FF8A00] shadow-[0_-2px_10px_rgba(255,138,0,0.5)]" />
                )}
              </Link>

              {/* Workspace Mega Dropdown */}
              {item.isWorkspace && (
                <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-[340px] opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 z-50 pt-2 pointer-events-none group-hover/nav:pointer-events-auto">
                  <div className="bg-white/95 dark:bg-[#111216]/95 border border-gray-200 dark:border-white/10 rounded-[16px] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-xl flex flex-col">
                    <div className="mb-4">
                      <h3 className="text-gray-600 dark:text-gray-400 font-medium text-xs">Recently Active Sheets</h3>
                    </div>
                    <div className="flex flex-col gap-1 mb-4">
                      {activeSheets.map(sheet => (
                        <Link href={`/sheets/${sheet.id}`} key={sheet.id} className="flex flex-col p-3 hover:bg-white/[0.03] rounded-xl border border-transparent hover:border-gray-200 dark:border-white/5 transition-all group/sheet">
                          <div className="flex justify-between items-center mb-2.5">
                            <span className="text-xs font-semibold text-black dark:text-white group-hover/sheet:text-[#FF8A00] transition-colors">{sheet.name}</span>
                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{sheet.progress}%</span>
                          </div>
                          <div className="h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[#FF8A00] shadow-[0_0_10px_#FF8A00]" style={{ width: `${sheet.progress}%` }} />
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link href="/explore-sheets" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-200 dark:border-white/10 hover:border-white/20 hover:text-black dark:text-white text-gray-600 dark:text-gray-400 text-[11px] font-semibold transition-all">
                      + Explore More Sheets
                    </Link>
                  </div>
                </div>
              )}

              {/* Platforms Mega Dropdown */}
              {item.isPlatforms && (
                <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-[340px] opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 z-50 pt-2 pointer-events-none group-hover/nav:pointer-events-auto">
                  <div className="bg-white/95 dark:bg-[#111216]/95 border border-gray-200 dark:border-white/10 rounded-[16px] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-xl flex flex-col">

                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-gray-600 dark:text-gray-400 font-medium text-xs">Your Coding Platforms</h3>
                    </div>

                    {/* Platforms List */}
                    <div className="flex flex-col gap-1 mb-5">
                      {platformsList.filter(p => p.connected).map(platform => (
                        <Link href={`/dashboard/platforms/${platform.id}`} key={platform.id} className="flex items-center justify-between py-1.5 hover:bg-white/[0.03] rounded-lg px-2 -mx-2 transition-colors">
                          <div className="flex items-center gap-3 w-[120px]">
                            <div className="w-5 flex items-center justify-center">
                              {platform.icon}
                            </div>
                            <span className="text-xs font-semibold text-black dark:text-white">{platform.name}</span>
                          </div>

                          <div className="flex-1 flex justify-center">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-medium border border-emerald-500/10">Connected</span>
                          </div>

                          <div className="flex items-center justify-end gap-1 w-16">
                            <span className="text-[#FF8A00] text-[10px]">🔥</span>
                            <span className="text-xs text-gray-300 font-medium">{platform.score}</span>
                          </div>
                        </Link>
                      ))}

                      <Link href="/settings/integrations" className="flex items-center justify-center py-2 mt-2 border border-dashed border-gray-200 dark:border-white/10 rounded-lg text-gray-500 hover:text-gray-300 hover:border-white/20 transition-all text-[10px] font-medium">
                        + Connect more platforms
                      </Link>
                    </div>

                    {/* Sync Button */}
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#FF8A00]/30 text-[#FF8A00] hover:bg-[#FF8A00]/10 text-xs font-semibold transition-all mb-3">
                      <RefreshCw size={12} /> Sync All Platforms
                    </button>

                    <div className="flex items-center justify-center gap-1.5 mb-5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">Last synced: 2 mins ago</span>
                    </div>

                    {/* Footer Stats */}
                    <div className="bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl p-3 flex justify-between">
                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-sm font-bold text-black dark:text-white mb-0.5">8</span>
                        <span className="text-[9px] text-gray-500 font-medium">Platforms</span>
                      </div>
                      <div className="w-px bg-white/10" />
                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-sm font-bold text-emerald-500 mb-0.5">5</span>
                        <span className="text-[9px] text-emerald-500 font-medium">Connected</span>
                      </div>
                      <div className="w-px bg-white/10" />
                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-sm font-bold text-[#FF8A00] mb-0.5">6,362</span>
                        <span className="text-[9px] text-gray-500 font-medium">Total Score</span>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right: Actions */}
      <div className={`flex items-center gap-4 transition-all duration-700 ease-in-out whitespace-nowrap justify-end ${isScrolled ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-[500px] opacity-100 pointer-events-auto'}`}>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className={`p-2 rounded-xl border ${border} text-gray-500 dark:text-[#A1A1AA] hover:text-black dark:text-white hover:bg-black/5 dark:bg-white/5 transition-all`}>
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <SignedIn>
            <button className={`relative p-2 rounded-xl border ${border} text-gray-500 dark:text-[#A1A1AA] hover:text-black dark:text-white hover:bg-black/5 dark:bg-white/5 transition-all`}>
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF8A00] rounded-full border-2 border-[#09090B]" />
            </button>
          </SignedIn>
        </div>

        <SignedIn>
          <div className="relative" ref={profileMenuRef}>
            <div 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF8A00] to-orange-400 flex items-center justify-center font-bold text-sm text-black dark:text-white overflow-hidden cursor-pointer shadow-[0_0_15px_rgba(255,138,0,0.2)] border border-gray-200 dark:border-white/10 hover:scale-105 transition-transform shrink-0"
            >
              {userImage ? <img src={userImage} alt="Profile" className="w-full h-full object-cover" /> : userName[0]}
            </div>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-56 rounded-2xl shadow-2xl p-1.5 border backdrop-blur-2xl z-[99999] bg-gray-50 dark:bg-[#101014]/95 border-gray-200 dark:border-white/10"
              >
                <div className="px-3 py-2 border-b border-gray-200 dark:border-white/5 mb-1 text-left">
                  <p className="font-bold text-xs truncate text-black dark:text-white">{userName}</p>
                  <p className="text-[10px] text-[#FF8A00] font-mono mt-0.5">@{displayUsername}</p>
                </div>

                <div className="px-1 py-1">
                  <button 
                    onClick={() => {
                      openUserProfile();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all text-left text-gray-300 hover:bg-black/5 dark:bg-white/5 hover:text-black dark:text-white"
                  >
                    <User size={13} />
                    Profile Information
                  </button>
                  <Link 
                    href="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all text-left text-gray-300 hover:bg-black/5 dark:bg-white/5 hover:text-black dark:text-white"
                  >
                    <Briefcase size={13} />
                    Other Details
                  </Link>
                </div>

                <div className="h-px bg-black/5 dark:bg-white/5 my-1 mx-2"></div>
                
                <div className="px-1 py-1">
                  <a href="/login" className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-red-500 hover:bg-red-500/10 transition-all font-medium">
                    <LogOut size={13} />
                    Logout
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </SignedIn>

        <SignedOut>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors cursor-pointer">
                Log In
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-5 py-2 rounded-xl bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-black text-xs font-black shadow-[0_0_15px_rgba(255,138,0,0.3)] transition-all cursor-pointer">
                Sign Up
              </button>
            </Link>
          </div>
        </SignedOut>
      </div>
    </nav>
    </div>
    </>
  );
}
