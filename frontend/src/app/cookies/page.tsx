import React from 'react';
import TopNavbar from '../../components/shared/TopNavbar';
import Footer from '../../components/Footer';

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <TopNavbar />
      <div className="flex-1 max-w-4xl mx-auto px-4 py-24 w-full">
        <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
        <p className="text-[var(--text-muted)] mb-8">Last updated: May 28, 2026</p>
        
        <div className="prose prose-invert max-w-none space-y-6 text-[var(--text-muted)]">
          <p>This is the Cookie Policy for Codeyx, accessible from codeyx.com.</p>

          <h2 className="text-2xl font-bold text-white mt-8">What Are Cookies</h2>
          <p>As is common practice with almost all professional websites this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored however this may downgrade or 'break' certain elements of the sites functionality.</p>

          <h2 className="text-2xl font-bold text-white mt-8">How We Use Cookies</h2>
          <p>We use cookies for a variety of reasons detailed below. Unfortunately in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.</p>

          <h2 className="text-2xl font-bold text-white mt-8">The Cookies We Set</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account related cookies:</strong> If you create an account with us then we will use cookies for the management of the signup process and general administration.</li>
            <li><strong>Login related cookies:</strong> We use cookies when you are logged in so that we can remember this fact.</li>
            <li><strong>Site preferences cookies:</strong> In order to provide you with a great experience on this site we provide the functionality to set your preferences for how this site runs when you use it.</li>
          </ul>
        </div>
      </div>
      <Footer />
    </main>
  );
}
