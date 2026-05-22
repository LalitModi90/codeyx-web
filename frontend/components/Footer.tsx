"use client";
import React from 'react';
import { TerminalSquare, Twitter, Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--card-bg)]/50 pt-16 pb-8 px-4 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="flex items-center gap-2 mb-6">
          <div className="text-primary">
            <TerminalSquare size={28} />
          </div>
          <span className="font-bold text-2xl tracking-tight">Coderyx</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 mb-8 text-[var(--text-muted)] font-medium">
          <a href="#" className="hover:text-primary transition-colors">FAQ</a>
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Contact Us</a>
        </div>

        <div className="flex gap-4 mb-8">
          <a href="#" className="p-2 rounded-full bg-[var(--border-color)] text-[var(--text-muted)] hover:text-white hover:bg-primary transition-all">
            <Twitter size={20} />
          </a>
          <a href="#" className="p-2 rounded-full bg-[var(--border-color)] text-[var(--text-muted)] hover:text-white hover:bg-primary transition-all">
            <Github size={20} />
          </a>
          <a href="#" className="p-2 rounded-full bg-[var(--border-color)] text-[var(--text-muted)] hover:text-white hover:bg-primary transition-all">
            <Linkedin size={20} />
          </a>
        </div>

        <div className="text-[var(--text-muted)] text-sm text-center">
          &copy; {new Date().getFullYear()} Coderyx. Built for the elite developer community.
        </div>
      </div>
    </footer>
  );
}
