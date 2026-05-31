"use client";

import React, { useState } from "react";
import { Save, User, Key, Globe, Shield, Database } from "lucide-react";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground mt-1">Configure global platform behavior and API keys.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Save size={18} className={isSaving ? "animate-pulse" : ""} />
          <span>{isSaving ? "Saving Changes..." : "Save All Changes"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Side Tabs (Static for demo) */}
        <div className="col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-card border border-primary/20 text-primary font-medium rounded-lg text-sm text-left shadow-sm">
            <Globe size={18} /> General
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted text-muted-foreground font-medium rounded-lg text-sm text-left transition-colors">
            <Key size={18} /> API Keys
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted text-muted-foreground font-medium rounded-lg text-sm text-left transition-colors">
            <Shield size={18} /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted text-muted-foreground font-medium rounded-lg text-sm text-left transition-colors">
            <Database size={18} /> Database
          </button>
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-foreground">General Configuration</h3>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Platform Name</label>
                  <input type="text" defaultValue="Codeyx" className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Support Email</label>
                  <input type="email" defaultValue="support@codeyx.com" className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Site Description (SEO)</label>
                <textarea rows={3} defaultValue="Codeyx is a modern coding platform that provides coding sheets, programming contests, developer projects, and DSA practice." className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg border border-border">
                <div>
                  <h4 className="font-semibold text-foreground text-sm">Maintenance Mode</h4>
                  <p className="text-xs text-muted-foreground">Disable access to the main platform for regular users.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-muted-foreground/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-foreground">API Integrations</h3>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Alfa LeetCode API URL</label>
                <input type="text" defaultValue="https://alfa-leetcode-api.onrender.com" className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">GitHub REST API Token (PAT)</label>
                <input type="password" defaultValue="ghp_xxxxxxxxxxxxxxxxxxxxxx" className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono" />
                <p className="text-xs text-muted-foreground mt-1">Used for syncing repositories and commits without rate limits.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
