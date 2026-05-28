"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Globe, GitFork, Star } from 'lucide-react';

interface Props { organizations: any[]; repositories: any[]; profile: any; }

export default function OSSContributions({ organizations, repositories, profile }: Props) {
  const ossRepos = repositories.filter(r => r.visibility === 'Public' && r.stars > 0);
  const totalOSSStars = ossRepos.reduce((acc: number, r: any) => acc + r.stars, 0);
  const totalForks = ossRepos.reduce((acc: number, r: any) => acc + r.forks, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl border bg-[#0D1117]/80 border-[#30363D] backdrop-blur-md shadow-2xl space-y-6"
    >
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-emerald-400" />
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-[var(--text-main)]">Open Source Contributions</h3>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'OSS Repos',    value: ossRepos.length,  icon: GitFork, color: 'text-emerald-400', bg: 'border-emerald-500/20 bg-emerald-500/5' },
          { label: 'OSS Stars',    value: totalOSSStars,    icon: Star,    color: 'text-yellow-400',  bg: 'border-yellow-500/20 bg-yellow-500/5' },
          { label: 'Organizations',value: organizations.length, icon: Users, color: 'text-[#58A6FF]', bg: 'border-blue-500/20 bg-blue-500/5' },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-2xl border ${s.bg} flex flex-col gap-1 items-center text-center`}>
            <s.icon className={`w-4 h-4 ${s.color} mb-1`} />
            <span className={`text-xl font-black ${s.color}`}>{s.value.toLocaleString()}</span>
            <span className="text-[9px] text-gray-500 uppercase tracking-wider">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Organizations */}
      {organizations.length > 0 ? (
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3">Organizations</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {organizations.map((org: any, i: number) => (
              <motion.div
                key={org.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-[#30363D] bg-white/[0.02] hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] transition-all"
              >
                {org.avatar ? (
                  <img src={org.avatar} alt={org.name} className="w-8 h-8 rounded-lg border border-[#30363D] object-cover flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-[#161B22] border border-[#30363D] flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-gray-500" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-black text-[var(--text-main)] truncate">{org.name}</p>
                  {org.description && <p className="text-[9px] text-gray-500 truncate">{org.description}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-[#30363D] bg-white/[0.01] flex items-center gap-3">
          <Users className="w-5 h-5 text-gray-700" />
          <p className="text-xs text-gray-500 font-medium">No organization memberships found.</p>
        </div>
      )}

      {/* OSS repos */}
      {ossRepos.length > 0 && (
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3">Top OSS Repositories</p>
          <div className="space-y-2">
            {ossRepos.slice(0, 5).map((r: any) => (
              <div key={r.name} className="flex items-center justify-between p-3 rounded-xl border border-[#30363D] bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                <span className="text-xs font-bold text-[#58A6FF]">{r.name}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[10px] text-yellow-400 font-bold">
                    <Star className="w-3 h-3" />{r.stars}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-500">
                    <GitFork className="w-3 h-3" />{r.forks}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
