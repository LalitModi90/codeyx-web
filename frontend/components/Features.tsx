"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Layers, CheckCircle, BarChart3, Database, PenTool, Lightbulb } from 'lucide-react';

const features = [
  { icon: Layers, title: "Workspace", desc: "A unified environment to code, track, and manage your progress seamlessly." },
  { icon: Database, title: "Sheet Tracker", desc: "Import and track popular coding sheets like Striver's A2Z or NeetCode 150." },
  { icon: PenTool, title: "Enhanced Notes", desc: "Rich text editor to jot down intuitions and algorithmic approaches." },
  { icon: BarChart3, title: "Analytics", desc: "Detailed insights into your problem-solving speed and accuracy." },
  { icon: CheckCircle, title: "Heatmap Tracking", desc: "Keep your streak alive with our visual daily submission heatmap." },
  { icon: Lightbulb, title: "Smart Insights", desc: "AI-driven recommendations on what topics you need to focus on next." },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Powerful Features for <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Elite Developers</span></h2>
        <p className="text-[var(--text-muted)] max-w-2xl mx-auto">Everything you need to level up your competitive programming and interview preparation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-primary/50 transition-all card-hover"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
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
