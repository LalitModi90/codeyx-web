"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, ThumbsUp, ChevronDown, Check, Clock, X, RefreshCw } from "lucide-react";

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5005/api/feedback");
      const data = await res.json();
      if (data.success) {
        setSuggestions(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:5005/api/feedback/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setSuggestions(suggestions.map(s => s._id === id ? { ...s, status } : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Suggestions</h1>
          <p className="text-muted-foreground mt-1">Review feedback and feature requests from the community.</p>
        </div>
        <button 
          onClick={fetchSuggestions}
          className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-muted-foreground">
          <RefreshCw className="animate-spin mr-2" size={24} /> Loading suggestions from backend...
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
              No suggestions found in the database.
            </div>
          ) : suggestions.map((suggestion) => (
            <div key={suggestion._id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                {/* Upvote Column */}
                <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                  <button className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                    <ChevronDown className="rotate-180" size={24} />
                  </button>
                  <span className="font-bold text-lg text-foreground">{suggestion.upvotes || 0}</span>
                </div>
                
                {/* Content Column */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-foreground text-sm">@{suggestion.userId || 'Anonymous'}</span>
                      <span className="text-muted-foreground text-xs">• {new Date(suggestion.createdAt).toLocaleDateString()}</span>
                      <span className={`ml-auto px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                        suggestion.status === 'resolved' || suggestion.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        suggestion.status === 'in-progress' || suggestion.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        'bg-orange-500/10 text-orange-500 border-orange-500/20'
                      }`}>
                        {suggestion.status || 'pending'}
                      </span>
                    </div>
                    {suggestion.title && <h3 className="font-bold text-foreground mb-1">{suggestion.title}</h3>}
                    <p className="text-muted-foreground text-sm leading-relaxed">{suggestion.suggestion}</p>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    {suggestion.status !== 'resolved' && (
                      <button 
                        onClick={() => updateStatus(suggestion._id, 'resolved')}
                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded font-medium transition-colors"
                      >
                        <Check size={14} /> Mark Resolved
                      </button>
                    )}
                    {(!suggestion.status || suggestion.status === 'pending') && (
                      <button 
                        onClick={() => updateStatus(suggestion._id, 'in-progress')}
                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded font-medium transition-colors"
                      >
                        <Clock size={14} /> Mark In Progress
                      </button>
                    )}
                    <button 
                      onClick={() => updateStatus(suggestion._id, 'rejected')}
                      className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded font-medium transition-colors ml-auto"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
