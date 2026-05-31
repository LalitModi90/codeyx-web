"use client";

import React, { useState, useEffect } from "react";
import { Search, RefreshCw, Calendar, ExternalLink, ShieldCheck } from "lucide-react";

export default function ContestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [contests, setContests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5005/api/contests");
      const data = await res.json();
      if (data.success && data.data) {
        setContests(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch contests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await fetchContests(); // Refresh data as sync action
    setIsSyncing(false);
  };

  const filteredContests = contests.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.site?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contests</h1>
          <p className="text-muted-foreground mt-1">Sync and manage upcoming coding contests across platforms.</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={isSyncing || isLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <RefreshCw size={18} className={(isSyncing || isLoading) ? "animate-spin" : ""} />
          <span>{isSyncing ? "Syncing API..." : "Sync Contests Now"}</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search contests..." 
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-muted-foreground">
          <RefreshCw className="animate-spin mr-2" size={24} /> Loading upcoming contests from backend...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredContests.map((contest, index) => (
            <div key={index} className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col p-5">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border bg-blue-500/10 text-blue-500 border-blue-500/20`}>
                  Upcoming
                </span>
                <span className="text-xs font-bold px-2 py-1 bg-muted rounded border border-border">
                  {contest.site}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-foreground mb-2 leading-tight">{contest.name}</h3>
              
              <div className="flex flex-col gap-2 mt-auto">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={16} /> {new Date(contest.start_time).toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground text-xs py-0.5 px-2 bg-muted rounded">Duration</span> 
                  {(contest.duration / 3600).toFixed(1)} hours
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <a href={contest.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline flex items-center gap-1.5">
                  <ExternalLink size={14} /> Open Platform
                </a>
              </div>
            </div>
          ))}
          {filteredContests.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
              No contests found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
