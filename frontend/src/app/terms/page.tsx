import React from 'react';
import TopNavbar from '../../components/shared/TopNavbar';
import Footer from '../../components/Footer';

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <TopNavbar />
      <div className="flex-1 max-w-4xl mx-auto px-4 py-24 w-full">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-[var(--text-muted)] mb-8">Last updated: May 28, 2026</p>
        
        <div className="prose prose-invert max-w-none space-y-6 text-[var(--text-muted)]">
          <h2 className="text-2xl font-bold text-white mt-8">1. Terms</h2>
          <p>By accessing this Website, accessible from codeyx.com, you are agreeing to be bound by these Website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws. If you disagree with any of these terms, you are prohibited from accessing this site.</p>
          
          <h2 className="text-2xl font-bold text-white mt-8">2. Use License</h2>
          <p>Permission is granted to temporarily download one copy of the materials on Codeyx's Website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose or for any public display;</li>
            <li>attempt to reverse engineer any software contained on Codeyx's Website;</li>
            <li>remove any copyright or other proprietary notations from the materials; or</li>
            <li>transferring the materials to another person or "mirror" the materials on any other server.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-8">3. Disclaimer</h2>
          <p>All the materials on Codeyx's Website are provided "as is". Codeyx makes no warranties, may it be expressed or implied, therefore negates all other warranties. Furthermore, Codeyx does not make any representations concerning the accuracy or reliability of the use of the materials on its Website or otherwise relating to such materials or any sites linked to this Website.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
