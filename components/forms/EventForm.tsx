"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const EVENT_CATEGORIES = [
  "Technology",
  "Hackathon",
  "Design",
  "Career",
  "Academics",
  "Workshop",
  "Social",
  "Other",
];

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EventForm({ isOpen, onClose, onSuccess }: EventFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Technology");
  const [organizer, setOrganizer] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter the event name.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          date: date ? new Date(date).toISOString() : new Date().toISOString(),
          time: time.trim(),
          location: location.trim(),
          category,
          tags,
          organizer: organizer.trim(),
          registrationLink: registrationLink.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create event.");
      }

      toast.success("Event created successfully!");

      // Reset form
      setName("");
      setDescription("");
      setTime("");
      setLocation("");
      setOrganizer("");
      setRegistrationLink("");
      setTags([]);

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-card border-border backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create Campus Event</DialogTitle>
          <DialogDescription>
            Publish a workshop, hackathon, or student gathering to the campus events feed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Event Name */}
          <div className="space-y-1.5">
            <Label htmlFor="eventName" className="text-xs font-semibold">
              Event Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="eventName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI & LLM Hands-On Workshop"
              required
              className="bg-background/50 border-border"
            />
          </div>

          {/* Category & Organizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs font-semibold">
                Category
              </Label>
              <Select value={category} onValueChange={(val) => setCategory(val || "Technology")}>
                <SelectTrigger id="category" className="bg-background/50 border-border">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="organizer" className="text-xs font-semibold">
                Organizer / Club Name
              </Label>
              <Input
                id="organizer"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="e.g. AI Student Society"
                className="bg-background/50 border-border"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs font-semibold">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-background/50 border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="time" className="text-xs font-semibold">
                Time
              </Label>
              <Input
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 4:00 PM - 6:00 PM"
                className="bg-background/50 border-border"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-xs font-semibold">
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Engineering Building Room 302"
              className="bg-background/50 border-border"
            />
          </div>

          {/* Tags Input */}
          <div className="space-y-1.5">
            <Label htmlFor="tags" className="text-xs font-semibold">
              Tags (AI, Python, LLM, Coding...)
            </Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type tag and press Add..."
                className="bg-background/50 border-border"
              />
              <Button type="button" onClick={handleAddTag} variant="secondary">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="px-2.5 py-0.5 bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs flex items-center gap-1"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of what will happen, prerequisites, free food, prizes..."
              rows={3}
              className="bg-background/50 border-border"
            />
          </div>

          {/* Registration Link */}
          <div className="space-y-1.5">
            <Label htmlFor="registrationLink" className="text-xs font-semibold">
              Registration Link (Optional)
            </Label>
            <Input
              id="registrationLink"
              value={registrationLink}
              onChange={(e) => setRegistrationLink(e.target.value)}
              placeholder="https://campus.edu/events/register..."
              className="bg-background/50 border-border"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...
                </>
              ) : (
                "Publish Event"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
