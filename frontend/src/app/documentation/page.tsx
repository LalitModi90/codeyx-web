import React from 'react';
import TopNavbar from '../../components/shared/TopNavbar';
import Footer from '../../components/Footer';

export default function DocumentationPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <TopNavbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-24 w-full">
        <h1 className="text-4xl font-bold mb-8">Documentation</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-[var(--text-muted)]">Welcome to the Codeyx documentation. Here you will find everything you need to know to get started, sync your accounts, and build your developer portfolio.</p>
          <h2 className="text-2xl mt-8 mb-4">Getting Started</h2>
          <p className="text-[var(--text-muted)]">Sign up and head over to your dashboard. Connect your GitHub, LeetCode, and CodeChef accounts in the settings panel to automatically import your statistics.</p>
          <h2 className="text-2xl mt-8 mb-4">API Reference</h2>
          <p className="text-[var(--text-muted)]">Our public API documentation is coming soon. Stay tuned for updates on how to integrate Codeyx data into your own applications.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
