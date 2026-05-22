"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface PlatformHandles {
  leetcode: string;
  codeforces: string;
  codechef: string;
  github: string;
  gfg: string;
  atcoder: string;
  hackerrank: string;
}

export interface UserProfile {
  username: string;
  firstName: string;
  lastName: string;
  degree: string;
  college: string;
  branch: string;
  gradYear: string;
  country: string;
  jobRole: string;
  isOnboarded: boolean;
  step1Complete: boolean;
  platformHandles: PlatformHandles;
}

interface OnboardingContextProps {
  profile: UserProfile;
  updateProfile: (data: Partial<UserProfile>) => void;
  completeUsernameSetup: (username: string, firstName: string, lastName: string) => void;
  completeFullProfile: (details: Omit<UserProfile, 'username' | 'firstName' | 'lastName' | 'isOnboarded' | 'step1Complete' | 'platformHandles'>) => void;
  resetOnboarding: () => void;
}

const defaultPlatformHandles: PlatformHandles = {
  leetcode: 'mTQb0YqjQb',
  codeforces: '',
  codechef: 'lalitmodi7878',
  github: 'LalitModi90',
  gfg: 'lalitmodiog7e',
  atcoder: '',
  hackerrank: 'lalitmodi7878065',
};

const defaultProfile: UserProfile = {
  username: '',
  firstName: '',
  lastName: '',
  degree: '',
  college: '',
  branch: '',
  gradYear: '',
  country: '',
  jobRole: '',
  isOnboarded: false,
  step1Complete: false,
  platformHandles: { ...defaultPlatformHandles },
};

const OnboardingContext = createContext<OnboardingContextProps | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Load from localStorage on mount — merge with defaults for new fields
  useEffect(() => {
    try {
      const saved = localStorage.getItem('coderyx_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge platformHandles with defaults so new fields get default values
        setProfile({
          ...defaultProfile,
          ...parsed,
          platformHandles: {
            ...defaultPlatformHandles,
            ...(parsed.platformHandles || {}),
          },
        });
      }
    } catch (e) {
      console.error('Failed to load profile', e);
    }
    setIsInitialized(true);
  }, []);

  // Sync to localStorage
  const updateProfile = (data: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...data };
      try {
        localStorage.setItem('coderyx_profile', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save profile', e);
      }
      return updated;
    });
  };

  const completeUsernameSetup = (username: string, firstName: string, lastName: string) => {
    updateProfile({
      username,
      firstName,
      lastName,
      step1Complete: true
    });
    router.push('/dashboard/onboarding');
  };

  const completeFullProfile = (details: Partial<UserProfile>) => {
    updateProfile({
      ...details,
      isOnboarded: true
    });
    router.push('/dashboard/home');
  };

  const resetOnboarding = () => {
    setProfile(defaultProfile);
    try {
      localStorage.removeItem('coderyx_profile');
    } catch (e) {
      console.error(e);
    }
    router.push('/dashboard/onboarding');
  };

  // Redirect logic to enforce onboarding
  useEffect(() => {
    if (!isInitialized) return;

    if (!profile.isOnboarded && (pathname === '/dashboard' || pathname === '/dashboard/home')) {
      router.push('/dashboard/onboarding');
    } else if (profile.isOnboarded && pathname === '/dashboard/onboarding') {
      router.push('/dashboard/home');
    }
  }, [profile, isInitialized, pathname, router]);

  return (
    <OnboardingContext.Provider value={{ profile, updateProfile, completeUsernameSetup, completeFullProfile, resetOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
