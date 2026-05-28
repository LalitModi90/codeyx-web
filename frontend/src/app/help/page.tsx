"use client";
import React, { useState } from 'react';
import TopNavbar from '../../components/shared/TopNavbar';
import Footer from '../../components/Footer';
import { Sparkles, ArrowRight, Bot, User as UserIcon, Loader2 } from 'lucide-react';

export default function HelpCenterPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse(null);

    setTimeout(() => {
      const q = query.toLowerCase();
      
      // Comprehensive Knowledge Base for Codeyx
      const knowledgeBase = [
        {
          keywords: ['login', 'sign in', 'log in', 'access'],
          answer: "To login to Codeyx, click the 'Log In' button in the top right corner. We use Clerk for secure authentication, so you can easily log in using your Google account, GitHub account, or your email address."
        },
        {
          keywords: ['signup', 'sign up', 'register', 'create account', 'join'],
          answer: "To join Codeyx, click the 'Sign Up' button in the top right. You can register instantly using your Google or GitHub account, which will automatically set up your developer profile."
        },
        {
          keywords: ['password', 'forgot password', 'reset password'],
          answer: "If you forgot your password, go to the Login page and click 'Forgot Password'. You will receive an email with secure instructions to reset it."
        },
        {
          keywords: ['leetcode', 'leet code'],
          answer: "To sync your LeetCode account, go to Dashboard -> Settings -> Integrations, enter your LeetCode username, and click 'Sync'. Our servers will fetch your latest contest rating and solved problems."
        },
        {
          keywords: ['codechef', 'code chef'],
          answer: "You can link your CodeChef account in the 'Platforms' section of your Dashboard. Once linked, we will display your current CodeChef rating, highest rating, and global rank."
        },
        {
          keywords: ['codeforces', 'code forces'],
          answer: "Codeforces integration is supported! Head to your Dashboard Integrations, add your Codeforces handle, and we will sync your contest rating, max rating, and rank."
        },
        {
          keywords: ['github', 'repo', 'open source', 'projects', 'project'],
          answer: "We automatically import your public GitHub repositories once you link your account. Go to the 'Projects' tab in your dashboard to manage visibility, add descriptions, and showcase your open-source work on your portfolio."
        },
        {
          keywords: ['leaderboard', 'rank', 'rating', 'score', 'algorithm', 'percentage'],
          answer: "The Codeyx Global Score is calculated out of 100 using a proprietary hybrid algorithm: 70% Competitive Programming (Contest ratings 35%, Problems Solved 20%, Accuracy 10%, Consistency 3%, Speed 2%), 20% Developer Engineering (GitHub 8%, Open Source 5%, Live Projects 4%, Portfolio 3%), and 10% Reputation & Community (Project Ratings, Reviews, Followers)."
        },
        {
          keywords: ['sheet', 'workspace', 'striver', 'neetcode', 'progress'],
          answer: "Codeyx features a powerful 'Workspace' where you can track popular coding sheets like Striver's A2Z or NeetCode 150. Go to the 'Sheets' section, select a sheet, and mark problems as solved to track your progress visually."
        },
        {
          keywords: ['delete account', 'remove account', 'close account'],
          answer: "To delete your account, go to Settings -> Account -> Danger Zone, and click 'Delete Account'. This action is permanent and will wipe all your synced data."
        },
        {
          keywords: ['price', 'cost', 'free', 'pricing', 'premium'],
          answer: "Codeyx is completely free for all developers! You can build your portfolio, sync unlimited platform stats, and join the global leaderboard without paying anything."
        },
        {
          keywords: ['portfolio', 'profile', 'custom profile', 'resume'],
          answer: "Codeyx acts as your digital developer resume. By linking your platforms, we automatically generate a beautiful, shareable public portfolio containing all your skills, ratings, heatmaps, and projects."
        },
        {
          keywords: ['who are you', 'what is codeyx', 'about'],
          answer: "I'm the Codeyx AI assistant! Codeyx is the ultimate developer portfolio platform built to help elite programmers aggregate their competitive programming stats and showcase their skills to the world."
        },
        {
          keywords: ['founder', 'creator', 'who made', 'developer', 'lalit'],
          answer: "Codeyx was built by Lalit Modi, aiming to provide a unified platform for competitive programmers and developers to showcase their true potential."
        },
        {
          keywords: ['hello', 'hi', 'hey', 'greetings'],
          answer: "Hello there! I am the Codeyx AI assistant. I can help you with anything related to syncing platforms, understanding the leaderboard, managing your portfolio, or tracking sheets. What do you need help with?"
        }
      ];

      // Simple scoring algorithm to find the best match
      let bestMatch = null;
      let maxScore = 0;

      for (const item of knowledgeBase) {
        let score = 0;
        for (const keyword of item.keywords) {
          if (q.includes(keyword)) {
            score += keyword.length; // Longer keywords give higher score
          }
        }
        if (score > maxScore) {
          maxScore = score;
          bestMatch = item.answer;
        }
      }

      // If no match found, use fallback
      let aiText = bestMatch;
      if (!aiText) {
        aiText = `I understand you're asking about "${query}". Since I am a simulated AI assistant for this demo, my knowledge base is currently limited. Try asking me about how to sync platforms like LeetCode or CodeChef, how the Leaderboard works, how to showcase GitHub projects, or tracking Coding Sheets!`;
      }

      setResponse(aiText);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <main className="min-h-screen flex flex-col">
      <TopNavbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-24 w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-bold mb-6">
            <Sparkles size={16} />
            AI-Powered Support
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">How can we help you?</h1>
          <p className="text-[var(--text-muted)] text-lg">Ask our intelligent assistant anything about Codeyx.</p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <form onSubmit={handleSearch} className="relative flex items-center">
              <Sparkles className="absolute left-6 text-primary animate-pulse" size={24} />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything... e.g. 'How do I sync LeetCode?'" 
                className="w-full pl-16 pr-16 py-5 rounded-2xl bg-[#09090b] border border-white/10 focus:border-primary/50 outline-none text-lg text-white shadow-2xl transition-all" 
              />
              <button 
                type="submit"
                disabled={isLoading || !query.trim()}
                className="absolute right-4 p-2.5 rounded-xl bg-primary text-black hover:scale-105 transition-transform flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} className="font-bold" />}
              </button>
            </form>
          </div>

          {/* AI Response Area */}
          {(isLoading || response) && (
            <div className="mb-16 p-6 rounded-2xl bg-[#111216] border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 border border-primary/30">
                  <Bot size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-400 mb-2">Codeyx AI</h4>
                  {isLoading ? (
                    <div className="flex gap-1.5 mt-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <p className="text-white leading-relaxed text-lg">{response}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <h2 className="text-2xl font-bold mb-6 mt-12 flex items-center gap-2">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-primary/30 transition-colors group cursor-pointer" onClick={() => setQuery("How do I connect my LeetCode account?")}>
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">How do I connect my LeetCode account?</h3>
              <p className="text-[var(--text-muted)]">Go to your Dashboard -&gt; Settings -&gt; Integrations, and enter your LeetCode username. Click sync to fetch your stats.</p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-primary/30 transition-colors group cursor-pointer" onClick={() => setQuery("Why is my rank not updating?")}>
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Why is my rank not updating?</h3>
              <p className="text-[var(--text-muted)]">Ranks are updated periodically every few hours to ensure platform stability. You can force a manual sync from your dashboard once per day.</p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-primary/30 transition-colors group cursor-pointer" onClick={() => setQuery("How can I delete my account?")}>
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">How can I delete my account?</h3>
              <p className="text-[var(--text-muted)]">Navigate to Settings -&gt; Account -&gt; Danger Zone, and click 'Delete Account'. Please note this action is irreversible and all your data will be permanently removed.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
