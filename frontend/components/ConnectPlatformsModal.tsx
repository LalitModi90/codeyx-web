"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from './OnboardingProvider';
import type { PlatformHandles } from './OnboardingProvider';
import {
  Link2, CheckCircle2, Loader2, Globe, ChevronRight,
  Code2, Terminal, Braces, GitBranch, BookOpen, Award
} from 'lucide-react';

interface PlatformConfig {
  key: keyof PlatformHandles;
  name: string;
  icon: React.ReactNode;
  placeholder: string;
  color: string;
  bgColor: string;
  borderColor: string;
  url: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    key: 'leetcode',
    name: 'LeetCode',
    icon: <Code2 size={16} />,
    placeholder: 'e.g. tourist',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    url: 'https://leetcode.com',
  },
  {
    key: 'codeforces',
    name: 'Codeforces',
    icon: <Terminal size={16} />,
    placeholder: 'e.g. tourist',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    url: 'https://codeforces.com',
  },
  {
    key: 'codechef',
    name: 'CodeChef',
    icon: <Braces size={16} />,
    placeholder: 'e.g. admin',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    url: 'https://codechef.com',
  },
  {
    key: 'github',
    name: 'GitHub',
    icon: <GitBranch size={16} />,
    placeholder: 'e.g. torvalds',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    url: 'https://github.com',
  },
  {
    key: 'gfg',
    name: 'GeeksforGeeks',
    icon: <BookOpen size={16} />,
    placeholder: 'e.g. username',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    url: 'https://geeksforgeeks.org',
  },
  {
    key: 'atcoder',
    name: 'AtCoder',
    icon: <Globe size={16} />,
    placeholder: 'e.g. tourist',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    url: 'https://atcoder.jp',
  },
  {
    key: 'hackerrank',
    name: 'HackerRank',
    icon: <Award size={16} />,
    placeholder: 'e.g. lalitmodi7878065',
    color: 'text-lime-400',
    bgColor: 'bg-lime-500/10',
    borderColor: 'border-lime-500/20',
    url: 'https://hackerrank.com',
  },
];

export default function ConnectPlatformsModal() {
  const { profile, updateProfile } = useOnboarding();
  const [handles, setHandles] = useState<PlatformHandles>(
    profile.platformHandles || {
      leetcode: '',
      codeforces: '',
      codechef: '',
      github: '',
      gfg: '',
      atcoder: '',
      hackerrank: '',
    }
  );
  const [verifying, setVerifying] = useState<Record<string, boolean>>({});
  const [verified, setVerified] = useState<Record<string, boolean>>({});
  const [showModal, setShowModal] = useState(false);

  const handleChange = (key: keyof PlatformHandles, value: string) => {
    setHandles(prev => ({ ...prev, [key]: value.trim().toLowerCase() }));
    // Reset verified status when changing
    setVerified(prev => ({ ...prev, [key]: false }));
  };

  const verifyHandle = async (platform: PlatformConfig) => {
    const handle = handles[platform.key];
    if (!handle) return;

    setVerifying(prev => ({ ...prev, [platform.key]: true }));
    try {
      const res = await fetch(`/api/${platform.key}?username=${encodeURIComponent(handle)}`);
      const data = await res.json();
      if (res.ok && !data.error) {
        setVerified(prev => ({ ...prev, [platform.key]: true }));
      } else {
        setVerified(prev => ({ ...prev, [platform.key]: false }));
      }
    } catch {
      setVerified(prev => ({ ...prev, [platform.key]: false }));
    } finally {
      setVerifying(prev => ({ ...prev, [platform.key]: false }));
    }
  };

  const connectedCount = Object.values(handles).filter(v => v.length > 0).length;

  const handleSave = () => {
    updateProfile({ platformHandles: handles });
    setShowModal(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-md transition-all active:scale-[0.98] bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-blue-500/20"
      >
        <Link2 size={11} />
        {connectedCount > 0 ? `${connectedCount} Connected` : 'Connect Platforms'}
      </button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#090d16]/85 backdrop-blur-xl"
              onClick={() => setShowModal(false)}
            />

            {/* Decorative glow */}
            <div className="absolute w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-[120px] pointer-events-none" />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative w-full max-w-lg bg-[#0f172a]/95 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg border border-white/15">
                  <Link2 className="text-white" size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Connect Platforms</h3>
                  <p className="text-gray-400 text-[11px]">
                    Link your coding profiles for live analytics
                  </p>
                </div>
              </div>

              {/* Platform Inputs */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                {PLATFORMS.map((platform) => (
                  <div
                    key={platform.key}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      handles[platform.key]
                        ? `${platform.borderColor} bg-white/[0.02]`
                        : 'border-white/5 bg-white/[0.01]'
                    }`}
                  >
                    {/* Platform Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${platform.bgColor} ${platform.color}`}>
                      {platform.icon}
                    </div>

                    {/* Input */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                        {platform.name}
                      </label>
                      <input
                        type="text"
                        placeholder={platform.placeholder}
                        value={handles[platform.key]}
                        onChange={(e) => handleChange(platform.key, e.target.value)}
                        className="w-full bg-transparent border-none text-white text-sm focus:outline-none placeholder-gray-600 font-mono"
                      />
                    </div>

                    {/* Verify / Status */}
                    <div className="flex-shrink-0">
                      {verifying[platform.key] ? (
                        <Loader2 size={16} className="text-blue-400 animate-spin" />
                      ) : verified[platform.key] ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : handles[platform.key] ? (
                        <button
                          onClick={() => verifyHandle(platform)}
                          className="text-[9px] font-bold uppercase text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20"
                        >
                          Verify
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                <p className="text-[10px] text-gray-500">
                  {connectedCount} of {PLATFORMS.length} platforms linked
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all border border-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={connectedCount === 0}
                    className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      connectedCount > 0
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98]'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Save & Sync
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
