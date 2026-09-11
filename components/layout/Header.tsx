"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, Sparkles } from "lucide-react";
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

            <div className="p-3 rounded-xl bg-accent/40 border border-border/50 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">UniNest v1.0</p>
              <p className="text-[11px]">Your Intelligent Campus Platform</p>
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
