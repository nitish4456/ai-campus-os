"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Loader2, Camera, X, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ITEM_CATEGORIES = [
  "Electronics",
  "Personal Belongings",
  "Keys",
  "Clothing",
  "Valuables",
  "Books & Notes",
  "Other",
];

export interface ItemFormEditData {
  _id?: string;
  itemName: string;
  category: string;
  description: string;
  location: string;
  date?: string | Date;
  imageUrl?: string;
}

interface ItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: ItemFormEditData | null;
  onSuccess?: () => void;
  defaultType?: "lost" | "found";
}

export function ItemForm({
  isOpen,
  onClose,
  editItem,
  onSuccess,
}: ItemFormProps) {
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [imageUrl, setImageUrl] = useState("");

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Field Validation Errors
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up Object URLs to prevent memory leaks
  const cleanupPreviewUrl = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  // Populate data when opening modal or editing
  useEffect(() => {
    if (editItem) {
      setItemName(editItem.itemName || "");
      setCategory(editItem.category || "Electronics");
      setDescription(editItem.description || "");
      setLocation(editItem.location || "");
      setDate(
        editItem.date
          ? new Date(editItem.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      setImageUrl(editItem.imageUrl || "");
      setPreviewUrl(editItem.imageUrl || null);
      setSelectedFile(null);
    } else {
      setItemName("");
      setCategory("Electronics");
      setDescription("");
      setLocation("");
      setDate(new Date().toISOString().split("T")[0]);
      setImageUrl("");
      setPreviewUrl(null);
      setSelectedFile(null);
    }
    setFieldErrors({});
    setUploadError(null);
  }, [editItem, isOpen]);

  // Clean up Object URL on unmount
  useEffect(() => {
    return () => {
      cleanupPreviewUrl();
    };
  }, [previewUrl]);

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate size (5MB maximum)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const err = "Image must be smaller than 5MB.";
      setUploadError(err);
      toast.error(err);
      return;
    }

    // Validate image type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      const err = "Only JPG, PNG and WEBP images are allowed.";
      setUploadError(err);
      toast.error(err);
      return;
    }

    cleanupPreviewUrl();
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemovePhoto = () => {
    cleanupPreviewUrl();
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageUrl("");
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Convert File to Base64 Data URI helper
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Upload file to server-side endpoint with fail-safe fallback
  const uploadPhotoFile = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        return data.url;
      }

      console.warn("Upload endpoint notice, falling back to base64 encoding:", data.error);
      return await fileToBase64(file);
    } catch (err) {
      console.warn("Client network error uploading image, using base64 fallback:", err);
      return await fileToBase64(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const errors: { [key: string]: string } = {};

    if (!itemName.trim()) {
      errors.itemName = "Item Name is required";
    }
    if (!category) {
      errors.category = "Category is required";
    }
    if (!date) {
      errors.date = "Please select the date the item was lost";
    }
    if (!location.trim()) {
      errors.location = "Location is required";
    }
    if (!description.trim()) {
      errors.description = "Description is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = imageUrl;

      // Upload file if selected
      if (selectedFile) {
        finalImageUrl = await uploadPhotoFile(selectedFile);
      }

      const payload = {
        type: "lost",
        itemName: itemName.trim(),
        category,
        description: description.trim(),
        location: location.trim(),
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        imageUrl: finalImageUrl,
      };

      const url = editItem?._id ? `/api/items/${editItem._id}` : "/api/items";
      const method = editItem?._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to submit report. Please try again.");
      }

      toast.success(
        editItem?._id
          ? "Lost item report updated successfully"
          : "Lost item reported successfully"
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Lost item submission error:", err);
      toast.error(err.message || "Unable to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && !isUploading && onClose()}>
      <DialogContent className="w-full max-w-2xl sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 bg-card border-border backdrop-blur-2xl text-foreground rounded-2xl shadow-2xl space-y-4">
        {/* Modal Header */}
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            {editItem?._id ? "Edit Lost Item Report" : "Report Lost Item"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Provide details of the lost belonging. Photos are optional.
          </DialogDescription>
        </DialogHeader>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Item Name (Full Width) */}
          <div className="space-y-1.5 w-full">
            <Label htmlFor="itemName" className="text-xs font-semibold flex items-center justify-between">
              <span>Item Name <span className="text-rose-500">*</span></span>
              {fieldErrors.itemName && (
                <span className="text-[11px] text-rose-400 font-normal">{fieldErrors.itemName}</span>
              )}
            </Label>
            <Input
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Black JBL Headphones, Silver MacBook Air..."
              className={`w-full bg-background/50 border-border rounded-xl text-sm ${
                fieldErrors.itemName ? "border-rose-500/60" : ""
              }`}
            />
          </div>

          {/* 2. Category & Date Lost (Responsive Grid: 1 col on mobile, 2 cols on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="space-y-1.5 w-full">
              <Label htmlFor="category" className="text-xs font-semibold flex items-center justify-between">
                <span>Category <span className="text-rose-500">*</span></span>
                {fieldErrors.category && (
                  <span className="text-[11px] text-rose-400 font-normal">{fieldErrors.category}</span>
                )}
              </Label>
              <Select value={category} onValueChange={(val) => setCategory(val || "Electronics")}>
                <SelectTrigger id="category" className="w-full bg-background/50 border-border rounded-xl text-sm">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 w-full">
              <Label htmlFor="date" className="text-xs font-semibold flex items-center justify-between">
                <span>Date Lost <span className="text-rose-500">*</span></span>
                {fieldErrors.date && (
                  <span className="text-[11px] text-rose-400 font-normal">{fieldErrors.date}</span>
                )}
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full bg-background/50 border-border rounded-xl text-sm ${
                  fieldErrors.date ? "border-rose-500/60" : ""
                }`}
              />
            </div>
          </div>

          {/* 3. Location (Full Width) */}
          <div className="space-y-1.5 w-full">
            <Label htmlFor="location" className="text-xs font-semibold flex items-center justify-between">
              <span>Location Lost <span className="text-rose-500">*</span></span>
              {fieldErrors.location && (
                <span className="text-[11px] text-rose-400 font-normal">{fieldErrors.location}</span>
              )}
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Central Library 2nd Floor, Engineering Hall..."
              className={`w-full bg-background/50 border-border rounded-xl text-sm ${
                fieldErrors.location ? "border-rose-500/60" : ""
              }`}
            />
          </div>

          {/* 4. Description (Full Width) */}
          <div className="space-y-1.5 w-full">
            <Label htmlFor="description" className="text-xs font-semibold flex items-center justify-between">
              <span>Description <span className="text-rose-500">*</span></span>
              {fieldErrors.description && (
                <span className="text-[11px] text-rose-400 font-normal">{fieldErrors.description}</span>
              )}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe distinctive features, brand, color, stickers, keychains..."
              rows={3}
              className={`w-full bg-background/50 border-border rounded-xl text-sm ${
                fieldErrors.description ? "border-rose-500/60" : ""
              }`}
            />
          </div>

          {/* 5. Photo Upload Section (Optional) */}
          <div className="space-y-2 w-full">
            <Label className="text-xs font-semibold block">
              Upload Photo <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
            />

            {previewUrl ? (
              <div className="rounded-xl overflow-hidden bg-slate-900/80 border border-border p-3 space-y-3 w-full">
                {/* Controlled Fixed Height Image Preview Container */}
                <div className="w-full max-h-[200px] h-48 rounded-lg overflow-hidden bg-black/40 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Item Preview"
                    className="max-h-[200px] w-full object-cover rounded-lg"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 px-1">
                  <span className="text-[11px] text-muted-foreground truncate max-w-[180px] sm:max-w-xs">
                    {selectedFile ? selectedFile.name : "Selected Photo"}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 text-[11px] rounded-lg border-border"
                    >
                      <Camera className="w-3.5 h-3.5 mr-1" /> Change Photo
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="h-8 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border hover:border-rose-500/40 bg-background/30 hover:bg-rose-950/10 rounded-xl p-5 text-center cursor-pointer transition-all space-y-1.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Click to Upload Photo</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    JPG, PNG, WEBP • Max 5MB
                  </p>
                </div>
              </div>
            )}

            {uploadError && (
              <p className="text-[11px] text-rose-400 mt-1">{uploadError}</p>
            )}
          </div>

          {/* 6. Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting || isUploading}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs px-5 shadow-lg shadow-rose-600/20"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Uploading Image...
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Submitting... ⏳
                </>
              ) : editItem?._id ? (
                "Update Lost Report"
              ) : (
                "Submit Lost Report"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
