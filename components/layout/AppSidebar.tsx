"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Calendar,
  Users,
  Bot,
  User,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Lost & Found",
    href: "/lost-found",
    icon: Search,
  },
  {
    label: "Events",
    href: "/events",
    icon: Calendar,
  },
  {
    label: "Skill Connect",
    href: "/skill-connect",
    icon: Users,
  },
  {
    label: "Friday",
    href: "/assistant",
    icon: Bot,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
];

export function SidebarNavItems({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group relative",
              isActive
                ? "bg-indigo-600/10 text-indigo-500 dark:text-indigo-400 font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
            )}
          >
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-600 rounded-r-full shadow-sm shadow-indigo-500/50" />
            )}
            <Icon
              className={cn(
                "w-4 h-4 transition-transform group-hover:scale-110",
                isActive ? "text-indigo-500 dark:text-indigo-400" : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "w-64 border-r border-border bg-card/60 backdrop-blur-xl hidden md:flex flex-col justify-between p-4 sticky top-0 h-screen z-30 transition-all duration-200 shrink-0",
        className
      )}
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent/50 transition-colors"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-indigo-400">
              UniNest
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium">
              Your Intelligent Campus Platform
            </p>
          </div>
        </Link>

        {/* Navigation Items */}
        <SidebarNavItems />
      </div>

      {/* Footer Info & GitHub Repository Link */}
      <div className="p-3.5 rounded-2xl bg-accent/40 border border-border/50 text-xs text-muted-foreground space-y-2.5">
        <div>
          <p className="font-semibold text-foreground">AI Campus OS v1.0</p>
          <p className="text-[11px] text-muted-foreground">Powered by Gemini AI</p>
        </div>

        <a
          href="https://github.com/nitish4456/ai-campus-os"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View AI Campus OS repository on GitHub"
          title="View source code on GitHub"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-indigo-500/30 hover:border-indigo-500/60 text-slate-200 hover:text-white font-medium text-xs shadow-md transition-all duration-200 group"
        >
          <GithubIcon className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
          <span>View on GitHub</span>
          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-200 shrink-0 ml-auto" />
        </a>
      </div>
    </aside>
  );
}
