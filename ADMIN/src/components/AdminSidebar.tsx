"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Briefcase, 
  Trophy, 
  MessageSquare, 
  Bell, 
  Settings,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { name: "Dashboard",         href: "/",                  icon: LayoutDashboard },
  { name: "Users",             href: "/users",             icon: Users },
  { name: "Universities",      href: "/universities",      icon: GraduationCap },
  { name: "DSA Sheets",        href: "/sheets",            icon: BookOpen },
  { name: "Projects",          href: "/projects",          icon: Briefcase },
  { name: "Contests",          href: "/contests",          icon: Trophy },
  { name: "Suggestions",       href: "/suggestions",       icon: MessageSquare },
  { name: "Send Notification", href: "/send-notification", icon: Bell },
  { name: "Sync Center",       href: "/sync",              icon: Zap },
  { name: "Settings",          href: "/settings",          icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={cn(
        "relative flex flex-col h-screen bg-card border-r border-border transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold">
              C
            </div>
            <span className="font-bold text-lg text-foreground">Codeyx Admin</span>
          </Link>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold mx-auto">
            C
          </div>
        )}
      </div>

      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-primary text-primary-foreground rounded-full p-1 shadow-md hover:bg-primary/90 transition-colors z-10"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={isCollapsed ? link.name : undefined}
            >
              <Icon size={20} className={cn("shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              {!isCollapsed && (
                <span className="font-medium text-sm">{link.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Link 
          href="https://codeyx-web.vercel.app"
          target="_blank"
          className={cn(
            "flex items-center justify-center py-2 px-4 w-full rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors",
            isCollapsed && "px-2"
          )}
        >
          {isCollapsed ? "Exit" : "Go to Main App"}
        </Link>
      </div>
    </div>
  );
}
