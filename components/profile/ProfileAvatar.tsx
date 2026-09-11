"use client";

import { useState } from "react";

interface ProfileAvatarProps {
  profileImage?: string | null;
  googleImage?: string | null;
  imageUrl?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function ProfileAvatar({
  profileImage,
  googleImage,
  imageUrl,
  name = "Student",
  size = "md",
  className = "",
}: ProfileAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Compute initials (e.g., "Rajinder Kumar" -> "RK", "Nitish" -> "N")
  const getInitials = (strName: string) => {
    const parts = strName.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "SU";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  // Image Priority: 1. Custom uploaded profileImage -> 2. Google Account googleImage -> 3. Fallback legacy imageUrl
  const effectiveImageUrl = profileImage || googleImage || imageUrl;

  // Size classes mapping
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm font-bold",
    lg: "w-20 h-20 text-xl font-bold sm:w-24 sm:h-24",
    xl: "w-24 h-24 md:w-[120px] md:h-[120px] text-2xl md:text-3xl font-black",
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  if (effectiveImageUrl && !imageError) {
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 border-2 border-indigo-500/40 shadow-xl bg-slate-900 ${currentSizeClass} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={effectiveImageUrl}
          alt={name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-full shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white border-2 border-indigo-500/40 shadow-xl select-none tracking-wider ${currentSizeClass} ${className}`}
    >
      <span>{initials}</span>
    </div>
  );
}
