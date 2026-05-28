"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, LayoutDashboard, Flame, Target } from 'lucide-react';
import { SignedOut } from '@clerk/nextjs';
import Link from 'next/link';

export default function AnalyticsDashboard() {
  const [topUser, setTopUser] = React.useState<any>(null);

  React.useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api'}/leaderboard`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setTopUser(data.data[0]);
        }
      })
      .catch(err => console.error("Error fetching top user", err));
  }, []);
  return (
    <section id="analytics" className="py-20 px-4 bg-[var(--card-bg)]/50 border-y border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <LayoutDashboard className="text-primary" size={32} />
            Deep Analytics Dashboard
          </h2>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto">Visualize your progress, identify weak topics, and track your consistency across platforms.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Stat Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-2 bg-[var(--background)] border border-[var(--border-color)] rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 text-primary">
              <LineChart size={120} />
            </div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Target className="text-primary"/> 
              {topUser ? `${topUser.user}'s Codeyx Score (Global #1)` : 'Contest Ratings Graph'}
            </h3>
            <div className="h-48 flex items-end gap-2 mt-auto relative z-10 border-b border-l border-[var(--border-color)] p-4">
              {/* Mock Graph Bars */}
              {[40, 60, 45, 80, 65, 90, 75, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-primary/20 to-primary/80 rounded-t-sm" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </motion.div>

          {/* Side Stat Cards */}
          <div className="flex flex-col gap-6">
            <motion.div 
              whileHover={{ y: -5 }}
              className="flex-1 bg-[var(--background)] border border-[var(--border-color)] rounded-3xl p-6 flex flex-col justify-center"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-full bg-orange-500/10 text-orange-500"><Flame size={24}/></div>
                <span className="text-[var(--text-muted)] font-medium">Problems Solved</span>
              </div>
              <div className="text-4xl font-bold">{topUser ? topUser.problems.toLocaleString() : '284'} <span className="text-sm font-normal text-green-500 ml-2">Total</span></div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="flex-1 bg-[var(--background)] border border-[var(--border-color)] rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 group-hover:opacity-100 opacity-0 transition-opacity"></div>
              <h4 className="text-[var(--text-muted)] mb-2 font-medium">Radar Mastery</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Problem Solving</span><span>{topUser ? topUser.radarStats?.problemSolving || 0 : 78}%</span></div>
                  <div className="w-full h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${topUser ? topUser.radarStats?.problemSolving || 0 : 78}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Accuracy</span><span>{topUser ? topUser.radarStats?.accuracy || 0 : 62}%</span></div>
                  <div className="w-full h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
                    <div className="h-full bg-primary/70" style={{ width: `${topUser ? topUser.radarStats?.accuracy || 0 : 62}%` }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <SignedOut>
          <div className="mt-12 max-w-3xl mx-auto text-center flex flex-col items-center justify-center p-8 border border-orange-500/20 rounded-3xl bg-orange-500/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 group-hover:opacity-100 opacity-0 transition-opacity duration-700"></div>
            <h3 className="text-xl md:text-2xl font-bold text-[var(--text-main)] mb-3 relative z-10">Want to see your real-time global ranking?</h3>
            <p className="text-[var(--text-muted)] mb-8 max-w-lg relative z-10">You are currently viewing a sample dashboard. Login to view your personalized analytics, rankings, and to comment on daily challenges.</p>
            <Link href="/login">
              <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black text-sm font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] relative z-10">
                Login to Access Full Rankings
              </button>
            </Link>
          </div>
        </SignedOut>

      </div>
    </section>
  );
}
