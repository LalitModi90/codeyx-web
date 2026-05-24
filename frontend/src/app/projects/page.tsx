"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ChevronDown, CheckCircle2, Star, GitCommit, Code2, 
  Award, Github, FolderKanban, History, Archive, Download, 
  Plus, ExternalLink, Activity, Bookmark, BookOpen, Layers, Play, FileCode2,
  ImageIcon, UploadCloud, Trash2, Globe, Lock, MessageSquare, StarHalf
} from 'lucide-react';
import TopNavbar from '@/components/shared/TopNavbar';

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState('All Projects');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [projectsList, setProjectsList] = useState([
    { title: 'AI Resume Builder', desc: 'AI-powered resume builder with ATS optimization and smart suggestions.', stack: ['Next.js', 'OpenAI', 'Tailwind CSS'], stars: 45, forks: 12, date: '2 days ago', status: 'Active', iconColor: 'text-purple-400', iconBg: 'bg-purple-500/10', live: true, isPublic: true, rating: 4.8, comments: [{ user: 'alex_dev', text: 'This is exactly what I needed. Great UI!' }, { user: 'sarah.js', text: 'Clean code and awesome architecture.' }], isRepo: true, isStarred: true, isContribution: false },
    { title: 'DevConnect', desc: 'Social platform for developers to connect, share and grow together.', stack: ['React', 'Firebase', 'Tailwind CSS'], stars: 32, forks: 8, date: '3 days ago', status: 'Active', iconColor: 'text-pink-400', iconBg: 'bg-pink-500/10', live: false, isPublic: true, rating: 4.5, comments: [{ user: 'mike_code', text: 'When is this launching?! Looks dope.' }], isRepo: true, isStarred: false, isContribution: false },
    { title: 'AlgoVisualizer', desc: 'Visualize data structures and algorithms step by step with animations.', stack: ['Next.js', 'D3.js', 'TypeScript'], stars: 78, forks: 15, date: '5 days ago', status: 'Trending', iconColor: 'text-[#FF8A00]', iconBg: 'bg-[#FF8A00]/10', live: true, isPublic: false, rating: 5.0, comments: [{ user: 'leet_god', text: 'This helped me clear my Google interview thanks man!' }], isRepo: false, isStarred: true, isContribution: true },
    { title: 'Old Web Scraper', desc: 'A Python script to scrape e-commerce data. No longer maintained.', stack: ['Python', 'BeautifulSoup'], stars: 12, forks: 2, date: '1 year ago', status: 'Archived', iconColor: 'text-gray-400', iconBg: 'bg-gray-500/10', live: false, isPublic: true, rating: 3.5, comments: [], isRepo: true, isStarred: false, isContribution: false },
  ]);

  const filteredProjects = projectsList.filter(proj => {
    if (activeTab === 'All Projects') return true;
    if (activeTab === 'My Repositories') return proj.isRepo;
    if (activeTab === 'Starred') return proj.isStarred;
    if (activeTab === 'Contributions') return proj.isContribution;
    if (activeTab === 'Archived') return proj.status === 'Archived';
    return true;
  });

  const [formData, setFormData] = useState({
    name: '',
    techStack: '',
    description: '',
    github: '',
    liveUrl: '',
    isPublic: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const handleImportFromGit = () => {
    setFormData({
      name: 'codeyx-portfolio',
      techStack: 'Next.js, Tailwind CSS, Framer Motion',
      description: 'My personal developer portfolio built with modern web technologies. Imported automatically from GitHub.',
      github: 'https://github.com/username/codeyx-portfolio',
      liveUrl: 'https://codeyx-portfolio.vercel.app',
      isPublic: true
    });
    setIsAddModalOpen(true);
  };

  const handleCreateProject = () => {
    if (!formData.name) return;
    
    const newProject = {
      title: formData.name,
      desc: formData.description || 'A new amazing project just added to Codeyx.',
      stack: formData.techStack ? formData.techStack.split(',').map(s => s.trim()) : ['React'],
      stars: 0,
      forks: 0,
      date: 'Just now',
      status: 'Active',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      live: !!formData.liveUrl,
      isPublic: formData.isPublic,
      rating: 0,
      comments: [],
      isRepo: true,
      isStarred: false,
      isContribution: false
    };

    setProjectsList([newProject, ...projectsList]);
    setIsAddModalOpen(false);
    setFormData({ name: '', techStack: '', description: '', github: '', liveUrl: '', isPublic: true });
    setSelectedFile(null);
  };

  const handleDeleteProject = (indexToRemove: number) => {
    setProjectsList(projectsList.filter((_, i) => i !== indexToRemove));
  };

  const handleToggleVisibility = () => {
    if (!selectedProject) return;
    
    const updatedList = projectsList.map(proj => 
      proj.title === selectedProject.title ? { ...proj, isPublic: !proj.isPublic } : proj
    );
    setProjectsList(updatedList);
    setSelectedProject({ ...selectedProject, isPublic: !selectedProject.isPublic });
  };
  
  return (
    <div className="min-h-screen bg-[#050816] font-sans selection:bg-[#FF8A00]/30 pb-20">
      <TopNavbar />
      
      {/* Abstract Glowing Backgrounds */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-900/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-5%] w-[30vw] h-[30vw] rounded-full bg-[#FF8A00]/5 blur-[120px]" />
      </div>

      <main className="max-w-[1600px] mx-auto px-6 pt-8 grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT SIDEBAR (xl:col-span-2) */}
        <aside className="xl:col-span-2 flex flex-col gap-6 sticky top-24 h-fit">
          
          {/* Projects Navigation */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest px-3 mb-2">Projects</span>
            {[
              { id: 'All Projects', icon: FolderKanban },
              { id: 'My Repositories', icon: BookOpen },
              { id: 'Starred', icon: Star },
              { id: 'Contributions', icon: GitCommit },
              { id: 'Archived', icon: Archive },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all relative group ${
                  activeTab === tab.id 
                    ? 'text-[#FF8A00] bg-[#FF8A00]/10 border border-[#FF8A00]/20 shadow-[0_0_15px_rgba(255,138,0,0.1)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <tab.icon size={16} className={activeTab === tab.id ? 'text-[#FF8A00]' : 'text-gray-500'} strokeWidth={2.5} />
                <span className="relative z-10">{tab.id}</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="projectsTabIndicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-1/2 bg-[#FF8A00] rounded-r shadow-[0_0_10px_#FF8A00]" />
                )}
              </button>
            ))}
          </div>

          {/* GitHub Connection Card */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest px-3 mb-2">GitHub</span>
            <div className="bg-[#101014] border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white leading-none mb-1.5">Connected to GitHub</h4>
                  <p className="text-xs font-semibold text-gray-500">@codewitharyan</p>
                </div>
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                </div>
              </div>
              <button className="w-full py-2 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] text-xs font-bold text-gray-300 transition-all flex items-center justify-center gap-2">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                Sync Again
              </button>
              <div className="text-[10px] font-semibold text-gray-500 text-center">Last synced 2 hours ago</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest px-3 mb-1">Filters</span>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" placeholder="Search projects..." className="w-full bg-[#101014] border border-white/5 rounded-xl py-2.5 pl-9 pr-3 text-xs font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#FF8A00]/30 transition-all" />
            </div>
            {['All Languages', 'All Topics', 'All Status'].map((lbl, i) => (
              <button key={i} className="w-full bg-[#101014] border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-3 text-xs font-semibold text-gray-400 flex items-center justify-between transition-all">
                {lbl}
                <ChevronDown size={14} className="text-gray-500" />
              </button>
            ))}
          </div>

          {/* Import Bottom Card */}
          <div className="mt-4 bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/20 rounded-2xl p-4 shadow-[0_10px_30px_rgba(168,85,247,0.1)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] group-hover:bg-purple-500/20 transition-all" />
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <Github size={16} className="text-purple-400" />
              <span className="text-sm font-bold text-white">Import Repository</span>
            </div>
            <p className="text-xs text-purple-200/60 font-semibold mb-4 relative z-10 leading-relaxed">
              Add any GitHub repository to track and showcase your work.
            </p>
            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all relative z-10">
              Import Repo
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA (xl:col-span-10) */}
        <div className="xl:col-span-10 min-w-0 flex flex-col gap-8">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                My Projects <span className="text-2xl">🚀</span>
              </h1>
              <p className="text-sm font-semibold text-gray-400">
                Showcase your coding journey and build your developer portfolio.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-[#101014] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] px-4 py-2.5 rounded-xl text-sm font-bold text-gray-300 transition-all">
                <Github size={16} /> Sync GitHub
              </button>
              <button className="flex items-center gap-2 bg-[#101014] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] px-4 py-2.5 rounded-xl text-sm font-bold text-gray-300 transition-all">
                <Download size={16} /> Import Repo
              </button>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-black px-5 py-2.5 rounded-xl text-sm font-black shadow-[0_0_20px_rgba(255,138,0,0.3)] transition-all"
              >
                <Plus size={18} strokeWidth={3} /> Create Project
              </button>
            </div>
          </div>

          {activeTab === 'All Projects' && (
            <>
              {/* Stats Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total Projects', value: '12', sub: '▲ 20% this month', icon: Code2, color: '#a855f7', bg: 'bg-purple-500/10' },
              { label: 'Total Stars', value: '284', sub: '▲ 15% this month', icon: Star, color: '#22c55e', bg: 'bg-emerald-500/10' },
              { label: 'Commits', value: '1.2K', sub: '▲ 18% this month', icon: GitCommit, color: '#FF8A00', bg: 'bg-orange-500/10' },
              { label: 'Languages Used', value: '8', sub: 'JavaScript, TypeScript...', icon: FileCode2, color: '#3b82f6', bg: 'bg-blue-500/10' },
              { label: 'Open Source Score', value: '85', sub: '▲ Excellent', icon: Award, color: '#d946ef', bg: 'bg-fuchsia-500/10' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#101014]/80 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:border-white/10 transition-all shadow-xl">
                <div className={`w-12 h-12 rounded-xl flex flex-shrink-0 items-center justify-center ${stat.bg} border border-white/5`} style={{ color: stat.color, boxShadow: `0 0 20px ${stat.color}20` }}>
                  <stat.icon size={22} />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <div className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1 truncate">{stat.label}</div>
                  <div className="text-2xl font-black text-white leading-none mb-1.5">{stat.value}</div>
                  <div className="text-[9px] font-bold text-emerald-400 truncate">{stat.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Featured Project Hero */}
          <div className="relative bg-[#101014] border border-[#FF8A00]/20 rounded-[28px] p-8 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[400px] h-[400px] bg-[#FF8A00]/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 border border-[#FF8A00]/20 rounded-full pointer-events-none" />
            
            <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
              <div className="flex flex-col items-start gap-5">
                <div className="px-3 py-1 bg-[#FF8A00]/10 border border-[#FF8A00]/20 text-[#FF8A00] text-[10px] font-black uppercase tracking-widest rounded-md flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,138,0,0.2)]">
                  <Star size={12} fill="currentColor" /> Featured Project
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#18181f] rounded-2xl flex items-center justify-center border border-white/10 shadow-xl relative group overflow-hidden">
                    <div className="absolute inset-0 bg-[#FF8A00]/10 opacity-0 group-hover:opacity-100 transition-all" />
                    <div className="w-8 h-8 rounded border-2 border-[#FF8A00] flex items-center justify-center rotate-45 relative z-10">
                      <div className="w-3 h-3 bg-[#FF8A00] -rotate-45" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                      Codeyx Platform <Award size={24} className="text-[#FF8A00]" />
                    </h2>
                  </div>
                </div>
                
                <p className="text-sm font-semibold text-gray-400 leading-relaxed max-w-md">
                  AI-powered coding workspace for DSA tracking and developer productivity.
                </p>

                <div className="flex flex-wrap gap-2">
                  {['Next.js', 'Node.js', 'MongoDB', 'Socket.io', 'Tailwind CSS', 'Docker'].map(tech => (
                    <span key={tech} className="px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-lg text-[10px] font-bold text-gray-300">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-6 mt-2 border-t border-white/5 pt-5 w-full">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300">
                    <Star size={14} className="text-[#FF8A00]" /> 124 Stars
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300">
                    <GitCommit size={14} className="text-gray-400" /> 18 Forks
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300">
                    <Layers size={14} className="text-gray-400" /> 24 Contributors
                  </div>
                  <div className="flex-1" />
                  <div className="text-[10px] font-bold text-gray-500">Updated 2 hours ago</div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    Active
                  </div>
                </div>

                <div className="flex gap-4 mt-2 w-full">
                  <button className="flex-1 py-3 rounded-xl bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-black text-sm font-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,138,0,0.3)] transition-all">
                    Live Demo <ExternalLink size={16} strokeWidth={2.5} />
                  </button>
                  <button className="flex-1 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] text-white text-sm font-bold flex items-center justify-center gap-2 transition-all">
                    <Github size={16} /> GitHub Repo
                  </button>
                  <button className="flex-1 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] text-white text-sm font-bold flex items-center justify-center gap-2 transition-all">
                    <BookOpen size={16} /> Case Study
                  </button>
                </div>
              </div>

              {/* Right Side Device Preview */}
              <div className="relative h-full min-h-[300px] flex items-center justify-center overflow-visible perspective-1000 hidden md:flex">
                <div className="absolute w-[120%] h-[120%] bg-gradient-to-r from-transparent via-[#FF8A00]/5 to-transparent blur-2xl transform -rotate-12" />
                {/* Simulated Laptop Frame */}
                <div className="w-full max-w-[480px] aspect-[16/10] bg-gray-900 rounded-lg p-1.5 border-2 border-gray-700 shadow-2xl relative transform rotate-y-[-5deg] rotate-x-[5deg]">
                  <div className="w-full h-full bg-[#050816] rounded-sm overflow-hidden relative">
                     <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center opacity-40 mix-blend-screen" />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[120%] h-4 bg-gray-800 rounded-t-sm shadow-xl flex justify-center"><div className="w-16 h-1 bg-gray-600 rounded-b-md" /></div>
                </div>
                {/* Simulated Mobile Frame */}
                <div className="absolute right-0 bottom-10 w-28 aspect-[9/19] bg-gray-900 rounded-[24px] p-1.5 border-2 border-gray-700 shadow-2xl transform rotate-y-[10deg] rotate-x-[5deg] translate-z-[50px]">
                  <div className="w-full h-full bg-[#0B1120] rounded-[18px] overflow-hidden relative border border-white/5">
                    <div className="absolute top-0 w-full h-4 bg-black flex justify-center rounded-t-xl"><div className="w-8 h-1.5 bg-gray-800 rounded-b-lg mt-1" /></div>
                     <div className="absolute inset-0 mt-5 bg-gradient-to-b from-[#FF8A00]/20 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          </>
          )}

          {/* Projects Grid Header */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-white">{activeTab}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-bold text-gray-300">{filteredProjects.length}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-[#101014] border border-white/5 rounded-lg p-1">
                <button className="p-1.5 bg-white/10 rounded-md text-[#FF8A00]"><FolderKanban size={16} /></button>
                <button className="p-1.5 hover:bg-white/5 rounded-md text-gray-500"><History size={16} /></button>
              </div>
              <button className="bg-[#101014] border border-white/5 hover:border-white/10 px-4 py-2 rounded-lg text-xs font-bold text-gray-300 flex items-center gap-2">
                Recently Updated <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* Projects Grid */}
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            
            {/* Create / Import Action Card */}
            <div className="bg-[#101014] border border-dashed border-white/20 rounded-[20px] overflow-hidden hover:border-[#FF8A00]/50 hover:bg-white/[0.02] transition-all group flex flex-col h-full min-h-[340px] relative cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF8A00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col items-center justify-center flex-1 p-8 text-center relative z-10 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-[#FF8A00] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,138,0,0.2)] transition-all">
                  <Plus size={32} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white mb-2">Add New Project</h3>
                  <p className="text-xs font-semibold text-gray-500 leading-relaxed mb-6">
                    Showcase your latest work. Import directly from GitHub or create manually.
                  </p>
                </div>
                <div className="w-full flex flex-col gap-3 mt-auto">
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full py-3 rounded-xl bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-black text-sm font-black shadow-[0_0_20px_rgba(255,138,0,0.3)] flex items-center justify-center gap-2 transition-all"
                  >
                    <Plus size={16} strokeWidth={3} /> Create Manually
                  </button>
                  <button 
                    onClick={handleImportFromGit}
                    className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Github size={14} /> Import from GitHub
                  </button>
                </div>
              </div>
            </div>

            {filteredProjects.map((proj, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedProject(proj)}
                className="bg-[#101014] border border-white/5 rounded-[20px] overflow-hidden hover:border-[#FF8A00]/30 hover:shadow-[0_10px_30px_rgba(255,138,0,0.05)] transition-all group flex flex-col h-full min-h-[340px] cursor-pointer"
              >
                {/* Thumbnail Area */}
                <div className="h-44 bg-[#18181f] relative border-b border-white/5 p-4 flex items-center justify-center overflow-hidden">
                  <div className="absolute top-3 right-3 flex gap-2 z-20">
                    <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest shadow-lg ${proj.status === 'Trending' ? 'bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                      {proj.status === 'Trending' && <Star size={8} className="inline mr-1" />}
                      {proj.status}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteProject(i); }}
                      className="w-6 h-6 rounded bg-black/50 border border-white/10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 backdrop-blur-sm transition-all"
                      title="Delete Project"
                    >
                      <Trash2 size={12} />
                    </button>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="w-6 h-6 rounded bg-black/50 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white backdrop-blur-sm transition-all"
                    >
                      <Bookmark size={12} />
                    </button>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101014] to-transparent z-10" />
                  
                  {/* Abstract thumbnail placeholder */}
                  <div className="w-[85%] h-[85%] bg-[#0B1120] border border-white/10 rounded-lg shadow-2xl rotate-[-2deg] relative overflow-hidden group-hover:rotate-0 transition-all duration-500">
                    <div className="absolute top-0 w-full h-4 bg-white/5 border-b border-white/5 flex gap-1 items-center px-2">
                      <div className="w-2 h-2 rounded-full bg-red-500/50" /><div className="w-2 h-2 rounded-full bg-yellow-500/50" /><div className="w-2 h-2 rounded-full bg-green-500/50" />
                    </div>
                    <div className="mt-6 p-3 grid grid-cols-3 gap-2 opacity-30">
                       <div className="h-3 bg-white/50 rounded w-full" /><div className="h-3 bg-white/50 rounded w-full" /><div className="h-3 bg-white/50 rounded w-full" />
                       <div className="h-3 bg-white/50 rounded w-full" /><div className="h-3 bg-[#FF8A00] rounded w-full shadow-[0_0_10px_#FF8A00]" /><div className="h-3 bg-white/50 rounded w-full" />
                    </div>
                  </div>

                  <div className={`absolute bottom-4 left-4 w-12 h-12 rounded-2xl flex items-center justify-center ${proj.iconBg} border border-white/10 shadow-xl z-20 group-hover:scale-110 transition-transform`}>
                    <Code2 size={20} className={proj.iconColor} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-black text-white group-hover:text-[#FF8A00] transition-colors">{proj.title}</h3>
                    <div className="text-gray-500" title={proj.isPublic ? "Public Project" : "Private Project"}>
                      {proj.isPublic ? <Globe size={14} /> : <Lock size={14} />}
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 leading-relaxed mb-4 flex-1">
                    {proj.desc}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                    {proj.stack.map(tech => (
                      <span key={tech} className="px-2 py-1 bg-white/[0.03] border border-white/5 rounded text-[9px] font-bold text-gray-400">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer group/stat">
                          <Star size={14} className="text-[#FF8A00] group-hover/stat:scale-110 transition-transform" /> {proj.stars}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer group/stat">
                          <GitCommit size={14} className="group-hover/stat:scale-110 transition-transform text-purple-400" /> {proj.forks}
                        </div>
                      </div>
                      <div className="text-[10px] font-semibold text-gray-500">{proj.date}</div>
                    </div>

                    {proj.live && (
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="w-full py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <Play size={12} fill="currentColor" /> View Live Deployment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* Add Project Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="w-full max-w-2xl bg-[#101014] border border-white/10 rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF8A00]/10 rounded-full blur-[80px] pointer-events-none -mr-32 -mt-32" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-3">
                    <Code2 className="text-[#FF8A00]" size={28} /> Create New Project
                  </h2>
                  <p className="text-sm font-semibold text-gray-400 mt-1">Showcase your skills by adding project details.</p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 relative z-10">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Project Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. AI Code Assistant" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#FF8A00]/50 transition-all shadow-inner" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Tech Stack</label>
                  <input type="text" value={formData.techStack} onChange={e => setFormData({...formData, techStack: e.target.value})} placeholder="e.g. React, Node.js, MongoDB" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#FF8A00]/50 transition-all shadow-inner" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Briefly describe your project..." rows={3} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#FF8A00]/50 transition-all shadow-inner resize-none" />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Project Thumbnail</label>
                  <label className="w-full border-2 border-dashed border-white/10 hover:border-[#FF8A00]/50 bg-black/30 rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                    />
                    {selectedFile ? (
                      <div className="flex flex-col items-center text-[#FF8A00]">
                        <CheckCircle2 size={32} className="mb-2" />
                        <span className="text-sm font-bold text-white">{selectedFile.name}</span>
                        <span className="text-[10px] text-gray-500 mt-1">Click to change file</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-[#FF8A00]/10 flex items-center justify-center transition-colors">
                          <UploadCloud size={20} className="text-gray-400 group-hover:text-[#FF8A00]" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">Click to upload or drag & drop</p>
                          <p className="text-xs font-semibold text-gray-600 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                        </div>
                      </>
                    )}
                  </label>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">GitHub Repository</label>
                  <div className="relative">
                    <Github size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})} placeholder="https://github.com/..." className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#FF8A00]/50 transition-all shadow-inner" />
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Live Demo URL (Optional)</label>
                  <div className="relative">
                    <ExternalLink size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" value={formData.liveUrl} onChange={e => setFormData({...formData, liveUrl: e.target.value})} placeholder="https://..." className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#FF8A00]/50 transition-all shadow-inner" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-6 bg-black/30 border border-white/5 rounded-xl p-4 relative z-10">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {formData.isPublic ? <Globe size={16} className="text-emerald-400" /> : <Lock size={16} className="text-red-400" />}
                    Project Visibility
                  </h4>
                  <p className="text-xs font-semibold text-gray-500 mt-1">
                    {formData.isPublic ? "Visible to everyone on your portfolio." : "Only you can see this project."}
                  </p>
                </div>
                <button 
                  onClick={() => setFormData({...formData, isPublic: !formData.isPublic})}
                  className={`w-12 h-6 rounded-full transition-all relative ${formData.isPublic ? 'bg-[#FF8A00]' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform ${formData.isPublic ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/10 relative z-10">
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateProject}
                  className="px-8 py-2.5 rounded-xl bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-black text-sm font-black shadow-[0_0_20px_rgba(255,138,0,0.3)] transition-all"
                >
                  Create Project
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl bg-[#101014] border border-white/10 rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col md:flex-row gap-8"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF8A00]/10 rounded-full blur-[80px] pointer-events-none -mr-32 -mt-32" />
              
              {/* Left Side: Thumbnail & Actions */}
              <div className="w-full md:w-1/3 flex flex-col gap-4 relative z-10">
                <div className={`w-full aspect-square rounded-2xl flex items-center justify-center ${selectedProject.iconBg} border border-white/10 shadow-xl`}>
                  <Code2 size={64} className={selectedProject.iconColor} />
                </div>
                
                {selectedProject.live && (
                  <button className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-black shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 transition-all">
                    <ExternalLink size={16} /> Open Live App
                  </button>
                )}
                
                <button className="w-full py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all">
                  <Github size={16} /> View Source Code
                </button>
              </div>

              {/* Right Side: Details */}
              <div className="w-full md:w-2/3 flex flex-col relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                      {selectedProject.title}
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-bold text-gray-500 bg-white/5 px-2 py-1 rounded">
                        {selectedProject.date}
                      </span>
                      <button 
                        onClick={handleToggleVisibility}
                        className={`text-xs font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all hover:bg-white/10 ${selectedProject.isPublic ? 'text-gray-300' : 'text-gray-400'}`}
                        title="Click to toggle visibility"
                      >
                        {selectedProject.isPublic ? <><Globe size={12} className="text-emerald-400"/> Public</> : <><Lock size={12} className="text-red-400"/> Private</>}
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedProject(null)}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all shrink-0"
                  >
                    <Plus size={20} className="rotate-45" />
                  </button>
                </div>

                <div className="w-full h-[1px] bg-white/10 my-4" />

                <div className="mb-6">
                  <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Description</h4>
                  <p className="text-sm font-semibold text-gray-300 leading-relaxed">
                    {selectedProject.desc}
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Technologies Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.stack.map((tech: string, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 bg-[#FF8A00]/10 border border-[#FF8A00]/20 rounded-lg text-xs font-bold text-[#FF8A00]">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare size={14} className="text-[#FF8A00]" /> Community Feedback
                    </h4>
                    {selectedProject.rating > 0 && (
                      <div className="flex items-center gap-1 bg-[#FF8A00]/10 border border-[#FF8A00]/20 px-2 py-1 rounded text-xs font-black text-[#FF8A00]">
                        <Star size={12} fill="currentColor" /> {selectedProject.rating.toFixed(1)} / 5.0
                      </div>
                    )}
                  </div>
                  
                  {selectedProject.comments.length > 0 ? (
                    <div className="flex flex-col gap-3 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedProject.comments.map((comment: any, idx: number) => (
                        <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FF8A00] to-purple-500 flex items-center justify-center text-[8px] font-bold text-white">
                              {comment.user.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-bold text-gray-400">@{comment.user}</span>
                          </div>
                          <p className="text-xs font-semibold text-gray-300 ml-7">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                      <p className="text-xs font-semibold text-gray-500">No community feedback yet.</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center">
                    <div className="text-2xl font-black text-white">{selectedProject.stars}</div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1 flex items-center justify-center gap-1"><Star size={10} className="text-[#FF8A00]"/> Stars</div>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center">
                    <div className="text-2xl font-black text-white">{selectedProject.forks}</div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1 flex items-center justify-center gap-1"><GitCommit size={10} className="text-purple-400"/> Forks</div>
                  </div>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
