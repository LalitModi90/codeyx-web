"use client";
import React, { useState } from 'react';
import {
  MapPin, Link2, Github, Twitter, Linkedin, Briefcase, Edit3,
  Code2, Trophy, FolderGit2, Star, Target, Shield, Flame,
  ChevronDown, ExternalLink, X, Check, Camera, Instagram, Mail, Copy, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import TopNavbar from '@/components/shared/TopNavbar'; // Assuming this exists
import { useUser, useClerk } from '@clerk/nextjs';
import { profileService } from '@/services/profile.service';
import { platformService } from '@/services/platform.service';
import { useSocket } from '@/hooks/useSocket';

const mockFollowersList: any[] = [];
const mockFollowingList: any[] = [];
export default function PublicProfilePage() {
  const params = useParams();
  const { user, isLoaded } = useUser();
  const urlUsername = params?.username as string | undefined;

  const targetUserId = urlUsername && urlUsername.startsWith('user_') ? urlUsername : (isLoaded && user ? user.id : '');
  const isOwnProfile = !urlUsername || urlUsername === (isLoaded && user ? user.id : '') || urlUsername === 'aryan_singh';

  const allMockUsers = [...mockFollowersList, ...mockFollowingList];
  const foundUser = urlUsername && !urlUsername.startsWith('user_') ? allMockUsers.find(u => u.username === urlUsername) : null;

  const [isPublic, setIsPublic] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isManagingSkills, setIsManagingSkills] = useState(false);
  const [isViewingAchievements, setIsViewingAchievements] = useState(false);
  const [isViewingCourses, setIsViewingCourses] = useState(false);
  const [isManagingCourses, setIsManagingCourses] = useState(false);
  const [isViewingProjects, setIsViewingProjects] = useState(false);
  const [isManagingProjects, setIsManagingProjects] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [followersSearch, setFollowersSearch] = useState('');
  const [followingSearch, setFollowingSearch] = useState('');
  const [visibleFollowers, setVisibleFollowers] = useState(6);
  const [visibleFollowing, setVisibleFollowing] = useState(6);
  const [followersList, setFollowersList] = useState(mockFollowersList);
  const [followingList, setFollowingList] = useState(mockFollowingList);
  const [lastUsernameChange, setLastUsernameChange] = useState<Date | null>(null);
  const { openUserProfile } = useClerk();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isFollowingProfile, setIsFollowingProfile] = useState(foundUser ? foundUser.isFollowing : false);
  const socket = useSocket();

  const [profile, setProfile] = useState({
    clerkId: '',
    name: foundUser ? foundUser.name : '',
    username: foundUser ? foundUser.username : '',
    location: '',
    github: '',
    bio: '',
    about: '',
    college: '',
    branch: '',
    year: '',
    email: '',
    portfolio: '',
    linkedin: '',
    twitter: '',
    instagram: ''
  });

  const [overallStats, setOverallStats] = useState({
    problems: 0,
    contests: 0,
    projects: 0,
    points: 0,
    rank: 0,
    percentile: '—'
  });

  React.useEffect(() => {
    if (!profile.username || isOwnProfile) return;
    try {
      const savedFollowing = localStorage.getItem('codeyx_following_list');
      if (savedFollowing) {
        const currentFollowing = JSON.parse(savedFollowing);
        if (Array.isArray(currentFollowing)) {
          const isFollowing = currentFollowing.some((u: any) => u.username?.toLowerCase() === profile.username.toLowerCase());
          setIsFollowingProfile(isFollowing);
        }
      }
    } catch (e) {
      console.error('Error initializing follow state:', e);
    }
  }, [profile.username, isOwnProfile]);

  React.useEffect(() => {
    if (!profile.username || isOwnProfile) return;
    
    try {
      const savedFollowing = localStorage.getItem('codeyx_following_list');
      let currentFollowing = savedFollowing ? JSON.parse(savedFollowing) : [];
      if (!Array.isArray(currentFollowing)) currentFollowing = [];

      const exists = currentFollowing.some((u: any) => u.username?.toLowerCase() === profile.username.toLowerCase());

      if (isFollowingProfile && !exists) {
        currentFollowing.push({
          name: profile.name,
          username: profile.username,
          image: profileImage || '',
          role: 'Awesome Developer',
          isFollowing: true
        });
        localStorage.setItem('codeyx_following_list', JSON.stringify(currentFollowing));
      } else if (!isFollowingProfile && exists) {
        currentFollowing = currentFollowing.filter((u: any) => u.username?.toLowerCase() !== profile.username.toLowerCase());
        localStorage.setItem('codeyx_following_list', JSON.stringify(currentFollowing));
      }
    } catch (e) {
      console.error('Error saving follow state:', e);
    }
  }, [isFollowingProfile, profile.username, profile.name, profileImage, isOwnProfile]);

  // Listen for realtime profile updates from other sessions
  React.useEffect(() => {
    if (socket && user?.id) {
      socket.on('profile.updated', (newProfile) => {
        setProfile((prev) => ({ ...prev, ...newProfile }));
      });
    }
    return () => {
      socket?.off('profile.updated');
    }
  }, [socket, user?.id]);

  React.useEffect(() => {
    if (isOwnProfile && isLoaded && user) {
      setProfile(prev => {
        const isMockUsername = prev.username === 'aryan_singh';
        const defaultUsername = user.primaryEmailAddress?.emailAddress?.split('@')[0] || user.firstName?.toLowerCase() || prev.username;
        const savedUsername = localStorage.getItem('codeyx_username');
        const finalUsername = user.username || savedUsername || (isMockUsername ? defaultUsername : prev.username);

        return {
          ...prev,
          clerkId: user.id,
          name: user.fullName || prev.name,
          username: finalUsername,
          email: user.primaryEmailAddress?.emailAddress || prev.email,
        };
      });
      setProfileImage(user.imageUrl);
    }
  }, [isLoaded, user, isOwnProfile]);

  React.useEffect(() => {
    const savedFollowers = localStorage.getItem('codeyx_followers_list');
    const savedFollowing = localStorage.getItem('codeyx_following_list');

    if (savedFollowers) {
      setFollowersList(JSON.parse(savedFollowers));
    }
    if (savedFollowing) {
      setFollowingList(JSON.parse(savedFollowing));
    }
  }, []);

  const toggleProjectDesc = (title: string) => {
    setExpandedProjects(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  };

  const handleToggleFollow = (userToToggle: any) => {
    const isCurrentlyFollowing = userToToggle.isFollowing;

    setFollowersList(prev => {
      const next = prev.map(u =>
        u.username === userToToggle.username
          ? { ...u, isFollowing: !isCurrentlyFollowing }
          : u
      );
      localStorage.setItem('codeyx_followers_list', JSON.stringify(next));
      return next;
    });

    if (isCurrentlyFollowing) {
      setFollowingList(prev => {
        const next = prev.filter(u => u.username !== userToToggle.username);
        localStorage.setItem('codeyx_following_list', JSON.stringify(next));
        return next;
      });
    } else {
      setFollowingList(prev => {
        let next;
        if (!prev.some(u => u.username === userToToggle.username)) {
          next = [{ ...userToToggle, isFollowing: true }, ...prev];
        } else {
          next = prev;
        }
        localStorage.setItem('codeyx_following_list', JSON.stringify(next));
        return next;
      });
    }
  };

  // States rearranged to the top of component

  const [skills, setSkills] = useState<{ name: string; level: string; color: string }[]>([]);

  const achievementsData: any[] = [];

  const [courses, setCourses] = useState<{ title: string; author: string; status: string; image: string; link: string }[]>([]);

  const [projects, setProjects] = useState<{ title: string; desc: string; tags: string[]; link: string; github: string; image: string }[]>([]);

  const [platformsData, setPlatformsData] = useState([
    {
      name: 'LeetCode',
      iconColor: 'text-yellow-500',
      primaryStatLabel: 'Problems Solved',
      primaryStatValue: '0',
      difficulty: { easy: 0, medium: 0, hard: 0 },
      stats: [
        { label: 'Current Rating', value: '—' },
        { label: 'Top Rating', value: '—', color: 'text-orange-500' },
        { label: 'Global Rank', value: '—' },
        { label: 'Streak', value: '—', color: 'text-orange-500' }
      ],
      chartColor: '#EAB308',
      platformId: 'leetcode'
    },
    {
      name: 'Codeforces',
      iconColor: 'text-blue-500',
      primaryStatLabel: 'Problems Solved',
      primaryStatValue: '0',
      difficulty: { easy: 0, medium: 0, hard: 0 },
      stats: [
        { label: 'Current Rating', value: '—' },
        { label: 'Top Rating', value: '—', color: 'text-purple-500' },
        { label: 'Current Rank', value: '—' },
        { label: 'Streak', value: '—', color: 'text-blue-400' }
      ],
      chartColor: '#3B82F6',
      platformId: 'codeforces'
    },
    {
      name: 'CodeChef',
      iconColor: 'text-amber-700',
      primaryStatLabel: 'Problems Solved',
      primaryStatValue: '0',
      difficulty: { easy: 0, medium: 0, hard: 0 },
      stats: [
        { label: 'Current Rating', value: '—' },
        { label: 'Stars', value: '—', color: 'text-amber-500' },
        { label: 'Global Rank', value: '—' },
        { label: 'Highest Rating', value: '—' }
      ],
      chartColor: '#F59E0B',
      platformId: 'codechef'
    },
    {
      name: 'GitHub',
      iconColor: 'text-gray-800 dark:text-white',
      primaryStatLabel: 'Contributions',
      primaryStatValue: '0',
      stats: [
        { label: 'Repositories', value: '—' },
        { label: 'Followers', value: '—' }
      ],
      chartColor: '#10B981',
      platformId: 'github'
    }
  ]);

  const [profileLoading, setProfileLoading] = useState(false);

  React.useEffect(() => {
    if (!targetUserId) return;

    const loadDynamicData = async () => {
      setProfileLoading(true);
      try {
        // 1. Fetch details from Leaderboard user profile endpoint
        const leaderRes = await fetch(`http://localhost:5005/api/leaderboard/user/${targetUserId}`);
        const leaderData = await leaderRes.json();

        // 2. Fetch bio details from MERN profile endpoint
        const profileRes = await profileService.getProfile(targetUserId);
        const pData = profileRes.data || {};

        // 3. Fetch real projects
        let projectsArray = [];
        try {
          const projectsRes = await profileService.getProjects(targetUserId);
          projectsArray = projectsRes.data || [];
          if (Array.isArray(projectsArray)) {
            setProjects(projectsArray);
          }
        } catch (projErr) {
          console.error('Failed to fetch projects:', projErr);
        }

        if (leaderData.success && leaderData.data) {
          const uData = leaderData.data;

          setProfile({
            clerkId: targetUserId,
            name: uData.user || 'Aryan Singh',
            username: uData.username || 'aryan_singh',
            location: pData.location || (isOwnProfile ? 'Add Location' : '—'),
            github: pData.socialLinks?.github || (isOwnProfile ? 'Add GitHub' : '—'),
            bio: pData.bio || (isOwnProfile ? 'Add a short bio or tagline...' : 'This user hasn\'t added a bio yet.'),
            about: pData.about || (isOwnProfile ? 'Tell others about yourself...' : 'No details provided yet.'),
            college: pData.college || (isOwnProfile ? 'Add College' : '—'),
            branch: pData.branch || (isOwnProfile ? 'Add Branch' : '—'),
            year: pData.year || (isOwnProfile ? 'Add Year' : '—'),
            email: pData.email || (isOwnProfile ? 'Add Email' : '—'),
            portfolio: pData.portfolio || (isOwnProfile ? 'Add Portfolio' : '—'),
            linkedin: pData.socialLinks?.linkedin || (isOwnProfile ? 'Add LinkedIn' : '—'),
            twitter: pData.socialLinks?.twitter || (isOwnProfile ? 'Add Twitter' : '—'),
            instagram: pData.socialLinks?.instagram || (isOwnProfile ? 'Add Instagram' : '—')
          });

          setOverallStats({
            problems: uData.problems || 0,
            contests: uData.contests || 0,
            projects: projectsArray ? projectsArray.length : 0,
            points: Math.round((uData.rating || 0) * 10),
            rank: uData.rank || 2,
            percentile: uData.winRate ? `Top ${100 - uData.winRate}%` : 'Top 10%'
          });

          if (uData.avatarUrl) {
            setProfileImage(uData.avatarUrl);
          }
        }
      } catch (err) {
        console.error('Error loading dynamic profile data:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    loadDynamicData();
  }, [targetUserId, isOwnProfile]);

  React.useEffect(() => {
    if (!targetUserId) return;

    const loadPlatformStats = async () => {
      try {
        const statsRes = await platformService.getAllPlatformStats(targetUserId);
        const pArray = Array.isArray(statsRes) ? statsRes : (Array.isArray(statsRes.data) ? statsRes.data : (statsRes.data?.data || []));

        if (pArray && pArray.length > 0) {
          setPlatformsData(prev => prev.map(p => {
            const realData = pArray.find((item: any) => item.platform === p.platformId);
            if (!realData) return p;

            const total = realData.totalSolved || 0;
            const rating = realData.rating || 0;
            const stats = realData.stats || {};

            if (p.platformId === 'leetcode') {
              return {
                ...p,
                primaryStatValue: total.toLocaleString(),
                difficulty: {
                  easy: stats.easy || 0,
                  medium: stats.medium || 0,
                  hard: stats.hard || 0
                },
                stats: [
                  { label: 'Current Rating', value: rating > 0 ? rating.toLocaleString() : '—' },
                  { label: 'Top Rating', value: rating > 0 ? rating.toLocaleString() : '—', color: 'text-orange-500' },
                  { label: 'Global Rank', value: stats.rank ? `#${stats.rank.toLocaleString()}` : '—' },
                  { label: 'Streak', value: 'Active', color: 'text-orange-500' }
                ]
              };
            }

            if (p.platformId === 'codeforces') {
              return {
                ...p,
                primaryStatValue: total.toLocaleString(),
                stats: [
                  { label: 'Current Rating', value: rating > 0 ? rating.toLocaleString() : '—' },
                  { label: 'Top Rating', value: rating > 0 ? rating.toLocaleString() : '—', color: 'text-purple-500' },
                  { label: 'Current Rank', value: stats.rank || '—' },
                  { label: 'Streak', value: 'Active', color: 'text-blue-400' }
                ]
              };
            }

            if (p.platformId === 'codechef') {
              return {
                ...p,
                primaryStatValue: total.toLocaleString(),
                stats: [
                  { label: 'Current Rating', value: rating > 0 ? rating.toLocaleString() : '—' },
                  { label: 'Stars', value: stats.stars ? `${stats.stars} ★` : '—', color: 'text-amber-500' },
                  { label: 'Global Rank', value: stats.globalRank ? `#${stats.globalRank}` : '—' },
                  { label: 'Highest Rating', value: stats.highestRating ? stats.highestRating.toString() : '—' }
                ]
              };
            }

            if (p.platformId === 'github') {
              return {
                ...p,
                primaryStatValue: (stats.totalStars || 0).toLocaleString(),
                stats: [
                  { label: 'Repositories', value: (stats.repos || 0).toLocaleString() },
                  { label: 'Followers', value: (stats.followers || 0).toLocaleString() }
                ]
              };
            }

            return p;
          }));
        }
      } catch (err) {
        console.error('Error loading dynamic platform stats:', err);
      }
    };

    loadPlatformStats();
  }, [targetUserId]);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white font-sans flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-[#FF8A00] animate-pulse">Loading Profile...</p>
      </div>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newUsername = formData.get('username') as string;

    if (newUsername !== profile.username) {
      // Mock validation for uniqueness
      const allMockUsers = [...mockFollowersList, ...mockFollowingList];
      const isTaken = allMockUsers.some(u => u.username.toLowerCase() === newUsername.toLowerCase());

      if (isTaken) {
        alert(`The username "${newUsername}" is already taken! Please choose a unique username.`);
        return; // Prevent saving
      }

      setLastUsernameChange(new Date());
      localStorage.setItem('codeyx_username', newUsername);
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: newUsername }));
    }

    const profilePayload = {
      userId: user?.id || '', // Link Clerk Authentication ID to MongoDB User Document
      name: profile.name,
      username: newUsername,
      location: formData.get('location') as string,
      github: formData.get('github') as string,
      bio: formData.get('bio') as string,
      about: formData.get('about') as string,
      college: formData.get('college') as string,
      branch: formData.get('branch') as string,
      year: formData.get('year') as string,
      email: formData.get('email') as string,
      portfolio: formData.get('portfolio') as string,
      linkedin: formData.get('linkedin') as string,
      twitter: formData.get('twitter') as string,
      instagram: formData.get('instagram') as string,
    };

    try {
      // Send payload to the MERN backend to update MongoDB
      await profileService.updateProfile(profilePayload);

      // We also update state optimistically for immediate UI feedback
      setProfile((prev: any) => ({ ...prev, ...profilePayload }));
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white font-sans pb-20 selection:bg-orange-500/30">
      <TopNavbar />

      {!isPublic && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 text-rose-500 text-sm font-semibold py-2 px-4 flex items-center justify-center gap-2">
          <Shield size={14} />
          Your profile is currently private. Only you can see this page.
        </div>
      )}

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-8">

        {/* HEADER SECTION */}
        <div className="relative w-full rounded-3xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0A0A0C] overflow-hidden p-8 mb-6 flex flex-col md:flex-row items-start md:items-center gap-8 shadow-2xl">
          {/* Background Grid Pattern & Glows */}
          <div className="absolute inset-0 pointer-events-none opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
          </div>
          <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[200%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none transform rotate-12" />

          {/* Large Watermark */}
          <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none hidden lg:block">
            <span className="text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500 tracking-tighter leading-none" style={{ textShadow: '0 0 80px rgba(255,138,0,0.5)' }}>
              &lt;/&gt;
            </span>
          </div>

          {/* Profile Photo */}
          <div className="relative z-10 shrink-0 group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-orange-500 to-amber-600 relative z-10 shadow-[0_0_40px_rgba(255,138,0,0.3)]">
              <div className="w-full h-full rounded-full bg-white dark:bg-[#050505] p-1">
                <img
                  src={foundUser ? foundUser.image : (profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80")}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            {/* Camera Icon Overlay */}
            {isOwnProfile && (
              <button aria-label="Edit profile photo" onClick={() => setIsEditing(true)} className="absolute bottom-2 right-2 w-10 h-10 bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-black dark:text-white hover:border-white/30 transition-all z-20 opacity-0 group-hover:opacity-100 shadow-lg cursor-pointer">
                <Camera size={16} />
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 relative z-10 flex flex-col gap-3 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white tracking-tight">{profile.name}</h1>
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-black dark:text-white">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
                  <Star size={12} className="fill-current" /> Pro Member
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {isOwnProfile && (
                  <button
                    onClick={() => setIsPublic(!isPublic)}
                    className={`group flex items-center justify-center gap-2 h-10 px-6 rounded-xl border ${isPublic ? 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]'} text-sm font-bold bg-transparent transition-all duration-300 backdrop-blur-md`}
                  >
                    <Shield size={16} className={`${isPublic ? 'group-hover:text-emerald-400' : 'group-hover:text-rose-400'} transition-colors`} />
                    {isPublic ? 'Public' : 'Private'}
                  </button>
                )}
                <button onClick={handleCopyLink} className="group flex items-center justify-center gap-2 h-10 px-6 rounded-xl border border-gray-300 dark:border-white/20 bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-white/40 transition-all duration-300 backdrop-blur-md">
                  {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-white transition-colors" />}
                  {isCopied ? 'Copied!' : 'Share'}
                </button>
                {isOwnProfile ? (
                  <button onClick={() => setIsEditing(true)} className="group flex items-center justify-center gap-2 h-10 px-6 rounded-xl border border-orange-500/40 text-orange-500 hover:bg-orange-500/10 hover:border-orange-500/60 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)] bg-transparent text-sm font-bold transition-all duration-300 backdrop-blur-md">
                    <Edit3 size={16} className="group-hover:text-orange-400 transition-colors" /> Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={() => setIsFollowingProfile(!isFollowingProfile)}
                    className={`flex items-center justify-center gap-2 h-10 px-8 rounded-xl text-sm font-bold border transition-all duration-300 ${isFollowingProfile ? 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 border-transparent' : 'bg-gradient-to-r from-orange-500 to-amber-500 text-black border-transparent hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-105'}`}
                  >
                    {isFollowingProfile ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
              {profile.username && <span className="text-gray-700 dark:text-gray-300">@{profile.username}</span>}
              {profile.location && !profile.location.startsWith('Add ') && (
                <div className="flex items-center gap-1.5"><MapPin size={14} /> {profile.location}</div>
              )}
              {profile.github && !profile.github.startsWith('Add ') && (
                <div className="flex items-center gap-1.5"><Link2 size={14} /> {profile.github}</div>
              )}
            </div>

            {(profile.bio && !profile.bio.startsWith('Add ')) ? (
              <p className="text-gray-600 dark:text-gray-400 text-sm max-w-2xl mt-1 leading-relaxed">
                {profile.bio}
                {isOwnProfile && (
                  <button aria-label="Edit bio" onClick={() => setIsEditing(true)} className="text-orange-500 hover:text-orange-400 ml-2 inline-flex items-center">
                    <Edit3 size={12} />
                  </button>
                )}
              </p>
            ) : isOwnProfile ? (
              <button onClick={() => setIsEditing(true)} className="text-xs text-gray-500 hover:text-orange-500 transition-colors mt-1 flex items-center gap-1.5">
                <Edit3 size={12} /> Add a short bio or tagline...
              </button>
            ) : null}

            <div className="flex items-center gap-3 mt-2">
              {[
                { icon: Mail, url: profile.email ? `mailto:${profile.email}` : '', value: profile.email, label: 'Email' },
                { icon: Github, url: profile.github, value: profile.github, label: 'GitHub' },
                { icon: Linkedin, url: profile.linkedin, value: profile.linkedin, label: 'LinkedIn' },
                { icon: Twitter, url: profile.twitter, value: profile.twitter, label: 'Twitter' },
                { icon: Instagram, url: profile.instagram, value: profile.instagram, label: 'Instagram' },
                { icon: Briefcase, url: profile.portfolio, value: profile.portfolio, label: 'Portfolio' }
              ]
                .filter(s => s.value && s.value.trim() !== '' && !s.value.startsWith('Add '))
                .map((social, i) => (
                  <a key={i} href={social.url?.startsWith('http') || social.url?.startsWith('mailto') ? social.url : `https://${social.url}`} target="_blank" rel="noopener noreferrer" className="group relative w-9 h-9 rounded-full bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-black dark:text-white hover:bg-white/10 transition-all">
                    <social.icon size={16} />
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/10 rounded-lg text-[10px] font-bold text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-xl whitespace-nowrap scale-95 group-hover:scale-100 z-50">
                      {social.label}
                    </span>
                  </a>
                ))
              }
              {/* If own profile and no socials filled → show hint */}
              {isOwnProfile && [profile.email, profile.github, profile.linkedin, profile.twitter, profile.instagram, profile.portfolio].filter(v => v && v.trim() !== '' && !v.startsWith('Add ')).length === 0 && (
                <button onClick={() => setIsEditing(true)} className="text-xs text-gray-500 hover:text-orange-500 transition-colors flex items-center gap-1.5 border border-dashed border-gray-300 dark:border-white/10 rounded-full px-3 py-1.5">
                  <Edit3 size={12} /> Add Social Links
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-8 mb-6 border-b border-gray-200 dark:border-white/5 overflow-x-auto scrollbar-hide">
          {['Overview', 'Platforms', 'Activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors relative top-[1px] ${activeTab === tab
                  ? 'border-orange-500 text-black dark:text-white'
                  : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white'
                }`}
            >
              {tab}
            </button>
          ))}
          <button
            onClick={() => setActiveTab('Followers')}
            className={`pb-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors relative top-[1px] flex items-center gap-2 ${activeTab === 'Followers'
                ? 'border-orange-500 text-black dark:text-white'
                : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white'
              }`}
          >
            Followers
            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-[11px] font-bold text-gray-700 dark:text-gray-300">
              {followersList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('Following')}
            className={`pb-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors relative top-[1px] flex items-center gap-2 ${activeTab === 'Following'
                ? 'border-orange-500 text-black dark:text-white'
                : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white'
              }`}
          >
            Following
            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-[11px] font-bold text-gray-700 dark:text-gray-300">
              {followingList.length}
            </span>
          </button>
        </div>

        {activeTab === 'Overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* STATS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              {[
                { icon: Code2, label: 'Problems Solved', value: overallStats.problems.toLocaleString(), color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                { icon: Trophy, label: 'Contests Participated', value: overallStats.contests.toLocaleString(), color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
                { icon: FolderGit2, label: 'Projects Built', value: overallStats.projects.toLocaleString(), color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                { icon: Star, label: 'Total Points', value: overallStats.points.toLocaleString(), color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
                { icon: Shield, label: 'Global Rank', value: `#${overallStats.rank}`, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
                { icon: Target, label: 'Percentile', value: overallStats.percentile, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
              ].map((stat, i) => (
                <div key={i} className="bg-gray-50 dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:border-gray-200 dark:border-white/10 transition-colors group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.border} border`}>
                    <stat.icon className={`${stat.color}`} size={20} />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-black dark:text-white group-hover:scale-105 transition-transform origin-left">{stat.value}</div>
                    <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mt-1">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* LEFT COL: About Me */}
              <div className="lg:col-span-4 bg-gray-50 dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/5 rounded-3xl p-6 flex flex-col">
                <h2 className="text-lg font-bold text-black dark:text-white mb-4">About Me</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 whitespace-pre-wrap">
                  {profile.about}
                </p>

                <div className="space-y-4 text-sm mt-auto">
                  {[
                    { label: 'College', value: profile.college },
                    { label: 'Branch', value: profile.branch },
                    { label: 'Year', value: profile.year },
                    { label: 'Email', value: profile.email },
                    { label: 'Portfolio', value: profile.portfolio },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <span className="text-gray-500 font-medium w-32 flex items-center gap-2">
                        <Target size={14} className="opacity-50" /> {item.label}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* MIDDLE COL: Skills */}
              <div className="lg:col-span-5 bg-gray-50 dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/5 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-black dark:text-white">Skills</h2>
                  {isOwnProfile && (
                    <button onClick={() => setIsManagingSkills(true)} className="text-xs font-bold text-orange-500 hover:text-orange-400">Manage</button>
                  )}
                </div>

                {skills.length === 0 ? (
                  <div className="text-sm text-gray-500 italic py-4">No skills added yet. {isOwnProfile && 'Click Manage to add skills!'}</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {skills.map((skill, i) => (
                      <div key={i} className="bg-gray-100 dark:bg-[#111115] border border-gray-200 dark:border-white/5 rounded-xl p-3 flex flex-col justify-between hover:border-gray-200 dark:border-white/10 transition-colors group cursor-pointer relative overflow-hidden">
                        <div className={`absolute right-0 bottom-0 w-12 h-12 bg-${skill.color}-500/10 rounded-tl-full blur-xl group-hover:bg-${skill.color}-500/20 transition-colors`}></div>
                        <span className="text-sm font-bold text-black dark:text-white relative z-10">{skill.name}</span>
                        <span className={`text-[10px] font-bold text-${skill.color}-400 uppercase tracking-widest mt-2 relative z-10`}>{skill.level}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT COL: Achievements */}
              <div className="lg:col-span-3 bg-gray-50 dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/5 rounded-3xl p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-black dark:text-white">Recent Achievements</h2>
                  <button onClick={() => setIsViewingAchievements(true)} className="text-xs font-bold text-orange-500 hover:text-orange-400">View All</button>
                </div>

                {achievementsData.length === 0 ? (
                  <div className="text-sm text-gray-500 italic py-4">No achievements earned yet. Keep coding to unlock badges!</div>
                ) : (
                  <div className="flex flex-col gap-4 flex-1">
                    {achievementsData.slice(0, 4).map((ach, i) => (
                      <div key={i} className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-[#111115] border border-gray-200 dark:border-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <ach.icon className={ach.color} size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-black dark:text-white truncate">{ach.title}</h4>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{ach.desc}</p>
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium shrink-0">
                          {ach.time}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* BOTTOM ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Courses */}
              <div className="lg:col-span-2 bg-gray-50 dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/5 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-black dark:text-white">Courses & Certifications</h2>
                  <div className="flex gap-3">
                    {isOwnProfile && (
                      <button onClick={() => setIsManagingCourses(true)} className="text-xs font-bold text-orange-500 hover:text-orange-400">Manage</button>
                    )}
                    <button onClick={() => setIsViewingCourses(true)} className="text-xs font-bold text-orange-500 hover:text-orange-400">View All</button>
                  </div>
                </div>

{courses.length === 0 ? (
                  <div className="text-sm text-gray-500 italic py-4">No courses added yet. {isOwnProfile && 'Click Manage to add courses!'}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {courses.slice(0, 4).map((course, i) => (
                      <div key={i} className="bg-gray-100 dark:bg-[#111115] border border-gray-200 dark:border-white/5 rounded-2xl p-3 flex flex-col group cursor-pointer hover:border-white/20 transition-all">
                        <div className="w-full aspect-[4/3] rounded-xl bg-white dark:bg-[#1A1A1D] mb-3 overflow-hidden relative">
                          {course.image ? (
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                              <Code2 className="text-black dark:text-white/30" size={32} />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-black dark:text-white truncate">{course.title}</h4>
                          {course.link && (
                            <a href={course.link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors shrink-0">
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-1 mb-3">{course.author}</p>
                        <div className="mt-auto">
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                            {course.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Languages — coming soon placeholder */}
              <div className="lg:col-span-1 bg-gray-50 dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/5 rounded-3xl p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-black dark:text-white">Top Languages</h2>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-6">
                  <Code2 size={32} className="text-gray-300 dark:text-white/10" />
                  <p className="text-sm text-gray-500 italic">Language stats will appear once platforms are connected & synced.</p>
                </div>
              </div>
            </div>

            {/* PROJECTS ROW */}
            <div className="mt-6 bg-gray-50 dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/5 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                  <FolderGit2 className="text-orange-500" size={20} /> Top Projects
                </h2>
                <div className="flex gap-3">
                  {isOwnProfile && (
                    <button onClick={() => setIsManagingProjects(true)} className="text-xs font-bold text-orange-500 hover:text-orange-400">Manage</button>
                  )}
                  <button onClick={() => setIsViewingProjects(true)} className="text-xs font-bold text-orange-500 hover:text-orange-400">View All</button>
                </div>
              </div>
{projects.length === 0 ? (
                <div className="text-sm text-gray-500 italic py-4">
                  No projects added yet. {isOwnProfile && 'Click Manage to add your projects!'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.slice(0, 3).map((proj, i) => (
                    <div
                      key={i}
                      onClick={() => toggleProjectDesc(proj.title)}
                      className="bg-white dark:bg-[#111115] border border-gray-200 dark:border-white/5 p-5 rounded-2xl flex flex-col group hover:border-gray-300 dark:hover:border-white/20 transition-all cursor-pointer"
                    >
                      {proj.image && (
                        <div className="w-full h-32 rounded-xl bg-gray-100 dark:bg-[#1A1A1D] mb-4 overflow-hidden shrink-0">
                          <img src={proj.image} alt={proj.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-black dark:text-white text-base truncate pr-2">{proj.title}</h3>
                        <div className="flex items-center gap-2 shrink-0">
                          {proj.github && (
                            <a href={proj.github} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                              <Github size={16} />
                            </a>
                          )}
                          {proj.link && (
                            <a href={proj.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-orange-500 transition-colors">
                              <ExternalLink size={16} />
                            </a>
                          )}
                        </div>
                      </div>
                      <p className={`text-sm text-gray-500 mb-4 ${expandedProjects.includes(proj.title) ? '' : 'line-clamp-2'}`}>
                        {proj.desc}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {proj.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="px-2 py-1 bg-gray-100 dark:bg-[#1A1A1D] text-gray-600 dark:text-gray-400 text-[10px] font-bold rounded-lg border border-gray-200 dark:border-white/5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Platforms' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-black dark:text-white">Platforms Overview</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {platformsData.map((platform, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/5 rounded-3xl p-6 flex flex-col hover:border-gray-300 dark:hover:border-white/10 transition-all group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/5 flex items-center justify-center shrink-0">
                        {platform.name === 'GitHub' ? <Github size={20} className="text-black dark:text-white" /> : <Code2 size={20} className={platform.iconColor} />}
                      </div>
                      <h3 className="font-bold text-black dark:text-white text-lg">{platform.name}</h3>
                    </div>
                    <a href={(platform as any).link || '#'} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all" title={`Visit ${platform.name}`}>
                      <ExternalLink size={14} />
                    </a>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">{platform.primaryStatLabel}</p>
                    <p className="text-3xl font-black text-black dark:text-white">{platform.primaryStatValue}</p>
                  </div>

                  {/* Difficulty Breakdown */}
                  {platform.difficulty && (
                    <div className="flex items-center gap-6 mb-5">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Easy</span>
                        <span className="text-sm font-black text-emerald-500">{platform.difficulty.easy}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Med</span>
                        <span className="text-sm font-black text-yellow-500">{platform.difficulty.medium}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Hard</span>
                        <span className="text-sm font-black text-rose-500">{platform.difficulty.hard}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6">
                    {platform.stats.map((stat, sIdx) => (
                      <div key={sIdx}>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">{stat.label}</p>
                        <p className={`text-sm font-bold ${stat.color || 'text-black dark:text-white'}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Faux Sparkline Chart */}
                  <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/5">
                    <svg className="w-full h-12 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path
                        d={`M0,25 C10,20 20,28 30,15 C40,5 50,18 60,10 C70,2 80,12 100,5`}
                        fill="none"
                        stroke={platform.chartColor}
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                        className="opacity-50 group-hover:opacity-100 transition-opacity"
                      />
                      <path
                        d={`M0,25 C10,20 20,28 30,15 C40,5 50,18 60,10 C70,2 80,12 100,5 L100,30 L0,30 Z`}
                        fill={`url(#gradient-${idx})`}
                        className="opacity-20 group-hover:opacity-40 transition-opacity"
                      />
                      <defs>
                        <linearGradient id={`gradient-${idx}`} x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor={platform.chartColor} stopOpacity="1" />
                          <stop offset="100%" stopColor={platform.chartColor} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="flex justify-between mt-2">
                      <span className="text-[9px] text-gray-500 uppercase tracking-wider">Top {platform.stats[0]?.value?.replace(/[^0-9.%]/g, '') || '5%'} of users</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Activity' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Heatmap Section */}
            <div className="bg-gray-50 dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/5 rounded-3xl p-6 mb-6">
              <h2 className="text-lg font-bold text-black dark:text-white mb-6">Contribution Activity</h2>

              <div className="w-full overflow-x-auto scrollbar-hide pb-4">
                <div className="flex gap-3 min-w-max">
                  {/* Y-axis Labels (Days) */}
                  <div className="flex flex-col justify-between text-[10px] text-gray-500 font-bold py-[2px] mt-1 pr-2">
                    <span className="h-[14px] leading-[14px]">Mon</span>
                    <span className="h-[14px] leading-[14px]"></span>
                    <span className="h-[14px] leading-[14px]">Wed</span>
                    <span className="h-[14px] leading-[14px]"></span>
                    <span className="h-[14px] leading-[14px]">Fri</span>
                    <span className="h-[14px] leading-[14px]"></span>
                    <span className="h-[14px] leading-[14px]"></span>
                  </div>

                  {/* Months & Grid */}
                  {[
                    { name: 'Jan', weeks: 4 }, { name: 'Feb', weeks: 4 }, { name: 'Mar', weeks: 5 },
                    { name: 'Apr', weeks: 4 }, { name: 'May', weeks: 4 }, { name: 'Jun', weeks: 5 },
                    { name: 'Jul', weeks: 4 }, { name: 'Aug', weeks: 5 }, { name: 'Sep', weeks: 4 },
                    { name: 'Oct', weeks: 4 }, { name: 'Nov', weeks: 5 }, { name: 'Dec', weeks: 4 },
                  ].map((month, mIdx) => (
                    <div key={mIdx} className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        {Array.from({ length: month.weeks }).map((_, weekIdx) => (
                          <div key={weekIdx} className="flex flex-col gap-1">
                            {Array.from({ length: 7 }).map((_, dayIdx) => {
                              // Create jagged edges for realism
                              const isHidden = (weekIdx === 0 && dayIdx < Math.floor(Math.random() * 4)) ||
                                (weekIdx === month.weeks - 1 && dayIdx > 2 + Math.floor(Math.random() * 4));
                              if (isHidden) {
                                return <div key={dayIdx} className="w-[14px] h-[14px]" />;
                              }
                              const intensity = Math.random();
                              const bg = intensity > 0.85 ? 'bg-green-600 dark:bg-green-500' : intensity > 0.6 ? 'bg-green-500 dark:bg-green-600' : intensity > 0.3 ? 'bg-green-300 dark:bg-green-800' : 'bg-gray-200 dark:bg-white/5';
                              return <div key={dayIdx} className={`w-[14px] h-[14px] rounded-[3px] ${bg} hover:ring-1 hover:ring-black dark:hover:ring-white transition-all`} title={`${Math.floor(intensity * 10)} contributions`} />;
                            })}
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-600 dark:text-gray-400 font-bold mt-1">{month.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-2">
                <span>Less</span>
                <div className="w-[14px] h-[14px] rounded-[3px] bg-gray-200 dark:bg-white/5"></div>
                <div className="w-[14px] h-[14px] rounded-[3px] bg-green-300 dark:bg-green-800"></div>
                <div className="w-[14px] h-[14px] rounded-[3px] bg-green-500 dark:bg-green-600"></div>
                <div className="w-[14px] h-[14px] rounded-[3px] bg-green-600 dark:bg-green-500"></div>
                <span>More</span>
              </div>
            </div>

            {/* Recent Activity List */}
            <div className="bg-gray-50 dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/5 rounded-3xl p-6">
              <h2 className="text-lg font-bold text-black dark:text-white mb-6">Recent Activity</h2>
<div className="text-sm text-gray-500 italic py-4 text-center">
                No recent activity to show. Start solving problems on connected platforms!
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Followers' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-black dark:text-white">Followers ({followersList.length})</h2>
              <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search followers..."
                  value={followersSearch}
                  onChange={(e) => setFollowersSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/10 rounded-xl text-sm text-black dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {followersList
                .filter(u => u.name.toLowerCase().includes(followersSearch.toLowerCase()) || u.username.toLowerCase().includes(followersSearch.toLowerCase()))
                .slice(0, visibleFollowers)
                .map((user, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-gray-300 dark:hover:border-white/10 transition-colors">
                    <Link href={`/profile/${user.username}`} className="flex items-center gap-4 cursor-pointer">
                      <img src={user.image} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <h4 className="text-sm font-bold text-black dark:text-white group-hover:text-orange-500 transition-colors">{user.name}</h4>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{user.role}</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleToggleFollow(user)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${user.isFollowing ? 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 border border-transparent' : 'bg-orange-500 text-black hover:bg-orange-400 border border-transparent'}`}
                    >
                      {user.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
            </div>

            {visibleFollowers < followersList.length && !followersSearch ? (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setVisibleFollowers(prev => Math.min(prev + 12, followersList.length))}
                  className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  Load More Followers
                </button>
              </div>
            ) : visibleFollowers >= followersList.length && !followersSearch ? (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 font-medium bg-gray-100 dark:bg-white/5 inline-block px-6 py-2 rounded-xl border border-gray-200 dark:border-white/10">
                  Showing all followers. Use the search bar to find a specific user.
                </p>
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'Following' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-black dark:text-white">Following ({followingList.length})</h2>
              <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search following..."
                  value={followingSearch}
                  onChange={(e) => setFollowingSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/10 rounded-xl text-sm text-black dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {followingList
                .filter(u => u.name.toLowerCase().includes(followingSearch.toLowerCase()) || u.username.toLowerCase().includes(followingSearch.toLowerCase()))
                .slice(0, visibleFollowing)
                .map((user, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-[#0A0A0C] border border-gray-200 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-gray-300 dark:hover:border-white/10 transition-colors">
                    <Link href={`/profile/${user.username}`} className="flex items-center gap-4 cursor-pointer">
                      <img src={user.image} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <h4 className="text-sm font-bold text-black dark:text-white group-hover:text-orange-500 transition-colors">{user.name}</h4>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{user.role}</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleToggleFollow(user)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${user.isFollowing ? 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 border border-transparent' : 'bg-orange-500 text-black hover:bg-orange-400 border border-transparent'}`}
                    >
                      {user.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
            </div>

            {visibleFollowing < followingList.length && !followingSearch ? (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setVisibleFollowing(prev => Math.min(prev + 12, followingList.length))}
                  className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  Load More Following
                </button>
              </div>
            ) : visibleFollowing >= followingList.length && !followingSearch ? (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 font-medium bg-gray-100 dark:bg-white/5 inline-block px-6 py-2 rounded-xl border border-gray-200 dark:border-white/10">
                  Showing all following. Use the search bar to find a specific user.
                </p>
              </div>
            ) : null}
          </div>
        )}

      </main>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsEditing(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151518]">
                <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                  <Edit3 size={18} className="text-orange-500" /> Edit Profile
                </h3>
                <button aria-label="Close" onClick={() => setIsEditing(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                <form id="edit-profile-form" onSubmit={handleSave} className="flex flex-col gap-5">

                  {/* Photo Edit */}
                  <div className="flex items-center gap-5 mb-2">
                    <button type="button" onClick={() => { setIsEditing(false); openUserProfile(); }} className="w-20 h-20 rounded-full bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden relative group cursor-pointer focus:outline-none">
                      <img src={profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80"} alt="Avatar" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                      <Camera size={24} className="absolute text-black dark:text-white shadow-xl drop-shadow-xl" />
                    </button>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-bold text-black dark:text-white">Profile Photo</h4>
                        <button type="button" onClick={() => { setIsEditing(false); openUserProfile(); }} className="text-[10px] font-bold text-orange-500 hover:text-orange-400 transition-colors">Change in Clerk</button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Managed securely via Clerk</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="edit-display-name" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Display Name</label>
                        <button type="button" onClick={() => { setIsEditing(false); openUserProfile(); }} className="text-[10px] font-bold text-orange-500 hover:text-orange-400 transition-colors">Change in Clerk</button>
                      </div>
                      <input id="edit-display-name" name="name" defaultValue={profile.name} readOnly placeholder="Your display name" className="w-full bg-gray-100 dark:bg-[#111115] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed focus:outline-none transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="edit-username" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Username</label>
                        {lastUsernameChange && (
                          <span className="text-[10px] font-medium text-orange-500">
                            Changes locked for {90 - Math.floor((new Date().getTime() - lastUsernameChange.getTime()) / (1000 * 3600 * 24))} days
                          </span>
                        )}
                      </div>
                      <input
                        id="edit-username"
                        name="username"
                        defaultValue={profile.username}
                        placeholder="Your username"
                        required
                        readOnly={!!lastUsernameChange && Math.floor((new Date().getTime() - lastUsernameChange.getTime()) / (1000 * 3600 * 24)) < 90}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors ${!!lastUsernameChange && Math.floor((new Date().getTime() - lastUsernameChange.getTime()) / (1000 * 3600 * 24)) < 90 ? 'bg-gray-100 dark:bg-[#111115] border-gray-200 dark:border-white/5 text-gray-500 cursor-not-allowed' : 'bg-white dark:bg-[#1A1A1D] border-gray-200 dark:border-white/10 text-black dark:text-white focus:border-orange-500/50'}`}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="edit-location" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Location</label>
                      <input id="edit-location" name="location" defaultValue={profile.location} placeholder="e.g. New Delhi, India" className="w-full bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-orange-500/50 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="edit-github" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">GitHub</label>
                      <input id="edit-github" name="github" defaultValue={profile.github} placeholder="github.com/username" className="w-full bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-orange-500/50 transition-colors" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-bio" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Bio / Tagline</label>
                    <textarea id="edit-bio" name="bio" defaultValue={profile.bio} placeholder="Write a short bio or tagline..." rows={2} className="w-full bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-orange-500/50 transition-colors resize-none"></textarea>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-about" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">About Me</label>
                    <textarea id="edit-about" name="about" defaultValue={profile.about} placeholder="Tell others about yourself..." rows={4} className="w-full bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-orange-500/50 transition-colors resize-none"></textarea>
                  </div>

                  <h4 className="text-sm font-bold text-black dark:text-white mt-2 border-b border-gray-200 dark:border-white/5 pb-2">Academic & Contact</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="edit-college" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">College</label>
                      <input id="edit-college" name="college" defaultValue={profile.college} placeholder="Your college or university" className="w-full bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-orange-500/50 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="edit-branch" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Branch</label>
                      <input id="edit-branch" name="branch" defaultValue={profile.branch} placeholder="e.g. Computer Science" className="w-full bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-orange-500/50 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="edit-year" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Year</label>
                      <input id="edit-year" name="year" defaultValue={profile.year} placeholder="e.g. 2021 - 2025" className="w-full bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-orange-500/50 transition-colors" />
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-black dark:text-white mt-2 border-b border-gray-200 dark:border-white/5 pb-2">Social Links & Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="edit-email" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                      <input id="edit-email" name="email" defaultValue={profile.email} type="email" placeholder="you@example.com" className="w-full bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-orange-500/50 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="edit-portfolio" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Portfolio Website</label>
                      <input id="edit-portfolio" name="portfolio" defaultValue={profile.portfolio} placeholder="yourportfolio.dev" className="w-full bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-orange-500/50 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="edit-linkedin" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">LinkedIn</label>
                      <input id="edit-linkedin" name="linkedin" defaultValue={profile.linkedin} placeholder="linkedin.com/in/username" className="w-full bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-orange-500/50 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="edit-twitter" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Twitter</label>
                      <input id="edit-twitter" name="twitter" defaultValue={profile.twitter} placeholder="twitter.com/username" className="w-full bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-orange-500/50 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="edit-instagram" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Instagram</label>
                      <input id="edit-instagram" name="instagram" defaultValue={profile.instagram} placeholder="instagram.com/username" className="w-full bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-orange-500/50 transition-colors" />
                    </div>
                  </div>
                </form>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151518]">
                <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" form="edit-profile-form" className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black dark:text-white text-sm font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all">
                  <Check size={16} /> Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANAGE SKILLS MODAL */}
      <AnimatePresence>
        {isManagingSkills && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsManagingSkills(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151518]">
                <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                  <Code2 size={18} className="text-orange-500" /> Manage Skills
                </h3>
                <button aria-label="Close" onClick={() => setIsManagingSkills(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin flex flex-col gap-3">
                {skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/5 p-3 rounded-xl">
                    <input
                      value={skill.name}
                      placeholder="Skill name"
                      aria-label="Skill name"
                      onChange={(e) => {
                        const newSkills = [...skills];
                        newSkills[idx].name = e.target.value;
                        setSkills(newSkills);
                      }}
                      className="flex-1 bg-transparent border-none text-sm font-bold text-black dark:text-white focus:outline-none"
                    />
                    <select
                      aria-label="Skill level"
                      value={skill.level}
                      onChange={(e) => {
                        const newSkills = [...skills];
                        newSkills[idx].level = e.target.value;
                        setSkills(newSkills);
                      }}
                      className="bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-gray-600 dark:text-gray-400 focus:outline-none"
                    >
                      <option value="Beginner" className="bg-white dark:bg-[#151518] text-black dark:text-white">Beginner</option>
                      <option value="Intermediate" className="bg-white dark:bg-[#151518] text-black dark:text-white">Intermediate</option>
                      <option value="Advanced" className="bg-white dark:bg-[#151518] text-black dark:text-white">Advanced</option>
                    </select>
                    <button
                      aria-label="Remove skill"
                      onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => setSkills([...skills, { name: 'New Skill', level: 'Beginner', color: 'blue' }])}
                  className="w-full py-3 mt-2 rounded-xl border border-dashed border-gray-300 dark:border-white/20 text-gray-500 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                >
                  + Add New Skill
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151518]">
                <button onClick={() => setIsManagingSkills(false)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black dark:text-white text-sm font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all">
                  <Check size={16} /> Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ALL ACHIEVEMENTS MODAL */}
      <AnimatePresence>
        {isViewingAchievements && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsViewingAchievements(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151518]">
                <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                  <Trophy size={18} className="text-orange-500" /> All Achievements
                </h3>
                <button aria-label="Close" onClick={() => setIsViewingAchievements(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin flex flex-col gap-4">
                {achievementsData.map((ach, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-gray-50 dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/5 p-4 rounded-xl hover:border-gray-300 dark:hover:border-white/10 transition-colors">
                    <div className={`w-12 h-12 rounded-2xl ${ach.bg} border border-gray-200 dark:border-white/5 flex items-center justify-center shrink-0`}>
                      <ach.icon className={ach.color} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-black dark:text-white truncate">{ach.title}</h4>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{ach.desc}</p>
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium shrink-0">
                      {ach.time}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151518]">
                <button onClick={() => setIsViewingAchievements(false)} className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-800 dark:text-gray-200 text-sm font-bold border border-gray-200 dark:border-white/10 transition-all">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ALL COURSES MODAL */}
      <AnimatePresence>
        {isViewingCourses && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsViewingCourses(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151518]">
                <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                  <Code2 size={18} className="text-orange-500" /> All Courses & Certifications
                </h3>
                <button aria-label="Close" onClick={() => setIsViewingCourses(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {courses.map((course, idx) => (
                  <div key={idx} className="bg-gray-100 dark:bg-[#111115] border border-gray-200 dark:border-white/5 rounded-2xl p-3 flex flex-col group cursor-pointer hover:border-white/20 transition-all">
                    <div className="w-full aspect-[4/3] rounded-xl bg-white dark:bg-[#1A1A1D] mb-3 overflow-hidden relative">
                      {course.image ? (
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                          <Code2 className="text-black dark:text-white/30" size={32} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-black dark:text-white truncate">{course.title}</h4>
                      {course.link && (
                        <a href={course.link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors shrink-0">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1 mb-3">{course.author}</p>
                    <div className="mt-auto">
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${course.status === 'Completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                        {course.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151518]">
                <button onClick={() => setIsViewingCourses(false)} className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-800 dark:text-gray-200 text-sm font-bold border border-gray-200 dark:border-white/10 transition-all">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANAGE COURSES MODAL */}
      <AnimatePresence>
        {isManagingCourses && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsManagingCourses(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151518]">
                <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                  <Code2 size={18} className="text-orange-500" /> Manage Courses
                </h3>
                <button aria-label="Close" onClick={() => setIsManagingCourses(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin flex flex-col gap-3">
                {courses.map((course, idx) => (
                  <div key={idx} className="flex flex-col gap-2 bg-gray-50 dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/5 p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <input
                        value={course.title}
                        placeholder="Course Title"
                        onChange={(e) => {
                          const newCourses = [...courses];
                          newCourses[idx].title = e.target.value;
                          setCourses(newCourses);
                        }}
                        className="flex-1 bg-transparent border-none text-sm font-bold text-black dark:text-white focus:outline-none"
                      />
                      <button
                        aria-label="Remove course"
                        onClick={() => setCourses(courses.filter((_, i) => i !== idx))}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        value={course.author}
                        placeholder="Instructor/Author"
                        onChange={(e) => {
                          const newCourses = [...courses];
                          newCourses[idx].author = e.target.value;
                          setCourses(newCourses);
                        }}
                        className="flex-1 bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 focus:outline-none"
                      />
                      <select
                        value={course.status}
                        onChange={(e) => {
                          const newCourses = [...courses];
                          newCourses[idx].status = e.target.value;
                          setCourses(newCourses);
                        }}
                        className="bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 focus:outline-none"
                      >
                        <option value="Completed" className="bg-white dark:bg-[#151518] text-black dark:text-white">Completed</option>
                        <option value="In Progress" className="bg-white dark:bg-[#151518] text-black dark:text-white">In Progress</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative flex items-center">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              if (file.size > 2 * 1024 * 1024) {
                                alert("Image size should be less than 2MB");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const newCourses = [...courses];
                                newCourses[idx].image = event.target?.result as string;
                                setCourses(newCourses);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <div className="w-full bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 flex items-center justify-between pointer-events-none">
                          <span className="truncate">{course.image ? 'Image Selected' : 'Upload Image (Max 2MB)'}</span>
                          <Camera size={14} />
                        </div>
                      </div>
                      <input
                        value={course.link || ''}
                        placeholder="Certificate Link URL"
                        onChange={(e) => {
                          const newCourses = [...courses];
                          newCourses[idx].link = e.target.value;
                          setCourses(newCourses);
                        }}
                        className="flex-1 bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setCourses([...courses, { title: 'New Course', author: 'Unknown', status: 'In Progress', image: '', link: '' }])}
                  className="w-full py-3 mt-2 rounded-xl border border-dashed border-gray-300 dark:border-white/20 text-gray-500 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                >
                  + Add New Course
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151518]">
                <button onClick={() => setIsManagingCourses(false)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black dark:text-white text-sm font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all">
                  <Check size={16} /> Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* ALL PROJECTS MODAL */}
      <AnimatePresence>
        {isViewingProjects && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsViewingProjects(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151518]">
                <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                  <FolderGit2 size={18} className="text-orange-500" /> All Projects
                </h3>
                <button aria-label="Close" onClick={() => setIsViewingProjects(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((proj, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleProjectDesc(proj.title)}
                    className="bg-gray-100 dark:bg-[#111115] border border-gray-200 dark:border-white/5 p-5 rounded-2xl flex flex-col group hover:border-gray-300 dark:hover:border-white/20 transition-all cursor-pointer"
                  >
                    {proj.image && (
                      <div className="w-full h-32 rounded-xl bg-gray-200 dark:bg-[#1A1A1D] mb-4 overflow-hidden shrink-0">
                        <img src={proj.image} alt={proj.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-black dark:text-white text-base truncate pr-2">{proj.title}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        {proj.github && (
                          <a href={proj.github} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                            <Github size={16} />
                          </a>
                        )}
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-orange-500 transition-colors">
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm text-gray-500 mb-4 ${expandedProjects.includes(proj.title) ? '' : 'line-clamp-2'}`}>
                      {proj.desc}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {proj.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="px-2 py-1 bg-gray-200 dark:bg-[#1A1A1D] text-gray-700 dark:text-gray-400 text-[10px] font-bold rounded-lg border border-gray-300 dark:border-white/5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151518]">
                <button onClick={() => setIsViewingProjects(false)} className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-800 dark:text-gray-200 text-sm font-bold border border-gray-200 dark:border-white/10 transition-all">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANAGE PROJECTS MODAL */}
      <AnimatePresence>
        {isManagingProjects && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsManagingProjects(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151518]">
                <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                  <FolderGit2 size={18} className="text-orange-500" /> Manage Projects
                </h3>
                <button aria-label="Close" onClick={() => setIsManagingProjects(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin flex flex-col gap-4">
                {projects.map((proj, idx) => (
                  <div key={idx} className="flex flex-col gap-3 bg-gray-50 dark:bg-[#1A1A1D] border border-gray-200 dark:border-white/5 p-4 rounded-xl">

                    <div className="flex-1 relative flex items-center">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            if (file.size > 2 * 1024 * 1024) {
                              alert("Image size should be less than 2MB");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const newProjs = [...projects];
                              newProjs[idx].image = event.target?.result as string;
                              setProjects(newProjs);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <div className="w-full bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-600 dark:text-gray-400 flex items-center justify-between pointer-events-none">
                        <span className="truncate">{proj.image ? 'Project Image Selected' : 'Upload Project Image (Max 2MB)'}</span>
                        <Camera size={14} />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        value={proj.title}
                        placeholder="Project Title"
                        onChange={(e) => {
                          const newProjs = [...projects];
                          newProjs[idx].title = e.target.value;
                          setProjects(newProjs);
                        }}
                        className="flex-1 bg-transparent border-none text-base font-bold text-black dark:text-white focus:outline-none placeholder-gray-400"
                      />
                      <button
                        aria-label="Remove project"
                        onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <textarea
                      value={proj.desc}
                      placeholder="Project Description..."
                      rows={2}
                      onChange={(e) => {
                        const newProjs = [...projects];
                        newProjs[idx].desc = e.target.value;
                        setProjects(newProjs);
                      }}
                      className="w-full bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-gray-600 dark:text-gray-400 focus:outline-none resize-none"
                    />

                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        value={proj.tags.join(', ')}
                        placeholder="Tags (comma separated)"
                        onChange={(e) => {
                          const newProjs = [...projects];
                          newProjs[idx].tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                          setProjects(newProjs);
                        }}
                        className="flex-1 bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-600 dark:text-gray-400 focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 flex items-center gap-2 bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2">
                        <Github size={14} className="text-gray-500" />
                        <input
                          value={proj.github}
                          placeholder="GitHub URL"
                          onChange={(e) => {
                            const newProjs = [...projects];
                            newProjs[idx].github = e.target.value;
                            setProjects(newProjs);
                          }}
                          className="flex-1 bg-transparent border-none text-xs text-gray-600 dark:text-gray-400 focus:outline-none"
                        />
                      </div>
                      <div className="flex-1 flex items-center gap-2 bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2">
                        <ExternalLink size={14} className="text-gray-500" />
                        <input
                          value={proj.link}
                          placeholder="Live Link URL"
                          onChange={(e) => {
                            const newProjs = [...projects];
                            newProjs[idx].link = e.target.value;
                            setProjects(newProjs);
                          }}
                          className="flex-1 bg-transparent border-none text-xs text-gray-600 dark:text-gray-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setProjects([...projects, { title: 'New Project', desc: '', tags: [], link: '', github: '', image: '' }])}
                  className="w-full py-4 mt-2 rounded-xl border border-dashed border-gray-300 dark:border-white/20 text-gray-500 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                >
                  + Add New Project
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151518]">
                <button onClick={() => setIsManagingProjects(false)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black dark:text-white text-sm font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all">
                  <Check size={16} /> Save Projects
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
