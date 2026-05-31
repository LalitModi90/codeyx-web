"use client";

import React, { useState, useEffect } from "react";
import { Building2, Search, CheckCircle, XCircle, MapPin, Trash2, Edit, RefreshCw, AlertTriangle } from "lucide-react";

export default function UniversitiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [universities, setUniversities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingUni, setEditingUni] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', shortName: '', city: '', state: '', country: 'India', domain: '', verified: true });


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
    if (action === "Delete") {
      if (!confirm("Are you sure you want to delete this university?")) return;
      try {
        await fetch(`http://localhost:5005/api/universities/${id}`, { method: 'DELETE' });
        setUniversities(universities.filter(u => u._id !== id));
      } catch(e) {
        console.error(e);
      }
    } else {
      try {
        await fetch(`http://localhost:5005/api/universities/${id}/verify`, { 
          method: 'PATCH', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verified: action === "Approved" })
        });
        setUniversities(universities.map(u => u._id === id ? { ...u, verified: action === "Approved" } : u));
      } catch(e) {
        console.error(e);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert("Name is required");
    try {
      if (editingUni) {
        const res = await fetch(`http://localhost:5005/api/universities/${editingUni._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          setUniversities(universities.map(u => u._id === editingUni._id ? data.data : u));
          setShowModal(false);
        } else {
          alert(data.message);
        }
      } else {
        const res = await fetch(`http://localhost:5005/api/universities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          setUniversities([data.data, ...universities]);
          setShowModal(false);
        } else {
          alert(data.message);
        }
      }
    } catch(err) {
      alert("Error saving university");
    }
  };

  const openAddModal = () => {
    setEditingUni(null);
    setFormData({ name: '', shortName: '', city: '', state: '', country: 'India', domain: '', verified: true });
    setShowModal(true);
  };

  const openEditModal = (uni: any) => {
    setEditingUni(uni);
    setFormData({ 
      name: uni.name || '', 
      shortName: uni.shortName || '', 
      city: uni.city || '', 
      state: uni.state || '', 
      country: uni.country || 'India', 
      domain: uni.domain || '', 
      verified: uni.verified 
    });
    setShowModal(true);
  };

  const filteredUnis = universities.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const checkDuplicate = (pendingUni: any) => {
    if (pendingUni.verified) return null;
    
    const target = pendingUni.name?.toLowerCase().trim();
    if (!target) return null;

    const duplicate = universities.find(u => {
      if (!u.verified || u._id === pendingUni._id) return false;
      const existing = u.name?.toLowerCase().trim();
      if (!existing) return false;
      
      // Exact match
      if (existing === target) return true;
      
      // Strong similarity (one contains the other completely)
      if (existing.length > 5 && target.length > 5) {
        if (existing.includes(target) || target.includes(existing)) return true;
      }
      return false;
    });
    
    return duplicate;
  };

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
          <button onClick={openAddModal} className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors shadow-sm flex items-center gap-2">
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
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                            <Building2 size={16} />
                          </div>
                          <span className="truncate">{uni.name}</span>
                        </div>
                        {(() => {
                          const duplicate = checkDuplicate(uni);
                          if (duplicate) {
                            return (
                              <div className="flex items-center gap-1 text-[10px] text-orange-500 font-bold bg-orange-500/10 px-2 py-0.5 rounded-full w-fit mt-2 border border-orange-500/20 ml-10">
                                <AlertTriangle size={12} /> 
                                Warning: Matches "{duplicate.name}" (Already Approved)
                              </div>
                            );
                          }
                          return null;
                        })()}
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
                        uni.verified 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                      }`}>
                        {uni.verified ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {!uni.verified && (
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
                        <button onClick={() => openEditModal(uni)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
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

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-border">
            <h2 className="text-xl font-bold mb-4">{editingUni ? 'Edit University' : 'Add New College'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">University Name *</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Short Name</label>
                  <input 
                    type="text"
                    value={formData.shortName} onChange={e => setFormData({...formData, shortName: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Domain</label>
                  <input 
                    type="text"
                    value={formData.domain} onChange={e => setFormData({...formData, domain: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">City</label>
                  <input 
                    type="text"
                    value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">State</label>
                  <input 
                    type="text"
                    value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Country</label>
                  <input 
                    type="text"
                    value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" id="verified"
                  checked={formData.verified}
                  onChange={e => setFormData({...formData, verified: e.target.checked})}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="verified" className="text-sm font-medium">Approved (Verified)</label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 hover:bg-muted rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
