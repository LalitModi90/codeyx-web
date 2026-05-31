"use client";

import React, { useState } from "react";
import { Bell, Send, Megaphone, Trash2 } from "lucide-react";

const initialAnnouncements = [
  { id: 1, title: "Platform Maintenance", content: "Codeyx will be down for maintenance this Sunday from 2 AM to 4 AM IST.", date: "May 30, 2026", audience: "All Users" },
  { id: 2, title: "New Contest Sync Added", content: "You can now sync CodeChef contests directly to your Codeyx profile!", date: "May 25, 2026", audience: "All Users" },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if(!title || !content) return;
    
    setAnnouncements([{
      id: Date.now(),
      title,
      content,
      date: "Just now",
      audience: "All Users"
    }, ...announcements]);
    
    setTitle("");
    setContent("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
          <p className="text-muted-foreground mt-1">Broadcast notifications to all Codeyx users.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Form */}
        <div className="lg:col-span-1 bg-card border border-border rounded-xl p-5 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-4 text-foreground font-semibold">
            <Megaphone size={18} className="text-primary" />
            <h2>New Broadcast</h2>
          </div>
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Server Update" 
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Message</label>
              <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your announcement here..." 
                rows={4}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Send size={16} /> Broadcast Now
            </button>
          </form>
        </div>

        {/* History */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Bell size={18} /> Announcement History
          </h3>
          
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-card border border-border rounded-xl p-5 shadow-sm relative group">
              <button 
                onClick={() => setAnnouncements(announcements.filter(a => a.id !== ann.id))}
                className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={16} />
              </button>
              <h4 className="text-lg font-bold text-foreground mb-1 pr-8">{ann.title}</h4>
              <div className="flex gap-3 text-xs text-muted-foreground mb-3">
                <span>{ann.date}</span>
                <span>•</span>
                <span>Audience: {ann.audience}</span>
              </div>
              <p className="text-sm text-muted-foreground">{ann.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
