"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, CheckCircle, ExternalLink, Globe } from 'lucide-react';

interface Props { repositories: any[]; }

const PROVIDER_CONFIG: Record<string, { color: string; bg: string; dot: string }> = {
  'Vercel':         { color: 'text-white',      bg: 'bg-black/60 border-white/15',          dot: 'bg-white' },
  'Netlify':        { color: 'text-teal-300',   bg: 'bg-teal-900/30 border-teal-500/20',    dot: 'bg-teal-400' },
  'GitHub Pages':   { color: 'text-[#58A6FF]', bg: 'bg-blue-900/20 border-blue-500/20',    dot: 'bg-[#58A6FF]' },
  'Custom Hosting': { color: 'text-purple-300', bg: 'bg-purple-900/20 border-purple-500/20',dot: 'bg-purple-400' },
};

export default function DeploymentAnalytics({ repositories }: Props) {
  const deployed = repositories.filter(r => r.hasDeployment && r.deploymentProvider !== 'Source Only');
  const byProvider: Record<string, any[]> = {};
  deployed.forEach(r => {
    const p = r.deploymentProvider;
    if (!byProvider[p]) byProvider[p] = [];
    byProvider[p].push(r);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl border bg-[#0D1117]/80 border-[#30363D] backdrop-blur-md shadow-2xl space-y-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-[#58A6FF]" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-[var(--text-main)]">Deployment Analytics</h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black">
          <CheckCircle className="w-3 h-3" />
          {deployed.length} Live Deployments
        </div>
      </div>

      {deployed.length === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center gap-3">
          <Rocket className="w-10 h-10 text-gray-700" />
          <p className="text-sm font-bold text-gray-500">No deployments detected</p>
          <p className="text-xs text-gray-600">Add homepage URLs to your GitHub repos to show deployment info.</p>
        </div>
      ) : (
        <>
          {/* Provider breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(byProvider).map(([provider, repos]) => {
              const cfg = PROVIDER_CONFIG[provider] || { color: 'text-gray-400', bg: 'bg-white/[0.03] border-white/[0.08]', dot: 'bg-gray-400' };
              return (
                <div key={provider} className={`p-4 rounded-2xl border ${cfg.bg} flex items-center gap-3`}>
                  <div className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
                  <div>
                    <p className={`text-xs font-black ${cfg.color}`}>{provider}</p>
                    <p className="text-[9px] text-gray-500">{repos.length} project{repos.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Deployment list */}
          <div className="space-y-2">
            {deployed.slice(0, 8).map((repo: any) => {
              const cfg = PROVIDER_CONFIG[repo.deploymentProvider] || { color: 'text-gray-400', bg: 'bg-white/[0.02] border-white/[0.05]', dot: 'bg-gray-400' };
              return (
                <div key={repo.name} className={`flex items-center justify-between p-3 rounded-xl border ${cfg.bg} hover:bg-white/[0.04] transition-all`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${cfg.dot} flex-shrink-0`} />
                    <div>
                      <p className="text-xs font-black text-[var(--text-main)]">{repo.name}</p>
                      <p className={`text-[9px] font-bold ${cfg.color}`}>{repo.deploymentProvider}</p>
                    </div>
                  </div>
                  {repo.homepage && (
                    <a href={repo.homepage} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[9px] font-black text-gray-400 hover:text-white hover:border-white/20 transition-all">
                      <Globe className="w-3 h-3" />Visit
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
}
