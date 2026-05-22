"use client";
import React from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { Moon, Sun, TerminalSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { SignedIn, SignedOut } from '@clerk/nextjs';

export default function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="fixed w-full top-0 z-50 glass-nav border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="relative flex items-center h-16 w-[200px] cursor-pointer">
            <img 
              src={theme === 'dark' ? '/assets/logo-dark-them.png' : '/assets/logo-light-Them.png'} 
              alt="Coderyx Logo" 
              className="absolute left-0 top-1/2 -translate-y-1/2 mt-2 h-36 w-auto object-contain" 
            />
          </Link>

          {/* Center Menu */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-[var(--text-muted)]">
            {[
              { label: 'Leaderboard', href: '/leaderboard' },
              { label: 'Question Kit', href: '/explore-sheets' },
              { label: 'Projects', href: '/explore-projects' },
              { label: 'Contests', href: '/contests' },
              { label: 'Features', href: '#features' }
            ].map((item) => (
              <Link key={item.label} href={item.href} className="hover:text-primary transition-colors relative group">
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-[var(--border-color)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="hidden sm:flex items-center gap-3">
              <SignedOut>
                <Link href="/login" className="px-5 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--background)] text-sm font-medium hover:border-primary/50 transition-colors">
                  Log In
                </Link>
                <Link href="/signup" className="px-5 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 text-white text-sm font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all transform hover:-translate-y-0.5">
                  Sign Up
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/profile" className="px-5 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 text-black text-sm font-bold hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all transform hover:-translate-y-0.5 border border-transparent">
                  Go to Profile
                </Link>
              </SignedIn>
            </div>
          </div>
          
        </div>
      </div>
    </nav>
  );
}
