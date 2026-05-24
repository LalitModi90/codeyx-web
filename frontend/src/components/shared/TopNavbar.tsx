"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useClerk, SignInButton, SignedOut, SignedIn } from '@clerk/nextjs';
import { Search, Sun, Moon, Bell, ChevronDown, Briefcase, RefreshCw, Activity, ExternalLink, LogOut, User, Settings, Lock, Check, X } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { platformService } from '../../services/platform.service';
import GlobalSearch from './GlobalSearch';

const platformsList = [
  { id: 'leetcode', name: 'LeetCode', connected: true, score: '1257', icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 5.842l-5.7 5.7a1.373 1.373 0 0 0 0 1.942l5.7 5.7 5.406 5.406a1.374 1.374 0 0 0 1.942 0l1.01-1.01a1.374 1.374 0 0 0 0-1.942l-5.406-5.406-5.7-5.7 5.7-5.7 5.406-5.406a1.374 1.374 0 0 0 0-1.942l-1.01-1.01A1.374 1.374 0 0 0 13.483 0zM21.275 14.502a1.374 1.374 0 0 0-.961.438l-4.14 4.14a1.374 1.374 0 0 0 0 1.942l1.01 1.01a1.374 1.374 0 0 0 1.942 0l4.14-4.14a1.374 1.374 0 0 0 0-1.942l-1.01-1.01a1.374 1.374 0 0 0-.981-.438z" fill="#FFA116" /></svg> },
  { id: 'codeforces', name: 'Codeforces', connected: true, score: '1890', icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="12" width="4.5" height="10" rx="1.5" fill="#FFC120" /><rect x="9.75" y="2" width="4.5" height="20" rx="1.5" fill="#1085C5" /><rect x="16.5" y="7" width="4.5" height="15" rx="1.5" fill="#F1393A" /></svg> },
  { id: 'gfg', name: 'GeeksforGeeks', connected: true, score: '1475', icon: <svg viewBox="0 0 100 100" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M48.5,12.5 C28,12.5 11,29.5 11,50 C11,70.5 28,87.5 48.5,87.5 L48.5,70.5 C37,70.5 28,61.5 28,50 C28,38.5 37,29.5 48.5,29.5 L48.5,12.5 Z M51.5,12.5 L51.5,29.5 C63,29.5 72,38.5 72,50 C72,61.5 63,70.5 51.5,70.5 L51.5,87.5 C72,87.5 89,70.5 89,50 C89,29.5 72,12.5 51.5,12.5 Z" fill="#2F8D46" /></svg> },
  { id: 'codechef', name: 'CodeChef', connected: false, score: '0', icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#8B4513" /><text x="12" y="16.5" fill="white" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">CC</text></svg> },
  { id: 'hackerrank', name: 'HackerRank', connected: true, score: '980', icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 0L1.608 6v12L12 24l10.392-6V6L12 0zm5.662 16.12l-1.57.906v-3.793h-8.18v3.793l-1.57-.906V7.88l1.57-.906v3.793h8.18V6.974l1.57.906v8.24z" fill="#2EC866" /></svg> },
  { id: 'atcoder', name: 'AtCoder', connected: false, score: '0', icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11" fill="white" /><path d="M12 4l-6 14h3.5l1.5-4h4l1.5-4h3.5L12 4zm-1.8 7.5L12 7l1.8 4.5h-3.6z" fill="#222" /></svg> },
  { id: 'hackerearth', name: 'HackerEarth', connected: false, score: '0', icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#2A3D4C" /><text x="12" y="16" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">HE</text></svg> },
  { id: 'codingninjas', name: 'Coding Ninjas', connected: true, score: '760', icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="6" fill="#F05136" /><text x="12" y="16" fill="white" fontSize="12" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">CN</text></svg> },
  { id: 'github', name: 'GitHub', connected: true, score: '2.4K', icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="#ffffff" /></svg> },
];

const initialActiveSheets: any[] = [];

export default function TopNavbar() {
  const { user, isLoaded } = useUser();
  const { openUserProfile } = useClerk();
  const pathname = usePathname();

  const [activeSheets, setActiveSheets] = React.useState(initialActiveSheets);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  
  const { getToken } = useAuth();
  const socket = useSocket();
  const [friendRequests, setFriendRequests] = React.useState<any[]>([]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const notificationsRef = React.useRef<HTMLDivElement>(null);
  
  const [realPlatforms, setRealPlatforms] = React.useState<any[]>([]);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<Date | null>(null);

  React.useEffect(() => {
    if (isLoaded && user) {
      const fetchPlatforms = async () => {
        try {
          const res: any = await platformService.getAllPlatformStats(user.id);
          // With interceptor, res is the actual payload: { statusCode, data, message }
          // Or if no interceptor, it's { data: { data } }
          const platformsArray = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : (res.data?.data || []));
          
          if (platformsArray && platformsArray.length > 0) {
            setRealPlatforms(platformsArray);
            const latest = platformsArray.reduce((max: any, p: any) => 
              new Date(p.lastSyncedAt) > new Date(max) ? p.lastSyncedAt : max, new Date(0)
            );
            if (latest && new Date(latest).getTime() > 0) setLastSyncedAt(new Date(latest));
          }
        } catch (e) {
          console.error('Failed to fetch platforms', e);
        }
      };
      
      fetchPlatforms();

      const handlePlatformsUpdated = (e: any) => {
        if (e.detail && Array.isArray(e.detail)) {
          setRealPlatforms(e.detail);
          const latest = e.detail.reduce((max: any, p: any) => 
            new Date(p.lastSyncedAt) > new Date(max) ? p.lastSyncedAt : max, new Date(0)
          );
          if (latest && new Date(latest).getTime() > 0) setLastSyncedAt(new Date(latest));
        } else {
          fetchPlatforms();
        }
      };

      window.addEventListener('platformsUpdated', handlePlatformsUpdated);
      return () => window.removeEventListener('platformsUpdated', handlePlatformsUpdated);
    }
  }, [isLoaded, user]);

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
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (isLoaded && user) {
      const fetchRequests = async () => {
        try {
          const token = await getToken();
          const res = await fetch('http://localhost:5005/api/social/requests', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success && data.data?.incoming) {
            setFriendRequests(data.data.incoming);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchRequests();
    }
  }, [isLoaded, user]);

  React.useEffect(() => {
    if (socket) {
      socket.on('friend.request.received', () => {
        if (user) {
           getToken().then(token => {
             fetch('http://localhost:5005/api/social/requests', { headers: { Authorization: `Bearer ${token}` } })
              .then(res => res.json())
              .then(data => {
                if (data.success && data.data?.incoming) setFriendRequests(data.data.incoming);
              });
           });
        }
      });
      socket.on('friend.list.updated', () => {
        if (user) {
           getToken().then(token => {
             fetch('http://localhost:5005/api/social/requests', { headers: { Authorization: `Bearer ${token}` } })
              .then(res => res.json())
              .then(data => {
                if (data.success && data.data?.incoming) setFriendRequests(data.data.incoming);
              });
           });
        }
      });
      socket.on('friend.request.rejected', (data: any) => {
        alert(`Your friend request to ${data.receiverName || 'that user'} was rejected.`);
      });
      socket.on('friend.request.revoked', (data: any) => {
        setFriendRequests(prev => prev.filter(r => r.senderId !== data.senderId));
      });
    }
    return () => {
      if (socket) {
        socket.off('friend.request.received');
        socket.off('friend.list.updated');
        socket.off('friend.request.rejected');
        socket.off('friend.request.revoked');
      }
    };
  }, [socket, user]);

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
      <div className={`flex items-center gap-0 transition-all duration-700 ease-in-out whitespace-nowrap ${isScrolled ? 'max-w-0 opacity-0 overflow-hidden pointer-events-none' : 'max-w-[500px] opacity-100 overflow-visible'}`}>
        <Link href="/dashboard" className="flex items-center group pr-2 shrink-0">
          <div className="relative h-16 w-32 transition-transform group-hover:scale-105 scale-[1.5] origin-left">
            <Image src="/assets/logo-dark-them.png" alt="Codeyx Logo" fill className="object-contain object-left" />
          </div>
        </Link>

        <div className="shrink-0">
          <GlobalSearch />
        </div>
      </div>

      {/* Center: Nav Links */}
      <div className={`hidden xl:flex items-center gap-7 transition-all duration-700 ease-in-out ${isScrolled ? 'mx-auto' : 'absolute left-1/2 -translate-x-1/2'}`}>
        {(pathname === '/'
          ? [
              { label: 'Explore Sheets', href: '/explore-sheets', isPrivate: false },
              { label: 'Projects', href: '/explore-projects', isPrivate: false },
              { label: 'Contests', href: '/contests', isPrivate: false },
              { label: 'Leaderboard', href: '/leaderboard', isPrivate: false },
            ]
          : [
              { label: 'Home', href: '/dashboard', isPrivate: true },
              { label: 'Explore Sheets', href: '/explore-sheets', isPrivate: false },
              { label: 'My Workspace', href: '/workspace', isWorkspace: true, hasDropdown: true, isPrivate: true },
              { label: 'Platforms', href: '/dashboard/platforms/leetcode', isPlatforms: true, hasDropdown: true, isPrivate: true },
              { label: 'Projects', href: '/explore-projects', isPrivate: false },
              { label: 'Contests', href: '/contests', isPrivate: false },
              { label: 'Leaderboard', href: '/leaderboard', isPrivate: false },
              { label: 'Profile', href: '/profile', isPrivate: true },
            ]
        ).map((item, i) => {
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
                      {platformsList.map(platform => {
                        const dbData = realPlatforms.find(p => p.platform === platform.id);
                        if (!dbData) return null; // Hide if not connected
                        
                        const score = dbData.totalSolved || dbData.rating || dbData.stats?.publicRepos || 0;

                        return (
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
                            <span className="text-xs text-gray-300 font-medium">{score >= 1000 ? (score/1000).toFixed(1) + 'K' : score}</span>
                          </div>
                        </Link>
                      )})}

                      <Link href="/settings/integrations" className="flex items-center justify-center py-2 mt-2 border border-dashed border-gray-200 dark:border-white/10 rounded-lg text-gray-500 hover:text-gray-300 hover:border-white/20 transition-all text-[10px] font-medium">
                        + Connect more platforms
                      </Link>
                    </div>

                    {/* Sync Button */}
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#FF8A00]/30 text-[#FF8A00] hover:bg-[#FF8A00]/10 text-xs font-semibold transition-all mb-3">
                      <RefreshCw size={12} /> Sync All Platforms
                    </button>

                    {lastSyncedAt && (
                    <div className="flex items-center justify-center gap-1.5 mb-5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">
                        Last synced: {lastSyncedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    )}

                    {/* Footer Stats */}
                    {(() => {
                      const connectedCount = realPlatforms.length;
                      const totalScore = realPlatforms.reduce((sum, p) => sum + (p.rating || p.totalSolved || p.stats?.publicRepos || 0), 0);
                      return (
                      <div className="bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl p-3 flex justify-between">
                        <div className="flex-1 flex flex-col items-center">
                          <span className="text-sm font-bold text-black dark:text-white mb-0.5">{platformsList.length}</span>
                          <span className="text-[9px] text-gray-500 font-medium">Platforms</span>
                        </div>
                        <div className="w-px bg-white/10" />
                        <div className="flex-1 flex flex-col items-center">
                          <span className="text-sm font-bold text-emerald-500 mb-0.5">{connectedCount}</span>
                          <span className="text-[9px] text-emerald-500 font-medium">Connected</span>
                        </div>
                        <div className="w-px bg-white/10" />
                        <div className="flex-1 flex flex-col items-center">
                          <span className="text-sm font-bold text-[#FF8A00] mb-0.5">{totalScore.toLocaleString()}</span>
                          <span className="text-[9px] text-gray-500 font-medium">Total Score</span>
                        </div>
                      </div>
                      )
                    })()}

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
            <div className="relative" ref={notificationsRef}>
              <button onClick={() => setShowNotifications(!showNotifications)} className={`relative p-2 rounded-xl border ${border} text-gray-500 dark:text-[#A1A1AA] hover:text-black dark:text-white hover:bg-black/5 dark:bg-white/5 transition-all`}>
                <Bell size={15} />
                {friendRequests.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF8A00] rounded-full border-2 border-[#09090B]" />}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl p-4 border backdrop-blur-2xl z-[99999] bg-white/95 dark:bg-[#111216]/95 border-gray-200 dark:border-white/10"
                  >
                    <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-3">Notifications</h3>
                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                      {friendRequests.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-4">No new notifications</p>
                      ) : (
                        friendRequests.map(req => (
                          <div key={req._id || req.requestId} className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-200 dark:border-white/5 flex flex-col gap-2">
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                              <Link href={`/profile/${req.senderId}`} className="font-bold text-black dark:text-white hover:text-[#FF8A00] transition-colors cursor-pointer">
                                {req.senderName || req.senderId.slice(-4)}
                              </Link> sent you a friend request.
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <button 
                                onClick={async () => {
                                  try {
                                    const token = await getToken();
                                    const res = await fetch('http://localhost:5005/api/social/accept', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                      body: JSON.stringify({ requestId: req._id || req.requestId })
                                    });
                                    if (res.ok) {
                                      setFriendRequests(prev => prev.filter(r => (r._id || r.requestId) !== (req._id || req.requestId)));
                                    } else {
                                      const data = await res.json();
                                      alert(`Accept Error: ${data.message}`);
                                    }
                                  } catch (error) {
                                    alert('Network error: Could not connect to the server. Please try again.');
                                  }
                                }}
                                className="flex-1 bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-black text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                              >
                                <Check size={12} /> Accept
                              </button>
                              <button 
                                onClick={async () => {
                                  try {
                                    const token = await getToken();
                                    const res = await fetch('http://localhost:5005/api/social/reject', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                      body: JSON.stringify({ requestId: req._id || req.requestId })
                                    });
                                    if (res.ok) {
                                      setFriendRequests(prev => prev.filter(r => (r._id || r.requestId) !== (req._id || req.requestId)));
                                    } else {
                                      const data = await res.json();
                                      alert(`Reject Error: ${data.message}`);
                                    }
                                  } catch (error) {
                                    alert('Network error: Could not connect to the server. Please try again.');
                                  }
                                }}
                                className="flex-1 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                              >
                                <X size={12} /> Reject
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
