"use client";
import React, { useState, useEffect } from 'react';
import { animate } from 'framer-motion';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Layers, Star, GitFork, Eye, FolderGit2, TrendingUp } from 'lucide-react';

const AnimatedCounter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const ctrl = animate(0, value, { duration: 1.4, ease: 'easeOut', onUpdate: v => setCount(Math.floor(v)) });
    return () => ctrl.stop();
  }, [value]);
  return <>{count.toLocaleString()}</>;
};


interface Props { profile: any; repositories: any[]; }

const Card = ({ label, value, icon: Icon, color, sub }: any) => (
  <div className={`p-4 rounded-2xl border bg-white/[0.02] border-white/[0.06] hover:border-${color}/20 transition-all`}>
    <div className="flex items-center justify-between mb-2">
      <span className={`text-[9px] font-black uppercase tracking-widest text-${color}`}>{label}</span>
      <Icon className={`w-3.5 h-3.5 text-${color}`} />
    </div>
    <p className="text-2xl font-black text-[var(--text-main)] leading-none"><AnimatedCounter value={value} /></p>
    {sub && <p className="text-[9px] text-gray-600 mt-1.5">{sub}</p>}
  </div>
);

export default function RepositoryAnalytics({ profile, repositories }: Props) {
  const publicCount  = repositories.filter(r => r.visibility === 'Public').length;
  const privateCount = repositories.filter(r => r.visibility === 'Private').length;
  const withDeployments = repositories.filter(r => r.hasDeployment).length;

  // Top repos by stars for mini chart
  const topRepos = [...repositories]
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 8)
    .map(r => ({ name: r.name.slice(0, 10), stars: r.stars }));

  const COLORS = ['#58A6FF', '#79B8FF', '#388BFD', '#1F6FEB', '#0550AE', '#033D8B', '#0A3069', '#0D2D6B'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl border bg-[#0D1117]/80 border-[#30363D] backdrop-blur-md shadow-2xl space-y-5"
    >
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-[#58A6FF]" />
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-[var(--text-main)]">Repository Analytics</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card label="Total Repos"   value={profile.publicRepos}  icon={FolderGit2} color="blue-400"   sub={`${publicCount} public · ${privateCount} private`} />
        <Card label="Total Stars"   value={profile.totalStars}   icon={Star}       color="yellow-400" sub="Across all repos" />
        <Card label="Total Forks"   value={profile.totalForks}   icon={GitFork}    color="purple-400" sub="Community forks" />
        <Card label="Deployments"   value={withDeployments}      icon={Eye}        color="emerald-400"sub="Live projects" />
      </div>

      {topRepos.length > 0 && (
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3">Top Repos by Stars</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRepos} margin={{ top: 0, right: 0, bottom: 0, left: -24 }}>
                <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#8b949e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 8, fill: '#8b949e' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: 8, fontSize: 10 }}
                  labelStyle={{ color: '#f0f6fc' }}
                  itemStyle={{ color: '#58A6FF' }}
                />
                <Bar dataKey="stars" radius={[4, 4, 0, 0]}>
                  {topRepos.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </motion.div>
  );
}
