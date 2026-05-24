"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: "Is Coderyx free to use?", a: "Yes, the core tracking features and analytics are completely free. We also offer a pro tier for advanced AI insights." },
  { q: "Can I sync my LeetCode profile?", a: "Absolutely. Simply enter your LeetCode username and we'll automatically fetch your submissions and stats." },
  { q: "Does it support dark mode?", a: "Yes! Coderyx is designed with a premium dark mode as the default experience, but light mode is fully supported." },
  { q: "How is my data secured?", a: "We use industry-standard encryption and do not store your passwords. We only use public APIs to fetch your coding stats." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-[var(--text-muted)]">Got questions? We've got answers.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border border-[var(--border-color)] bg-[var(--card-bg)] rounded-2xl overflow-hidden">
            <button 
              className="w-full px-6 py-5 flex justify-between items-center text-left font-semibold focus:outline-none"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            >
              {faq.q}
              <motion.div animate={{ rotate: openIndex === idx ? 180 : 0 }}>
                <ChevronDown className="text-[var(--text-muted)]" />
              </motion.div>
            </button>
            <AnimatePresence>
              {openIndex === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 text-[var(--text-muted)] border-t border-[var(--border-color)] pt-4">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
