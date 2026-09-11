"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { SidebarNavItems } from "@/components/layout/AppSidebar";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

export function Header({
  userName,
  userImageUrl,
  googleImageUrl,
}: {
  userName?: string;
  userImageUrl?: string | null;
  googleImageUrl?: string | null;
}) {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(
    userImageUrl || null
  );
  const [googlePhoto, setGooglePhoto] = useState<string | null>(
    googleImageUrl || null
  );

  useEffect(() => {
    if (userImageUrl !== undefined && googleImageUrl !== undefined) {
      setProfilePhoto(userImageUrl);
      setGooglePhoto(googleImageUrl);
      return;
    }

    // Fetch profile photo from database endpoint if not passed explicitly
    fetch("/api/profile/photo")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.profileImage) setProfilePhoto(data.profileImage);
          if (data.googleImage) setGooglePhoto(data.googleImage);
        }
      })
      .catch(() => {});
  }, [userImageUrl, googleImageUrl]);

  const displayName = userName || user?.firstName || user?.fullName || "Student";

  return (
    <header className="h-16 border-b border-border bg-background/75 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Left Greeting & Mobile Drawer Trigger */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Mobile Menu Sheet Drawer */}
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-72 bg-card border-border p-4 flex flex-col justify-between">
            <SheetHeader className="pb-4 border-b border-border">
              <SheetTitle className="text-left flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-base tracking-tight text-foreground">
                  UniNest
                </span>
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 py-4">
              <SidebarNavItems onLinkClick={() => setIsMobileOpen(false)} />
            </div>

            <div className="p-3.5 rounded-2xl bg-accent/40 border border-border/50 text-xs text-muted-foreground space-y-2.5">
              <div>
                <p className="font-semibold text-foreground">AI Campus OS v1.0</p>
                <p className="text-[11px] text-muted-foreground">Your Intelligent Campus Platform</p>
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
          </SheetContent>
        </Sheet>

        {/* Greeting */}
        <h2 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
          <span>Hello, {displayName}</span>
          <span className="text-sm text-indigo-500 animate-pulse hidden sm:inline">👋</span>
        </h2>
      </div>

      {/* Global Cross-Platform Search Component */}
      <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-6">
        <GlobalSearch />
      </div>

      {/* Right Action Icons & User Button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Custom User Profile Avatar Link */}
        <Link href="/profile" title="View Profile" className="hover:scale-105 transition-transform">
          <ProfileAvatar
            profileImage={profilePhoto}
            googleImage={googlePhoto || user?.imageUrl}
            name={displayName}
            size="sm"
          />
        </Link>

        {/* Clerk User Button */}
        <div className="pl-1 border-l border-border/60">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 sm:h-9 sm:w-9 rounded-xl border border-indigo-500/30",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
