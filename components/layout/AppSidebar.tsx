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
} from "lucide-react";
import { cn } from "@/lib/utils";

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

      {/* Footer Info */}
      <div className="p-3 rounded-xl bg-accent/40 border border-border/50 text-xs text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground">UniNest v1.0</p>
        <p className="text-[11px] text-muted-foreground">Powered by Gemini AI</p>
      </div>
    </aside>
  );
}
