"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, ExternalLink, CheckCircle, XCircle, Star, Trash2, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function ProjectsModerationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5005/api/projects/public/all/explore");
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAction = (id: string, action: "Approved" | "Featured" | "Spam" | "Deleted") => {
    // Optimistic UI Update (In a real app, this should make an API call to update status)
    if (action === "Deleted") {
      setProjects(projects.filter(p => p._id !== id));
    } else {
      setProjects(projects.map(p => p._id === id ? { ...p, status: action, featured: action === 'Featured' } : p));
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.author?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects Moderation</h1>
          <p className="text-muted-foreground mt-1">Review, approve, or feature community submitted projects.</p>
        </div>
        <button 
          onClick={fetchProjects}
          className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search projects by title or author..." 
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-muted-foreground">
          <RefreshCw className="animate-spin mr-2" size={24} /> Loading real projects from backend...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const isFeatured = project.featured;
            // Determine status based on flags if real DB doesn't have a strict 'status' string
            const status = project.status || (isFeatured ? 'Featured' : 'Approved');

            return (
              <div key={project._id} className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
                {project.screenshotUrl && (
                  <div className="w-full h-32 bg-muted relative overflow-hidden">
                    <img src={project.screenshotUrl} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                      status === 'Pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                      status === 'Featured' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                      status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {status === 'Featured' && <Star size={10} className="inline mr-1" />}
                      {status}
                    </span>
                    <span className="text-xs text-muted-foreground">{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    by <span className="font-medium text-foreground">@{project.author?.username || 'developer'}</span>
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                    {project.techStack?.slice(0, 4).map((tech: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs border border-border/50">
                        {tech}
                      </span>
                    ))}
                    {project.techStack?.length > 4 && (
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs border border-border/50">
                        +{project.techStack.length - 4}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="bg-muted/30 p-3 border-t border-border flex items-center justify-between gap-2">
                  <Link 
                    href={project.githubUrl || project.liveUrl || "#"} 
                    target="_blank"
                    className="flex-1 flex justify-center items-center gap-1.5 py-2 text-xs font-medium bg-background border border-border rounded hover:bg-muted transition-colors text-foreground"
                  >
                    <ExternalLink size={14} /> View
                  </Link>
                  
                  {status !== 'Approved' && status !== 'Featured' && (
                    <button 
                      onClick={() => handleAction(project._id, 'Approved')}
                      className="flex-1 flex justify-center items-center gap-1.5 py-2 text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-colors text-emerald-600 dark:text-emerald-400"
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                  )}

                  {status === 'Approved' && (
                    <button 
                      onClick={() => handleAction(project._id, 'Featured')}
                      className="flex-1 flex justify-center items-center gap-1.5 py-2 text-xs font-medium bg-purple-500/10 border border-purple-500/20 rounded hover:bg-purple-500/20 transition-colors text-purple-600 dark:text-purple-400"
                    >
                      <Star size={14} /> Feature
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleAction(project._id, 'Deleted')}
                    className="w-10 flex justify-center items-center py-2 text-xs font-medium bg-red-500/10 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors text-red-600 dark:text-red-400"
                    title="Delete/Reject"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          
          {filteredProjects.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
              No projects found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
