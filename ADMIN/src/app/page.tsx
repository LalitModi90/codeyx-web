"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  Briefcase, 
  Trophy,
  ArrowUpRight,
  TrendingUp,
  Activity,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    sheets: 0,
    contests: 4
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, projectsRes, sheetsRes] = await Promise.all([
        fetch("http://localhost:5005/api/leaderboard?all=true").then(r => r.json().catch(() => ({}))),
        fetch("http://localhost:5005/api/projects/public/all/explore").then(r => r.json().catch(() => ({}))),
        fetch("http://localhost:5005/api/sheets").then(r => r.json().catch(() => ({})))
      ]);

      const usersCount = usersRes?.data?.length || 0;
      const projectsCount = projectsRes?.data?.length || 0;
      const sheetsCount = sheetsRes?.data?.length || 0;

      setStats(prev => ({ ...prev, users: usersCount, projects: projectsCount, sheets: sheetsCount }));
      
      // Use leaderboard data for recent users as a fallback
      if (usersRes?.data && Array.isArray(usersRes.data)) {
        setRecentUsers(usersRes.data.slice(0, 4));
      }

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleForceSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('http://localhost:5005/api/admin/force-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setSyncResult(data.message || 'Sync started!');
      setTimeout(() => setSyncResult(null), 5000);
    } catch (e) {
      setSyncResult('Failed to start sync');
    } finally {
      setIsSyncing(false);
    }
  };

  const statCards = [
    { title: "Total Users", value: stats.users, change: "+12%", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Active Projects", value: stats.projects, change: "+5%", icon: Briefcase, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "DSA Sheets", value: stats.sheets, change: "+2", icon: BookOpen, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Upcoming Contests", value: stats.contests, change: "Sync Active", icon: Trophy, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome to the Codeyx Admin Control Panel.</p>
        </div>
        <div className="flex items-center gap-3">
          {syncResult && (
            <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              ✅ {syncResult}
            </span>
          )}
          <button
            onClick={handleForceSync}
            disabled={isSyncing}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Force Sync All'}</span>
          </button>
          <button
            onClick={fetchDashboardData}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            {isLoading ? <Activity size={18} className="animate-pulse" /> : <Activity size={18} />}
            <span>System Status</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-foreground">
                    {isLoading ? <div className="h-8 w-16 bg-muted animate-pulse rounded mt-1"></div> : stat.value}
                  </h3>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm">
                <span className="text-emerald-500 font-medium flex items-center">
                  <TrendingUp size={14} className="mr-1" />
                  {stat.change}
                </span>
                <span className="text-muted-foreground ml-1">since last week</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Recent Activity (Users)</h3>
            <Link href="/users" className="text-sm text-primary hover:underline flex items-center">
              View all <ArrowUpRight size={14} className="ml-1" />
            </Link>
          </div>
          <div className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Codeyx Score</th>
                  <th className="px-6 py-3">Linked Platforms</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading real data...</td></tr>
                ) : recentUsers.map((user, i) => (
                  <tr key={i} className="bg-card hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={user.avatarUrl || '/default-avatar.png'} alt="" className="w-8 h-8 rounded-full border border-border" />
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{user.user || 'Anonymous'}</span>
                          <span className="text-xs text-muted-foreground">@{user.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground font-bold">{user.rating || 0}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {Object.keys(user.platformBreakdown || {}).filter(p => p !== 'codeyx').join(', ') || 'None'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        !user.isBanned ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {!user.isBanned ? 'Active' : 'Banned'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/sheets" className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-2 rounded-md">
                  <BookOpen size={18} />
                </div>
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">Manage DSA Sheets</span>
              </div>
              <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link href="/projects" className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/10 text-purple-500 p-2 rounded-md">
                  <Briefcase size={18} />
                </div>
                <span className="font-medium text-foreground group-hover:text-purple-500 transition-colors">Review Projects</span>
              </div>
              <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-purple-500 transition-colors" />
            </Link>
            <Link href="/contests" className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500/10 text-orange-500 p-2 rounded-md">
                  <Trophy size={18} />
                </div>
                <span className="font-medium text-foreground group-hover:text-orange-500 transition-colors">Sync Contests</span>
              </div>
              <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-orange-500 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
