import TopNavbar from '../components/shared/TopNavbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Projects from '../components/Projects';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import Link from 'next/link';
import { Bot, Sparkles } from 'lucide-react';

// Trigger deployment build
export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Codeyx",
    "url": "https://codeyx-web.vercel.app",
    "description": "Codeyx is a modern coding platform that provides coding sheets, programming contests, developer projects, DSA practice, web development resources, and tools for students and developers to learn, practice, build projects, and improve their coding skills.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://codeyx-web.vercel.app/explore-sheets?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <main className="min-h-screen relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TopNavbar />
      <Hero />
      <AnalyticsDashboard />
      <Projects />

      <Features />
      <HowItWorks />
      <FAQ />
      <Footer />

      {/* Floating AI Help Desk Button */}
      <Link href="/help" className="fixed bottom-8 right-8 z-50 group cursor-pointer" title="Ask Codeyx AI">
        <div className="absolute -inset-2 bg-gradient-to-r from-primary to-orange-400 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
        <div className="relative flex items-center justify-center bg-[#111216] border border-white/10 p-3 rounded-full shadow-2xl hover:scale-110 transition-transform">
          <div className="relative">
            <Bot className="text-primary" size={20} />
            <Sparkles className="absolute -top-1 -right-1 text-orange-400 animate-pulse" size={10} />
          </div>
        </div>
      </Link>
    </main>
  );
}
