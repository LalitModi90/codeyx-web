"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from './OnboardingProvider';
import { useUser } from '@clerk/nextjs';
import { User, CheckCircle2, XCircle, Loader2, Sparkles, ChevronRight } from 'lucide-react';

export default function UsernameSetupModal() {
  const { profile, completeUsernameSetup } = useOnboarding();
  const { isLoaded, isSignedIn, user } = useUser();
  
  const [firstName, setFirstName] = useState(profile.firstName || '');
  const [lastName, setLastName] = useState(profile.lastName || '');
  const [username, setUsername] = useState(profile.username || '');
  
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState('');

  // Pre-fill fields from Clerk when user loads
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      if (!firstName && user.firstName) setFirstName(user.firstName);
      if (!lastName && user.lastName) setLastName(user.lastName);
      
      if (!username) {
        const randomDigits = Math.floor(Math.random() * 900000) + 100000;
        let baseName = user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'user';
        // Base name only letters, numbers, underscores
        baseName = baseName.toLowerCase().replace(/[^a-z0-9_]/g, '');
        
        // Initial name is base + random digits to ensure uniqueness by default
        setUsername(`${baseName}_${randomDigits}`);
      }
    }
  }, [isLoaded, isSignedIn, user]);

  // Handle username check debouncing
  useEffect(() => {
    if (username.length < 4) {
      setIsChecking(false);
      setIsAvailable(null);
      setSuggestions([]);
      setError('');
      return;
    }

    const validFormat = /^[a-zA-Z0-9_]+$/.test(username);
    if (!validFormat) {
      setIsChecking(false);
      setIsAvailable(false);
      setSuggestions([]);
      setError('Letters, numbers, and underscores only.');
      return;
    }

    setError('');
    setIsChecking(true);

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api'}/profile/check-username?username=${encodeURIComponent(username)}`);
        const data = await res.json();
        setIsChecking(false);
        if (data.available) {
          setIsAvailable(true);
          setSuggestions([]);
        } else {
          setIsAvailable(false);
          setSuggestions(data.suggestions || []);
          setError(data.error || 'Username is already taken.');
        }
      } catch (err) {
        setIsChecking(false);
        console.error('Username check failed', err);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !username || !isAvailable || isSaving) return;
    
    setIsSaving(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api'}/profile/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, username, name: `${firstName} ${lastName}`.trim() })
      });
    } catch (err) {
      console.error('Failed to reserve username in DB:', err);
    } finally {
      setIsSaving(false);
      completeUsernameSetup(username, firstName, lastName);
    }
  };

  // If Step 1 is already complete, do not show the modal
  if (profile.step1Complete) return null;

  const initials = `${firstName[0] || ''}${lastName[0] || ''}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Dark backdrop blur */}
      <div className="absolute inset-0 bg-[#090d16]/80 backdrop-blur-xl"></div>
      
      {/* Neon glowing decorative rings behind modal */}
      <div className="absolute w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md bg-[#0f172a]/90 border border-white/10 rounded-3xl p-8 shadow-2xl text-center backdrop-blur-2xl"
      >
        {/* Decorative Top Sparkle */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg border border-white/15">
          <Sparkles className="text-white" size={20} />
        </div>

        {/* Profile Avatar Preview */}
        <div className="mt-4 mb-6 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-orange-500/25 to-amber-500/5 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-inner relative overflow-hidden group">
            {isLoaded && isSignedIn && user?.imageUrl ? (
              <img 
                src={user.imageUrl} 
                alt="Profile Preview" 
                className="w-full h-full object-cover rounded-full" 
              />
            ) : initials ? (
              <span className="text-3xl font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                {initials}
              </span>
            ) : (
              <User size={40} className="stroke-[1.5]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mt-4">Welcome to Coderyx</h3>
          <p className="text-gray-400 text-sm mt-1">Complete your profile to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="text-left space-y-4">
          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">First Name</label>
              <input 
                type="text" 
                required
                placeholder="Alex"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#0b0f19]/80 border border-white/10 text-white rounded-xl py-3 px-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all placeholder-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Last Name</label>
              <input 
                type="text" 
                required
                placeholder="Dev"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#0b0f19]/80 border border-white/10 text-white rounded-xl py-3 px-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all placeholder-gray-600"
              />
            </div>
          </div>

          {/* Username Input Field */}
          <div className="relative">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Choose Username</label>
            <div className="relative">
              <input 
                type="text" 
                required
                placeholder="alex_dev"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                className={`w-full bg-[#0b0f19]/80 border text-white rounded-xl py-3 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 transition-all placeholder-gray-600 ${
                  isAvailable === true ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500' :
                  isAvailable === false ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' :
                  'border-white/10 focus:border-orange-500 focus:ring-orange-500'
                }`}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {isChecking && <Loader2 size={16} className="text-orange-500 animate-spin" />}
                {!isChecking && isAvailable === true && <CheckCircle2 size={18} className="text-emerald-500" />}
                {!isChecking && isAvailable === false && <XCircle size={18} className="text-red-500" />}
              </div>
            </div>

            {/* Validation Message & Suggestions */}
            <AnimatePresence mode="wait">
              {isAvailable === true && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }}
                  className="text-xs text-emerald-400 mt-1.5 ml-1 flex items-center gap-1"
                >
                  ✔ Username is available
                </motion.p>
              )}
              {isAvailable === false && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-1.5 space-y-1.5"
                >
                  <p className="text-xs text-red-400 ml-1 flex items-center gap-1">
                    ✖ {error}
                  </p>
                  {suggestions.length > 0 && (
                    <div className="bg-[#0b0f19]/50 border border-white/5 p-2 rounded-xl">
                      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1 ml-1">Suggestions:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => setUsername(suggestion)}
                            className="text-xs bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/40 rounded-lg px-2.5 py-1 transition-all font-mono"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Rules info if input empty */}
          {!username && (
            <p className="text-[10px] text-gray-500 leading-relaxed ml-1">
              Minimum 4 characters. Only letters, numbers, and underscores allowed. No spaces.
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!firstName || !lastName || !username || !isAvailable || isChecking || isSaving}
            className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              !firstName || !lastName || !username || !isAvailable || isChecking || isSaving
                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] hover:scale-[1.02]'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                Continue <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
