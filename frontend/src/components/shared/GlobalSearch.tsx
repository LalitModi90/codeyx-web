import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Trophy, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{users: any[], contests: any[], projects: any[], sheets: any[]}>({ users: [], contests: [], projects: [], sheets: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], contests: [], projects: [], sheets: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:5005/api/search?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        // Local Sheets (Problems)
        const allSheets = [
          { id: 'striver-a2z', name: 'Striver A2Z DSA Sheet' },
          { id: 'love-babbar', name: 'Love Babbar Sheet' },
          { id: 'neetcode-150', name: 'Neetcode 150' },
          { id: 'blind-75', name: 'Blind 75' },
        ];
        const matchedSheets = allSheets.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));

        if (data.success) {
          setResults({
            ...data.data,
            sheets: matchedSheets
          });
        } else {
          setResults({ users: [], contests: [], projects: [], sheets: matchedSheets });
        }
      } catch (err) {
        console.error('Search error', err);
        // Fallback to just sheets if API fails
        const allSheets = [
          { id: 'striver-a2z', name: 'Striver A2Z DSA Sheet' },
          { id: 'love-babbar', name: 'Love Babbar Sheet' },
          { id: 'neetcode-150', name: 'Neetcode 150' },
          { id: 'blind-75', name: 'Blind 75' },
        ];
        setResults({ users: [], contests: [], projects: [], sheets: allSheets.filter(s => s.name.toLowerCase().includes(query.toLowerCase())) });
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative hidden md:flex" ref={searchRef}>
      <div className="flex items-center relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#A1A1AA] w-4 h-4 group-focus-within:text-[#FF8A00] transition-colors pointer-events-none" />
        
        <input
          type="text"
          className="w-64 bg-gray-50 dark:bg-[#101014] border border-gray-200 dark:border-white/5 rounded-xl py-2 pl-10 pr-14 text-xs text-black dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#FF8A00]/50 transition-all"
          placeholder="Search any problem or topic..."
          value={query}
          autoComplete="off"
          spellCheck="false"
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        
        {!loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-gray-500 dark:text-[#A1A1AA] font-bold border border-gray-200 dark:border-white/10 px-1.5 py-0.5 rounded pointer-events-none">Ctrl K</span>
        )}
        
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            <Loader2 size={14} className="text-[#FF8A00] animate-spin" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full mt-4 w-72 sm:w-80 -left-12 sm:left-0 bg-white dark:bg-[#111216] border border-gray-200 dark:border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden z-[99999]"
          >
            <div className="max-h-[300px] overflow-y-auto p-2">
              {results.users.length === 0 && results.contests.length === 0 && (!results.projects || results.projects.length === 0) && (!results.sheets || results.sheets.length === 0) && !loading ? (
                <div className="p-4 text-center text-xs text-gray-500">No results found for "{query}"</div>
              ) : (
                <>
                  {/* Users */}
                  {results.users.length > 0 && (
                    <div className="mb-3">
                      <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Users</div>
                      {results.users.map(user => (
                        <Link href={`/profile?id=${user.id}`} key={user.id} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                          <img src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.id} alt={user.name} className="w-6 h-6 rounded-full" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Contests */}
                  {results.contests.length > 0 && (
                    <div className="mb-3">
                      <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contests</div>
                      {results.contests.map(contest => (
                        <a href={contest.url} target="_blank" rel="noopener noreferrer" key={contest.id} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                          <div className="w-6 h-6 rounded-full bg-[#FF8A00]/10 flex items-center justify-center shrink-0">
                            <Trophy size={12} className="text-[#FF8A00]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{contest.name}</p>
                            <p className="text-[10px] text-gray-500 truncate">{contest.platform} • {new Date(contest.startTime).toLocaleDateString()}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Projects */}
                  {results.projects?.length > 0 && (
                    <div className="mb-3">
                      <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Projects</div>
                      {results.projects.map(project => (
                        <Link href={project.url} key={project.id} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 24 24" className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{project.name}</p>
                            <p className="text-[10px] text-gray-500 truncate">{project.techStack?.slice(0, 3).join(', ')}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Problem Sheets */}
                  {results.sheets?.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Problem Sheets</div>
                      {results.sheets.map(sheet => (
                        <Link href={`/sheets/${sheet.id}`} key={sheet.id} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                          <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 24 24" className="w-3 h-3 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{sheet.name}</p>
                            <p className="text-[10px] text-gray-500 truncate">Curated coding problems</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="p-2 border-t border-gray-200 dark:border-white/10 text-center">
              <span className="text-[10px] text-gray-400 font-medium">Press <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">Enter</kbd> to view all results</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
