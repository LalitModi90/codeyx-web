"use client";

import React, { useState, useEffect } from "react";
import { Send, Search, CheckSquare, Square, RefreshCw, Users, Bell } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export default function SendNotificationPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const { getToken } = useAuth();

  const showToast = (msg: string, t: 'success' | 'error') => {
    setToast({ message: msg, type: t });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5005/api/leaderboard?all=true");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.user?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectUser = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.userId));
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return showToast("Title and Message are required!", "error");
    if (selectedUsers.length === 0) return showToast("Please select at least one user!", "error");

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
          title,
          message,
          type
        })
      });
      const data = await res.json();
      
      if (data.success) {
        showToast(`Notification sent to ${selectedUsers.length} users successfully!`, "success");
        setTitle("");
        setMessage("");
        setSelectedUsers([]);
      } else {
        showToast("Failed to send notification: " + data.message, "error");
      }
    } catch(err) {
      showToast("Error sending notification", "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleBroadcastAll = async () => {
    if (!title || !message) return showToast("Title and Message are required!", "error");
    if (!confirm("Are you sure you want to broadcast this to EVERY registered user?")) return;

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
          broadcast: true,
          title,
          message,
          type
        })
      });
      const data = await res.json();
      
      if (data.success) {
        showToast(`Broadcast sent to ALL users successfully!`, "success");
        setTitle("");
        setMessage("");
        setSelectedUsers([]);
      } else {
        showToast("Failed to send broadcast: " + data.message, "error");
      }
    } catch(err) {
      showToast("Error sending broadcast", "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleSmartSelect = (criteria: string) => {
    let filtered = [];
    switch(criteria) {
      case 'no-platform':
        filtered = users.filter(u => Object.keys(u.platformBreakdown || {}).filter(p => p !== 'codeyx').length === 0);
        break;
      case 'has-platform':
        filtered = users.filter(u => Object.keys(u.platformBreakdown || {}).filter(p => p !== 'codeyx').length > 0);
        break;
      case 'suspended':
        filtered = users.filter(u => u.isBanned);
        break;
      case 'active':
        filtered = users.filter(u => u.problems > 0);
        break;
    }
    setSelectedUsers(filtered.map(u => u.userId));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Bell className="text-primary" /> Send Notification
        </h1>
        <p className="text-muted-foreground mt-1">Compose and send targeted or broadcast notifications to users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: COMPOSE */}
        <div className="lg:col-span-5 bg-card border border-border rounded-xl p-6 shadow-sm h-fit sticky top-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
            <Send size={18} className="text-primary" /> Compose Message
          </h2>
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Notification Title</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Account Update" 
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Message Content</label>
              <textarea 
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write your message here..." 
                rows={5}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Notification Type</label>
              <select 
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="info">Info (Blue icon)</option>
                <option value="success">Success (Green icon)</option>
                <option value="urgent">Urgent (Red icon)</option>
                <option value="soon">Feature (Orange icon)</option>
              </select>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button 
                type="submit"
                disabled={isSending || selectedUsers.length === 0}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              >
                {isSending ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                Send to Selected ({selectedUsers.length})
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase font-bold">OR</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              <button 
                type="button"
                onClick={handleBroadcastAll}
                disabled={isSending}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Users size={18} />
                Broadcast to ALL Users
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT PANEL: SELECT USERS */}
        <div className="lg:col-span-7 bg-card border border-border rounded-xl shadow-sm flex flex-col h-[80vh]">
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-foreground">
              <Users size={18} className="text-primary" /> Select Recipients
            </h2>
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button 
                onClick={handleSelectAll}
                className="whitespace-nowrap px-4 py-2 bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {selectedUsers.length === filteredUsers.length && filteredUsers.length > 0 ? (
                  <><CheckSquare size={16}/> Deselect All</>
                ) : (
                  <><Square size={16}/> Select All</>
                )}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground py-1 font-semibold uppercase">Smart Select:</span>
              <button onClick={() => handleSmartSelect('no-platform')} className="px-2.5 py-1 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-full font-medium transition-colors">0 Platforms Connected</button>
              <button onClick={() => handleSmartSelect('has-platform')} className="px-2.5 py-1 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-full font-medium transition-colors">Platforms Connected</button>
              <button onClick={() => handleSmartSelect('active')} className="px-2.5 py-1 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 rounded-full font-medium transition-colors">Active (Solved &gt; 0)</button>
              <button onClick={() => handleSmartSelect('suspended')} className="px-2.5 py-1 text-xs bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20 rounded-full font-medium transition-colors">Suspended Users</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <RefreshCw className="animate-spin mr-2" size={20} /> Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                No users found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                {filteredUsers.map(user => {
                  const isSelected = selectedUsers.includes(user.userId);
                  return (
                    <div 
                      key={user.userId}
                      onClick={() => toggleSelectUser(user.userId)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'border border-muted-foreground/30'
                      }`}>
                        {isSelected && <CheckSquare size={14} className="opacity-100" />}
                      </div>
                      <img 
                        src={user.avatarUrl || '/default-avatar.png'} 
                        alt="avatar" 
                        className="w-8 h-8 rounded-full bg-muted object-cover border border-border"
                      />
                      <div className="overflow-hidden flex-1">
                        <p className="text-sm font-bold text-foreground truncate">{user.user || 'Anonymous'}</p>
                        <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="p-3 border-t border-border bg-muted/30 text-center text-sm font-medium text-muted-foreground">
            {selectedUsers.length} user(s) selected
          </div>
        </div>
        
      </div>

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
