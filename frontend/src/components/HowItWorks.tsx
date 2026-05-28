"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Link as LinkIcon, Trophy, Briefcase } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: "1. Create Your Profile",
    desc: "Sign up securely and start building your developer identity in seconds. No complex setup required."
  },
  {
    icon: LinkIcon,
    title: "2. Connect Platforms",
    desc: "Link your LeetCode, CodeChef, and GitHub accounts. We automatically sync your real-time stats, contest ratings, and repositories."
  },
  {
    icon: Trophy,
    title: "3. Climb the Leaderboard",
    desc: "Your rank is calculated using a unified rating system combining your LeetCode and CodeChef contest ratings. Solve problems, improve your ratings, and dominate the global rankings!"
  },
  {
    icon: Briefcase,
    title: "4. Showcase & Get Hired",
    desc: "Share your public portfolio link with recruiters. Let your competitive programming stats and open-source projects speak for themselves."
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Codeyx</span> Works
          </h2>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg">
            A simple, seamless workflow to aggregate your developer stats and rank on the global leaderboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Connecting Line for desktop */}
                {idx !== steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-full h-[2px] bg-gradient-to-r from-[var(--border-color)] to-transparent z-0" />
                )}
                
                <div className="w-24 h-24 rounded-full bg-[var(--card-bg)] border-2 border-[var(--border-color)] group-hover:border-primary flex items-center justify-center text-primary mb-6 relative z-10 transition-all shadow-lg group-hover:scale-110 group-hover:shadow-primary/20">
                  <Icon size={40} />
                </div>
                
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Info Box about Leaderboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-[var(--card-bg)] to-background border border-[var(--border-color)] max-w-4xl mx-auto relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          
          <h4 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <Trophy className="text-yellow-500" />
            How is the Leaderboard Ranking Calculated?
          </h4>
          <p className="text-[var(--text-muted)] text-lg leading-relaxed mb-6">
            The Codeyx Leaderboard uses a comprehensive algorithm to determine your global rank. It fetches your real-time data from multiple platforms and combines them:
          </p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
              <span className="text-[var(--text-muted)]"><strong className="text-white">LeetCode & CodeChef Ratings:</strong> Your contest ratings from both platforms are synced. Higher ratings significantly boost your position.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
              <span className="text-[var(--text-muted)]"><strong className="text-white">Problem Solving Consistency:</strong> The total number of problems you've solved across platforms contributes to your base score.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
              <span className="text-[var(--text-muted)]"><strong className="text-white">GitHub Activity:</strong> Your open-source contributions, stars, and commits are factored in to balance competitive programming with real-world development skills.</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
