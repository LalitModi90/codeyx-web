"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderGit2, Star, GitFork, ExternalLink, Eye, Clock, Lock, Globe, Search } from 'lucide-react';

interface Repo { name: string; description: string; stars: number; forks: number; watchers: number; language: string; visibility: string; homepage: string; hasDeployment: boolean; deploymentProvider: string; updatedAt: string; topics: string[]; }
interface Props { repositories: Repo[]; }

const LANG_COLORS: Record<string, string> = {
  TypeScript:'#3178c6', JavaScript:'#f1e05a', Python:'#3572A5', Go:'#00ADD8',
  Java:'#b07219', 'C++':'#f34b7d', Rust:'#dea584', HTML:'#e34c26', CSS:'#563d7c',
  Vue:'#41b883', Ruby:'#701516', 'C#':'#178600', Dart:'#00B4AB', Shell:'#89e051',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}yr ago`;
}

export default function PinnedRepositories({ repositories }: Props) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'stars' | 'updated' | 'forks'>('stars');

  const filtered = repositories
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || (r.description || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'stars' ? b.stars - a.stars : sortBy === 'forks' ? b.forks - a.forks : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 12);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search repositories..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#0D1117] border border-[#30363D] rounded-xl focus:outline-none focus:border-[#58A6FF] transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['stars', 'forks', 'updated'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                sortBy === s ? 'bg-[#58A6FF]/20 border border-[#58A6FF]/30 text-[#58A6FF]' : 'bg-white/[0.03] border border-white/[0.06] text-gray-500 hover:text-white'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 rounded-3xl border bg-[#0D1117]/80 border-[#30363D] flex flex-col items-center justify-center gap-3">
          <FolderGit2 className="w-10 h-10 text-gray-700" />
          <p className="text-sm font-bold text-gray-500">No repositories found</p>
          <p className="text-xs text-gray-600">Sync your GitHub profile to load repository data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((repo, i) => (
            <motion.div
              key={repo.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group p-4 rounded-2xl border bg-[#0D1117]/80 border-[#30363D] hover:border-[#58A6FF]/30 hover:shadow-[0_0_20px_rgba(88,166,255,0.05)] transition-all duration-300 relative overflow-hidden flex flex-col"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#58A6FF]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start justify-between gap-2 mb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-[#58A6FF] flex-shrink-0" />
                  <a
                    href={`https://github.com/${repo.name}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-black text-[#58A6FF] hover:underline truncate"
                  >
                    {repo.name}
                  </a>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {repo.visibility === 'Private' ? (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Lock className="w-2 h-2" />Private
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Globe className="w-2 h-2" />Public
                    </span>
                  )}
                  {repo.hasDeployment && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-black uppercase bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/20 animate-pulse">
                      Live
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-gray-500 leading-relaxed mb-3 flex-1 relative z-10 line-clamp-2">
                {repo.description || 'No description available.'}
              </p>

              {/* Topics */}
              {repo.topics && repo.topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3 relative z-10">
                  {repo.topics.slice(0, 3).map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded text-[7px] font-semibold bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/15">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between gap-2 relative z-10">
                <div className="flex items-center gap-3">
                  {repo.language && (
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: LANG_COLORS[repo.language] || '#8b949e' }} />
                      <span className="text-[9px] text-gray-500 font-medium">{repo.language}</span>
                    </div>
                  )}
                  <span className="flex items-center gap-1 text-[9px] text-gray-500">
                    <Star className="w-2.5 h-2.5 text-yellow-400" />{repo.stars}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] text-gray-500">
                    <GitFork className="w-2.5 h-2.5" />{repo.forks}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {repo.hasDeployment && repo.homepage && (
                    <a href={repo.homepage} target="_blank" rel="noreferrer"
                      className="p-1 rounded-lg hover:bg-[#58A6FF]/10 text-[#58A6FF] transition-all">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <span className="flex items-center gap-1 text-[8px] text-gray-600">
                    <Clock className="w-2.5 h-2.5" />{timeAgo(repo.updatedAt)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
