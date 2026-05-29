"use client";
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, CheckCircle2, ArrowUpRight, AlertCircle } from 'lucide-react';

interface Props { profile: any; languages: any[]; repositories: any[]; }

export default function AIInsights({ profile, languages, repositories }: Props) {
  const { strongestLang, mostActive, collaborationScore, consistencyLevel, insights, recommendations } = useMemo(() => {
    const top = [...languages].sort((a, b) => b.percentage - a.percentage);
    const strongestLang = top[0]?.language || 'Unknown';

    const bestRepo = [...repositories].sort((a, b) => b.stars - a.stars)[0];
    const mostActive = bestRepo?.name || 'N/A';
    const hasStars = bestRepo?.stars > 0;

    const totalRepos   = repositories.length;
    const deployedCount= repositories.filter(r => r.hasDeployment).length;

    const collaborationScore = Math.min(100, Math.round(
      ((profile.followers / 10) + (profile.totalForks * 2) + (profile.prsCount * 3)) / 3
    ));

    const streak = profile.streak || 0;
    const consistencyLevel = streak >= 30 ? 'Exceptional' : streak >= 14 ? 'Strong' : streak >= 7 ? 'Good' : streak >= 1 ? 'Developing' : 'Inactive';

    const insights = [
      {
        title: 'Strongest Technology',
        desc: `Dominant expertise in ${strongestLang} (${top[0]?.percentage || 0}% of codebase). Your repository analytics show high proficiency in this stack.`,
        type: 'strength',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/5 border-emerald-500/10',
      },
      {
        title: hasStars ? 'Top Repository' : 'Recent Activity',
        desc: hasStars 
          ? `"${mostActive}" is your most popular repository with ${bestRepo.stars} stars and ${bestRepo.forks} forks.`
          : `"${mostActive}" is your latest active repository. Try sharing your projects to gain community stars and feedback.`,
        type: 'active',
        color: 'text-[#58A6FF]',
        bg: 'bg-blue-500/5 border-blue-500/10',
      },
      {
        title: 'Contribution Consistency',
        desc: `${consistencyLevel} coding consistency with a ${streak}-day contribution streak. ${streak >= 7 ? 'Excellent habit formation detected.' : 'Increase daily coding to build streak momentum.'}`,
        type: streak >= 7 ? 'strength' : 'gap',
        color: streak >= 7 ? 'text-orange-400' : 'text-amber-400',
        bg: streak >= 7 ? 'bg-orange-500/5 border-orange-500/10' : 'bg-amber-500/5 border-amber-500/10',
      },
    ];

    const recommendations = [
      deployedCount < totalRepos / 2
        ? `Deploy more projects — only ${deployedCount}/${totalRepos} repos have live deployments. Consider adding Vercel or GitHub Pages.`
        : `Excellent deployment culture! ${deployedCount} live projects demonstrate production-ready engineering skills.`,
      profile.prsCount < 5
        ? `Increase open-source contributions. You have ${profile.prsCount} PRs; try contributing to other repositories.`
        : `Strong PR activity (${profile.prsCount} PRs). Keep collaborating to strengthen your open-source identity.`,
      top.length < 3
        ? `Diversify your tech stack — adding a new language or framework boosts your portfolio appeal.`
        : `Strong multi-tech portfolio (${top.length} technologies). ${strongestLang} is your defining strength.`,
    ];

    return { strongestLang, mostActive, collaborationScore, consistencyLevel, insights, recommendations };
  }, [profile, languages, repositories]);

  const hasData = profile.publicRepos > 0 || languages.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl border bg-[#0D1117]/80 border-[#30363D] backdrop-blur-md shadow-2xl space-y-6 relative overflow-hidden"
    >
      <div className="absolute -top-14 -right-14 w-44 h-44 bg-[#58A6FF]/6 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#58A6FF] animate-pulse" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-[var(--text-main)]">AI Developer Insights</h3>
        </div>
        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#58A6FF]/10 border border-[#58A6FF]/20 text-[#58A6FF] text-[8px] font-black uppercase tracking-widest">
          <Sparkles className="w-2.5 h-2.5" />Active Analysis
        </span>
      </div>

      {!hasData ? (
        <div className="h-32 flex flex-col items-center justify-center gap-2 text-gray-600">
          <Brain className="w-8 h-8 opacity-40" />
          <p className="text-xs font-bold">Insufficient data for AI analysis</p>
          <p className="text-[10px] text-gray-600">Sync your GitHub profile to generate insights.</p>
        </div>
      ) : (
        <>
          {/* Insight cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            {insights.map((ins, i) => (
              <div key={i} className={`p-4 rounded-xl border ${ins.bg} flex flex-col gap-2`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase tracking-wider ${ins.color}`}>{ins.title}</span>
                  {ins.type === 'gap' ? (
                    <AlertCircle className={`w-3.5 h-3.5 ${ins.color}`} />
                  ) : (
                    <ArrowUpRight className={`w-3.5 h-3.5 ${ins.color}`} />
                  )}
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">{ins.desc}</p>
              </div>
            ))}
          </div>

          {/* Collaboration score */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Collaboration Score</span>
              <span className="text-[10px] font-black text-[#58A6FF]">{collaborationScore}/100</span>
            </div>
            <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${collaborationScore}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-[#1F6FEB] to-[#58A6FF]"
              />
            </div>
          </div>

          {/* Recommendations */}
          <div className="relative z-10 space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Recommendations</p>
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-300 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
