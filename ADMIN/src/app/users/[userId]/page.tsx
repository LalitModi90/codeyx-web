"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { 
  ArrowLeft, ShieldBan, ShieldCheck, Mail, MapPin, 
  Briefcase, Github, Globe, RefreshCw, AlertTriangle, Send, X, CheckSquare, Square
} from "lucide-react";
import Link from "next/link";

export default function UserAdminProfilePage() {
  const { userId } = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyData, setNotifyData] = useState({ title: "", message: "", type: "info" });
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (msg: string, t: 'success' | 'error') => {
    setToast({ message: msg, type: t });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch user profile from leaderboard detail endpoint
      const profileRes = await fetch(`http://localhost:5005/api/leaderboard/user/${userId}`);
      const profileData = await profileRes.json();
      
      if (!profileData.success) {
        setError(profileData.message || "User not found");
        setIsLoading(false);
        return;
      }
      setUser(profileData.data);

      // 2. Fetch user's projects
      const projectsRes = await fetch(`http://localhost:5005/api/projects/${userId}`);
      const projectsData = await projectsRes.json();
      if (projectsData.success) {
        setProjects(projectsData.data || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch user details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleSendNotification = async () => {
    if (!notifyData.title || !notifyData.message) return showToast("Title and Message are required", "error");
    setIsSending(true);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5005/api/admin/notify`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUserId: userId,
          title: notifyData.title,
          message: notifyData.message,
          type: notifyData.type
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Notification sent successfully!", "success");
        setShowNotifyModal(false);
        setNotifyData({ title: "", message: "", type: "info" });
      } else {
        showToast("Failed to send notification: " + data.message, "error");
      }
    } catch (err) {
      showToast("Error sending notification", "error");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-muted-foreground">
        <RefreshCw className="animate-spin mb-4" size={32} />
        <p>Loading user profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-red-500">
        <AlertTriangle size={48} className="mb-4 text-red-500/50" />
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
        <button onClick={() => router.back()} className="mt-6 px-4 py-2 bg-muted text-foreground rounded-lg">
          Go Back
        </button>
      </div>
    );
  }

  const isBanned = user.isBanned || false;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} /> Back to Users
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowNotifyModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-medium transition-colors"
          >
            <Send size={18} /> Send Notification
          </button>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            !isBanned 
              ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20' 
              : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
          }`}>
            {!isBanned ? <ShieldBan size={18} /> : <ShieldCheck size={18} />}
            {!isBanned ? 'Suspend Account' : 'Restore Account'}
          </button>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-purple-500/20 w-full relative">
          <div className="absolute -bottom-12 left-8">
            <img 
              src={user.avatarUrl || '/default-avatar.png'} 
              alt={user.user} 
              className="w-24 h-24 rounded-full border-4 border-card object-cover bg-muted"
            />
          </div>
        </div>
        <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              {user.user} 
              {!isBanned ? (
                <span className="text-[10px] uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20">Active</span>
              ) : (
                <span className="text-[10px] uppercase px-2 py-0.5 bg-red-500/10 text-red-500 rounded border border-red-500/20">Banned</span>
              )}
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">@{user.username}</p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
              {user.college && <span className="flex items-center gap-1.5"><MapPin size={16} /> {user.college}</span>}
              <span className="flex items-center gap-1.5"><Globe size={16} /> {user.isPublic ? 'Public Profile' : 'Private Profile'}</span>
            </div>
          </div>
          <div className="flex gap-4 text-center">
            <div className="bg-muted/50 rounded-lg p-4 min-w-[100px]">
              <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Codeyx Score</p>
              <p className="text-2xl font-black text-primary">{user.rating}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 min-w-[100px]">
              <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Total Solved</p>
              <p className="text-2xl font-black text-foreground">{user.problems}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Stats */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 border-b border-border pb-2">Platform Breakdown</h3>
            {Object.keys(user.platformBreakdown || {}).filter(p => p !== 'codeyx').length === 0 ? (
              <p className="text-muted-foreground text-sm italic">No external platforms connected.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(user.platformBreakdown)
                  .filter(([platform]) => platform !== 'codeyx')
                  .map(([platform, data]: [string, any]) => (
                  <div key={platform} className="flex items-center justify-between">
                    <span className="capitalize font-medium text-foreground">{platform}</span>
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">Solved: <span className="text-foreground font-semibold">{data.solved}</span></p>
                      {data.rating > 0 && <p className="text-muted-foreground">Rating: <span className="text-primary font-semibold">{data.rating}</span></p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 border-b border-border pb-2">Internal Metadata</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Clerk User ID</span> <span className="font-mono text-xs truncate max-w-[150px]">{user.userId}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Win Rate</span> <span className="font-medium">{user.winRate}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Highest Streak</span> <span className="font-medium">{user.streak} days</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Contests Attended</span> <span className="font-medium">{user.contests}</span></div>
            </div>
          </div>
        </div>

        {/* Right Column - Projects */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-border pb-2">
              <h3 className="font-bold text-lg flex items-center gap-2"><Briefcase size={20}/> User Projects</h3>
              <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">{projects.length} Total</span>
            </div>
            
            {projects.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Briefcase size={32} className="mx-auto mb-3 opacity-20" />
                <p>This user hasn't added any projects yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((project: any) => (
                  <div key={project._id} className="bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-foreground truncate">{project.title}</h4>
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${
                        project.visibility === 'public' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                      }`}>
                        {project.visibility}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                    <div className="flex items-center justify-between text-xs mt-auto">
                      <span className="text-muted-foreground">{new Date(project.createdAt).toLocaleDateString()}</span>
                      <div className="flex gap-2">
                        {project.githubUrl && <a href={project.githubUrl} target="_blank" className="text-muted-foreground hover:text-foreground"><Github size={14}/></a>}
                        {project.liveUrl && <a href={project.liveUrl} target="_blank" className="text-muted-foreground hover:text-primary"><Globe size={14}/></a>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setShowNotifyModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Send size={20} className="text-primary"/> Send Notification</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Send a real-time web popup notification to <strong>{user.user}</strong>.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Title</label>
                <input 
                  type="text" 
                  value={notifyData.title}
                  onChange={(e) => setNotifyData({...notifyData, title: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                  placeholder="e.g. Warning, Congratulations, etc."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Message</label>
                <textarea 
                  value={notifyData.message}
                  onChange={(e) => setNotifyData({...notifyData, message: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none resize-none h-24"
                  placeholder="Notification content..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Type</label>
                <select 
                  value={notifyData.type}
                  onChange={(e) => setNotifyData({...notifyData, type: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                >
                  <option value="info">Info (Blue)</option>
                  <option value="success">Success (Green)</option>
                  <option value="urgent">Urgent (Red)</option>
                  <option value="soon">Soon (Orange)</option>
                </select>
              </div>
              <button 
                onClick={handleSendNotification}
                disabled={isSending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSending ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                {isSending ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[9999] px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 transition-all animate-in slide-in-from-bottom-5 fade-in duration-300 bg-white ${
          toast.type === 'success' 
            ? 'border-emerald-200 text-emerald-600' 
            : 'border-red-200 text-red-600'
        }`}>
          {toast.type === 'success' ? <CheckSquare size={20} /> : <Square size={20} />}
          <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
