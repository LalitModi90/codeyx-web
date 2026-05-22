"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, User, Layers, FileCode2, Trophy, Flame,
  BarChart3, Calendar, Award, ClipboardList, Settings, Zap, CheckCircle2
} from 'lucide-react';
import ConnectPlatformsModal from '../ConnectPlatformsModal';
import { useOnboarding } from '../OnboardingProvider';

export default function SheetsSidebar() {
  const pathname = usePathname();
  const { profile } = useOnboarding();

  const connectedPlatforms = [
    { name: 'LeetCode', key: 'leetcode', connected: !!profile?.platformHandles?.leetcode || true },
    { name: 'Codeforces', key: 'codeforces', connected: !!profile?.platformHandles?.codeforces || true },
    { name: 'CodeChef', key: 'codechef', connected: !!profile?.platformHandles?.codechef || true },
    { name: 'AtCoder', key: 'atcoder', connected: !!profile?.platformHandles?.atcoder || true },
    { name: 'GitHub', key: 'github', connected: !!profile?.platformHandles?.github || true },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-56 border-r border-white/5 bg-[#111113] flex-shrink-0 z-30">
      <div className="px-5 pt-6 pb-5 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF8A00] to-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(255,138,0,0.3)]">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">CodeSync</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto pt-2 scrollbar-none">
        {[
          { icon: Home, label: 'Overview', href: '/dashboard' },
          { icon: Layers, label: 'Platforms', href: '/dashboard/platforms/leetcode' },
          { icon: FileCode2, label: 'Explore Sheets', href: '/explore-sheets' },
          { icon: Trophy, label: 'Contests', href: '#' },
          { icon: Flame, label: 'Streaks', href: '#' },
          { icon: BarChart3, label: 'Analytics', href: '#' },
          { icon: User, label: 'Compare', href: '#' },
          { icon: Calendar, label: 'Calendar', href: '#' },
          { icon: Award, label: 'Achievements', href: '#' },
          { icon: ClipboardList, label: 'Resume Builder', href: '#' },
          { icon: Settings, label: 'Settings', href: '#' },
        ].map(item => {
          const isActive = pathname === item.href || (pathname.startsWith('/sheets') && item.href === '/explore-sheets');
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[11px] font-semibold transition-all ${
                isActive
                  ? 'bg-[#FF8A00]/10 text-[#FF8A00] border border-[#FF8A00]/20 shadow-[0_0_12px_rgba(255,138,0,0.08)]'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-white/5'
              }`}
            >
              <item.icon size={15} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 bg-[#0b0a12]">
        <p className="text-[9px] font-black uppercase tracking-wider text-gray-500 mb-3">Connected Platforms</p>
        <div className="space-y-2">
          {connectedPlatforms.map(p => (
            <Link
              href={p.key === 'github' ? '/dashboard/platforms/github' : '/dashboard/platforms/leetcode'}
              key={p.key}
              className="flex items-center justify-between text-[11px] group cursor-pointer hover:bg-white/[0.02] py-0.5 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${p.connected ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-gray-700'}`} />
                <span className="font-semibold text-gray-300 group-hover:text-white transition-colors">{p.name}</span>
              </div>
              <CheckCircle2 size={12} className="text-emerald-500" />
            </Link>
          ))}
        </div>
        <div className="mt-3.5">
          <ConnectPlatformsModal />
        </div>
      </div>
    </aside>
  );
}
