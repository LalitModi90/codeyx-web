"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';

const companies = [
  { name: "Google", color: "text-red-500", desc: "150+ Top Frequency Questions", logo: "G" },
  { name: "Meta", color: "text-blue-500", desc: "Core Data Structures & Algos", logo: "M" },
  { name: "Amazon", color: "text-yellow-500", desc: "Leadership & System Design", logo: "a" },
  { name: "Microsoft", color: "text-green-500", desc: "Arrays, Strings, Trees", logo: "MS" }
];

export default function CompanySheets() {
  return (
    <section id="company-kit" className="py-20 px-4 max-w-7xl mx-auto">
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
          <Briefcase className="text-primary" size={32} />
          Company Wise Kits
        </h2>
        <p className="text-[var(--text-muted)]">Target specific companies with curated problem lists based on recent interview experiences.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {companies.map((comp, i) => (
          <motion.div 
            key={comp.name}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group cursor-pointer bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-2xl hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
          >
            <div className={`w-12 h-12 rounded-xl bg-[var(--background)] border border-[var(--border-color)] flex items-center justify-center font-bold text-xl mb-4 ${comp.color}`}>
              {comp.logo}
            </div>
            <h3 className="font-bold text-lg mb-1">{comp.name}</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">{comp.desc}</p>
            <SignedIn>
              <div className="text-sm font-medium text-primary group-hover:underline mt-auto">Start Preparation →</div>
            </SignedIn>
            <SignedOut>
              <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                <Link href="/login">
                  <button className="w-full py-2 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white text-sm font-bold transition-all flex items-center justify-center gap-2 border border-orange-500/20">
                    Login to Access Full Sheet
                  </button>
                </Link>
              </div>
            </SignedOut>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
