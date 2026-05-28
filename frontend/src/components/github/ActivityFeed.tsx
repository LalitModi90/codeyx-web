"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Activity, GitCommit, GitPullRequest, AlertCircle, Star, GitFork, Zap } from 'lucide-react';

interface Props { events: any[]; repositories: any[]; }

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PushEvent:              { label: 'Pushed commits',     color: 'text-emerald-400', icon: GitCommit },
  PullRequestEvent:       { label: 'Pull request',       color: 'text-violet-400',  icon: GitPullRequest },
  IssuesEvent:            { label: 'Issue activity',     color: 'text-amber-400',   icon: AlertCircle },
  WatchEvent:             { label: 'Starred a repo',     color: 'text-yellow-400',  icon: Star },
  ForkEvent:              { label: 'Forked a repo',      color: 'text-blue-400',    icon: GitFork },
  CreateEvent:            { label: 'Created branch/repo',color: 'text-[#58A6FF]',   icon: Zap },
  ReleaseEvent:           { label: 'Published release',  color: 'text-emerald-400', icon: Zap },
  DeleteEvent:            { label: 'Deleted branch',     color: 'text-red-400',     icon: Zap },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export default function ActivityFeed({ events, repositories }: Props) {
  // Build activity from recent events + repo updates
  const recentActivity = events.slice(0, 20);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl border bg-[#0D1117]/80 border-[#30363D] backdrop-blur-md shadow-2xl space-y-5"
    >
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-[#58A6FF]" />
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-[var(--text-main)]">Recent Activity</h3>
        <span className="ml-auto text-[9px] text-gray-500 font-bold uppercase tracking-wider">Live Feed</span>
      </div>

      {recentActivity.length === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center gap-3">
          <Activity className="w-10 h-10 text-gray-700" />
          <p className="text-sm font-bold text-gray-500">No recent activity found</p>
          <p className="text-xs text-gray-600">Sync your GitHub profile to load activity data.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gradient-to-b from-[#58A6FF]/30 via-[#30363D] to-transparent" />
          <div className="space-y-4 pl-9">
            {recentActivity.map((ev: any, i: number) => {
              const cfg = TYPE_CONFIG[ev.type] || { label: ev.type, color: 'text-gray-400', icon: Activity };
              const Icon = cfg.icon;
              const repo = ev.repo?.name || '';
              const detail = ev.type === 'PushEvent' ? `${ev.payload?.commits?.length || 0} commit(s)` :
                             ev.type === 'PullRequestEvent' ? ev.payload?.action || '' :
                             ev.type === 'IssuesEvent' ? ev.payload?.action || '' : '';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="relative"
                >
                  {/* Dot */}
                  <div className={`absolute -left-9 top-1 w-5 h-5 rounded-full bg-[#0D1117] border-2 border-[#30363D] flex items-center justify-center`}>
                    <Icon className={`w-2.5 h-2.5 ${cfg.color}`} />
                  </div>
                  <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                        {detail && <span className="text-[9px] text-gray-500 ml-2">· {detail}</span>}
                        {repo && (
                          <p className="text-[10px] text-[#58A6FF] font-semibold mt-0.5">
                            {repo}
                          </p>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-600 flex-shrink-0">{timeAgo(ev.created_at || '')}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
