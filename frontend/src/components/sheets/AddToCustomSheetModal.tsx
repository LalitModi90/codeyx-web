"use client";
import React, { useState, useEffect } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { customSheetsService } from '../../services/customSheets.service';
import { useCustomSheetsStore } from '../../store/customSheets.store';

interface Props {
  problemId: number;
  problemName: string;
  sourceSlug: string;
  onClose: () => void;
}

export default function AddToCustomSheetModal({ problemId, problemName, sourceSlug, onClose }: Props) {
  const { sheets, fetchSheets, createSheet } = useCustomSheetsStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchSheets();
  }, []);

  const handleToggle = (sheetId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(sheetId)) next.delete(sheetId);
      else next.add(sheetId);
      return next;
    });
  };

  const handleSave = async () => {
    setAdding(true);
    try {
      const promises = Array.from(selected).map((sid) =>
        customSheetsService.addProblem({ sheetId: sid, problemId, sourceSlug })
      );
      await Promise.all(promises);
      onClose();
    } catch {
    } finally {
      setAdding(false);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newTitle.trim()) return;
    setIsCreating(true);
    try {
      const sheet = await createSheet(newTitle.trim());
      if (sheet?._id) {
        await customSheetsService.addProblem({ sheetId: sheet._id, problemId, sourceSlug });
      }
      onClose();
    } catch {
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111216] border border-white/10 rounded-[20px] w-full max-w-md mx-4 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white">Add to Sheet</h3>
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{problemName}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto mb-5 pr-1">
          {sheets.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">No custom sheets yet. Create one below.</p>
          ) : (
            sheets.map((s) => (
              <button
                key={s._id}
                onClick={() => handleToggle(s._id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all border ${
                  selected.has(s._id)
                    ? 'bg-[#FF8A00]/10 border-[#FF8A00]/30 text-white'
                    : 'bg-transparent border-white/5 text-gray-400 hover:border-white/10 hover:text-gray-200'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{s.title}</div>
                  <div className="text-[10px] text-gray-500">{s.totalProblems} problems · {s.progressPercentage}% done</div>
                </div>
                {selected.has(s._id) && <Check size={16} className="text-[#FF8A00] flex-shrink-0 ml-2" />}
              </button>
            ))
          )}
        </div>

        <div className="border-t border-white/5 pt-4 mb-4">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Or create new sheet</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Sheet title..."
              className="flex-1 bg-[#09090B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF8A00]/50"
            />
            <button
              onClick={handleCreateAndAdd}
              disabled={!newTitle.trim() || isCreating}
              className="bg-[#FF8A00] hover:bg-orange-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
            >
              {isCreating ? <Loader2 size={12} className="animate-spin" /> : null}
              Create & Add
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={selected.size === 0 || adding}
          className="w-full bg-gradient-to-r from-[#FF8A00] to-orange-500 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {adding ? <Loader2 size={16} className="animate-spin" /> : null}
          Add to {selected.size} sheet{selected.size !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}
