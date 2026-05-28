import React from 'react';
import TopNavbar from '../../components/shared/TopNavbar';
import Footer from '../../components/Footer';

export default function BlogPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <TopNavbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-24 w-full">
        <h1 className="text-4xl font-bold mb-8">Codeyx Blog</h1>
        <div className="grid gap-8">
          <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)]">
            <span className="text-sm text-primary mb-2 block">May 28, 2026</span>
            <h2 className="text-2xl font-bold mb-4">Introducing Codeyx: The Ultimate Developer Portfolio</h2>
            <p className="text-[var(--text-muted)] mb-4">Today we are thrilled to announce the launch of Codeyx, a unified platform designed for competitive programmers and open-source contributors...</p>
            <button className="text-primary hover:underline">Read more</button>
          </div>
          <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)]">
            <span className="text-sm text-primary mb-2 block">May 20, 2026</span>
            <h2 className="text-2xl font-bold mb-4">How our Leaderboard Algorithm Works</h2>
            <p className="text-[var(--text-muted)] mb-4">Curious about how we rank developers globally? Dive deep into our rating system that aggregates LeetCode, CodeChef, and GitHub stats...</p>
            <button className="text-primary hover:underline">Read more</button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
