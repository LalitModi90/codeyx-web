"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderGit2, Github, ExternalLink, Star, GitCommit, Search, 
  Code2, Play, Globe, Lock, Layers, X, MessageSquare
} from 'lucide-react';
import TopNavbar from '@/components/shared/TopNavbar';
import Footer from '@/components/Footer';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';

import { api } from '@/lib/api';

// Fallback image for projects without one
const DEFAULT_PROJECT_IMG = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800';

export default function ExploreProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 6;
  
  // Interactive Modal State
  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects/explore/all');
        if (res.data) {
          const formattedProjects = res.data.map((p: any) => ({
            id: p._id,
            title: p.title || 'Untitled Project',
            desc: p.description || 'No description provided.',
            stack: p.techStack || [],
            stars: p.stars || 0,
            forks: p.forks || 0,
            date: new Date(p.createdAt).toLocaleDateString(),
            iconColor: 'text-[#FF8A00]',
            iconBg: 'bg-[#FF8A00]/10',
            live: !!p.liveUrl,
            isRepo: !!p.githubUrl,
            author: p.userId || 'developer',
            image: p.imageUrl || DEFAULT_PROJECT_IMG,
            liveUrl: p.liveUrl,
            githubUrl: p.githubUrl
          }));
          setProjectsList(formattedProjects);
        }
      } catch (err) {
        console.error('Failed to load projects', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    
    const newComment = {
      user: 'you',
      text: commentText,
      isNew: true
    };
    
    // Create updated project with the new comment
    const updatedProject = {
      ...selectedProject,
      comments: [newComment, ...(selectedProject.comments || [
        { user: 'alex_dev', text: 'This is exactly what I needed. Great UI and architecture!' },
        { user: 'sarah.js', text: 'Clean code. I learned a lot from reading the repo!' }
      ])]
    };
    
    setSelectedProject(updatedProject);
    setCommentText('');
  };

  // Handle Search Resets Page
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  const filteredProjects = projectsList.filter(p => {
    // 1. Text Search
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.stack.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Tag Filter
    let matchesTag = true;
    if (selectedTag === 'Web') {
      matchesTag = p.stack.some((s: string) => ['react', 'next.js', 'vue', 'html', 'node.js', 'angular', 'css'].includes(s.toLowerCase()));
    } else if (selectedTag === 'Mobile') {
      matchesTag = p.stack.some((s: string) => ['react native', 'flutter', 'android', 'ios', 'swift', 'kotlin'].includes(s.toLowerCase()));
    } else if (selectedTag === 'AI') {
      matchesTag = p.stack.some((s: string) => ['python', 'tensorflow', 'pytorch', 'openai', 'ai', 'machine learning', 'llm'].includes(s.toLowerCase()));
    } else if (selectedTag === 'Open Source') {
      matchesTag = p.isRepo === true;
    }

    return matchesSearch && matchesTag;
  });

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const currentProjects = filteredProjects.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#050816] font-sans selection:bg-[#FF8A00]/30 pb-20">
      <TopNavbar />
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-900/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-5%] w-[30vw] h-[30vw] rounded-full bg-[#FF8A00]/5 blur-[120px]" />
      </div>

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 pt-32 pb-20 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF8A00]/10 border border-[#FF8A00]/20 text-[#FF8A00] text-sm font-bold mb-6 shadow-[0_0_15px_rgba(255,138,0,0.2)]"
          >
            <FolderGit2 size={16} /> Community Projects
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight"
          >
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A00] to-amber-400">Amazing Work</span> from the Community
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 font-medium"
          >
            Discover open-source projects, get inspired by top developers, and find your next big idea.
          </motion.p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12">
          <div className="relative w-full md:w-96">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by name or technology..." 
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-[#101014] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8A00]/50 transition-all shadow-inner" 
            />
          </div>
          <div className="flex gap-2">
            {['All', 'Web', 'Mobile', 'AI', 'Open Source'].map(tag => (
              <button 
                key={tag} 
                onClick={() => { setSelectedTag(tag); setCurrentPage(0); }}
                className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                  selectedTag === tag 
                    ? 'bg-[#FF8A00]/20 border-[#FF8A00] text-[#FF8A00] shadow-[0_0_15px_rgba(255,138,0,0.15)]' 
                    : 'bg-[#101014] border-white/10 hover:border-white/20 text-gray-400 hover:text-white'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF8A00]"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Code2 size={48} className="text-white/20 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No projects found</h3>
            <p className="text-gray-500">Be the first to share your amazing work with the community!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentProjects.map((proj, idx) => (
            <motion.div 
              key={proj.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (idx % 6) * 0.1 }}
              onClick={() => setSelectedProject(proj)}
              className="bg-[#101014] border border-white/5 rounded-3xl overflow-hidden hover:border-[#FF8A00]/30 hover:shadow-[0_10px_40px_rgba(255,138,0,0.1)] transition-all group cursor-pointer flex flex-col h-full"
            >
              {/* Card Image */}
              <div className="h-48 w-full relative overflow-hidden bg-[#18181f]">
                <div className="absolute inset-0 bg-gradient-to-t from-[#101014] to-transparent z-10" />
                <img src={proj.image} alt={proj.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                
                <div className={`absolute bottom-4 left-6 w-14 h-14 rounded-2xl flex items-center justify-center ${proj.iconBg} border border-white/10 shadow-2xl z-20 group-hover:-translate-y-2 transition-transform duration-300`}>
                  <Code2 size={24} className={proj.iconColor} />
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-black text-white group-hover:text-[#FF8A00] transition-colors">{proj.title}</h3>
                    <p className="text-xs font-bold text-gray-500 mt-1">by @{proj.author}</p>
                  </div>
                </div>
                
                <p className="text-sm font-medium text-gray-400 leading-relaxed mb-6 line-clamp-2 flex-1">
                  {proj.desc}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {proj.stack.slice(0, 3).map(tech => (
                    <span key={tech} className="px-2.5 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-xs font-bold text-gray-300">
                      {tech}
                    </span>
                  ))}
                  {proj.stack.length > 3 && (
                    <span className="px-2.5 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-xs font-bold text-gray-500">
                      +{proj.stack.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400"><Star size={14} className="text-[#FF8A00]" /> {proj.stars}</span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400"><GitCommit size={14} className="text-purple-400" /> {proj.forks}</span>
                  </div>
                  <div className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Details →
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-16 flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-6 py-3 rounded-xl bg-[#101014] border border-white/10 hover:border-[#FF8A00]/50 disabled:opacity-50 disabled:hover:border-white/10 text-white font-bold transition-all hover:shadow-[0_0_20px_rgba(255,138,0,0.15)] flex items-center gap-2"
              >
                ← Previous
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === i ? 'bg-[#FF8A00] text-black shadow-[0_0_15px_rgba(255,138,0,0.3)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-6 py-3 rounded-xl bg-[#101014] border border-white/10 hover:border-[#FF8A00]/50 disabled:opacity-50 disabled:hover:border-white/10 text-white font-bold transition-all hover:shadow-[0_0_20px_rgba(255,138,0,0.15)] flex items-center gap-2"
              >
                Next →
              </button>
            </div>
            <p className="text-xs text-gray-500 font-semibold">
              Showing page {currentPage + 1} of {totalPages} ({filteredProjects.length} total projects)
            </p>
          </div>
        )}
      </main>

      <Footer />

      {/* PROJECT DETAILS MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl bg-[#0A0D18] border border-white/10 rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative flex flex-col md:flex-row max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white backdrop-blur-md transition-all"
              >
                <X size={20} />
              </button>

              {/* Modal Left Side: Image & Actions */}
              <div className="w-full md:w-2/5 bg-[#101014] relative border-r border-white/5 flex flex-col">
                <div className="h-64 md:h-[40%] w-full relative">
                  <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover opacity-50" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101014] to-transparent" />
                  
                  <div className={`absolute bottom-6 left-8 w-20 h-20 rounded-[2rem] flex items-center justify-center ${selectedProject.iconBg} border border-white/10 shadow-2xl`}>
                    <Code2 size={40} className={selectedProject.iconColor} />
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col justify-end">
                  <div className="flex flex-col gap-4">
                    {selectedProject.live && (
                      <>
                        <SignedIn>
                          <a href={selectedProject.liveUrl?.startsWith('http') ? selectedProject.liveUrl : `https://${selectedProject.liveUrl}`} target="_blank" rel="noopener noreferrer" className="w-full py-4 rounded-xl bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-black text-sm font-black shadow-[0_0_20px_rgba(255,138,0,0.3)] flex items-center justify-center gap-2 transition-all">
                            <Globe size={18} /> Open Live Preview
                          </a>
                        </SignedIn>
                        <SignedOut>
                          <Link href="/login">
                            <button className="w-full py-4 rounded-xl bg-[#1a1a24] border border-white/5 text-gray-500 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:bg-white/5">
                              <Lock size={16} /> Login to view Live App
                            </button>
                          </Link>
                        </SignedOut>
                      </>
                    )}
                    
                    {selectedProject.isRepo && (
                      <>
                        <SignedIn>
                          <a href={selectedProject.githubUrl?.startsWith('http') ? selectedProject.githubUrl : `https://${selectedProject.githubUrl}`} target="_blank" rel="noopener noreferrer" className="w-full py-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all">
                            <Github size={18} /> View Source Code
                          </a>
                        </SignedIn>
                        <SignedOut>
                          <Link href="/login">
                            <button className="w-full py-4 rounded-xl bg-white/[0.01] border border-white/5 text-gray-500 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:bg-white/5">
                              <Lock size={16} /> Login for Source Code
                            </button>
                          </Link>
                        </SignedOut>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-3xl font-black text-white">{selectedProject.stars}</div>
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1 flex items-center gap-1 justify-center"><Star size={12} className="text-[#FF8A00]"/> Stars</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-white">{selectedProject.forks}</div>
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1 flex items-center gap-1 justify-center"><GitCommit size={12} className="text-purple-400"/> Forks</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Right Side: Details */}
              <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto custom-scrollbar bg-gradient-to-br from-transparent to-[#FF8A00]/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="px-2 py-1 rounded bg-[#FF8A00]/10 border border-[#FF8A00]/20 text-[10px] font-black uppercase tracking-widest text-[#FF8A00]">
                    Featured
                  </div>
                  <span className="text-sm font-bold text-gray-500">{selectedProject.date}</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-black text-white mb-2 leading-tight">
                  {selectedProject.title}
                </h2>
                <div className="flex items-center gap-2 mb-10 text-gray-400 font-medium">
                  Built by <span className="font-bold text-white">@{selectedProject.author}</span>
                </div>

                <div className="mb-10">
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Layers size={16} className="text-gray-400" /> About the Project
                  </h4>
                  <p className="text-base text-gray-300 leading-relaxed font-medium">
                    {selectedProject.desc}
                  </p>
                </div>

                <div className="mb-10">
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Code2 size={16} className="text-gray-400" /> Tech Stack Used
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedProject.stack.map((tech: string, idx: number) => (
                      <span key={idx} className="px-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-sm font-bold text-gray-200 hover:border-[#FF8A00]/50 hover:bg-[#FF8A00]/10 transition-colors cursor-default">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <SignedIn>
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare size={16} className="text-[#FF8A00]" /> Community Feedback
                      </h4>
                      <div className="flex items-center gap-1 bg-[#FF8A00]/10 border border-[#FF8A00]/20 px-2 py-1 rounded text-xs font-black text-[#FF8A00]">
                        <Star size={12} fill="currentColor" /> 4.8 / 5.0
                      </div>
                    </div>

                    {/* Add Comment / Rating UI */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-gray-300">Rate this project:</span>
                        <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button 
                              key={star} 
                              onClick={() => setUserRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star 
                                size={18} 
                                className={`${(hoverRating || userRating) >= star ? 'text-[#FF8A00] fill-[#FF8A00]' : 'text-gray-500'} transition-colors duration-200`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="relative">
                        <textarea 
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Share your thoughts or feedback..." 
                          className="w-full bg-[#101014] border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#FF8A00]/50 transition-all resize-none shadow-inner pr-36"
                          rows={2}
                        />
                        <button 
                          onClick={handlePostComment}
                          disabled={!commentText.trim()}
                          className="absolute bottom-3 right-3 px-4 py-1.5 rounded-lg bg-[#FF8A00] hover:bg-[#FF8A00]/90 disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-black transition-all shadow-[0_0_15px_rgba(255,138,0,0.2)]"
                        >
                          Post Comment
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {(selectedProject.comments || [
                        { user: 'alex_dev', text: 'This is exactly what I needed. Great UI and architecture!' },
                        { user: 'sarah.js', text: 'Clean code. I learned a lot from reading the repo!' }
                      ]).map((comment: any, idx: number) => (
                        <motion.div 
                          initial={comment.isNew ? { opacity: 0, y: -10 } : false}
                          animate={{ opacity: 1, y: 0 }}
                          key={idx} 
                          className="bg-white/5 border border-white/5 rounded-xl p-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${comment.isNew ? 'bg-[#FF8A00]' : 'bg-gradient-to-br from-gray-600 to-gray-800'}`}>
                              {comment.user.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-gray-300">@{comment.user}</span>
                            {comment.isNew && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FF8A00]/20 text-[#FF8A00] font-black uppercase">New</span>}
                          </div>
                          <p className="text-sm font-semibold text-gray-400 ml-8">{comment.text}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </SignedIn>

                <SignedOut>
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 border-dashed flex flex-col items-center justify-center text-center">
                    <Lock size={24} className="text-gray-500 mb-3" />
                    <h4 className="text-sm font-bold text-white mb-1">Developer Insights Locked</h4>
                    <p className="text-xs text-gray-400 font-medium max-w-sm mb-4">Login to view detailed analytics, ratings, community comments, and to access the live app and repository.</p>
                    <Link href="/login">
                      <button className="px-6 py-2.5 rounded-xl bg-[#FF8A00]/10 text-[#FF8A00] text-sm font-bold hover:bg-[#FF8A00] hover:text-black transition-all border border-[#FF8A00]/20 hover:border-[#FF8A00] shadow-[0_0_15px_rgba(255,138,0,0)] hover:shadow-[0_0_15px_rgba(255,138,0,0.3)]">
                        Login Required
                      </button>
                    </Link>
                  </div>
                </SignedOut>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
