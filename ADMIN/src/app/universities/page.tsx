"use client";

import React, { useState, useEffect } from "react";
import { Building2, Search, CheckCircle, XCircle, MapPin, Trash2, Edit, RefreshCw } from "lucide-react";

export default function UniversitiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [universities, setUniversities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUniversities = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5005/api/universities");
      const data = await res.json();
      if (data.success) {
        setUniversities(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch universities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const handleAction = async (id: string, action: "Approved" | "Rejected" | "Delete") => {
    // In a real app, you would make a fetch call here like:
    // await fetch(`http://localhost:5005/api/universities/${id}/verify`, { method: 'PATCH', body: { isVerified: action === 'Approved' } })
    
    if (action === "Delete") {
      setUniversities(universities.filter(u => u._id !== id));
    } else {
      setUniversities(universities.map(u => u._id === id ? { ...u, isVerified: action === "Approved" } : u));
    }
  };

  const filteredUnis = universities.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">University Management</h1>
          <p className="text-muted-foreground mt-1">Manage, approve, or add colleges and universities.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchUniversities}
            className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors shadow-sm flex items-center gap-2">
            <Building2 size={18} />
            <span>Add New College</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search university by name..." 
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
                <th className="px-6 py-4 font-semibold">University Name</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Domain</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                 <tr>
                 <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                   <RefreshCw className="animate-spin inline mr-2" size={20} /> Loading real universities...
                 </td>
               </tr>
              ) : filteredUnis.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No universities found.
                  </td>
                </tr>
              ) : (
                filteredUnis.map((uni) => (
                  <tr key={uni._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                          <Building2 size={16} />
                        </div>
                        <span className="truncate">{uni.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} /> {uni.country || 'Global'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {uni.domain || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        uni.isVerified 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                      }`}>
                        {uni.isVerified ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {!uni.isVerified && (
                          <>
                            <button 
                              onClick={() => handleAction(uni._id, 'Approved')}
                              className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button 
                              onClick={() => handleAction(uni._id, 'Rejected')}
                              className="p-2 text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors" title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleAction(uni._id, 'Delete')}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete"
                        >
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
