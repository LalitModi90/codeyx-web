"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { ShieldOff } from "lucide-react";

const ADMIN_EMAIL = "lalitkumargeloth16@gmail.com";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase()?.trim();

  if (!userEmail || userEmail !== ADMIN_EMAIL) {
    return (
      <div className="flex h-screen items-center justify-center bg-background flex-col gap-6">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <ShieldOff className="text-red-500" size={40} />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-sm">
            You do not have permission to access the Admin Portal.
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Logged in as: <span className="text-red-400">{userEmail || "Not logged in"}</span>
          </p>
        </div>
        <a
          href="http://localhost:3000"
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition"
        >
          Go to Main App
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
