"use client";

import React, { useState, useEffect } from "react";
import { Search, Network, RefreshCw, Layers, Edit2, Trash2 } from "lucide-react";

export default function PatternsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatterns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5005/api/patterns/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch patterns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
  }, []);

  // Flatten the nested categories -> patterns structure for easy table rendering
  const allPatterns = categories.flatMap(cat => 
    (cat.patterns || []).map((pat: any) => ({
      ...pat,
      categoryTitle: cat.title
    }))
  );

  const filteredPatterns = allPatterns.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.categoryTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pattern Management</h1>
          <p className="text-muted-foreground mt-1">Manage coding patterns, categories, and question counts.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchPatterns}
            className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search patterns or categories..." 
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Pattern Title</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Difficulty</th>
                <th className="px-6 py-4 font-semibold">Total Questions</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                 <tr>
                 <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                   <RefreshCw className="animate-spin inline mr-2" size={20} /> Loading patterns...
                 </td>
               </tr>
              ) : filteredPatterns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No patterns found.
                  </td>
                </tr>
              ) : (
                filteredPatterns.map((pat) => (
                  <tr key={pat._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Network size={20} />
                        </div>
                        <span className="font-semibold text-foreground">{pat.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Layers size={14} /> {pat.categoryTitle}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        pat.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        pat.difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {pat.difficulty || 'Medium'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-lg">{pat.totalProblems || 0}</span> 
                        <span className="text-muted-foreground text-xs uppercase tracking-wider">Questions</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit Pattern">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Pattern">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
