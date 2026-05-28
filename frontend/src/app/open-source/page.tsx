import React from 'react';
import TopNavbar from '../../components/shared/TopNavbar';
import Footer from '../../components/Footer';

export default function OpenSourcePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <TopNavbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-24 w-full text-center">
        <h1 className="text-4xl font-bold mb-6">We Love Open Source</h1>
        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-12">Codeyx is built on open-source technologies, and we believe in giving back to the community.</p>
        
        <div className="p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] max-w-3xl mx-auto text-left">
          <h2 className="text-2xl font-bold mb-4">Contribute to Codeyx</h2>
          <p className="text-[var(--text-muted)] mb-6">Our core platform is open source. You can contribute by fixing bugs, adding new features, or improving our documentation. Check out our GitHub repository to get started.</p>
          <a href="https://github.com/LalitModi90/codeyx-web" target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-2 rounded-lg bg-white text-black font-medium hover:opacity-90">
            View on GitHub
          </a>
        </div>
      </div>
      <Footer />
    </main>
  );
}
