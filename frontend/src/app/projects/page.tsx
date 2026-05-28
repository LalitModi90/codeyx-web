"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ChevronDown, CheckCircle2, Star, GitCommit, Code2, 
  Award, Github, FolderKanban, Archive, Download, 
  Plus, ExternalLink, Activity, Bookmark, BookOpen, Layers, Play, FileCode2,
  Trash2, Globe, Lock, RefreshCw, Sparkles, Check, GitFork
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { projectService } from '@/services/project.service';
import TopNavbar from '@/components/shared/TopNavbar';

export default function ProjectsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('All Projects');
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    techStack: '',
    description: '',
    githubUrl: '',
    liveUrl: '',
    visibility: 'private',
    featured: false
  });

  const fetchProjects = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectService.getProjects(userId);
      if (res.data) {
        setProjectsList(res.data);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProjects(user.id);
    }
  }, [user?.id]);

  const handleSyncGithub = async () => {
    setSyncing(true);
    setError(null);
    try {
      const res = await projectService.syncGithubProjects();
      if (res.data) {
        setProjectsList(res.data);
      }
    } catch (e: any) {
      setError('Unable to sync GitHub repositories. Using cached data.');
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !user?.id) return;
    try {
      const res = await projectService.createProject(formData);
      if (res.data) {
        setProjectsList([res.data, ...projectsList]);
        setIsAddModalOpen(false);
        setFormData({ title: '', techStack: '', description: '', githubUrl: '', liveUrl: '', visibility: 'private', featured: false });
      }
    } catch (e: any) {
      setError('Failed to create manual project');
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !user?.id) return;
    try {
      const res = await projectService.updateProject(selectedProject._id, formData);
      if (res.data) {
        setProjectsList(projectsList.map(p => p._id === selectedProject._id ? res.data : p));
        setIsEditModalOpen(false);
        setSelectedProject(null);
      }
    } catch (e: any) {
      setError('Failed to update project details');
    }
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectService.deleteProject(projectId);
      setProjectsList(projectsList.filter(p => p._id !== projectId));
      if (selectedProject?._id === projectId) setSelectedProject(null);
    } catch (e: any) {
      setError('Failed to delete project');
    }
  };

  const handleToggleVisibility = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await projectService.toggleVisibility(projectId);
      if (res.data) {
        setProjectsList(projectsList.map(p => p._id === projectId ? res.data : p));
        if (selectedProject?._id === projectId) setSelectedProject(res.data);
      }
    } catch (e: any) {
      setError('Failed to change visibility');
    }
  };

  const handleToggleFeatured = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await projectService.toggleFeatured(projectId);
      if (res.data) {
        setProjectsList(projectsList.map(p => p._id === projectId ? res.data : p));
        if (selectedProject?._id === projectId) setSelectedProject(res.data);
      }
    } catch (e: any) {
      setError('Failed to update featured status');
    }
  };

  // Filter projects by tab
  const filteredProjects = useMemo(() => {
    return projectsList.filter(proj => {
      if (activeTab === 'All Projects') return true;
      if (activeTab === 'Public') return proj.visibility === 'public';
      if (activeTab === 'Private') return proj.visibility === 'private';
      if (activeTab === 'Featured') return proj.featured;
      if (activeTab === 'Repositories') return proj.isRepo;
      return true;
    });
  }, [projectsList, activeTab]);

  // Derived statistics
  const stats = useMemo(() => {
    const total = projectsList.length;
    const publicCount = projectsList.filter(p => p.visibility === 'public').length;
    const privateCount = projectsList.filter(p => p.visibility === 'private').length;
    const stars = projectsList.reduce((acc, p) => acc + (p.stars || 0), 0);
    const forks = projectsList.reduce((acc, p) => acc + (p.forks || 0), 0);
    const featuredCount = projectsList.filter(p => p.featured).length;

    return { total, publicCount, privateCount, stars, forks, featuredCount };
  }, [projectsList]);

  return (
    <div className="min-h-screen bg-[#050816] font-sans pb-20 relative overflow-hidden text-[var(--text-main)]">
      {/* Dynamic Glow Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#58a6ff02_1px,transparent_1px),linear-gradient(to_bottom,#58a6ff02_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-transparent blur-[160px] rounded-full pointer-events-none" />

      <TopNavbar />

      <main className="max-w-[1600px] mx-auto px-6 pt-8 grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT SIDEBAR */}
        <aside className="xl:col-span-2 flex flex-col gap-6 sticky top-24 h-fit">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest px-3 mb-2">Portfolio Navigation</span>
            {[
              { id: 'All Projects', icon: FolderKanban },
              { id: 'Repositories', icon: Github },
              { id: 'Public', icon: Globe },
              { id: 'Private', icon: Lock },
              { id: 'Featured', icon: Star },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                  activeTab === tab.id 
                    ? 'text-[#58A6FF] bg-[#58A6FF]/10 border border-[#58A6FF]/20 shadow-[0_0_15px_rgba(88,166,255,0.05)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <tab.icon size={14} className={activeTab === tab.id ? 'text-[#58A6FF]' : 'text-gray-500'} />
                <span>{tab.id}</span>
              </button>
            ))}
          </div>

          {/* Sync Box */}
          <div className="bg-[#101014] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Showcase Sync</h4>
            <p className="text-[10px] text-gray-500 leading-normal">
              Keep your imported projects automatically synchronized with your GitHub repositories.
            </p>
            <button
              onClick={handleSyncGithub}
              disabled={syncing}
              className="w-full py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-bold text-gray-300 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
              <span>{syncing ? 'Syncing...' : 'Sync Projects'}</span>
            </button>
          </div>
        </aside>

        {/* MAIN PROJECTS AREA */}
        <div className="xl:col-span-10 min-w-0 flex flex-col gap-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-3xl font-black text-white flex items-center gap-3">
                Project Showcase <span className="text-2xl">🚀</span>
              </h1>
              <p className="text-xs text-gray-400 font-semibold mt-1.5">
                Import from GitHub, toggle public visibility, configure features, and manage your public developer portfolio.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleSyncGithub}
                disabled={syncing}
                className="flex items-center gap-2 bg-[#101014] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 transition-all"
              >
                <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Sync GitHub
              </button>
              {user?.username && (
                <Link
                  href={`/portfolio/${user.username}`}
                  className="flex items-center gap-2 bg-[#101014] border border-[#58A6FF]/20 hover:border-[#58A6FF]/40 hover:bg-white/[0.02] px-4 py-2.5 rounded-xl text-xs font-bold text-[#58A6FF] transition-all"
                >
                  <Globe size={14} /> My Public Portfolio
                </Link>
              )}
              <button 
                onClick={() => {
                  setFormData({ title: '', techStack: '', description: '', githubUrl: '', liveUrl: '', visibility: 'private', featured: false });
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-2 bg-[#58A6FF] hover:bg-[#79B8FF] text-black px-5 py-2.5 rounded-xl text-xs font-black shadow-[0_0_20px_rgba(88,166,255,0.2)] transition-all"
              >
                <Plus size={16} /> Create Project
              </button>
            </div>
          </div>

          {/* Stats Summary Card */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Projects', value: stats.total, color: 'text-[#58A6FF]' },
              { label: 'Featured Projects', value: stats.featuredCount, color: 'text-yellow-400' },
              { label: 'Total Stars', value: stats.stars, color: 'text-orange-400' },
              { label: 'Public Portfolio Repos', value: stats.publicCount, color: 'text-emerald-400' },
            ].map(s => (
              <div key={s.label} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl flex flex-col gap-1 shadow-lg hover:border-white/10 transition-all">
                <span className={`text-xl font-black ${s.color}`}>{s.value}</span>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider font-black">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Dynamic Sync Banner */}
          {syncing && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-[#58A6FF] rounded-2xl text-xs font-bold flex items-center gap-3 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Updating portfolio projects & auto-importing repositories...</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* Create manually button */}
            <div 
              onClick={() => {
                setFormData({ title: '', techStack: '', description: '', githubUrl: '', liveUrl: '', visibility: 'private', featured: false });
                setIsAddModalOpen(true);
              }}
              className="border-2 border-dashed border-white/15 bg-white/[0.01] hover:bg-white/[0.02] hover:border-[#58A6FF]/40 rounded-3xl p-6 text-center flex flex-col items-center justify-center min-h-[220px] gap-3 cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-500 group-hover:text-[#58A6FF] group-hover:scale-110 transition-all">
                <Plus size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-white">Create Manual Project</p>
                <p className="text-[10px] text-gray-500 mt-1">Add details, technologies and mock links</p>
              </div>
            </div>

            {filteredProjects.map(proj => (
              <div 
                key={proj._id} 
                onClick={() => {
                  setSelectedProject(proj);
                  setFormData({
                    title: proj.title,
                    techStack: proj.techStack?.join(', ') || '',
                    description: proj.description || '',
                    githubUrl: proj.githubUrl || '',
                    liveUrl: proj.liveUrl || '',
                    visibility: proj.visibility || 'private',
                    featured: proj.featured || false
                  });
                  setIsEditModalOpen(true);
                }}
                className="p-5 rounded-3xl border bg-[#0D1117]/80 border-[#30363D] hover:border-[#58A6FF]/30 hover:shadow-2xl transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#58A6FF]/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#58A6FF]/10 border border-[#58A6FF]/20 flex items-center justify-center">
                      <Code2 className="w-5 h-5 text-[#58A6FF]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white group-hover:text-[#58A6FF] transition-colors">{proj.title}</h3>
                      <span className="text-[8px] font-black uppercase tracking-wider text-gray-500">
                        {proj.isRepo ? 'GitHub Repository' : 'Manual Portfolio Project'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => handleToggleVisibility(proj._id, e)}
                      className={`p-1.5 rounded-lg border hover:bg-white/5 transition-all ${proj.visibility === 'public' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/[0.02] border-white/5 text-gray-500'}`}
                      title={proj.visibility === 'public' ? 'Public Portfolio' : 'Private Portfolio'}
                    >
                      {proj.visibility === 'public' ? <Globe size={12} /> : <Lock size={12} />}
                    </button>
                    <button 
                      onClick={(e) => handleToggleFeatured(proj._id, e)}
                      className={`p-1.5 rounded-lg border hover:bg-white/5 transition-all ${proj.featured ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-white/[0.02] border-white/5 text-gray-500'}`}
                      title="Featured Project"
                    >
                      <Star size={12} fill={proj.featured ? 'currentColor' : 'none'} />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteProject(proj._id, e)}
                      className="p-1.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 text-gray-500 transition-all"
                      title="Delete Project"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed flex-1 line-clamp-3 relative z-10">
                  {proj.description || 'No custom description provided.'}
                </p>

                <div className="flex flex-wrap gap-1 relative z-10">
                  {proj.techStack?.slice(0, 5).map((t: string) => (
                    <span key={t} className="px-2 py-0.5 bg-white/[0.03] border border-white/5 rounded text-[8px] font-bold text-gray-400">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4 relative z-10">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-0.5 text-yellow-500 font-bold"><Star className="w-3.5 h-3.5" />{proj.stars || 0}</span>
                    <span className="flex items-center gap-0.5 text-gray-500 font-bold"><GitFork className="w-3.5 h-3.5" />{proj.forks || 0}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold flex items-center gap-1.5">
                    {proj.deploymentStatus === 'Active' ? (
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                        Live Demo
                      </span>
                    ) : 'Source Code Only'}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* CREATE MANUAL PROJECT MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#0d1117] border border-[#30363D] rounded-3xl p-6 shadow-2xl relative"
            >
              <h2 className="text-lg font-black text-white flex items-center gap-2 mb-4">
                <Code2 className="text-[#58A6FF]" /> Create manual project
              </h2>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Project Title</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#161b22] border border-[#30363D] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#58A6FF]"
                    placeholder="e.g. Portfolio Builder"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#161b22] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#58A6FF] resize-none"
                    placeholder="Describe your project showcase details..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Technologies (comma separated)</label>
                  <input 
                    type="text" 
                    value={formData.techStack} 
                    onChange={e => setFormData({ ...formData, techStack: e.target.value })}
                    className="w-full bg-[#161b22] border border-[#30363D] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#58A6FF]"
                    placeholder="TypeScript, Next.js, Framer Motion"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">GitHub Repository Link</label>
                    <input 
                      type="text" 
                      value={formData.githubUrl} 
                      onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
                      className="w-full bg-[#161b22] border border-[#30363D] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#58A6FF]"
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Live Demo Link</label>
                    <input 
                      type="text" 
                      value={formData.liveUrl} 
                      onChange={e => setFormData({ ...formData, liveUrl: e.target.value })}
                      className="w-full bg-[#161b22] border border-[#30363D] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#58A6FF]"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-[#30363D]">
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#58A6FF] text-black font-black uppercase text-xs hover:bg-[#79B8FF] transition-all"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#0d1117] border border-[#30363D] rounded-3xl p-6 shadow-2xl relative"
            >
              <h2 className="text-lg font-black text-white flex items-center gap-2 mb-4">
                <Code2 className="text-[#58A6FF]" /> Configure Project details
              </h2>
              <form onSubmit={handleUpdateProject} className="space-y-4">
                <div>
                  <label htmlFor="edit-title" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Project Title</label>
                  <input 
                    id="edit-title"
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#161b22] border border-[#30363D] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#58A6FF]"
                    placeholder="Project Title"
                    title="Project Title"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit-desc" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea 
                    id="edit-desc"
                    title="Description"
                    placeholder="Project Description"
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#161b22] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#58A6FF] resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label htmlFor="edit-tech" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Technologies (comma separated)</label>
                  <input 
                    id="edit-tech"
                    title="Technologies"
                    placeholder="React, Node.js, MongoDB..."
                    type="text" 
                    value={formData.techStack} 
                    onChange={e => setFormData({ ...formData, techStack: e.target.value })}
                    className="w-full bg-[#161b22] border border-[#30363D] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#58A6FF]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="edit-github" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">GitHub Repository Link</label>
                    <input 
                      id="edit-github"
                      title="GitHub Repository Link"
                      placeholder="https://github.com/..."
                      type="text" 
                      value={formData.githubUrl} 
                      onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
                      className="w-full bg-[#161b22] border border-[#30363D] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#58A6FF]"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-live" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Live Demo Link</label>
                    <input 
                      id="edit-live"
                      title="Live Demo Link"
                      placeholder="https://..."
                      type="text" 
                      value={formData.liveUrl} 
                      onChange={e => setFormData({ ...formData, liveUrl: e.target.value })}
                      className="w-full bg-[#161b22] border border-[#30363D] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#58A6FF]"
                    />
                  </div>
                </div>

                <div className="flex gap-4 border-t border-[#30363D] pt-4 items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, visibility: formData.visibility === 'public' ? 'private' : 'public' })}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all ${formData.visibility === 'public' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/[0.02] border-white/5 text-gray-400'}`}
                    >
                      {formData.visibility === 'public' ? 'Public Portfolio' : 'Private Portfolio'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all ${formData.featured ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-white/[0.02] border-white/5 text-gray-400'}`}
                    >
                      Featured
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsEditModalOpen(false);
                        setSelectedProject(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#58A6FF] text-black font-black uppercase text-xs hover:bg-[#79B8FF] transition-all"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
