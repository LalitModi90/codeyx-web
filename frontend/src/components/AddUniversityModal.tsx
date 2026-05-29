import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import axios from 'axios';

interface AddUniversityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (universityName: string) => void;
  initialName?: string;
}

export default function AddUniversityModal({ isOpen, onClose, onSuccess, initialName = '' }: AddUniversityModalProps) {
  const [name, setName] = useState(initialName);
  const [shortName, setShortName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [similarInstitutions, setSimilarInstitutions] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSimilarInstitutions([]);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api'}/universities`, {
        name,
        shortName,
        city,
        state,
        country
      }, { withCredentials: true });

      if (response.data.success) {
        onSuccess(response.data.data.name);
        onClose();
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError(err.response.data.message || 'Similar institution already exists');
        if (err.response.data.similar) {
          setSimilarInstitutions(err.response.data.similar);
        }
      } else {
        setError('Failed to add university. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#101014] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="flex justify-between items-center p-5 border-b border-white/5">
            <h3 className="text-[#FAFAFA] font-bold">Add Missing University</h3>
            <button onClick={onClose} className="text-[#A1A1AA] hover:text-white transition-colors" aria-label="Close" title="Close">
              <X size={18} />
            </button>
          </div>

          <div className="p-5 overflow-y-auto max-h-[70vh]">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
                {similarInstitutions.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <p className="font-bold text-white">Did you mean one of these?</p>
                    {similarInstitutions.map((sim, i) => (
                      <button 
                        key={i}
                        type="button"
                        onClick={() => {
                          onSuccess(sim.name);
                          onClose();
                        }}
                        className="w-full text-left p-2 bg-white/5 rounded hover:bg-white/10 flex items-center justify-between"
                      >
                        <span>{sim.name}</span>
                        <Check size={14} className="text-emerald-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="uni-name" className="block text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5 ml-1">University Name *</label>
                <input 
                  id="uni-name"
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#09090B] border border-white/5 text-[#FAFAFA] text-xs rounded-xl py-3 px-4 focus:border-orange-500 focus:outline-none transition-all"
                  placeholder="e.g. Indian Institute of Technology Delhi"
                  title="University Name"
                  aria-label="University Name"
                />
              </div>

              <div>
                <label htmlFor="uni-shortname" className="block text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5 ml-1">Short Name (Optional)</label>
                <input 
                  id="uni-shortname"
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  className="w-full bg-[#09090B] border border-white/5 text-[#FAFAFA] text-xs rounded-xl py-3 px-4 focus:border-orange-500 focus:outline-none transition-all"
                  placeholder="e.g. IIT Delhi"
                  title="Short Name"
                  aria-label="Short Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="uni-city" className="block text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5 ml-1">City</label>
                  <input 
                    id="uni-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#09090B] border border-white/5 text-[#FAFAFA] text-xs rounded-xl py-3 px-4 focus:border-orange-500 focus:outline-none transition-all"
                    placeholder="e.g. New Delhi"
                    title="City"
                    aria-label="City"
                  />
                </div>
                <div>
                  <label htmlFor="uni-state" className="block text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5 ml-1">State</label>
                  <input 
                    id="uni-state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-[#09090B] border border-white/5 text-[#FAFAFA] text-xs rounded-xl py-3 px-4 focus:border-orange-500 focus:outline-none transition-all"
                    placeholder="e.g. Delhi"
                    title="State"
                    aria-label="State"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="uni-country" className="block text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5 ml-1">Country</label>
                <input 
                  id="uni-country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-[#09090B] border border-white/5 text-[#FAFAFA] text-xs rounded-xl py-3 px-4 focus:border-orange-500 focus:outline-none transition-all"
                  placeholder="e.g. India"
                  title="Country"
                  aria-label="Country"
                />
              </div>

              <div className="pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={loading || !name}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Validating...' : 'Submit Institution'}
                </button>
                <p className="text-center text-[9px] text-[#A1A1AA] mt-2">
                  All submissions are verified by moderators to prevent spam.
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
