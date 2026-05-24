"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, FolderGit2, ArrowRight } from 'lucide-react';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';

const projects = [
  {
    title: "Algorithm Visualizer",
    desc: "Interactive visualization tool for sorting and pathfinding algorithms.",
    tags: ["React", "TypeScript", "Tailwind"],
    featured: true,
  },
  {
    title: "Code Collab Editor",
    desc: "Real-time collaborative code editor with WebSockets.",
    tags: ["Next.js", "Node.js", "Socket.io"],
    featured: false,
  },
  {
    title: "LeetCode Stats Card",
    desc: "Dynamically generated GitHub readme stats for LeetCode profiles.",
    tags: ["Vercel", "Go", "GraphQL"],
    featured: false,
  }
];

export default function Projects() {
  return (
    <section id="projects" className="py-20 px-4 max-w-7xl mx-auto">
      <div className="mb-12 text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center md:justify-start gap-3">
          <FolderGit2 className="text-primary" size={32} />
          Featured Projects
        </h2>
        <p className="text-[var(--text-muted)] max-w-2xl">A showcase of top-tier full-stack applications and open-source contributions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className={`group relative bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 overflow-hidden card-hover flex flex-col ${proj.featured ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-br from-[var(--card-bg)] to-primary/5' : ''}`}
          >
            {/* Glow effect on hover in dark mode */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FolderGit2 size={24} />
              </div>
              <div className="flex gap-2 items-center">
                <SignedIn>
                  <button className="p-2 rounded-full hover:bg-[var(--border-color)] transition-colors text-[var(--text-muted)] hover:text-white" title="View Source">
                    <Github size={20} />
                  </button>
                  <button className="p-2 rounded-full hover:bg-[var(--border-color)] transition-colors text-[var(--text-muted)] hover:text-white" title="Live Demo">
                    <ExternalLink size={20} />
                  </button>
                </SignedIn>
                <SignedOut>
                  <Link href="/login">
                    <button className="text-xs font-bold text-orange-500 hover:bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/30 transition-colors">
                      Login to Access
                    </button>
                  </Link>
                </SignedOut>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2 relative z-10">{proj.title}</h3>
            <p className="text-[var(--text-muted)] mb-6 flex-grow relative z-10">{proj.desc}</p>
            
            <div className="flex flex-wrap gap-2 relative z-10">
              {proj.tags.map(tag => (
                <span key={tag} className="text-xs font-medium px-3 py-1 rounded-full bg-[var(--border-color)] text-[var(--text-main)]">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link href="/explore-projects" className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-primary/50 text-[var(--text-main)] font-bold transition-all hover:shadow-[0_0_20px_rgba(255,138,0,0.15)]">
          Explore All Community Projects 
          <ArrowRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
