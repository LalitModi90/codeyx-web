import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Search, AlertCircle } from 'lucide-react';

export interface SmartOption {
  id: string;
  label: string;
  aliases?: string[];
  verified?: boolean;
}

interface SmartInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  options: SmartOption[];
  allowCustom?: boolean;
  onAddCustom?: (val: string) => void;
  loading?: boolean;
  onSearch?: (query: string) => void;
  icon?: React.ReactNode;
}

export default function SmartInput({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  options, 
  allowCustom = true,
  onAddCustom,
  loading = false,
  onSearch,
  icon
}: SmartInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<SmartOption[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Fuse
  const fuse = new Fuse(options, {
    keys: ['label', 'aliases'],
    threshold: 0.3,
    includeScore: true
  });

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults(options.slice(0, 10)); // Default suggestions
    } else {
      const searchResults = fuse.search(query).map(r => r.item);
      setResults(searchResults.slice(0, 10));
    }
    
    if (onSearch) {
      const timeout = setTimeout(() => onSearch(query), 300);
      return () => clearTimeout(timeout);
    }
  }, [query, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    setQuery(val);
    onChange(val);
    setIsOpen(false);
  };

  const exactMatch = results.find(r => r.label.toLowerCase() === query.toLowerCase());

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5 ml-1">
        {label}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
            {icon}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full bg-[#09090B] border border-white/5 text-[#FAFAFA] text-xs rounded-xl py-3 ${icon ? 'pl-10' : 'px-4'} pr-10 focus:border-orange-500 focus:outline-none transition-all placeholder-zinc-700`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600">
          <Search size={14} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-[#101014]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto scrollbar-thin"
          >
            {loading ? (
              <div className="p-4 text-xs text-zinc-500 text-center animate-pulse">Loading suggestions...</div>
            ) : results.length > 0 ? (
              <div className="py-1">
                {results.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.label)}
                    className="w-full text-left px-4 py-2.5 text-xs text-[#FAFAFA] hover:bg-white/10 transition-all flex items-center justify-between group"
                  >
                    <span>{opt.label}</span>
                    {value === opt.label && <Check size={14} className="text-orange-500" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 flex flex-col items-center text-center">
                <AlertCircle size={20} className="text-zinc-600 mb-2" />
                <p className="text-xs text-zinc-500 mb-3">No matching results found</p>
                {allowCustom && query.trim() !== '' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onAddCustom) onAddCustom(query);
                      else handleSelect(query);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-orange-400 bg-orange-500/10 px-4 py-2 rounded-lg hover:bg-orange-500/20 transition-all"
                  >
                    <Plus size={14} />
                    Add "{query}"
                  </button>
                )}
              </div>
            )}
            
            {/* Show Add Custom at bottom even if results exist but no exact match */}
            {allowCustom && query.trim() !== '' && results.length > 0 && !exactMatch && (
              <div className="p-2 border-t border-white/5 bg-black/20">
                <button
                  type="button"
                  onClick={() => {
                    if (onAddCustom) onAddCustom(query);
                    else handleSelect(query);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-zinc-400 hover:text-white bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition-all"
                >
                  <Plus size={12} />
                  Can't find it? Add "{query}"
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
