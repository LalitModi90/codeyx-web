"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, ExternalLink, Globe, Lock, Star, GitFork, 
  CheckCircle, Code2, Edit3, Image as ImageIcon, Trash2,
  Plus, Check, Sparkles, X, Info
} from 'lucide-react';
import { projectService } from '@/services/project.service';
import { useUser, useClerk } from '@clerk/nextjs';

interface Props { 
  repositories: any[]; 
  userId?: string; 
}

const PROVIDER_BADGE: Record<string, { color: string; bg: string }> = {
  'Vercel':         { color: 'text-white',        bg: 'bg-black border-white/20' },
  'Netlify':        { color: 'text-teal-400',     bg: 'bg-teal-500/10 border-teal-500/20' },
  'GitHub Pages':   { color: 'text-[#58A6FF]',   bg: 'bg-blue-500/10 border-blue-500/20' },
  'Custom Hosting': { color: 'text-purple-400',   bg: 'bg-purple-500/10 border-purple-500/20' },
  'Source Only':    { color: 'text-gray-500',     bg: 'bg-white/[0.03] border-white/[0.06]' },
};

export default function ProjectShowcase({ repositories, userId }: Props) {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Rating & Detail modal states
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [userRating, setUserRating] = useState<number>(5);
  const [userComment, setUserComment] = useState<string>('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [showVisibilityTour, setShowVisibilityTour] = useState(false);

  const isOwner = !userId || user?.id === userId;

  const getAverageRating = (ratingsList: any[]) => {
    if (!ratingsList || ratingsList.length === 0) return 0;
    const sum = ratingsList.reduce((acc, r) => acc + r.rating, 0);
    return (sum / ratingsList.length).toFixed(1);
  };

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !selectedProject.dbId) {
      alert("This project doesn't have a database entry yet. Edit and save it first to enable rating!");
      return;
    }
    setRatingSubmitting(true);
    setRatingError('');
    try {
      const res = await projectService.addProjectRating(selectedProject.dbId, {
        rating: userRating,
        comment: userComment,
        username: user?.username || user?.fullName || 'Anonymous',
        userAvatar: user?.imageUrl || ''
      });
      
      const updatedProj = res.data;
      await loadProjects();
      
      // Update selected project state
      setSelectedProject((prev: any) => ({
        ...prev,
        ratings: updatedProj.ratings
      }));
      setUserComment('');
      setUserRating(5);
    } catch (err: any) {
      console.error('Failed to submit rating:', err);
      setRatingError(err.response?.data?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    githubUrl: '',
    liveUrl: '',
    screenshotUrl: '',
    galleryUrls: [] as string[],
    visibility: 'private',
    featured: false
  });

  const loadProjects = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await projectService.getProjects(userId);
      if (res) {
        setDbProjects(Array.isArray(res) ? res : (res.data || []));
      }
    } catch (err) {
      console.error('Error fetching database projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [userId]);

  useEffect(() => {
    if (isOwner && typeof window !== 'undefined') {
      const tourDone = localStorage.getItem('codeyx_visibility_tour');
      if (!tourDone) {
        setShowVisibilityTour(true);
      }
    }
  }, [isOwner]);

  const closeTour = () => {
    setShowVisibilityTour(false);
    localStorage.setItem('codeyx_visibility_tour', 'done');
  };

  const handleOpenEdit = (repo: any) => {
    // Find matching project in DB
    const match = dbProjects.find(p => p._id === repo.dbId || p.repoName === repo.name || p.title === repo.name);
    
    if (match) {
      setEditingProject(match);
      setFormData({
        title: match.title || repo.name,
        description: match.description || repo.description || '',
        techStack: match.techStack?.join(', ') || repo.language || '',
        githubUrl: match.githubUrl || repo.githubUrl || '',
        liveUrl: match.liveUrl || repo.homepage || '',
        screenshotUrl: match.screenshotUrl || '',
        galleryUrls: match.galleryUrls || [],
        visibility: match.visibility || 'private',
        featured: match.featured || false
      });
    } else {
      // If no match found in DB, let's create a temporary editing payload
      setEditingProject({ isNew: true, repoName: repo.name });
      setFormData({
        title: repo.name,
        description: repo.description || '',
        techStack: repo.language || '',
        githubUrl: `https://github.com/${repo.name}`,
        liveUrl: repo.homepage || '',
        screenshotUrl: '',
        galleryUrls: [],
        visibility: 'private',
        featured: false
      });
    }
  };

  const handleAddNewProject = () => {
    setEditingProject({ isNew: true, isCustom: true });
    setFormData({
      title: 'New Project',
      description: '',
      techStack: '',
      githubUrl: '',
      liveUrl: '',
      screenshotUrl: '',
      galleryUrls: [],
      visibility: 'public',
      featured: false
    });
  };

  const handleDeleteProject = (projectId: string) => {
    setProjectToDelete(projectId);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await projectService.deleteProject(projectToDelete);
      await loadProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
      setErrorMsg('Failed to delete project. Please try again.');
    } finally {
      setProjectToDelete(null);
    }
  };

  const handleToggleVisibility = async (e: React.MouseEvent, repo: any) => {
    e.stopPropagation();
    const newVisibility = repo.visibility === 'public' ? 'private' : 'public';
    try {
      if (!repo.dbId) {
        // Auto-create the project in DB if it doesn't exist yet
        await projectService.createProject({
          title: repo.name,
          description: repo.description || '',
          techStack: repo.language || '',
          githubUrl: `https://github.com/${repo.name}`,
          liveUrl: repo.homepage || '',
          screenshotUrl: '',
          visibility: newVisibility,
          featured: false,
          isRepo: true,
          repoName: repo.name
        });
      } else {
        await projectService.updateProject(repo.dbId, { visibility: newVisibility });
      }
      await loadProjects();
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
      setErrorMsg('Failed to update visibility. Please try again.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 1MB = 1024 * 1024 bytes
    const sizeLimit = 1 * 1024 * 1024;
    if (file.size > sizeLimit) {
      setErrorMsg('Image size must be under 1MB to save successfully.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, screenshotUrl: reader.result as string }));
      setErrorMsg('');
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentCount = formData.galleryUrls.length;
    if (currentCount + files.length > 4) {
      setErrorMsg('You can only upload up to 4 gallery images.');
      return;
    }

    const sizeLimit = 1 * 1024 * 1024;
    Array.from(files).forEach(file => {
      if (file.size > sizeLimit) {
        setErrorMsg('Each image must be under 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ 
          ...prev, 
          galleryUrls: [...prev.galleryUrls, reader.result as string].slice(0, 4) 
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || !editingProject) return;
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      let res;
      if (editingProject.isNew) {
        // Create project in DB
        res = await projectService.createProject({
          ...formData,
          isRepo: !editingProject.isCustom,
          repoName: editingProject.isCustom ? undefined : editingProject.repoName
        });
      } else {
        // Update project in DB
        res = await projectService.updateProject(editingProject._id, formData);
      }
      console.log('[ProjectShowcase] Save response:', res);
      setSuccessMsg(res?.data?.message || 'Project saved successfully!');
      await loadProjects();
      setTimeout(() => {
        setEditingProject(null);
        setSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      console.error('[ProjectShowcase] Save error:', err);
      const msg = typeof err === 'string' ? err : (err?.message || 'Failed to save project');
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'stars' | 'forks' | 'name' | 'rated'>('stars');

  // Merge repo statistics with DB project edits and include custom standalone projects
  const repoNamesFetched = new Set(repositories.map(r => r.name));
  const mergedShowcase = repositories.map(repo => {
    const dbMatch = dbProjects.find(p => p.repoName === repo.name || p.title === repo.name);
    return {
      name: repo.name,
      description: dbMatch?.description || repo.description || `Public GitHub repository for ${repo.name}`,
      homepage: dbMatch?.liveUrl || repo.homepage || '',
      githubUrl: dbMatch?.githubUrl || `https://github.com/${repo.name}`,
      techStack: dbMatch?.techStack || [repo.language].filter(l => l && l !== 'Unknown'),
      screenshotUrl: dbMatch?.screenshotUrl || '',
      galleryUrls: dbMatch?.galleryUrls || [],
      visibility: dbMatch?.visibility || 'private',
      featured: dbMatch?.featured || false,
      stars: repo.stars || 0,
      forks: repo.forks || 0,
      deploymentProvider: dbMatch?.deploymentProvider || repo.deploymentProvider || 'Source Only',
      dbId: dbMatch?._id,
      ratings: dbMatch?.ratings || [],
      isRepo: true
    };
  });

  // Append custom database projects that are not associated with any fetched GitHub repo
  dbProjects.forEach(proj => {
    const isLinkedToFetchedRepo = proj.repoName ? repoNamesFetched.has(proj.repoName) : (proj.title ? repoNamesFetched.has(proj.title) : false);
    if (!isLinkedToFetchedRepo) {
      mergedShowcase.push({
        name: proj.title || 'Custom Project',
        description: proj.description || '',
        homepage: proj.liveUrl || '',
        githubUrl: proj.githubUrl || '',
        techStack: proj.techStack || [],
        screenshotUrl: proj.screenshotUrl || '',
        galleryUrls: proj.galleryUrls || [],
        visibility: proj.visibility || 'private',
        featured: proj.featured || false,
        stars: proj.stars || 0,
        forks: proj.forks || 0,
        deploymentProvider: proj.deploymentProvider || 'Source Only',
        dbId: proj._id,
        ratings: proj.ratings || [],
        isRepo: false
      });
    }
  });

  const filteredAndSorted = mergedShowcase
    .filter(repo => {
      const q = searchQuery.toLowerCase();
      return (
        repo.name?.toLowerCase().includes(q) ||
        repo.description?.toLowerCase().includes(q) ||
        repo.techStack?.some((t: string) => t.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'stars') return (b.stars || 0) - (a.stars || 0);
      if (sortBy === 'forks') return (b.forks || 0) - (a.forks || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'rated') {
        const avgA = getAverageRating(a.ratings);
        const avgB = getAverageRating(b.ratings);
        if (avgB !== avgA) return Number(avgB) - Number(avgA);
        return (b.ratings?.length || 0) - (a.ratings?.length || 0);
      }
      return 0;
    });

  if (mergedShowcase.length === 0) {
    return (
      <div className="p-12 rounded-3xl border bg-[#0D1117]/80 border-[#30363D] flex flex-col items-center justify-center gap-3">
        <Rocket className="w-10 h-10 text-gray-700" />
        <p className="text-sm font-bold text-gray-500">No projects to showcase</p>
        <p className="text-xs text-gray-600">Sync your GitHub profile to load project data.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-[#58A6FF]" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-[var(--text-main)]">Project Showcase</h3>
          </div>
          {isOwner && (
            <button
              onClick={handleAddNewProject}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#58A6FF]/10 hover:bg-[#58A6FF]/20 border border-[#58A6FF]/20 text-[#58A6FF] text-[9px] font-black uppercase tracking-wider transition-all"
            >
              <Plus className="w-3 h-3" />
              <span>Add Custom Project</span>
            </button>
          )}
        </div>
        
        {/* Search & Sort controls */}
        <div className="flex items-center flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#101014] border border-white/10 rounded-xl px-3 py-1.5 text-[10px] font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-[#58A6FF]/50 transition-all min-w-[150px]"
          />
          <div className="flex bg-[#101014] border border-white/10 rounded-xl p-0.5">
            {(['stars', 'forks', 'name', 'rated'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSortBy(mode)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                  sortBy === mode 
                    ? 'bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/20 shadow-[0_0_10px_rgba(88,166,255,0.05)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 bg-white/[0.02] px-2.5 py-1.5 rounded-xl border border-white/5">
            Public Portfolio Sync
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAndSorted.map((repo, i) => {
          const badge = PROVIDER_BADGE[repo.deploymentProvider] || PROVIDER_BADGE['Source Only'];
          return (
            <motion.div
              key={repo.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedProject(repo)}
              className="group p-5 rounded-xl border bg-[#111216] border-white/5 hover:border-[#58A6FF]/40 hover:bg-[#111216]/80 hover:shadow-[0_0_24px_rgba(88,166,255,0.1)] transition-all duration-300 relative overflow-hidden flex flex-col gap-3 cursor-pointer"
            >
              {/* Overlay Thumbnail Preview */}
              {repo.screenshotUrl && (
                <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay group-hover:opacity-20 transition-opacity pointer-events-none" style={{ backgroundImage: `url(${repo.screenshotUrl})` }} />
              )}

              <div className="absolute inset-0 bg-gradient-to-br from-[#58A6FF]/[0.015] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* Header */}
              <div className="flex items-start justify-between gap-2 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#58A6FF]/20 to-[#1F6FEB]/10 border border-[#58A6FF]/20 flex items-center justify-center flex-shrink-0">
                    <Code2 className="w-4 h-4 text-[#58A6FF]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-black text-[#58A6FF]">{repo.name}</p>
                      {repo.featured && (
                        <Star className="w-3 h-3 text-yellow-400 fill-currentColor" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[7px] font-black uppercase px-1 py-0.5 rounded border ${badge.bg} ${badge.color}`}>
                        {repo.deploymentProvider}
                      </span>
                      {isOwner ? (
                        <div className="relative">
                          {i === 0 && showVisibilityTour && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-[#58A6FF] p-3 rounded-2xl shadow-[0_10px_30px_rgba(88,166,255,0.3)] z-50"
                            >
                              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#58A6FF] rotate-45" />
                              <div className="flex flex-col items-center gap-2 relative z-10">
                                <p className="text-black text-[10px] font-black leading-tight text-center uppercase tracking-wide">
                                  Click here to toggle your project between Public and Private!
                                </p>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); closeTour(); }}
                                  className="w-full py-1.5 bg-black/10 hover:bg-black/20 rounded-lg text-black text-[9px] font-extrabold uppercase transition-colors"
                                >
                                  Got it
                                </button>
                              </div>
                            </motion.div>
                          )}
                          <button
                            onClick={(e) => handleToggleVisibility(e, repo)}
                            className={`group flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all duration-300 ${
                              repo.visibility === 'public' 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                                : 'bg-white/[0.02] border-white/10 text-gray-500 hover:bg-white/[0.05] hover:text-gray-300'
                            } ${i === 0 && showVisibilityTour ? 'ring-2 ring-[#58A6FF] ring-offset-2 ring-offset-[#0D1117] relative z-40' : ''}`}
                            title="Toggle visibility"
                          >
                            <div className={`relative w-5 h-2.5 rounded-full transition-colors duration-300 flex items-center ${repo.visibility === 'public' ? 'bg-emerald-500/40' : 'bg-white/20'}`}>
                              <div className={`absolute w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300 ${repo.visibility === 'public' ? 'translate-x-2.5 shadow-emerald-500/50' : '-translate-x-0.5 shadow-black/50'}`} />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest mt-0.5">
                              {repo.visibility}
                            </span>
                          </button>
                        </div>
                      ) : (
                        <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border flex items-center gap-0.5 ${repo.visibility === 'public' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/[0.02] border-white/5 text-gray-500'}`}>
                          {repo.visibility === 'public' ? <Globe className="w-2 h-2"/> : <Lock className="w-2 h-2"/>}
                          {repo.visibility}
                        </span>
                      )}
                      {repo.ratings && repo.ratings.length > 0 && (
                        <span className="text-[7px] font-black uppercase px-1 py-0.5 rounded border bg-yellow-500/10 border-yellow-500/20 text-yellow-400 flex items-center gap-0.5">
                          <Star className="w-2 h-2 fill-current" />
                          {getAverageRating(repo.ratings)} ({repo.ratings.length})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isOwner && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(repo);
                      }}
                      className="p-1.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-[#58A6FF]/30 text-gray-400 hover:text-white transition-all"
                      title="Edit project parameters"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {repo.dbId && !repo.isRepo && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(repo.dbId);
                        }}
                        className="p-1.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-rose-500/10 hover:border-rose-500/30 text-gray-400 hover:text-rose-400 transition-all"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-[10px] text-gray-400 leading-relaxed flex-1 relative z-10 line-clamp-2">
                {repo.description || 'No description provided.'}
              </p>

              {/* Custom Tech Stack Tags */}
              <div className="flex flex-wrap gap-1 relative z-10">
                {repo.techStack?.slice(0, 4).map((t: string) => (
                  <span key={t} className="px-1.5 py-0.5 bg-white/[0.03] border border-white/5 rounded text-[8px] font-bold text-gray-500">
                    {t}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between relative z-10 border-t border-white/5 pt-2.5">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[9px] text-yellow-400 font-bold">
                    <Star className="w-3 h-3" />{repo.stars}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] text-gray-500">
                    <GitFork className="w-3 h-3" />{repo.forks}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {repo.githubUrl && (
                    <a
                      href={repo.githubUrl}
                      target="_blank" rel="noreferrer"
                      className="px-2 py-1 rounded-lg text-[9px] font-black bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white hover:border-white/20 transition-all"
                    >
                      GitHub
                    </a>
                  )}
                  {repo.homepage && (
                    <a
                      href={repo.homepage}
                      target="_blank" rel="noreferrer"
                      className="px-2 py-1 rounded-lg text-[9px] font-black bg-[#58A6FF]/10 border border-[#58A6FF]/20 text-[#58A6FF] hover:bg-[#58A6FF]/20 transition-all flex items-center gap-1"
                    >
                      <Globe className="w-2.5 h-2.5" />Live
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {projectToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0D1117] border border-rose-500/20 rounded-2xl p-6 shadow-[0_0_40px_rgba(244,63,94,0.15)] max-w-sm w-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col items-center text-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wide">Delete Project?</h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    This action cannot be undone. Are you absolutely sure you want to delete this project from your showcase?
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full mt-4">
                  <button
                    onClick={() => setProjectToDelete(null)}
                    className="flex-1 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-gray-300 hover:text-white text-xs font-bold transition-all border border-[#30363D]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-black uppercase text-xs transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDITING DIALOG / DRAWER */}
      <AnimatePresence>
        {editingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              className="w-full max-w-2xl bg-[#0D1117] border border-[#30363D] rounded-xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#58A6FF]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#58A6FF]" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Configure Public Showcase</h3>
                </div>
                <button
                  onClick={() => setEditingProject(null)}
                  className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all"
                  aria-label="Close Configuration Modal"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {successMsg ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-center text-emerald-400">
                  <CheckCircle className="w-10 h-10" />
                  <p className="text-xs font-black uppercase tracking-wider">{successMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden min-h-0 mt-2">
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-2 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Project Name / Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-[#161b22] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#58A6FF]"
                        placeholder="e.g. My Premium App"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-[#161b22] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#58A6FF] resize-none"
                        rows={3}
                        placeholder="Short showcase introduction..."
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Technologies Used (comma separated)</label>
                      <input
                        type="text"
                        value={formData.techStack}
                        onChange={e => setFormData({ ...formData, techStack: e.target.value })}
                        className="w-full bg-[#161b22] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#58A6FF]"
                        placeholder="Next.js, TypeScript, Framer Motion"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">GitHub URL</label>
                      <input
                        type="text"
                        value={formData.githubUrl}
                        onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
                        className="w-full bg-[#161b22] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#58A6FF]"
                        placeholder="https://github.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Live URL (e.g. Vercel)</label>
                      <input
                        type="text"
                        value={formData.liveUrl}
                        onChange={e => setFormData({ ...formData, liveUrl: e.target.value })}
                        className="w-full bg-[#161b22] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#58A6FF]"
                        placeholder="https://..."
                      />
                    </div>

                     <div className="col-span-2">
                      <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Project Photo / Thumbnail (Upload or enter URL)</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                          <input
                            type="text"
                            value={formData.screenshotUrl}
                            onChange={e => setFormData({ ...formData, screenshotUrl: e.target.value })}
                            className="w-full bg-[#161b22] border border-[#30363D] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#58A6FF]"
                            placeholder="Paste image URL (or upload)..."
                          />
                        </div>
                        <label className="flex items-center justify-center px-4 py-2 bg-white/[0.04] border border-[#30363D] rounded-xl hover:bg-white/[0.08] hover:border-[#58A6FF]/30 text-gray-400 hover:text-white transition-all text-xs font-bold cursor-pointer shrink-0">
                          Upload File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      
                      {/* Image Preview */}
                      {formData.screenshotUrl && (
                        <div className="mt-2 relative w-full h-24 rounded-xl overflow-hidden border border-white/5 bg-[#161b22]">
                          <img src={formData.screenshotUrl} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, screenshotUrl: '' })}
                            className="absolute top-1.5 right-1.5 p-1 bg-black/75 hover:bg-black text-gray-400 hover:text-white rounded-full transition-all"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="col-span-2 mt-2">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Project Gallery (Up to 4 images)</label>
                        <span className="text-[8px] font-bold text-gray-600">{formData.galleryUrls.length} / 4</span>
                      </div>
                      
                      {formData.galleryUrls.length < 4 && (
                        <label className="flex items-center justify-center w-full py-3 bg-white/[0.02] border border-dashed border-white/10 rounded-xl hover:bg-white/[0.05] hover:border-emerald-500/30 text-gray-400 hover:text-white transition-all text-xs font-bold cursor-pointer">
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add Gallery Image
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleGalleryUpload}
                            className="hidden"
                          />
                        </label>
                      )}

                      {formData.galleryUrls.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {formData.galleryUrls.map((url, idx) => (
                            <div key={idx} className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10 bg-[#161b22]">
                              <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  const newUrls = [...formData.galleryUrls];
                                  newUrls.splice(idx, 1);
                                  setFormData(prev => ({ ...prev, galleryUrls: newUrls }));
                                }}
                                className="absolute top-1 right-1 p-0.5 bg-black/80 hover:bg-black text-gray-400 hover:text-white rounded-full transition-all"
                                title="Remove image"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-black/20 border border-[#30363D] rounded-xl p-3 mt-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, visibility: formData.visibility === 'public' ? 'private' : 'public' })}
                        className={`px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all ${formData.visibility === 'public' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/[0.02] border-white/5 text-gray-400'}`}
                      >
                        {formData.visibility === 'public' ? 'Public portfolio' : 'Private'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                        className={`px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all ${formData.featured ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-white/[0.02] border-white/5 text-gray-400'}`}
                      >
                        Featured
                      </button>
                    </div>
                    <span className="text-[8px] font-medium text-gray-600 uppercase tracking-wide">
                      {formData.visibility === 'public' ? 'Will show on public page' : 'Invisible to others'}
                    </span>
                  </div>

                  {errorMsg && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mt-2">
                      <Info className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      <p className="text-[10px] font-bold text-red-400">{errorMsg}</p>
                    </div>
                  )}

                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t border-[#30363D] mt-4 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingProject(null)}
                      className="px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2.5 rounded-xl bg-[#58A6FF] text-black font-black uppercase text-xs hover:bg-[#79B8FF] transition-all disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}

        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-[1100px] bg-[#0D1117] border border-[#30363D] rounded-xl overflow-hidden shadow-[0_0_50px_rgba(88,166,255,0.15)] flex flex-col md:flex-row h-[75vh] max-h-[750px]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 p-2 bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white rounded-full transition-all z-20 border border-white/5"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Left Column: Project Details */}
              <div className="w-full md:w-1/2 p-6 md:p-8 border-b md:border-b-0 md:border-r border-[#30363D] overflow-y-auto flex flex-col gap-5">
                {selectedProject.screenshotUrl && (
                  <div className="w-full h-44 rounded-2xl overflow-hidden border border-white/5 bg-[#161b22] relative group shrink-0">
                    <img src={selectedProject.screenshotUrl} alt={selectedProject.name} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* GALLERY GRID */}
                {selectedProject.galleryUrls && selectedProject.galleryUrls.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-500">Project Gallery</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedProject.galleryUrls.map((url: string, idx: number) => (
                        <div key={idx} className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/5 bg-[#161b22]">
                          <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-[#58A6FF]" />
                    <h2 className="text-xl font-black text-white">{selectedProject.name}</h2>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-[#58A6FF]/10 border border-[#58A6FF]/20 text-[#58A6FF] rounded text-[8px] font-black uppercase tracking-wider">
                      {selectedProject.deploymentProvider}
                    </span>
                    <span className={`px-2 py-0.5 border rounded text-[8px] font-black uppercase tracking-wider ${selectedProject.visibility === 'public' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/[0.02] border-white/5 text-gray-500'}`}>
                      {selectedProject.visibility}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed font-medium bg-[#161b22]/50 p-4 rounded-2xl border border-white/5">
                  {selectedProject.description || 'No description provided for this project.'}
                </p>

                {selectedProject.techStack && selectedProject.techStack.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-500">Technologies</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProject.techStack.map((t: string) => (
                        <span key={t} className="px-2.5 py-1 bg-white/[0.03] border border-white/5 rounded-xl text-[9px] font-bold text-gray-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-auto pt-4 border-t border-[#30363D]">
                  {selectedProject.githubUrl && (
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-white/[0.03] border border-[#30363D] hover:bg-white/[0.08] hover:border-[#58A6FF]/30 text-xs font-bold text-gray-300 hover:text-white rounded-xl transition-all"
                    >
                      <GitFork className="w-3.5 h-3.5" />
                      <span>Repository</span>
                    </a>
                  )}
                  {selectedProject.liveUrl && (
                    <a
                      href={selectedProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-[#58A6FF] hover:bg-[#79B8FF] text-xs font-black text-black rounded-xl transition-all shadow-[0_0_20px_rgba(88,166,255,0.2)]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live Site</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: Ratings & Comments */}
              <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col gap-6 bg-[#0D1117]/50">
                <div className="flex items-center justify-between border-b border-[#30363D] pb-4">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">User Reviews</h3>
                    <p className="text-[10px] text-gray-500 font-bold mt-0.5">
                      {selectedProject.ratings?.length || 0} Total {selectedProject.ratings?.length === 1 ? 'Comment' : 'Comments'}
                    </p>
                  </div>
                  {selectedProject.dbId ? (
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-base font-black text-white">{getAverageRating(selectedProject.ratings)}</span>
                      </div>
                      <span className="text-[8px] font-black uppercase text-gray-500 tracking-wider">Average Score</span>
                    </div>
                  ) : (
                    <span className="text-[8px] font-bold text-gray-600 bg-white/[0.02] border border-white/5 px-2 py-1 rounded">
                      Unsaved Repository
                    </span>
                  )}
                </div>

                {/* Star review list (only top 5) */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {!selectedProject.ratings || selectedProject.ratings.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center gap-2 text-center">
                      <Sparkles className="w-5 h-5 text-gray-600" />
                      <p className="text-[10px] font-bold text-gray-500">No reviews yet.</p>
                      {userId && selectedProject.dbId && <p className="text-[9px] text-gray-600">Be the first to share your thoughts!</p>}
                    </div>
                  ) : (
                    <>
                      {/* Sort by date newest first, slice to top 5 */}
                      {[...selectedProject.ratings]
                        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map((rating: any, index: number) => (
                          <div key={index} className="p-3 bg-[#161b22] border border-[#30363D] rounded-2xl flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {rating.userAvatar ? (
                                  <img src={rating.userAvatar} alt={rating.username} className="w-5 h-5 rounded-full object-cover" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#58A6FF]/20 to-[#1F6FEB]/20 border border-white/5 flex items-center justify-center text-[8px] font-bold text-[#58A6FF]">
                                    {rating.username.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <span className="text-[10px] font-black text-white">{rating.username}</span>
                              </div>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-2.5 h-2.5 ${star <= rating.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            {rating.comment && (
                              <p className="text-[10px] text-gray-400 leading-relaxed font-medium bg-black/20 p-2 rounded-xl border border-white/5">
                                {rating.comment}
                              </p>
                            )}
                          </div>
                        ))}

                      {selectedProject.ratings.length > 5 && (
                        <div className="text-center py-2 bg-white/[0.02] border border-dashed border-white/5 rounded-xl">
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                            And {selectedProject.ratings.length - 5} more comments...
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>


              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
