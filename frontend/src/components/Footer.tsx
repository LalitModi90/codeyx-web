"use client";
import React from 'react';
import { TerminalSquare, Instagram, Github, Linkedin, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--card-bg)]/50 pt-16 pb-8 px-4 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand & About */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="text-primary">
                <TerminalSquare size={28} />
              </div>
              <span className="font-bold text-2xl tracking-tight">Codeyx</span>
            </div>
            <p className="text-[var(--text-muted)] leading-relaxed">
              The ultimate portfolio and analytics platform for elite developers. Showcase your skills, track your progress, and stand out in the tech industry.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/mr.lalitmodi90/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[var(--border-color)] text-[var(--text-muted)] hover:text-white hover:bg-primary transition-all">
                <Instagram size={20} />
              </a>
              <a href="https://github.com/LalitModi90" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[var(--border-color)] text-[var(--text-muted)] hover:text-white hover:bg-primary transition-all">
                <Github size={20} />
              </a>
              <a href="https://www.linkedin.com/in/lalit-modi-874631302/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[var(--border-color)] text-[var(--text-muted)] hover:text-white hover:bg-primary transition-all">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Product</h4>
            <ul className="space-y-4 text-[var(--text-muted)]">
              <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/explore-projects" className="hover:text-primary transition-colors">Explore Projects</Link></li>
              <li><Link href="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Developer Dashboard</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Resources</h4>
            <ul className="space-y-4 text-[var(--text-muted)]">
              <li><Link href="/documentation" className="hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/community" className="hover:text-primary transition-colors">Community</Link></li>
              <li><Link href="/open-source" className="hover:text-primary transition-colors">Open Source</Link></li>
              <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Contact & Legal</h4>
            <ul className="space-y-4 text-[var(--text-muted)]">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary" />
                <a href="mailto:codeyx6@gmail.com" className="hover:text-primary transition-colors">codeyx6@gmail.com</a>
              </li>
              <li className="pt-2"><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--border-color)] text-center md:flex md:justify-between md:text-left items-center">
          <p className="text-[var(--text-muted)] text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Codeyx. Built for the elite developer community.
          </p>
          <div className="flex justify-center gap-6 text-sm text-[var(--text-muted)]">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
