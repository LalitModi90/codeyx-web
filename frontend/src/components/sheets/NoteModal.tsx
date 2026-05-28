'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Trash2, Edit3 } from 'lucide-react';

interface NoteProblem {
  problemId: number;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  notes: string;
}

interface NoteModalProps {
  problem: NoteProblem;
  onClose: () => void;
  onSave: (problemId: number, notes: string) => Promise<void>;
}

const diffColor = (d: string) => {
  if (d === 'Easy') return 'text-emerald-400';
  if (d === 'Medium') return 'text-amber-400';
  return 'text-rose-400';
};

export default function NoteModal({ problem, onClose, onSave }: NoteModalProps) {
  const [value, setValue] = useState(problem.notes || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-focus textarea on open
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(problem.problemId, value);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 700);
    } catch {
      // ignore — parent handles error
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setValue('');
    setSaving(true);
    try {
      await onSave(problem.problemId, '');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-[#111216] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Edit3 size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Problem Note</span>
            </div>
            <h3 className="text-base font-black text-white leading-snug pr-8 line-clamp-2">
              {problem.name}
            </h3>
            <span className={`text-xs font-bold mt-1 inline-block ${diffColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors mt-0.5 shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Textarea */}
        <div className="p-5">
          <textarea
            ref={textareaRef}
            id={`note-textarea-${problem.problemId}`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={8}
            placeholder="Write your approach, edge cases, key insights…"
            className="w-full bg-[#09090B] border border-white/10 focus:border-amber-500/50 rounded-xl p-4 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none transition-colors leading-relaxed font-mono"
            maxLength={2000}
          />
          <div className="flex justify-between items-center mt-1.5 px-1">
            <span className="text-[10px] text-gray-600">{value.length} / 2000 characters</span>
            {value !== (problem.notes || '') && (
              <span className="text-[10px] text-amber-500 font-semibold">Unsaved changes</span>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 pb-5">
          {problem.notes ? (
            <button
              onClick={handleClear}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-50"
            >
              <Trash2 size={13} />
              Clear Note
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
            >
              Cancel
            </button>
            <button
              id={`save-note-btn-${problem.problemId}`}
              onClick={handleSave}
              disabled={saving || value === (problem.notes || '')}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                saved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-black'
              }`}
            >
              <Save size={13} />
              {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
