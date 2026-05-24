"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AuthVisuals from '@/components/AuthVisuals';
import { SignUp } from '@clerk/nextjs';

import { useTheme } from '@/components/ThemeProvider';

export default function SignupPage() {
  const { theme } = useTheme();
  
  return (
    <main className="min-h-screen flex bg-[var(--background)]">
      <AuthVisuals type="signup" />
      
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-[var(--text-muted)] hover:text-primary transition-colors">
          ← Back to Home
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative group my-8"
        >
          {/* Border glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl blur-md"></div>
          
          <div className="relative z-10 flex justify-center">
            <SignUp 
              appearance={{
                layout: {
                  logoImageUrl: theme === 'dark' ? '/assets/logo-dark-them.png' : '/assets/logo-light-Them.png',
                  logoPlacement: 'inside'
                },
                elements: {
                  rootBox: "w-full",
                  card: "bg-[var(--card-bg)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-2xl rounded-3xl w-full",
                  logoImage: "h-36 w-auto object-contain",
                  headerTitle: "text-[var(--text-main)]",
                  headerSubtitle: "text-[var(--text-muted)]",
                  socialButtonsBlockButton: "border-[var(--border-color)] hover:bg-[var(--border-color)] text-[var(--text-main)]",
                  socialButtonsBlockButtonText: "font-semibold",
                  dividerLine: "bg-[var(--border-color)]",
                  dividerText: "text-[var(--text-muted)]",
                  formFieldLabel: "text-[var(--text-muted)]",
                  formFieldInput: "bg-[var(--background)] border-[var(--border-color)] text-[var(--text-main)] focus:border-primary focus:ring-primary",
                  formButtonPrimary: "bg-gradient-to-r from-orange-500 to-orange-400 hover:opacity-90 shadow-lg shadow-orange-500/25",
                  footerActionText: "text-[var(--text-muted)]",
                  footerActionLink: "text-primary hover:text-orange-400",
                },
                variables: {
                  colorPrimary: "#FF8A00",
                  colorText: theme === 'dark' ? 'white' : '#111827',
                  colorBackground: "transparent",
                }
              }}
            />
          </div>
        </motion.div>
      </div>
    </main>
  );
}
