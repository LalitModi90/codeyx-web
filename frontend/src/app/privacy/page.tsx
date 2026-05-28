import React from 'react';
import TopNavbar from '../../components/shared/TopNavbar';
import Footer from '../../components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <TopNavbar />
      <div className="flex-1 max-w-4xl mx-auto px-4 py-24 w-full">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-[var(--text-muted)] mb-8">Last updated: May 28, 2026</p>
        
        <div className="prose prose-invert max-w-none space-y-6 text-[var(--text-muted)]">
          <p>At Codeyx, accessible from codeyx.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Codeyx and how we use it.</p>
          
          <h2 className="text-2xl font-bold text-white mt-8">Information We Collect</h2>
          <p>The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</p>
          <p>If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.</p>
          
          <h2 className="text-2xl font-bold text-white mt-8">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, operate, and maintain our website</li>
            <li>Improve, personalize, and expand our website</li>
            <li>Understand and analyze how you use our website</li>
            <li>Develop new products, services, features, and functionality</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-8">Log Files</h2>
          <p>Codeyx follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
