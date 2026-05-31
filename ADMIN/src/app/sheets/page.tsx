"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, BookOpen, Layers, RefreshCw } from "lucide-react";

export default function DSASheetsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sheets, setSheets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSheets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5005/api/sheets");
      const data = await res.json();
      if (data.success) {
        setSheets(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch sheets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSheets();
  }, []);

  const filteredSheets = sheets.filter(s => 
    s.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">DSA Sheets</h1>
          <p className="text-muted-foreground mt-1">Manage official coding sheets and master problems.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchSheets}
            className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors shadow-sm flex items-center gap-2">
            <Plus size={18} />
            <span>Create New Sheet</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search sheets by title..." 
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors w-full sm:w-auto">
          Manage Master Problems
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Sheet Title</th>
                <th className="px-6 py-4 font-semibold">Creator</th>
                <th className="px-6 py-4 font-semibold">Total Problems</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                 <tr>
                 <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                   <RefreshCw className="animate-spin inline mr-2" size={20} /> Loading real sheets...
                 </td>
               </tr>
              ) : filteredSheets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No sheets found.
                  </td>
                </tr>
              ) : (
                filteredSheets.map((sheet) => (
                  <tr key={sheet._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <BookOpen size={20} />
                        </div>
                        <span className="font-semibold text-foreground">{sheet.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Layers size={14} /> {sheet.isOfficial ? 'Codeyx Official' : 'Community'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-foreground">{sheet.steps?.reduce((acc: number, step: any) => acc + step.problems.length, 0) || 0}</span> problems
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        sheet.visibility === 'public' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                      }`}>
                        {sheet.visibility === 'public' ? 'Published' : 'Private'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit Sheet">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Sheet">
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
