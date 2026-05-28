"use client";

import React, { useEffect, useState } from 'react';
import TopNavbar from '@/components/shared/TopNavbar';
import { Settings, Link2, ExternalLink, CheckCircle2, RefreshCw, ShieldAlert, Trash2, Lock, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { platformService } from '@/services/platform.service';

const AVAILABLE_PLATFORMS = [
  { id: 'leetcode', name: 'LeetCode', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { id: 'github', name: 'GitHub', color: 'text-gray-200', bg: 'bg-gray-200/10', border: 'border-gray-200/20' },
  { id: 'codeforces', name: 'Codeforces', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 'codechef', name: 'CodeChef', color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/20' },
  { id: 'hackerrank', name: 'HackerRank', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'atcoder', name: 'AtCoder', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
];

export default function IntegrationsSettings() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<'integrations' | 'privacy'>('integrations');
  const [connectedPlatforms, setConnectedPlatforms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [platformUsername, setPlatformUsername] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [disconnectModal, setDisconnectModal] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      platformService.getAllPlatformStats(user.id)
        .then((res: any) => {
          const platformsArray = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : (res.data?.data || []));
          setConnectedPlatforms(platformsArray);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [user?.id]);

  const isConnected = (platformId: string) => {
    return connectedPlatforms.some((p) => p.platform === platformId);
  };

  const extractUsername = (input: string) => {
    let text = input.trim();
    if (text.endsWith('/')) text = text.slice(0, -1);
    
    try {
      if (text.includes('http') || text.includes('.com') || text.includes('.jp')) {
        const url = new URL(text.startsWith('http') ? text : `https://${text}`);
        const paths = url.pathname.split('/').filter(Boolean);
        return paths[paths.length - 1] || text;
      }
    } catch (e) {}

    const parts = text.split('/');
    return parts[parts.length - 1];
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platformUsername.trim() || !activeModal || !user?.id) return;
    
    setIsSyncing(true);
    setError("");
    setSuccessMsg("");
    
    const finalUsername = extractUsername(platformUsername);

    try {
      await platformService.syncPlatform(activeModal, user.id, finalUsername);
      const res: any = await platformService.getAllPlatformStats(user.id);
      const platformsArray = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : (res.data?.data || []));
      setConnectedPlatforms(platformsArray);
      
      window.dispatchEvent(new CustomEvent('platformsUpdated', { detail: platformsArray }));

      setSuccessMsg("Account successfully connected!");
      setTimeout(() => {
        setActiveModal(null);
        setPlatformUsername("");
        setSuccessMsg("");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || "Please verify your username and try again.";
      setError(`Connection failed: ${serverMsg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const triggerDisconnect = (platformId: string) => {
    setDisconnectModal(platformId);
    setError("");
    setSuccessMsg("");
  };

  const handleDisconnectConfirm = async () => {
    if (!disconnectModal || !user?.id) return;
    
    setIsDisconnecting(true);
    setError("");
    setSuccessMsg("");
    
    try {
      await platformService.disconnectPlatform(disconnectModal, user.id);
      
      const res: any = await platformService.getAllPlatformStats(user.id);
      const platformsArray = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : (res.data?.data || []));
      setConnectedPlatforms(platformsArray);
      
      window.dispatchEvent(new CustomEvent('platformsUpdated', { detail: platformsArray }));
      
      setSuccessMsg("Account successfully disconnected!");
      setTimeout(() => {
        setDisconnectModal(null);
        setSuccessMsg("");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError("Failed to disconnect account. Please try again.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Perform full account and profile deletion
  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    setError("");
    try {
      console.log("[Delete Account] Initiating Clerk deletion...");
      await user.delete();
      console.log("[Delete Account] Clerk user deleted successfully.");
      window.location.href = "/login"; // Redirect to login
    } catch (err: any) {
      console.error("Clerk deletion failed:", err);
      setError(err.message || "Failed to permanently delete account. Please try again later.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] font-sans text-white pb-20 relative">
      <TopNavbar />

      <main className="max-w-4xl mx-auto px-6 pt-12 flex flex-col gap-8 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
            <Settings className="text-[#FF8A00]" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Settings</h1>
            <p className="text-gray-400 font-semibold mt-1">Configure integrations, privacy, and account security preferences.</p>
          </div>
        </div>

        {/* PREMIUM GLASSMORPHIC TABS */}
        <div className="flex border-b border-white/5 gap-6 mb-2">
          <button 
            onClick={() => setActiveTab('integrations')}
            className={`pb-4 text-sm font-black uppercase tracking-wider relative transition-all ${activeTab === 'integrations' ? 'text-[#FF8A00]' : 'text-gray-500 hover:text-white'}`}
          >
            Coding Integrations
            {activeTab === 'integrations' && (
              <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF8A00]" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('privacy')}
            className={`pb-4 text-sm font-black uppercase tracking-wider relative transition-all ${activeTab === 'privacy' ? 'text-rose-500' : 'text-gray-500 hover:text-white'}`}
          >
            Privacy & Account
            {activeTab === 'privacy' && (
              <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-rose-500" />
            )}
          </button>
        </div>

        {/* TAB CONTENTS */}
        <AnimatePresence mode="wait">
          {activeTab === 'integrations' ? (
            <motion.div
              key="integrations-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {AVAILABLE_PLATFORMS.map((platform, idx) => {
                const connected = isConnected(platform.id);
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={platform.id}
                    className="bg-[#111216]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${platform.bg} ${platform.border}`}>
                        <span className={`text-xl font-bold ${platform.color}`}>{platform.name[0]}</span>
                      </div>
                      
                      {connected ? (
                        <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                          <CheckCircle2 size={12} className="text-emerald-400" />
                          <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Connected</span>
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Available</span>
                        </div>
                      )}
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-xl font-black text-white mb-1">{platform.name}</h3>
                      {connected ? (
                        <p className="text-sm font-semibold text-emerald-500/80 mb-6 line-clamp-2">
                          Your {platform.name} account is successfully connected and syncing in real-time.
                        </p>
                      ) : (
                        <p className="text-sm font-semibold text-gray-500 mb-6 line-clamp-2">
                          Sync your {platform.name} profile, repositories, rating, and global ranking to your developer portfolio.
                        </p>
                      )}

                      {connected ? (
                        <button onClick={() => triggerDisconnect(platform.id)} className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 text-sm font-bold transition-all">
                          Disconnect Account
                        </button>
                      ) : (
                        <button onClick={() => { setActiveModal(platform.id); setError(""); setPlatformUsername(""); }} className="w-full py-2.5 rounded-xl bg-[#FF8A00] hover:bg-orange-500 text-black text-sm font-black shadow-[0_0_20px_rgba(255,138,0,0.2)] transition-all">
                          Connect Account
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="privacy-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-6"
            >
              {/* GDPR Info Box */}
              <div className="bg-[#111216]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-8 relative overflow-hidden flex flex-col md:flex-row gap-6 items-start">
                <div className="w-12 h-12 shrink-0 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                  <Lock size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-2">GDPR & Data Protection Commitment</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    At Codeyx, we value your data privacy above all. You have full ownership of all portfolios, imported code, and dynamic analytics. 
                  </p>
                  <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4 font-semibold">
                    <li>Immediate profile deactivation blocks public portfolios instantly.</li>
                    <li>Background cleanup jobs permanently wipe repositories, activity histories, and analytics.</li>
                    <li>We never retain backup records, search logs, or email addresses once deleted.</li>
                  </ul>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border border-rose-500/15 bg-rose-500/[0.02] rounded-2xl p-8 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="text-rose-500" size={24} />
                  <h3 className="text-xl font-black text-rose-500">Danger Zone</h3>
                </div>
                <div className="h-px bg-rose-500/10 w-full" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">Permanently Delete Account</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-lg">
                      Deleting your account will erase your developer portfolio, sync connections, and all Codeyx historical performance rankings. This request processes immediately.
                    </p>
                  </div>
                  <button 
                    onClick={() => { setShowDeleteModal(true); setError(""); }}
                    className="px-5 py-3 shrink-0 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.1)]"
                  >
                    <Trash2 size={14} /> Delete Account
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Connect Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#111216] border border-white/10 rounded-2xl p-6 shadow-2xl relative"
          >
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              ✕
            </button>
            <h3 className="text-2xl font-black text-white mb-2">Connect {AVAILABLE_PLATFORMS.find(p => p.id === activeModal)?.name}</h3>
            <p className="text-sm text-gray-400 mb-6">Enter your platform username or paste your profile URL. We'll extract what we need!</p>

              {successMsg && (
                <div className="flex flex-col items-center justify-center py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <CheckCircle2 size={32} className="text-emerald-400 mb-2" />
                  <span className="text-sm font-bold text-emerald-400">{successMsg}</span>
                </div>
              )}

              {!successMsg && (
                <form onSubmit={handleConnect} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Username or Profile URL</label>
                    <input 
                      type="text" 
                      required
                      value={platformUsername}
                      onChange={(e) => setPlatformUsername(e.target.value)}
                      placeholder="e.g. lalitmodi90 or https://github.com/lalit..."
                      className="w-full bg-[#09090B] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF8A00] transition-colors"
                    />
                  </div>

                  {error && (
                    <div className="text-xs font-semibold text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-lg flex items-start gap-2">
                      <span className="mt-0.5">⚠️</span>
                      <span>{error}</span>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isSyncing || !platformUsername.trim()}
                    className="w-full py-3 rounded-xl bg-[#FF8A00] hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-[#FF8A00] text-black text-sm font-black shadow-[0_0_20px_rgba(255,138,0,0.2)] transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : 'Connect Account'}
                  </button>
                </form>
              )}
          </motion.div>
        </div>
      )}

      {/* Disconnect Confirmation Modal */}
      {disconnectModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#111216] border border-white/10 rounded-2xl p-6 shadow-2xl relative"
          >
            <button 
              onClick={() => setDisconnectModal(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              ✕
            </button>
            <h3 className="text-2xl font-black text-white mb-2">Disconnect {AVAILABLE_PLATFORMS.find(p => p.id === disconnectModal)?.name}</h3>
            <p className="text-sm text-gray-400 mb-6">Are you sure you want to disconnect this platform? You will lose real-time statistics on your Coderyx dashboard.</p>

            {successMsg && (
              <div className="flex flex-col items-center justify-center py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle2 size={32} className="text-emerald-400 mb-2" />
                <span className="text-sm font-bold text-emerald-400">{successMsg}</span>
              </div>
            )}

            {!successMsg && (
              <div className="flex flex-col gap-4">
                {error && (
                  <div className="text-xs font-semibold text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-lg flex items-start gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-4 mt-2">
                  <button 
                    onClick={() => setDisconnectModal(null)}
                    disabled={isDisconnecting}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-black transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDisconnectConfirm}
                    disabled={isDisconnecting}
                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-black shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all flex items-center justify-center gap-2"
                  >
                    {isDisconnecting ? <RefreshCw size={16} className="animate-spin" /> : 'Disconnect'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* UX Rules Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#111216] border border-rose-500/20 rounded-2xl p-8 shadow-2xl relative"
          >
            <button 
              onClick={() => !isDeleting && setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
              disabled={isDeleting}
            >
              ✕
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/35 flex items-center justify-center text-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                <ShieldAlert size={20} />
              </div>
              <h3 className="text-2xl font-black text-white">Delete Account?</h3>
            </div>

            <p className="text-xs font-semibold text-gray-400 mb-4 leading-relaxed">
              This action will permanently remove:
            </p>

            <ul className="text-xs text-gray-300 space-y-2.5 mb-6 pl-4 list-disc marker:text-rose-500 font-bold">
              <li>projects</li>
              <li>repositories</li>
              <li>reviews</li>
              <li>analytics</li>
              <li>portfolio</li>
              <li>coding platform data</li>
            </ul>

            <div className="p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-xl mb-6 flex items-center gap-2.5">
              <EyeOff size={16} className="text-rose-400" />
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-wider">
                This action cannot be undone.
              </p>
            </div>

            {error && (
              <div className="text-xs font-semibold text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-[0_4px_20px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw size={14} className="animate-spin" /> : 'Permanently Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
