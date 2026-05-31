"use client";
import React, { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const pathname = usePathname();

  // Hide on landing page
  if (pathname === '/') return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      email: formData.get('email')?.toString() || '',
      message: formData.get('message')?.toString() || '',
    };

    try {
      // Assuming frontend and backend are on same localhost or mapped correctly
      const token = localStorage.getItem('__clerk_db_jwt') || ''; // Just fallback if not authenticated
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api'}/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsSuccess(false);
        }, 3000);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button - Theme Matched Bottom Right */}
      <button 
        onClick={() => { setIsOpen(true); setIsSuccess(false); }}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-3 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all hover:scale-105 group border border-white/10 cursor-pointer"
        title="Give Feedback"
        aria-label="Give Feedback"
      >
        <MessageSquare className="w-5 h-5 text-blue-100 group-hover:-translate-y-0.5 transition-transform" />
        <span className="font-bold text-sm tracking-wide">Feedback</span>
      </button>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111216] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-white/5 bg-white/[0.02]">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-400" />
                We Value Your Feedback
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Close"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {isSuccess ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Thank You!</h4>
                <p className="text-gray-400">Your feedback has been sent directly to our team. We appreciate your help in improving Codeyx.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                <div>
                  <label htmlFor="feedback-email" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Your Email (Optional)</label>
                  <input 
                    id="feedback-email"
                    title="Your Email"
                    type="email" 
                    name="email" 
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500/50 outline-none text-white text-sm transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="feedback-msg" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Message *</label>
                  <textarea 
                    id="feedback-msg"
                    title="Message"
                    name="message" 
                    required
                    rows={4}
                    placeholder="Tell us what you love, what's broken, or what we can improve..."
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500/50 outline-none text-white text-sm transition-colors resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:hover:from-blue-600 disabled:hover:to-indigo-600 text-white font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {isLoading ? 'Sending...' : 'Send Feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
