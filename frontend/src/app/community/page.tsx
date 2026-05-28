import React from 'react';
import TopNavbar from '../../components/shared/TopNavbar';
import Footer from '../../components/Footer';

export default function CommunityPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <TopNavbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-24 w-full text-center">
        <h1 className="text-4xl font-bold mb-6">Join the Codeyx Community</h1>
        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-12">Connect with thousands of elite developers, share interview experiences, and collaborate on exciting open-source projects.</p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          <div className="p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)]">
            <h2 className="text-2xl font-bold mb-4">Discord Server</h2>
            <p className="text-[var(--text-muted)] mb-6">Join our active Discord community to chat with other developers, get help with bugs, and participate in weekly coding contests.</p>
            <button className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90">Join Discord</button>
          </div>
          <div className="p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)]">
            <h2 className="text-2xl font-bold mb-4">GitHub Discussions</h2>
            <p className="text-[var(--text-muted)] mb-6">Propose new features, report bugs, and discuss architectural decisions for the open-source Codeyx platform.</p>
            <button className="px-6 py-2 rounded-lg bg-[var(--border-color)] text-white font-medium hover:bg-gray-700">View Discussions</button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
