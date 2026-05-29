"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderGit2, Github, ExternalLink, Star, GitCommit, Search,
  Code2, Play, Globe, Lock, Layers, X, MessageSquare, ArrowUpRight, ArrowUpDown
} from 'lucide-react';
import TopNavbar from '@/components/shared/TopNavbar';
import Footer from '@/components/Footer';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { projectService } from '@/services/project.service';

export default function ExploreProjectsPage() {
  const { user } = useUser();
  const { openSignIn } = useClerk();

  const [publicProjects, setPublicProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [sortBy, setSortBy] = useState<'latest' | 'stars' | 'rated'>('latest');

  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  // Interactive Modal State
  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState('');

  const fetchPublicProjects = async () => {
    setLoading(true);
    try {
      const res = await projectService.getExploreProjects();
      if (res.data) {
        setPublicProjects(res.data);
      }
    } catch (err) {
      console.error('Failed to load public projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicProjects();
  }, []);

  const getAverageRating = (ratingsList: any[]) => {
    if (!ratingsList || ratingsList.length === 0) return 0;
    const sum = ratingsList.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / ratingsList.length).toFixed(1));
  };

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !selectedProject._id) return;
    setRatingSubmitting(true);
    setRatingError('');
    try {
      const res = await projectService.addProjectRating(selectedProject._id, {
        rating: userRating,
        comment: commentText,
        username: user?.username || user?.fullName || 'Anonymous',
        userAvatar: user?.imageUrl || ''
      });

      const updatedProj = res.data;

      // Reload projects list to keep sync
      await fetchPublicProjects();

      // Update selected project state
      setSelectedProject((prev: any) => ({
        ...prev,
        ratings: updatedProj.ratings
      }));
      setCommentText('');
      setUserRating(5);
    } catch (err: any) {
      console.error('Failed to submit rating:', err);
      setRatingError(err.response?.data?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  const isOwnProject = user?.id && selectedProject && selectedProject.userId === user.id;

  const filteredProjects = publicProjects
    .filter(p => {
      // 1. Search Query Match
      const q = searchQuery.toLowerCase();
      const titleMatch = p.title?.toLowerCase().includes(q);
      const descMatch = p.description?.toLowerCase().includes(q);
      const stackMatch = p.techStack?.some((s: string) => s.toLowerCase().includes(q));
      const authorMatch = p.author?.username?.toLowerCase().includes(q) || p.author?.name?.toLowerCase().includes(q);
      const isSearchMatch = titleMatch || descMatch || stackMatch || authorMatch;

      // 2. Tag Category Match
      if (selectedTag === 'All') return isSearchMatch;

      const tagLower = selectedTag.toLowerCase();
      let isTagMatch = false;
      if (tagLower === 'web') {
        isTagMatch = p.techStack?.some((s: string) => ['next.js', 'react', 'web', 'html', 'css', 'javascript', 'typescript', 'tailwind', 'express', 'node'].includes(s.toLowerCase()));
      } else if (tagLower === 'mobile') {
        isTagMatch = p.techStack?.some((s: string) => ['react native', 'flutter', 'android', 'ios', 'swift', 'kotlin', 'mobile'].includes(s.toLowerCase()));
      } else if (tagLower === 'ai') {
        isTagMatch = p.techStack?.some((s: string) => ['ai', 'openai', 'llm', 'python', 'pytorch', 'ml', 'machine learning', 'artificial intelligence', 'gemini', 'claude'].includes(s.toLowerCase()));
      } else if (tagLower === 'open source') {
        isTagMatch = p.isRepo === true;
      }

      return isSearchMatch && isTagMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'stars') {
        return (b.stars || 0) - (a.stars || 0);
      }
      if (sortBy === 'rated') {
        const avgA = getAverageRating(a.ratings);
        const avgB = getAverageRating(b.ratings);
        if (avgB !== avgA) return avgB - avgA;
        return (b.ratings?.length || 0) - (a.ratings?.length || 0);
      }
      // default: latest (sorted by createdAt)
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
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

        {/* Search, Filter & Sort */}
        <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-12 bg-white/[0.02] border border-white/5 p-4 rounded-3xl backdrop-blur-md">
          <div className="relative w-full xl:w-96">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, author or technology..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-[#101014] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8A00]/50 transition-all shadow-inner"
            />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto justify-end">
            {/* Tag Selection Filters */}
            <div className="flex bg-[#101014] border border-white/10 rounded-2xl p-1 flex-wrap justify-center gap-1">
              {['All', 'Web', 'Mobile', 'AI', 'Open Source'].map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(tag);
                    setCurrentPage(0);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedTag === tag
                    ? 'bg-[#FF8A00]/10 border border-[#FF8A00]/20 text-[#FF8A00]'
                    : 'text-gray-400 hover:text-white border border-transparent'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Premium Sort Dropdown */}
            <div className="flex items-center gap-2 bg-[#101014] border border-white/10 rounded-2xl p-1">
              <span className="text-[10px] font-black uppercase text-gray-500 pl-3 pr-1 flex items-center gap-1">
                <ArrowUpDown size={12} /> Sort:
              </span>
              {([
                { id: 'latest', label: 'Latest' },
                { id: 'stars', label: 'Stars' },
                { id: 'rated', label: 'Most Rated' }
              ] as const).map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setSortBy(mode.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${sortBy === mode.id
                    ? 'bg-[#FF8A00]/10 border border-[#FF8A00]/20 text-[#FF8A00]'
                    : 'text-gray-400 hover:text-white border border-transparent'
                    }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-t-[#FF8A00] border-white/10 animate-spin" />
            <span className="text-xs font-black uppercase text-[#FF8A00] tracking-wider animate-pulse">Loading Public projects...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentProjects.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <FolderGit2 size={64} className="text-gray-600 mb-6" />
                <h3 className="text-2xl font-black text-gray-400 mb-2">No Projects Found</h3>
                <p className="text-gray-500 font-medium max-w-md">No public projects match your filters. Try selecting a different category or search term.</p>
              </div>
            ) : currentProjects.map((proj, idx) => {
              const avgScore = getAverageRating(proj.ratings);
              return (
                <motion.div
                  key={proj._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (idx % 6) * 0.1 }}
                  onClick={() => { setSelectedProject(proj); setActiveImageIndex(0); }}
                  className="bg-[#101014] border border-white/5 rounded-3xl overflow-hidden hover:border-[#FF8A00]/30 hover:shadow-[0_10px_40px_rgba(255,138,0,0.1)] transition-all group cursor-pointer flex flex-col h-full relative"
                >
                  {/* Card Image */}
                  <div className="h-48 w-full relative overflow-hidden bg-[#18181f]">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101014] to-transparent z-10" />
                    <img
                      src={proj.screenshotUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400'}
                      alt={proj.title}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                    />

                    <div className="absolute bottom-4 left-6 w-12 h-12 rounded-xl flex items-center justify-center bg-orange-500/10 border border-orange-500/25 shadow-2xl z-20 group-hover:-translate-y-1 transition-transform duration-300">
                      <Code2 size={20} className="text-orange-400" />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-black text-white group-hover:text-[#FF8A00] transition-colors">{proj.title}</h3>
                        <Link
                          href={`/profile/${proj.userId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-bold text-gray-500 hover:text-white mt-1 block"
                        >
                          by @{proj.author?.username || 'developer'}
                        </Link>
                      </div>

                      {/* Display Rating aggregates on the card */}
                      {proj.ratings && proj.ratings.length > 0 ? (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-black uppercase tracking-wider">
                          <Star size={10} className="fill-current" />
                          <span>{avgScore} ({proj.ratings.length})</span>
                        </div>
                      ) : (
                        <span className="text-[8px] font-black uppercase tracking-wider text-gray-600 bg-white/[0.01] px-2 py-1 rounded border border-white/5">
                          Unrated
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-medium text-gray-400 leading-relaxed mb-6 line-clamp-2 flex-1">
                      {proj.description || 'No description provided.'}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {proj.techStack?.slice(0, 3).map((tech: string) => (
                        <span key={tech} className="px-2.5 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-[10px] font-bold text-gray-300">
                          {tech}
                        </span>
                      ))}
                      {proj.techStack?.length > 3 && (
                        <span className="px-2.5 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-[10px] font-bold text-gray-500">
                          +{proj.techStack.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400"><Star size={14} className="text-[#FF8A00]" /> {proj.stars || 0}</span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400"><GitCommit size={14} className="text-purple-400" /> {proj.forks || 0}</span>
                      </div>
                      <div className="text-xs font-bold text-orange-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        View Details →
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[1200px] bg-[#0D0E16]/95 backdrop-blur-3xl border border-white/[0.08] rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8),_0_0_80px_rgba(255,138,0,0.06)] relative flex flex-col md:flex-row h-[80vh] max-h-[800px]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 z-50 w-11 h-11 rounded-full bg-white/[0.03] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white backdrop-blur-md hover:scale-105 active:scale-95 transition-all shadow-xl"
                aria-label="Close Project Details"
                title="Close"
              >
                <X size={18} />
              </button>

              {/* Modal Left Side: Immersive Image & Actions */}
              <div className="w-full md:w-[48%] bg-white/[0.01] relative border-r border-white/[0.05] flex flex-col overflow-hidden">
                <div className="h-80 md:h-[52%] w-full relative bg-[#18181f]/80 overflow-hidden group">
                  {(() => {
                    const gallery = selectedProject.galleryUrls || selectedProject.gallery || [];
                    const allImages = [selectedProject.screenshotUrl, ...gallery].filter(Boolean);
                    const currentImg = allImages[activeImageIndex] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400';
                    return (
                      <>
                        <img
                          src={currentImg}
                          alt={selectedProject.title}
                          className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0E16] via-[#0D0E16]/30 to-transparent z-10" />

                        {/* Pulsing Code Pill */}
                        <div className="absolute bottom-6 left-6 px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 flex items-center gap-2 shadow-[0_0_20px_rgba(255,138,0,0.15)] backdrop-blur-md z-20">
                          <Code2 size={16} className="text-orange-400 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Interactive</span>
                        </div>

                        {/* Gallery Thumbnails */}
                        {allImages.length > 1 && (
                          <div className="absolute bottom-6 right-6 flex items-center gap-2 z-20 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
                            {allImages.slice(0, 4).map((img, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setActiveImageIndex(idx); }}
                                className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-orange-500 scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'}`}
                              >
                                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                              </button>
                            ))}
                            {allImages.length > 4 && (
                              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
                                +{allImages.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                <div className="p-8 flex-1 flex flex-col justify-between gap-6">
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    {selectedProject.liveUrl && (
                      <a
                        href={selectedProject.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:brightness-110 text-black text-sm font-black shadow-[0_10px_30px_rgba(255,138,0,0.25)] hover:shadow-[0_10px_35px_rgba(255,138,0,0.35)] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all duration-300"
                      >
                        <Globe size={16} /> Open Live Preview
                      </a>
                    )}

                    {selectedProject.githubUrl && (
                      <a
                        href={selectedProject.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-orange-500/30 text-white text-sm font-bold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all duration-300"
                      >
                        <Github size={16} className="text-gray-400" /> View Source Code
                      </a>
                    )}
                  </div>

                  {/* High-Fidelity Stats Grid */}
                  <div className="pt-6 border-t border-white/[0.05] flex items-center justify-between gap-4">
                    <div className="flex-1 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] p-4 rounded-2xl text-center group transition-all duration-300">
                      <div className="text-3xl font-black text-white group-hover:text-orange-400 transition-colors">{selectedProject.stars || 0}</div>
                      <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5 justify-center"><Star size={11} className="text-orange-400" /> Stars</div>
                    </div>
                    <div className="flex-1 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] p-4 rounded-2xl text-center group transition-all duration-300">
                      <div className="text-3xl font-black text-white group-hover:text-purple-400 transition-colors">{selectedProject.forks || 0}</div>
                      <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5 justify-center"><GitCommit size={11} className="text-purple-400" /> Forks</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Right Side: Elegant Details Scroll */}
              <div className="w-full md:w-[52%] p-8 md:p-12 overflow-y-auto custom-scrollbar bg-gradient-to-br from-[#0D0E16] via-[#0D0E16] to-orange-500/[0.02] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-[9px] font-black uppercase tracking-widest text-orange-400 flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,138,0,0.1)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                      Public Showcase
                    </div>
                    <span className="text-xs font-bold text-gray-500">
                      {selectedProject.createdAt ? new Date(selectedProject.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Active Showcase'}
                    </span>
                  </div>

                  <Link
                    href={`/profile/${selectedProject.userId}`}
                    className="flex items-center gap-2 group bg-white/[0.02] border border-white/[0.05] hover:border-orange-500/30 hover:bg-orange-500/[0.04] px-5 py-1.5 rounded-xl transition-all mr-32"
                    onClick={(e) => { e.stopPropagation(); setSelectedProject(null); }}
                  >
                    {selectedProject.author?.avatarUrl ? (
                      <img src={selectedProject.author.avatarUrl} alt={selectedProject.author.username} className="w-5 h-5 rounded-full object-cover border border-white/10 group-hover:border-orange-500/50 transition-colors" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-[9px] font-black uppercase">
                        {selectedProject.author?.username?.charAt(0) || 'D'}
                      </div>
                    )}
                    <span className="text-[10px] font-black text-gray-300 group-hover:text-orange-400 transition-colors">
                      @{selectedProject.author?.username || 'developer'}
                    </span>
                  </Link>
                </div>

                <h2 className="text-4xl font-black text-white mb-3 leading-tight tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                  {selectedProject.title}
                </h2>
                <div className="flex items-center gap-2 mb-10 text-sm font-medium text-gray-400">
                  <span>Built by</span>
                  <Link
                    href={`/profile/${selectedProject.userId}`}
                    className="font-bold text-white hover:text-orange-400 hover:underline transition-all flex items-center gap-1"
                    onClick={(e) => { e.stopPropagation(); setSelectedProject(null); }}
                  >
                    @{selectedProject.author?.username || 'developer'}
                  </Link>
                </div>

                {/* About Section */}
                <div className="mb-10">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Layers size={14} className="text-orange-400" /> About the Project
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed font-medium bg-white/[0.01] border border-white/[0.03] p-5 rounded-2xl">
                    {selectedProject.description || 'No description provided for this project.'}
                  </p>
                </div>

                {/* Tech Stack Section */}
                <div className="mb-10">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Code2 size={14} className="text-orange-400" /> Tech Stack Used
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {(() => {
                      const techArr = selectedProject.techStack || [];
                      let parsed: { category?: string, tech: string }[] = [];

                      techArr.forEach((t: string) => {
                        const sectionRegex = /([A-Za-z]+):\s*([^:]+?)(?=\s+[A-Za-z]+:|$)/g;
                        const matches = [...t.matchAll(sectionRegex)];

                        if (matches.length > 0) {
                          matches.forEach(m => {
                            parsed.push({ category: m[1].trim(), tech: m[2].trim() });
                          });
                        } else {
                          if (t.includes(',')) {
                            t.split(',').forEach(item => {
                              if (item.trim()) parsed.push({ tech: item.trim() });
                            });
                          } else {
                            if (t.trim()) parsed.push({ tech: t.trim() });
                          }
                        }
                      });

                      return parsed.map((item, idx) => (
                        item.category ? (
                          <div key={idx} className="px-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex flex-col gap-1 w-full sm:w-[calc(50%-0.375rem)] hover:bg-orange-500/[0.02] hover:border-orange-500/30 transition-all cursor-default">
                            <span className="text-[9px] text-orange-400 uppercase tracking-widest font-black">{item.category}</span>
                            <span className="text-xs font-bold text-gray-300 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 opacity-50" />
                              {item.tech}
                            </span>
                          </div>
                        ) : (
                          <span key={idx} className="px-3.5 py-2 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs font-bold text-gray-300 hover:border-orange-500/30 hover:bg-orange-500/[0.04] hover:text-orange-300 transition-all cursor-default flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 opacity-80" />
                            {item.tech}
                          </span>
                        )
                      ));
                    })()}
                  </div>
                </div>

                {/* Ratings & Reviews Section */}
                <div className="mt-auto pt-8 border-t border-white/[0.05] space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare size={14} className="text-orange-400" /> Community Reviews
                    </h4>
                    {selectedProject.ratings && selectedProject.ratings.length > 0 && (
                      <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl text-xs font-black text-orange-400 shadow-[0_0_15px_rgba(255,138,0,0.1)]">
                        <Star size={12} fill="currentColor" className="text-orange-400" />
                        <span>{getAverageRating(selectedProject.ratings)} / 5.0</span>
                        <span className="text-orange-400/50">({selectedProject.ratings.length})</span>
                      </div>
                    )}
                  </div>

                  {/* Reviews List */}
                  <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
                    {!selectedProject.ratings || selectedProject.ratings.length === 0 ? (
                      <div className="text-center py-8 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2">
                        <MessageSquare size={20} className="text-gray-600 animate-bounce" />
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">No reviews yet</p>
                          <p className="text-[10px] text-gray-600 mt-1">Be the first to share your thoughts!</p>
                        </div>
                      </div>
                    ) : (
                      selectedProject.ratings.slice(0, 5).map((rating: any, idx: number) => (
                        <div key={idx} className="bg-white/[0.02] border border-white/[0.04] border-l-2 border-l-orange-500/60 rounded-2xl p-4 space-y-2 hover:bg-white/[0.04] transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              {rating.userAvatar ? (
                                <img src={rating.userAvatar} alt={rating.username} className="w-6 h-6 rounded-full object-cover border border-white/10" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] font-black uppercase">
                                  {rating.username?.charAt(0)}
                                </div>
                              )}
                              <span className="text-xs font-extrabold text-white">@{rating.username}</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-2.5 h-2.5 ${star <= rating.rating ? 'text-amber-400 fill-current' : 'text-gray-700'}`}
                                />
                              ))}
                            </div>
                          </div>
                          {rating.comment && (
                            <p className="text-xs font-medium text-gray-400 pl-8 leading-relaxed">
                              {rating.comment}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Rating Input Gating */}

                  {/* Option A: Signed In */}
                  {user?.id && (
                    <form onSubmit={handleRateSubmit} className="border-t border-white/[0.05] pt-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Share Your Thoughts</span>
                        <div className="flex items-center gap-1.5" onMouseLeave={() => setHoverRating(0)}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setUserRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              className="p-1 focus:outline-none transition-transform hover:scale-125"
                              title={`Rate ${star} stars`}
                              aria-label={`Rate ${star} stars`}
                            >
                              <Star
                                className={`w-4.5 h-4.5 ${(hoverRating || userRating) >= star ? 'text-amber-400 fill-current' : 'text-gray-700 hover:text-amber-400'}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write an encouraging comment..."
                          className="w-full bg-[#101014] border border-white/[0.06] rounded-2xl px-4 py-3.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 pr-20"
                          required
                        />
                        <button
                          type="submit"
                          disabled={ratingSubmitting}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-black font-black uppercase text-[9px] tracking-wider rounded-xl transition-all disabled:opacity-50"
                        >
                          {ratingSubmitting ? 'Posting...' : 'Post'}
                        </button>
                      </div>

                      {ratingError && (
                        <p className="text-[9px] font-bold text-red-400 mt-1">{ratingError}</p>
                      )}
                    </form>
                  )}

                  {/* Option C: Guest / Signed Out */}
                  {!user?.id && (
                    <div className="border-t border-white/[0.05] pt-5 text-center space-y-3">
                      <p className="text-xs text-gray-400 font-medium">
                        🔐 Sign in to leave a review and support this project showcase!
                      </p>
                      <button
                        type="button"
                        onClick={() => openSignIn?.()}
                        className="w-full py-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
                      >
                        Sign In to Review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
