"use client";
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import TopNavbar from '../../components/shared/TopNavbar';
import { useCustomSheetsStore } from '../../store/customSheets.store';
import { 
  Plus, Trash2, Bookmark, Play, Loader2, Sparkles, Box, 
  ChevronRight, Activity
} from 'lucide-react';
import Link from 'next/link';

export default function MySheetsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const { sheets, isLoading, fetchSheets, createSheet, deleteSheet } = useCustomSheetsStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login');
      return;
    }
    if (isSignedIn) fetchSheets();
  }, [isLoaded, isSignedIn]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    await createSheet(newTitle.trim(), newDesc.trim());
    setNewTitle('');
    setNewDesc('');
    setShowCreate(false);
    setCreating(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this sheet? Problems will not be removed from other sheets.')) {
      await deleteSheet(id);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#FF8A00]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#FAFAFA] font-sans overflow-x-hidden selection:bg-[#FF8A00]/30 pb-20">
      <TopNavbar />
      
      <main className="max-w-[1400px] mx-auto px-6 pt-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2">
              <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
                <Activity size={12} /> Home
              </Link>
              <ChevronRight size={12} />
              <span className="text-gray-300">My Sheets</span>
            </div>
            <h1 className="text-[32px] font-extrabold text-white flex items-center gap-2">
              My Sheets <Bookmark size={24} className="text-[#FF8A00]" />
            </h1>
            <p className="text-sm text-gray-400 mt-1">Your custom problem collections with synced progress.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-gradient-to-r from-[#FF8A00] to-orange-500 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-[0_8px_25px_rgba(255,138,0,0.3)] hover:scale-105 transition-transform active:scale-95"
          >
            <Plus size={16} /> New Sheet
          </button>
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#111216] border border-white/10 rounded-[20px] w-full max-w-md mx-4 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Create Custom Sheet</h3>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Sheet title (e.g. Interview Prep)"
                className="w-full bg-[#09090B] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF8A00]/50 mb-3"
                autoFocus
              />
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full bg-[#09090B] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF8A00]/50 mb-5 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 bg-transparent border border-white/10 text-gray-400 py-3 rounded-xl text-sm font-bold hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newTitle.trim() || creating}
                  className="flex-1 bg-[#FF8A00] hover:bg-orange-500 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : null}
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sheets Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={32} className="animate-spin text-[#FF8A00]" />
          </div>
        ) : sheets.length === 0 ? (
          <div className="text-center py-32">
            <Bookmark size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No custom sheets yet</h3>
            <p className="text-sm text-gray-400 mb-6">Create your first sheet by favoriting problems and organizing them.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-[#FF8A00] hover:bg-orange-500 text-white px-6 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2 transition-all"
            >
              <Plus size={16} /> Create Your First Sheet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sheets.map((sheet) => (
              <Link
                key={sheet._id}
                href={`/my-sheets/${sheet._id}`}
                className="block bg-[#111216] border border-white/5 hover:border-white/10 rounded-[20px] p-5 relative overflow-hidden group transition-all duration-300 shadow-lg"
              >
                {/* Accent bar */}
                {sheet.progressPercentage > 0 && (
                  <div
                    className="absolute top-0 left-0 h-[2px] bg-[#FF8A00] shadow-[0_0_10px_#FF8A00] transition-all duration-500"
                    style={{ width: `${sheet.progressPercentage}%` }}
                  />
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#FF8A00]/20 to-orange-500/10 border border-[#FF8A00]/20 flex items-center justify-center shadow-lg">
                    <Bookmark size={20} className="text-[#FF8A00]" />
                  </div>
                  <button
                    onClick={(e) => handleDelete(sheet._id, e)}
                    className="text-gray-600 hover:text-rose-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                    title="Delete sheet"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <h3 className="font-bold text-sm text-white mb-1 leading-tight group-hover:text-[#FF8A00] transition-colors">
                  {sheet.title}
                </h3>
                {sheet.description && (
                  <p className="text-[11px] text-gray-400 mb-3 line-clamp-2">{sheet.description}</p>
                )}

                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                      <Box size={12} className="text-gray-500" />
                      {sheet.totalProblems} problems
                    </span>
                    <span className="text-xs font-bold text-white">{sheet.progressPercentage}%</span>
                  </div>

                  <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-4">
                    <div
                      className={`h-full transition-all duration-1000 ${sheet.progressPercentage > 0 ? 'bg-[#FF8A00]' : 'bg-transparent'}`}
                      style={{ width: `${sheet.progressPercentage}%` }}
                    />
                  </div>

                  <button className="w-full py-2.5 rounded-xl text-xs font-bold transition-all bg-[#FF8A00] hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(255,138,0,0.2)] flex items-center justify-center gap-2">
                    <Play size={12} className="fill-current" />
                    {sheet.progressPercentage > 0 ? 'Continue' : 'Start'}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
