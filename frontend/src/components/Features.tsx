"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Globe2, Trophy, Search, BarChart3, UserCircle, LayoutGrid, Unlock, Lock } from 'lucide-react';

const features = [
  { 
    icon: Globe2, 
    title: "Public Portfolios", 
    desc: "View stunning developer portfolios, aggregated analytics, and skills without creating an account.", 
    access: "Public (No Login)" 
  },
  { 
    icon: Trophy, 
    title: "Global Leaderboard", 
    desc: "Check out top developers on the platform, their ranks, and competitive stats instantly.", 
    access: "Public (No Login)" 
  },
  { 
    icon: Search, 
    title: "Explore Projects", 
    desc: "Discover and search through real-world projects showcased by our developer community.", 
    access: "Public (No Login)" 
  },
  { 
    icon: BarChart3, 
    title: "Real-time Analytics", 
    desc: "Sync and track your LeetCode, CodeChef, and GitHub statistics in one unified dashboard.", 
    access: "Requires Login" 
  },
  { 
    icon: UserCircle, 
    title: "Custom Profile Builder", 
    desc: "Create your own professional portfolio with automatic skill tagging and project imports.", 
    access: "Requires Login" 
  },
  { 
    icon: LayoutGrid, 
    title: "Project Management", 
    desc: "Seamlessly import GitHub repositories and configure visibility to showcase your best work.", 
    access: "Requires Login" 
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">
          Everything You Need, <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Open or Secured</span>
        </h2>
        <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
          Explore the community without logging in, or create an account to start building your own professional developer portfolio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          const isPublic = feat.access.includes("Public");
          
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-primary/50 transition-all card-hover overflow-hidden"
            >
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-background/50 backdrop-blur-sm"
                   style={{ 
                     borderColor: isPublic ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                     color: isPublic ? '#22c55e' : '#ef4444'
                   }}>
                {isPublic ? <Unlock size={12} /> : <Lock size={12} />}
                {feat.access}
              </div>
              
              <div className="w-14 h-14 mt-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">{feat.desc}</p>
            </motion.div>
          )
        })}
      </div>
    </section>
  );
}
