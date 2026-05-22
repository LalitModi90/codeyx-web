import React from 'react';
import { Search, Briefcase, Moon, Sun, Bird } from 'lucide-react';
import { useTheme } from '../ThemeProvider';

export default function SheetsTopHeader() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 px-6 border-b border-white/5 flex items-center justify-between backdrop-blur-md z-50 shrink-0 sticky top-0 bg-[#09090B]/80">
      <div className="flex-1 flex items-center max-w-lg relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] w-4 h-4 group-focus-within:text-[#FF8A00] transition-colors" />
        <input 
          type="text"
          placeholder="Search any coding sheet..."
          className="w-full bg-[#101014] border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-[#FAFAFA] placeholder-[#A1A1AA] focus:outline-none focus:border-[#FF8A00]/50 focus:ring-1 focus:ring-[#FF8A00]/50 transition-all"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF8A00]/10 text-[#FF8A00] border border-[#FF8A00]/20 hover:bg-[#FF8A00]/20 transition-all">
          <Briefcase size={14} />
          Company Wise Kit
        </button>
        
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl border border-white/5 text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-white/5 transition-all"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="w-9 h-9 rounded-xl bg-[#101014] border border-white/5 flex items-center justify-center text-[#FF8A00] shadow-[0_0_15px_rgba(255,138,0,0.1)]">
          <Bird size={20} />
        </div>
      </div>
    </header>
  );
}
