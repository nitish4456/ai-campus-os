"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Trash2, Loader2, Check, X, Sparkles } from "lucide-react";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ProfilePhotoSectionProps {
  initialImageUrl?: string | null;
  googleImageUrl?: string | null;
  userName: string;
}

export function ProfilePhotoSection({
  initialImageUrl,
  googleImageUrl,
  userName,
}: ProfilePhotoSectionProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    initialImageUrl || null
  );

  // File Upload & Preview State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  // Clean up Object URL
  const cleanupPreviewUrl = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB maximum)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error("Profile picture must be smaller than 5 MB.");
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast.error("Please select a valid image file (JPG, PNG, or WEBP).");
      return;
    }

    cleanupPreviewUrl();
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleCancelPreview = () => {
    cleanupPreviewUrl();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Save selected photo to Cloudinary and DB
  const handleSavePhoto = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      // 1. Upload to Cloudinary via /api/upload
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.error || "Failed to upload photo.");
      }

      const uploadedUrl = uploadData.url;

      // 2. Save profile image URL to MongoDB via /api/profile/photo
      const profileRes = await fetch("/api/profile/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadedUrl }),
      });

      const profileData = await profileRes.json();
      if (!profileRes.ok) {
        throw new Error(profileData.error || "Failed to save profile picture.");
      }

      setCurrentImageUrl(uploadedUrl);
      cleanupPreviewUrl();
      setSelectedFile(null);
      setPreviewUrl(null);

      toast.success("Profile picture updated successfully.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile picture.");
    } finally {
      setIsUploading(false);
    }
  };

  // Remove photo
  const handleRemovePhoto = async () => {
    setIsRemoving(true);

    try {
      const res = await fetch("/api/profile/photo", {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove profile picture.");
      }

      setCurrentImageUrl(null);
      handleCancelPreview();
      setIsRemoveDialogOpen(false);

      toast.success("Profile picture removed.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove profile picture.");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-card/70 border border-border backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-4 shadow-xl relative overflow-hidden">
      {/* Background glow overlay */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
      />

      {/* Profile Picture Display (Preview or Saved or Fallback) */}
      <div className="relative group">
        <ProfileAvatar
          profileImage={previewUrl || currentImageUrl}
          googleImage={googleImageUrl}
          name={userName}
          size="xl"
          className="ring-4 ring-indigo-500/30 shadow-2xl transition-all duration-300"
        />

        {/* Change Photo Overlay Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-1 right-1 p-2.5 rounded-full bg-pink-600 hover:bg-pink-500 text-white shadow-lg transition-transform hover:scale-110 border-2 border-background"
          aria-label="Upload profile picture"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* User Info */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
          {userName}
        </h2>
        <div className="flex items-center justify-center gap-1.5">
          <Badge variant="outline" className="px-2.5 py-0.5 border-indigo-500/40 text-indigo-400 bg-indigo-950/30 text-xs">
            <Sparkles className="w-3 h-3 mr-1" /> Student Profile
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      {previewUrl ? (
        /* Preview Confirmation Bar */
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancelPreview}
            disabled={isUploading}
            className="rounded-xl text-xs"
          >
            <X className="w-3.5 h-3.5 mr-1" /> Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSavePhoto}
            disabled={isUploading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-600/20 px-4"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving Photo...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5" /> Save Photo
              </>
            )}
          </Button>
        </div>
      ) : (
        /* Main Action Buttons: Change Photo & Remove Photo */
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isRemoving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl px-4 shadow-md shadow-indigo-600/20"
          >
            <Camera className="w-3.5 h-3.5 mr-1.5" />
            {currentImageUrl ? "Change Photo" : "Upload Photo"}
          </Button>

          {currentImageUrl && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRemoveDialogOpen(true)}
              disabled={isUploading || isRemoving}
              className="border-border hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 text-xs rounded-xl px-4"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove Photo
            </Button>
          )}
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="w-full max-w-md bg-card border-border backdrop-blur-2xl p-6 rounded-2xl shadow-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-bold text-foreground">
              Remove Profile Picture?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Are you sure you want to remove your custom profile picture? Your profile will revert to displaying your default avatar initials.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => setIsRemoveDialogOpen(false)}
              disabled={isRemoving}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRemovePhoto}
              disabled={isRemoving}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs px-4"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Removing photo...
                </>
              ) : (
                "Remove Photo"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
