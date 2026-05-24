"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Code, Cpu, Flame, Sparkles, Database, ShieldAlert, Award } from 'lucide-react';

interface AuthVisualsProps {
  type: 'login' | 'signup';
}

export default function AuthVisuals({ type }: AuthVisualsProps) {
  const isLogin = type === 'login';

  return (
    <div className="hidden lg:flex w-1/2 relative bg-[#090d16] overflow-hidden items-center justify-center p-12 border-r border-white/5">
      {/* Premium background mesh gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,transparent_20%,#090d16_80%)] pointer-events-none"></div>
      
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles size={12} />
            {isLogin ? "Welcome Back Developer" : "Initialize Your Account"}
          </div>
          
          <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
            {isLogin ? (
              <>
                Unified Competitive <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500">
                  Programming Engine
                </span>
              </>
            ) : (
              <>
                Connect Your Global <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">
                  Coding Platforms
                </span>
              </>
            )}
          </h2>
          
          <p className="text-gray-400 text-base max-w-md">
            {isLogin 
              ? "Aggregated diagnostics, profile customization, and automated stats synchronization for modern competitive programmers."
              : "Instantly link Codeforces, LeetCode, CodeChef, and GitHub to automatically synchronize your global ratings, active streak, and achievements."}
          </p>
        </motion.div>

        {/* IDE & Diagnostics Visual Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full bg-[#0b0f19]/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl relative"
        >
          {/* Top Title Bar (macOS style) */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0d1321] border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
              <Terminal size={12} />
              {isLogin ? "coderyx_engine.ts" : "platform_connector.ts"}
            </div>
            <div className="w-12"></div>
          </div>

          {/* IDE Content Area */}
          <div className="p-6 font-mono text-sm leading-relaxed text-gray-300 overflow-x-auto bg-[#080d16]/90">
            {isLogin ? (
              /* Real TypeScript Code Snippet for Login */
              <>
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 text-right w-5">1</span>
                  <span className="text-orange-400">import</span> <span className="text-blue-400">{"{ CodeyxClient }"}</span> <span className="text-orange-400">from</span> <span className="text-green-400">"@codeyx/core"</span><span className="text-gray-400">;</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 text-right w-5">2</span>
                  <span></span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 text-right w-5">3</span>
                  <span className="text-gray-500">// Initialize profile stats aggregator</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 text-right w-5">4</span>
                  <span className="text-orange-400">const</span> <span className="text-blue-300">client</span> <span className="text-gray-400">=</span> <span className="text-orange-400">new</span> <span className="text-purple-400">CodeyxClient</span><span className="text-gray-400">({"{"}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 text-right w-5">5</span>
                  <span className="ml-4 text-gray-400">userId:</span> <span className="text-green-400">"dev_pro"</span><span className="text-gray-400">,</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 text-right w-5">6</span>
                  <span className="ml-4 text-gray-400">syncInterval:</span> <span className="text-teal-400">300</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 text-right w-5">7</span>
                  <span className="text-gray-400">{"});"}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 text-right w-5">8</span>
                  <span></span>
                </div>
                <div className="flex bg-orange-500/10 border-l-2 border-orange-500 -mx-6 px-6">
                  <span className="text-gray-600 select-none mr-4 text-right w-5">9</span>
                  <span className="text-orange-400">await</span> <span className="text-blue-300">client</span><span className="text-gray-400">.</span><span className="text-purple-400">syncActiveStreak</span><span className="text-gray-400">();</span>
                </div>
              </>
            ) : (
              /* Real TypeScript Code Snippet for Signup */
              <>
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 text-right w-5">1</span>
                  <span className="text-orange-400">import</span> <span className="text-blue-400">{"{ CodeyxEngine }"}</span> <span className="text-orange-400">from</span> <span className="text-green-400">"@codeyx/engine"</span><span className="text-gray-400">;</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 text-right w-5">2</span>
                  <span></span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 text-right w-5">3</span>
                  <span className="text-gray-500">// Connect platform identifiers</span>
                </div>
                <div className="flex bg-blue-500/10 border-l-2 border-blue-500 -mx-6 px-6">
                  <span className="text-gray-600 select-none mr-4 text-right w-5">4</span>
                  <span className="text-orange-400">await</span> <span className="text-blue-300">engine</span><span className="text-gray-400">.</span><span className="text-purple-400">connectPlatforms</span><span className="text-gray-400">([</span>
                </div>
                <div className="flex bg-blue-500/10 border-l-2 border-blue-500 -mx-6 px-6">
                  <span className="text-gray-600 select-none mr-4 text-right w-5">5</span>
                  <span className="ml-8 text-green-400">"codeforces"</span><span className="text-gray-400">,</span> <span className="text-green-400">"leetcode"</span><span className="text-gray-400">,</span> <span className="text-green-400">"codechef"</span>
                </div>
                <div className="flex bg-blue-500/10 border-l-2 border-blue-500 -mx-6 px-6">
                  <span className="text-gray-600 select-none mr-4 text-right w-5">6</span>
                  <span className="text-gray-400">{"  ]);"}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 text-right w-5">7</span>
                  <span></span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 text-right w-5">8</span>
                  <span className="text-gray-500">// Generate portfolio aggregates</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 text-right w-5">9</span>
                  <span className="text-orange-400">await</span> <span className="text-blue-300">engine</span><span className="text-gray-400">.</span><span className="text-purple-400">buildDeveloperProfile</span><span className="text-gray-400">();</span>
                </div>
              </>
            )}
          </div>

          {/* Inline Live Metrics Panel */}
          <div className="p-4 bg-[#0d1321]/90 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-mono">Engine: Operational</span>
              </div>
              <div className="h-3 w-px bg-white/10"></div>
              <div className="flex items-center gap-1.5">
                <Code size={12} className={isLogin ? "text-orange-400" : "text-blue-400"} />
                <span className="font-mono">{isLogin ? "Sync: Active" : "Status: Ready"}</span>
              </div>
            </div>
            <div className={`font-mono font-semibold ${isLogin ? "text-orange-400" : "text-blue-400"}`}>
              {isLogin ? "v1.0.0-rc3" : "port_v2.0"}
            </div>
          </div>
        </motion.div>

        {/* Real-time stats widgets floating underneath */}
        <div className="flex items-center gap-4 mt-6">
          {isLogin ? (
            /* Login Widgets */
            <>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex-1 bg-[#0b0f19]/70 border border-white/5 rounded-xl p-4 flex items-center gap-3 backdrop-blur-md"
              >
                <div className="w-9 h-9 rounded-lg bg-orange-500/15 flex items-center justify-center text-orange-400">
                  <Flame size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Active Streak</p>
                  <p className="text-sm font-bold text-white">284 Days</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex-1 bg-[#0b0f19]/70 border border-white/5 rounded-xl p-4 flex items-center gap-3 backdrop-blur-md"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
                  <Cpu size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Aggregated Stats</p>
                  <p className="text-sm font-bold text-white">1,482 Solved</p>
                </div>
              </motion.div>
            </>
          ) : (
            /* Signup Widgets */
            <>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex-1 bg-[#0b0f19]/70 border border-white/5 rounded-xl p-4 flex items-center gap-3 backdrop-blur-md"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
                  <Database size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Integrations</p>
                  <p className="text-sm font-bold text-white">4 Platforms</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex-1 bg-[#0b0f19]/70 border border-white/5 rounded-xl p-4 flex items-center gap-3 backdrop-blur-md"
              >
                <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400">
                  <Award size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Leaderboards</p>
                  <p className="text-sm font-bold text-white">Global Sync</p>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
