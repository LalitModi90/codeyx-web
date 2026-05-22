"use client";
import React, { useEffect, useState } from 'react';
import TopNavbar from '../../components/shared/TopNavbar';
import { 
  Activity, Code2, Target, CheckCircle2, Bookmark, Box, Play, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function WorkspacePage() {
  const [activeSheets, setActiveSheets] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activeSheets');
      if (saved) {
        setActiveSheets(JSON.parse(saved));
      }
      
      const handleWorkspaceUpdate = (e: any) => {
        if (e.detail) {
          setActiveSheets(e.detail);
        }
      };
      window.addEventListener('workspaceUpdated', handleWorkspaceUpdate);
      return () => window.removeEventListener('workspaceUpdated', handleWorkspaceUpdate);
    }
  }, []);

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const newSheets = activeSheets.filter(s => s.id !== id);
    setActiveSheets(newSheets);
    localStorage.setItem('activeSheets', JSON.stringify(newSheets));
    window.dispatchEvent(new CustomEvent('workspaceUpdated', { detail: newSheets }));
  };

  const getSheetIcon = (id: string) => {
    switch(id) {
      case 'striver-a2z': return { icon: Code2, color: 'from-orange-500 to-amber-500', text: 'text-orange-500' };
      case 'love-babbar': return { icon: Target, color: 'from-emerald-500 to-green-500', text: 'text-emerald-500' };
      case 'neetcode-150': return { icon: Box, color: 'from-blue-500 to-cyan-500', text: 'text-blue-500' };
      default: return { icon: Code2, color: 'from-purple-500 to-pink-500', text: 'text-purple-500' };
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans selection:bg-[#FF8A00]/30 pb-20">
      <TopNavbar />

      <main className="max-w-[1600px] mx-auto px-6 pt-10">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white mb-3">My Workspace</h1>
          <p className="text-gray-400">Track your progress and continue where you left off.</p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#111216] border border-white/5 rounded-2xl p-6 flex items-center gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8A00]/5 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none" />
            <div className="w-14 h-14 rounded-full bg-[#FF8A00]/10 border border-[#FF8A00]/20 flex items-center justify-center">
              <Activity size={24} className="text-[#FF8A00]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 mb-1">Active Sheets</p>
              <p className="text-3xl font-black text-white">{activeSheets.length}</p>
            </div>
          </div>
          
          <div className="bg-[#111216] border border-white/5 rounded-2xl p-6 flex items-center gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none" />
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 size={24} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 mb-1">Total Solved</p>
              <p className="text-3xl font-black text-white">564</p>
            </div>
          </div>

          <div className="bg-[#111216] border border-white/5 rounded-2xl p-6 flex items-center gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none" />
            <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Target size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 mb-1">Daily Streak</p>
              <p className="text-3xl font-black text-white">12 <span className="text-sm text-gray-500 font-medium">Days</span></p>
            </div>
          </div>
        </div>

        {/* Sheets Grid */}
        <h2 className="text-xl font-bold text-white mb-6">Continue Learning</h2>
        
        {activeSheets.length === 0 ? (
          <div className="bg-[#111216] border border-dashed border-white/10 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Bookmark size={32} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No active sheets yet</h3>
            <p className="text-gray-400 mb-8 max-w-sm">Explore our curated collection of coding sheets and add them to your workspace to start tracking your progress.</p>
            <Link href="/explore-sheets" className="bg-[#FF8A00] hover:bg-orange-500 text-white rounded-xl px-8 py-3 text-sm font-bold shadow-[0_4px_20px_rgba(255,138,0,0.3)] transition-all active:scale-95">
              Explore Sheets
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {activeSheets.map((sheet, i) => {
              const theme = getSheetIcon(sheet.id);
              const Icon = theme.icon;
              return (
                <Link href={`/sheets/${sheet.id}`} key={sheet.id} className="block h-full">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-[#111216] border border-white/5 hover:border-white/10 rounded-[20px] p-6 relative overflow-hidden group transition-all duration-300 shadow-lg flex flex-col h-full cursor-pointer"
                  >
                    {/* Accent Line */}
                    <div className="absolute top-0 left-0 h-[2px] bg-[#FF8A00] shadow-[0_0_10px_#FF8A00] transition-all duration-500" style={{ width: `${sheet.progress}%` }} />
                    
                    <div className="flex gap-4 mb-5">
                      <div className={`w-14 h-14 rounded-[14px] bg-gradient-to-br ${theme.color} p-[1px] flex-shrink-0 shadow-lg`}>
                        <div className="w-full h-full bg-[#111216]/90 rounded-[13px] flex items-center justify-center backdrop-blur-sm">
                          <Icon size={22} className={theme.text} />
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="font-bold text-base text-white mb-1.5 leading-tight group-hover:text-[#FF8A00] transition-colors">{sheet.name}</h3>
                      </div>
                      
                      <button onClick={(e) => handleRemove(e, sheet.id)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-400">Progress</span>
                        <span className="text-sm font-black text-white">{sheet.progress}%</span>
                      </div>
                      
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-6">
                        <div className="h-full transition-all duration-1000 bg-gradient-to-r from-orange-600 to-[#FF8A00] shadow-[0_0_10px_#FF8A00]" style={{ width: `${sheet.progress}%` }} />
                      </div>

                      <button className="w-full py-3 rounded-xl bg-white/5 group-hover:bg-[#FF8A00] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(255,138,0,0.3)]">
                        <Play size={14} className="group-hover:fill-current" /> Continue Practice
                      </button>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
        
      </main>
    </div>
  );
}
