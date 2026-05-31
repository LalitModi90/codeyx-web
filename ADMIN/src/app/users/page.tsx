"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, ShieldBan, ExternalLink, ShieldCheck, RefreshCw, Send, X, CheckSquare, Square } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkNotifyModal, setShowBulkNotifyModal] = useState(false);
  const [notifyData, setNotifyData] = useState({ title: "", message: "", type: "info" });
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const { getToken } = useAuth();

  const showToast = (msg: string, t: 'success' | 'error') => {
    setToast({ message: msg, type: t });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetching from leaderboard with ?all=true to get ALL users including inactive ones
      const res = await fetch("http://localhost:5005/api/leaderboard?all=true");
      const data = await res.json();
      if (data.success) {
        // Backend returns the array directly in data.data
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (id: string) => {
    // Optimistic UI update for banning/suspending
    setUsers(users.map(u => {
      if (u.userId === id) {
        return { ...u, isBanned: !u.isBanned };
      }
      return u;
    }));
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.userId));
    }
  };

  const handleSendBulkNotification = async () => {
    if (!notifyData.title || !notifyData.message) return showToast("Title and Message are required", "error");
    setIsSending(true);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5005/api/admin/notify`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUserIds: selectedUsers,
          title: notifyData.title,
          message: notifyData.message,
          type: notifyData.type
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Notification sent to ${selectedUsers.length} users successfully!`, "success");
        setShowBulkNotifyModal(false);
        setNotifyData({ title: "", message: "", type: "info" });
        setSelectedUsers([]);
      } else {
        showToast("Failed to send notification: " + data.message, "error");
      }
    } catch (err) {
      showToast("Error sending notification", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage platform users, roles, and permissions.</p>
        </div>
        <div className="flex gap-3">
          {selectedUsers.length > 0 && (
            <button 
              onClick={() => setShowBulkNotifyModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-bold transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <Send size={18} />
              Notify ({selectedUsers.length})
            </button>
          )}
          <button 
            onClick={fetchUsers}
            className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or username..." 
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
                <th className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                    onChange={toggleSelectAll}
                    className="rounded border-border bg-background text-primary focus:ring-primary/50"
                  />
                </th>
                <th className="px-6 py-4 font-semibold">User Info</th>
                <th className="px-6 py-4 font-semibold">Codeyx Score</th>
                <th className="px-6 py-4 font-semibold">Platforms Connected</th>
                <th className="px-6 py-4 font-semibold">Problems Solved</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <RefreshCw className="animate-spin inline mr-2" size={20} /> Loading real users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.userId} className={`transition-colors ${selectedUsers.includes(user.userId) ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.includes(user.userId)}
                        onChange={() => toggleSelectUser(user.userId)}
                        className="rounded border-border bg-background text-primary focus:ring-primary/50"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatarUrl || '/default-avatar.png'} 
                          alt="avatar" 
                          className="w-10 h-10 rounded-full bg-muted object-cover border border-border"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{user.user || 'Anonymous'}</span>
                          <span className="text-xs text-muted-foreground">@{user.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground font-bold">{user.rating || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {Object.keys(user.platformBreakdown || {}).filter(p => p !== 'codeyx').length > 0 ? (
                          Object.keys(user.platformBreakdown).filter(p => p !== 'codeyx').map((p: string, i: number) => (
                            <span key={i} className="px-2 py-1 text-[10px] uppercase font-bold bg-secondary/50 text-secondary-foreground rounded border border-border/50">
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-xs italic">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-foreground">{user.problems || 0}</span> problems
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1 w-fit ${
                        !user.isBanned ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {!user.isBanned ? <ShieldCheck size={12}/> : <ShieldBan size={12}/>}
                        {!user.isBanned ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/users/${user.userId}`}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium text-xs flex items-center gap-1"
                          title="View Admin Profile"
                        >
                          View Details
                        </Link>
                        <a 
                          href={`http://localhost:3000/portfolio/${user.username}`} 
                          target="_blank"
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" 
                          title="View Public Profile"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button 
                          onClick={() => handleToggleStatus(user.userId)}
                          className={`p-2 rounded-lg transition-colors ${
                            !user.isBanned 
                              ? 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10' 
                              : 'text-red-500 hover:text-emerald-500 hover:bg-emerald-500/10'
                          }`}
                          title={!user.isBanned ? 'Suspend User' : 'Restore User'}
                        >
                          {!user.isBanned ? <ShieldBan size={16} /> : <ShieldCheck size={16} />}
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

      {/* Bulk Notification Modal */}
      {showBulkNotifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setShowBulkNotifyModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Send size={20} className="text-primary"/> Bulk Notification</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Sending to <strong className="text-primary">{selectedUsers.length}</strong> selected users.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Title</label>
                <input 
                  type="text" 
                  value={notifyData.title}
                  onChange={(e) => setNotifyData({...notifyData, title: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                  placeholder="e.g. Warning, Congratulations, etc."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Message</label>
                <textarea 
                  value={notifyData.message}
                  onChange={(e) => setNotifyData({...notifyData, message: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none resize-none h-24"
                  placeholder="Notification content..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Type</label>
                <select 
                  value={notifyData.type}
                  onChange={(e) => setNotifyData({...notifyData, type: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                >
                  <option value="info">Info (Blue)</option>
                  <option value="success">Success (Green)</option>
                  <option value="urgent">Urgent (Red)</option>
                  <option value="soon">Soon (Orange)</option>
                </select>
              </div>
              <button 
                onClick={handleSendBulkNotification}
                disabled={isSending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSending ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                {isSending ? "Sending..." : `Send to ${selectedUsers.length} Users`}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[9999] px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 transition-all animate-in slide-in-from-bottom-5 fade-in duration-300 bg-white ${
          toast.type === 'success' 
            ? 'border-emerald-200 text-emerald-600' 
            : 'border-red-200 text-red-600'
        }`}>
          {toast.type === 'success' ? <CheckSquare size={20} /> : <Square size={20} />}
          <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
