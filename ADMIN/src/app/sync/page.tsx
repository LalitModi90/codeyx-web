"use client";

import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, CheckCircle, XCircle, Clock, Zap, Users, ChevronRight, Play, Pause } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api";
const DELAY_BETWEEN_SYNCS_MS = 3000; // 3s delay between each user to avoid rate limits

type SyncStatus = "idle" | "pending" | "syncing" | "done" | "error";

interface PlatformEntry {
  userId: string;
  platform: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  status: SyncStatus;
  message?: string;
}

export default function SyncPage() {
  const { getToken } = useAuth();
  const [entries, setEntries] = useState<PlatformEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkRunning, setIsBulkRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [totalDone, setTotalDone] = useState(0);
  const pauseRef = useRef(false);

  // Fetch all connected platform stats
  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/admin/sync-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEntries(
          data.data.map((e: any) => ({
            ...e,
            status: "idle" as SyncStatus,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load sync list:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Sync a single platform entry
  const syncOne = async (idx: number, token: string): Promise<boolean> => {
    const entry = entries[idx];
    setEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, status: "syncing" } : e))
    );
    try {
      const res = await fetch(`${API_URL}/admin/sync-one`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: entry.userId,
          platform: entry.platform,
          username: entry.username,
        }),
      });
      const data = await res.json();
      setEntries((prev) =>
        prev.map((e, i) =>
          i === idx
            ? { ...e, status: data.success ? "done" : "error", message: data.message }
            : e
        )
      );
      return data.success;
    } catch (err: any) {
      setEntries((prev) =>
        prev.map((e, i) =>
          i === idx ? { ...e, status: "error", message: err.message } : e
        )
      );
      return false;
    }
  };

  // Run bulk sync one-by-one with delay
  const runBulkSync = async () => {
    setIsBulkRunning(true);
    setIsPaused(false);
    pauseRef.current = false;
    setTotalDone(0);

    // Reset all to pending
    setEntries((prev) => prev.map((e) => ({ ...e, status: "pending", message: undefined })));

    const token = await getToken() || "";
    let done = 0;

    for (let i = 0; i < entries.length; i++) {
      // Check pause
      while (pauseRef.current) {
        await new Promise((r) => setTimeout(r, 500));
      }

      setCurrentIdx(i);
      await syncOne(i, token);
      done++;
      setTotalDone(done);

      // Delay between syncs to avoid API rate limits
      if (i < entries.length - 1) {
        await new Promise((r) => setTimeout(r, DELAY_BETWEEN_SYNCS_MS));
      }
    }

    setCurrentIdx(-1);
    setIsBulkRunning(false);
    setIsPaused(false);
  };

  const togglePause = () => {
    pauseRef.current = !pauseRef.current;
    setIsPaused(pauseRef.current);
  };

  const getStatusIcon = (status: SyncStatus, isCurrentIdx: boolean) => {
    if (isCurrentIdx && status === "syncing")
      return <RefreshCw size={14} className="text-blue-400 animate-spin" />;
    switch (status) {
      case "done":    return <CheckCircle size={14} className="text-emerald-500" />;
      case "error":   return <XCircle size={14} className="text-red-500" />;
      case "syncing": return <RefreshCw size={14} className="text-blue-400 animate-spin" />;
      case "pending": return <Clock size={14} className="text-yellow-500 animate-pulse" />;
      default:        return <ChevronRight size={14} className="text-gray-600" />;
    }
  };

  const getStatusBg = (status: SyncStatus) => {
    switch (status) {
      case "done":    return "border-emerald-500/20 bg-emerald-500/5";
      case "error":   return "border-red-500/20 bg-red-500/5";
      case "syncing": return "border-blue-500/30 bg-blue-500/10";
      case "pending": return "border-yellow-500/20 bg-yellow-500/5";
      default:        return "border-white/5 bg-transparent";
    }
  };

  const doneCount  = entries.filter((e) => e.status === "done").length;
  const errorCount = entries.filter((e) => e.status === "error").length;
  const progress   = entries.length > 0 ? Math.round((totalDone / entries.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap size={22} className="text-yellow-400" /> Platform Sync Center
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Sync all connected users one-by-one with {DELAY_BETWEEN_SYNCS_MS / 1000}s delay to respect API rate limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isBulkRunning && (
            <button
              onClick={togglePause}
              className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors ${
                isPaused
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-yellow-600 hover:bg-yellow-500 text-black"
              }`}
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
              {isPaused ? "Resume" : "Pause"}
            </button>
          )}
          <button
            onClick={runBulkSync}
            disabled={isBulkRunning || isLoading || entries.length === 0}
            className="px-5 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={14} className={isBulkRunning ? "animate-spin" : ""} />
            {isBulkRunning ? `Syncing ${totalDone}/${entries.length}...` : "Start Sync All"}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isBulkRunning && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-foreground">
              {isPaused ? "⏸ Paused" : `Syncing... ${totalDone} of ${entries.length}`}
            </span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="text-emerald-500 font-bold">✅ {doneCount} done</span>
            <span className="text-red-500 font-bold">❌ {errorCount} failed</span>
            <span className="text-yellow-500 font-bold">⏳ {entries.length - totalDone} remaining</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Entries", value: entries.length, color: "text-blue-400" },
          { label: "Completed",     value: doneCount,       color: "text-emerald-400" },
          { label: "Failed",        value: errorCount,      color: "text-red-400" },
          { label: "Remaining",     value: entries.length - doneCount - errorCount, color: "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground font-semibold mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Entries List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Users size={16} className="text-muted-foreground" />
          <h3 className="font-bold text-foreground text-sm">
            Connected Platform Entries ({entries.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <RefreshCw size={20} className="text-primary animate-spin" />
            <span className="text-muted-foreground text-sm">Loading connected users...</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users size={40} className="text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No connected platform entries found.</p>
          </div>
        ) : (
          <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
            {entries.map((entry, i) => (
              <div
                key={`${entry.userId}-${entry.platform}`}
                className={`flex items-center gap-4 px-4 py-3 border-l-2 transition-all ${
                  currentIdx === i ? "border-l-blue-500" : "border-l-transparent"
                } ${getStatusBg(entry.status)}`}
              >
                <div className="w-6 flex justify-center shrink-0">
                  {getStatusIcon(entry.status, currentIdx === i)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {entry.displayName || entry.userId.slice(-6)}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      entry.platform === "leetcode"   ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                      entry.platform === "codeforces" ? "bg-blue-500/10   text-blue-400   border-blue-500/20"   :
                      entry.platform === "codechef"   ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                      entry.platform === "github"     ? "bg-gray-500/10   text-gray-400   border-gray-500/20"   :
                      "bg-orange-500/10 text-orange-400 border-orange-500/20"
                    }`}>
                      {entry.platform}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">@{entry.username}</p>
                  {entry.message && (
                    <p className={`text-[10px] mt-0.5 font-semibold ${
                      entry.status === "error" ? "text-red-400" : "text-emerald-400"
                    }`}>
                      {entry.message}
                    </p>
                  )}
                </div>

                <span className="text-xs text-muted-foreground font-mono shrink-0">#{i + 1}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
