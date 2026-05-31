"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, ShieldBan, ExternalLink, ShieldCheck, RefreshCw } from "lucide-react";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetching from leaderboard as it's a public endpoint returning all active users
      const res = await fetch("http://localhost:5005/api/leaderboard");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.leaderboard || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (id: string) => {
    // Optimistic UI update for banning/suspending
    setUsers(users.map(u => {
      if (u.userId === id) {
        return { ...u, isBanned: !u.isBanned };
      }
      return u;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage platform users, roles, and permissions.</p>
        </div>
        <button 
          onClick={fetchUsers}
          className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          Refresh Users
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or username..." 
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">User Info</th>
                <th className="px-6 py-4 font-semibold">Codeyx Score</th>
                <th className="px-6 py-4 font-semibold">Platforms Connected</th>
                <th className="px-6 py-4 font-semibold">Problems Solved</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <RefreshCw className="animate-spin inline mr-2" size={20} /> Loading real users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatarUrl || '/default-avatar.png'} 
                          alt="avatar" 
                          className="w-10 h-10 rounded-full bg-muted object-cover border border-border"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{user.fullName || 'Anonymous'}</span>
                          <span className="text-xs text-muted-foreground">@{user.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground font-bold">{user.codeyxScore}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.externalPlatforms?.length > 0 ? (
                          user.externalPlatforms.map((p: string, i: number) => (
                            <span key={i} className="px-2 py-1 text-[10px] uppercase font-bold bg-secondary/50 text-secondary-foreground rounded border border-border/50">
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-xs italic">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-foreground">{user.totalSolved}</span> problems
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1 w-fit ${
                        !user.isBanned ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {!user.isBanned ? <ShieldCheck size={12}/> : <ShieldBan size={12}/>}
                        {!user.isBanned ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={`http://localhost:3000/portfolio/${user.username}`} 
                          target="_blank"
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" 
                          title="View Public Profile"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button 
                          onClick={() => handleToggleStatus(user.userId)}
                          className={`p-2 rounded-lg transition-colors ${
                            !user.isBanned 
                              ? 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10' 
                              : 'text-red-500 hover:text-emerald-500 hover:bg-emerald-500/10'
                          }`}
                          title={!user.isBanned ? 'Suspend User' : 'Restore User'}
                        >
                          {!user.isBanned ? <ShieldBan size={16} /> : <ShieldCheck size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
