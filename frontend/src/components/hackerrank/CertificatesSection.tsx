"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, ExternalLink, Calendar, BookOpen, ShieldCheck, AlertTriangle } from 'lucide-react';

interface CertificateItem {
  name: string;
  issuer: string;
  date: string;
  level: string;
  status: 'verified' | 'pending';
}

interface CertificatesSectionProps {
  certificates?: CertificateItem[];
}

export default function CertificatesSection({ certificates = [] }: CertificatesSectionProps) {
  const hasData = certificates && certificates.length > 0;
  const brandColors = {
    primary: '#00EA64',
    secondary: '#00C853',
    accent: '#39FF14',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#00EA64] flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-[#00EA64]" />
          <span>Certificates & Achievements</span>
        </h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Verified skill assessments and credentials</p>
      </div>

      {!hasData ? (
        <div className={`p-8 rounded-3xl border ${brandColors.card} text-center flex flex-col items-center justify-center space-y-3`}>
          <AlertTriangle size={32} className="text-yellow-500/50 animate-pulse" />
          <div className="space-y-1">
            <span className="text-xs font-black uppercase text-white block">No Verified Certificates Available (N/A)</span>
            <p className="text-[10px] text-gray-500 max-w-sm leading-relaxed mx-auto">
              Take free verified assessments directly on HackerRank in SQL, JavaScript, React, or Python to earn official verified credentials that will dynamically index here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className={`p-5 rounded-3xl border ${brandColors.card} hover:border-[#00EA64]/40 flex flex-col justify-between hover:shadow-[0_0_20px_rgba(0,234,100,0.06)] transition-all duration-300 relative group`}
            >
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#00EA64]/10 border border-[#00EA64]/20 flex items-center justify-center">
                <CheckCircle className="w-3.5 h-3.5 text-[#00EA64] group-hover:scale-110 transition-transform" />
              </div>

              <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center group-hover:border-[#00EA64]/30 transition-colors">
                  <Award className="w-5 h-5 text-[#00EA64]" />
                </div>

                <div>
                  <h4 className="font-extrabold text-xs text-white group-hover:text-[#00EA64] transition-colors">{cert.name}</h4>
                  <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{cert.issuer}</p>
                </div>
              </div>

              <div className="border-t border-white/[0.04] pt-3 mt-4 flex items-center justify-between text-[9px] font-bold text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  <span>Issued: {cert.date}</span>
                </span>
                <span className="flex items-center gap-1 text-[#00EA64] uppercase tracking-widest font-black">
                  <BookOpen size={10} />
                  <span>{cert.level}</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
