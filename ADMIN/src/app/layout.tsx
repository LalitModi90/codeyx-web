import React from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import "./globals.css";

export const metadata = {
  title: "Admin Dashboard - Codeyx",
  description: "Codeyx Admin Panel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="flex h-screen bg-background overflow-hidden">
          <AdminSidebar />
          
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
              <h2 className="text-xl font-semibold text-foreground">Admin Portal</h2>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  AD
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
