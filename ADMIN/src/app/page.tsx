"use client";

import React from "react";
import { 
  Users, 
  BookOpen, 
  Briefcase, 
  Trophy,
  ArrowUpRight,
  TrendingUp,
  Activity
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Total Users", value: "1,248", change: "+12%", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Active Projects", value: "342", change: "+5%", icon: Briefcase, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "DSA Sheets", value: "15", change: "+2", icon: BookOpen, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Upcoming Contests", value: "4", change: "Sync Active", icon: Trophy, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome to the Codeyx Admin Control Panel.</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors shadow-sm flex items-center gap-2">
          <Activity size={18} />
          <span>System Status</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
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
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Recent Registrations</h3>
            <Link href="/users" className="text-sm text-primary hover:underline flex items-center">
              View all <ArrowUpRight size={14} className="ml-1" />
            </Link>
          </div>
          <div className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Platform Linked</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { name: "Lalit Modi", email: "lalit@example.com", platform: "LeetCode, GitHub", date: "Today", status: "Active" },
                  { name: "Rahul Singh", email: "rahul@example.com", platform: "GitHub", date: "Yesterday", status: "Active" },
                  { name: "Priya Sharma", email: "priya@example.com", platform: "None", date: "2 days ago", status: "Pending Sync" },
                ].map((user, i) => (
                  <tr key={i} className="bg-card hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{user.platform}</td>
                    <td className="px-6 py-4 text-muted-foreground">{user.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-2 rounded-md">
                  <BookOpen size={18} />
                </div>
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">Add New DSA Problem</span>
              </div>
              <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/10 text-purple-500 p-2 rounded-md">
                  <Briefcase size={18} />
                </div>
                <span className="font-medium text-foreground group-hover:text-purple-500 transition-colors">Review Projects</span>
              </div>
              <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-purple-500 transition-colors" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500/10 text-orange-500 p-2 rounded-md">
                  <Trophy size={18} />
                </div>
                <span className="font-medium text-foreground group-hover:text-orange-500 transition-colors">Sync Contests</span>
              </div>
              <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-orange-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
