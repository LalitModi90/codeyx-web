"use client";
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import TopNavbar from '../../components/shared/TopNavbar';
import { 
  Sparkles, Code2, Heart, Zap, Target, Briefcase, Brain, Box,
  Play, CheckCircle2, Activity, Bookmark, ChevronDown, Flame
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { progressService } from '../../services/progress.service';
import { sheetsService } from '../../services/sheets.service';

const tabs = ['All Sheets', 'Company Wise', 'Popular', 'Quick Revision', 'Complete DSA', 'Topic Specific', 'Competitive'];

const iconMap: Record<string, any> = {
  Code2, Heart, Zap, Target, Briefcase, Brain, Box
};

export default function ExploreSheetsPage() {
  const [activeTab, setActiveTab] = useState('All Sheets');
  const [levelFilter, setLevelFilter] = useState('All Levels');
  const [topicFilter, setTopicFilter] = useState('All Topics');
  const [sortFilter, setSortFilter] = useState('Sort By');
  const { isSignedIn, isLoaded, user } = useUser();

  const { data: allProgress = [] } = useQuery({
    queryKey: ['allProgress', user?.id],
    queryFn: async () => {
      const response: any = await progressService.getAllProgress();
      return response?.data || response || [];
    },
    enabled: isLoaded && !!isSignedIn,
    refetchOnMount: true,
    staleTime: 30000,
  });

  const { data: sheetsData = [], isLoading: sheetsLoading } = useQuery({
    queryKey: ['allSheets'],
    queryFn: async () => {
      const response: any = await sheetsService.getAllSheets();
      return response?.data || response || [];
    },
    staleTime: 60000,
  });

  const progressMap = new Map(
    (allProgress as any[]).map((p: any) => [p.slug, p])
  );



  let filteredSheets = [...(sheetsData as any[])].filter((sheet: any) => {
    let matchesTab = true;
    if (activeTab !== 'All Sheets') {
      if (activeTab === 'Popular') {
        matchesTab = (sheet.rating && sheet.rating >= 4.5) || sheet.tags?.includes('Popular');
      } else {
        matchesTab = sheet.tags?.includes(activeTab) || sheet.title?.toLowerCase().includes(activeTab.toLowerCase());
      }
    }
    
    let matchesLevel = true;
    if (levelFilter !== 'All Levels') {
       matchesLevel = sheet.tags?.includes(levelFilter) || sheet.description?.includes(levelFilter);
    }
    
    let matchesTopic = true;
    if (topicFilter !== 'All Topics') {
       matchesTopic = sheet.tags?.includes(topicFilter) || sheet.title?.includes(topicFilter);
    }
    
    return matchesTab && matchesLevel && matchesTopic;
  });

  if (sortFilter === 'Most Popular') {
    filteredSheets.sort((a, b) => (b.followers || 0) - (a.followers || 0));
  } else if (sortFilter === 'Highest Rated') {
    filteredSheets.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortFilter === 'Newest') {
    filteredSheets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#FAFAFA] font-sans overflow-x-hidden selection:bg-[#FF8A00]/30 pb-20">
      <TopNavbar />
      
      <main className="max-w-[1400px] mx-auto px-6 pt-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-[32px] font-extrabold text-white mb-2 flex items-center gap-2">
              Explore Sheets <Sparkles size={24} className="text-[#FF8A00]" />
            </h1>
            <p className="text-sm text-gray-400">
              Curated roadmaps and problem collections to accelerate your coding journey.
            </p>
          </div>
          
          {/* Personalized for You Card */}
          <div className="bg-gradient-to-r from-indigo-950/40 to-purple-900/20 border border-purple-500/20 rounded-2xl p-4 flex items-center justify-between w-full md:w-[320px] relative overflow-hidden shadow-[0_10px_30px_rgba(88,28,135,0.1)]">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-600/20 blur-[30px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-xs font-bold text-white mb-1.5">Personalized for You</h3>
              <p className="text-[10px] text-gray-400 mb-3">Based on your progress and weak topics</p>
              <button className="text-[10px] font-bold text-[#FF8A00] border border-[#FF8A00]/30 bg-[#FF8A00]/10 hover:bg-[#FF8A00]/20 px-4 py-1.5 rounded-lg transition-colors">
                View Recommendations
              </button>
            </div>
            <div className="relative z-10 -mr-2">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500/30 to-indigo-500/10 border border-purple-400/30 rounded-2xl rotate-12 flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <Box size={20} className="text-purple-300 transform -rotate-12" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full lg:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-[#FF8A00] text-white shadow-[0_0_15px_rgba(255,138,0,0.4)]' 
                    : 'bg-transparent text-gray-400 border border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-[#111216] border border-white/5 hover:bg-white/[0.02] px-4 py-2.5 rounded-xl text-xs font-medium text-gray-400 transition-colors cursor-pointer outline-none appearance-none"
            >
              <option value="All Levels">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="bg-[#111216] border border-white/5 hover:bg-white/[0.02] px-4 py-2.5 rounded-xl text-xs font-medium text-gray-400 transition-colors cursor-pointer outline-none appearance-none"
            >
              <option value="All Topics">All Topics</option>
              <option value="DSA">DSA</option>
              <option value="System Design">System Design</option>
              <option value="Web Dev">Web Dev</option>
            </select>
            <select
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
              className="bg-[#111216] border border-white/5 hover:bg-white/[0.02] px-4 py-2.5 rounded-xl text-xs font-medium text-gray-400 transition-colors cursor-pointer outline-none appearance-none"
            >
              <option value="Sort By">Sort By</option>
              <option value="Most Popular">Most Popular</option>
              <option value="Highest Rated">Highest Rated</option>
              <option value="Newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {sheetsLoading && (
          <div className="bg-[#111216]/40 border border-white/5 rounded-3xl p-16 flex flex-col items-center justify-center mb-12">
            <div className="w-8 h-8 border-2 border-[#FF8A00] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-gray-400">Loading sheets...</p>
          </div>
        )}



        {/* Grid Section */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white mb-6">All Sheets</h2>
          
          {sheetsLoading ? (
            <div className="bg-[#111216]/40 border border-white/5 rounded-3xl p-16 flex flex-col items-center justify-center text-center backdrop-blur-sm">
              <div className="w-8 h-8 border-2 border-[#FF8A00] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-gray-400">Loading sheets...</p>
            </div>
          ) : filteredSheets.length === 0 ? (
            <div className="bg-[#111216]/40 border border-dashed border-white/5 rounded-3xl p-16 flex flex-col items-center justify-center text-center backdrop-blur-sm">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6 shadow-xl">
                <Box size={28} className="text-gray-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Coming Soon!</h3>
              <p className="text-xs text-gray-400 mb-8 max-w-sm leading-relaxed">
                We are actively working on curating new sheets for this category. Stay tuned!
              </p>
              <button 
                onClick={() => {
                  setActiveTab('All Sheets');
                  setLevelFilter('All Levels');
                  setTopicFilter('All Topics');
                  setSortFilter('Sort By');
                }}
                className="bg-[#FF8A00]/10 hover:bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/20 rounded-xl px-6 py-2.5 text-xs font-bold transition-all hover:scale-105 active:scale-95"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredSheets.map((sheet: any, i: number) => {
                const Icon = iconMap[sheet.icon];
                const progress = progressMap.get(sheet.slug);
                const progressPercent = progress?.progressPercentage ?? (isSignedIn ? 0 : undefined);
                const isStarted = typeof progressPercent === 'number' && progressPercent > 0;

                return (
                  <Link href={`/sheets/${sheet.slug}`} key={sheet.slug} className="block h-full">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-[#111216] border border-white/5 hover:border-white/10 rounded-[20px] p-5 relative overflow-hidden group transition-all duration-300 shadow-lg flex flex-col h-full cursor-pointer"
                    >
                    {/* Accent Line */}
                    {isStarted && (
                      <div className="absolute top-0 left-0 h-[2px] bg-[#FF8A00] shadow-[0_0_10px_#FF8A00] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                    )}
                    
                    <div className="flex gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-[14px] bg-gradient-to-br ${sheet.color} p-[1px] flex-shrink-0 shadow-lg`}>
                        <div className="w-full h-full bg-[#111216]/90 rounded-[13px] flex items-center justify-center backdrop-blur-sm">
                          <Icon size={22} className={sheet.text} />
                        </div>
                      </div>
                      <div className="flex-1 pt-1.5">
                        <h3 className="font-bold text-sm text-white mb-1.5 leading-tight group-hover:text-[#FF8A00] transition-colors">{sheet.title}</h3>
                        <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">{sheet.description || sheet.desc}</p>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                          <Box size={12} className="text-gray-500" />
                          <span>{sheet.totalProblems || sheet.problems || 0} Problems</span>
                        </div>
                        {isSignedIn && typeof progressPercent === 'number' && (
                          <span className="text-xs font-bold text-white">{progressPercent}%</span>
                        )}
                      </div>
                      
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-6">
                        <div className={`h-full transition-all duration-1000 ${isStarted ? 'bg-[#FF8A00]' : 'bg-transparent'}`} style={{ width: `${isStarted ? progressPercent : 0}%` }} />
                      </div>

                      <div className="flex items-center gap-3">
                        <button className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          isStarted 
                            ? 'bg-[#FF8A00] hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(255,138,0,0.2)]' 
                            : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'
                        }`}>
                          {isStarted ? 'Continue' : 'Start Sheet'}
                        </button>
                        <button className="w-10 h-10 rounded-xl border border-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors flex-shrink-0">
                          <Bookmark size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        
      </main>
    </div>
  );
}
