"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  Loader2,
  Plus,
  X,
  Globe,
  MapPin,
  Tag,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
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
import { EVENT_CATEGORIES } from "@/components/forms/EventForm";
import { isValidExternalUrl } from "@/lib/utils";

export default function EditAdminEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [isLoadingEvent, setIsLoadingEvent] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technology");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");
  const [source, setSource] = useState("UniNest Campus");
  const [sourceUrl, setSourceUrl] = useState("");
  const [isExternal, setIsExternal] = useState(false);

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      setIsLoadingEvent(true);
      try {
        const res = await fetch(`/api/admin/events/${eventId}`);
        const data = await res.json();
        if (res.ok && data.event) {
          const evt = data.event;
          setTitle(evt.title || evt.name || "");
          setDescription(evt.description || "");
          setCategory(evt.category || "Technology");
          setDate(evt.date ? new Date(evt.date).toISOString().split("T")[0] : "");
          setEndDate(evt.endDate ? new Date(evt.endDate).toISOString().split("T")[0] : "");
          setLocation(evt.location || "");
          setCity(evt.city || "");
          setImageUrl(evt.imageUrl || "");
          setBookingUrl(evt.bookingUrl || evt.registrationLink || "");
          setSource(evt.source || "UniNest Campus");
          setSourceUrl(evt.sourceUrl || "");
          setIsExternal(!!evt.isExternal);
          setTags(evt.tags || []);
        } else {
          setErrorMsg("Event not found or failed to load.");
        }
      } catch (err) {
        setErrorMsg("Error fetching event details.");
      } finally {
        setIsLoadingEvent(false);
      }
    }

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

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
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Event title is required.");
      return;
    }

    if (!date) {
      setErrorMsg("Event start date is required.");
      return;
    }

    if (bookingUrl.trim() && !isValidExternalUrl(bookingUrl.trim())) {
      setErrorMsg(
        "Booking URL is invalid or blocked. Provide a valid external http(s) URL."
      );
      return;
    }

    if (sourceUrl.trim() && !isValidExternalUrl(sourceUrl.trim())) {
      setErrorMsg(
        "Source URL is invalid or blocked. Provide a valid external http(s) URL."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        date: new Date(date).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        location: location.trim(),
        city: city.trim(),
        imageUrl: imageUrl.trim(),
        bookingUrl: bookingUrl.trim(),
        source: source.trim() || "UniNest Campus",
        sourceUrl: sourceUrl.trim(),
        tags,
        isExternal,
      };

      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update event");
      }

      router.push("/admin/events");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while updating event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingEvent) {
    return (
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 md:p-10 max-w-4xl w-full mx-auto space-y-8">
          {/* Top navigation header */}
          <div className="flex items-center gap-4">
            <Link href="/admin/events">
              <Button variant="ghost" size="sm" className="rounded-xl gap-1 text-muted-foreground hover:text-foreground">
                <ChevronLeft className="w-4 h-4" /> Back to Dashboard
              </Button>
            </Link>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="px-3 py-0.5 border-indigo-500/40 text-indigo-400 bg-indigo-950/30">
                Edit Event
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              Edit Event Details
            </h1>
            <p className="text-sm text-muted-foreground">
              Modify title, description, official booking links, dates, and categories.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl text-xs bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Section */}
            <div className="p-6 rounded-2xl bg-card/60 border border-border backdrop-blur-xl space-y-4">
              <h3 className="font-bold text-sm text-foreground border-b border-border pb-3">
                General Information
              </h3>

              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold">
                  Event Title <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event title..."
                  required
                  className="bg-background/50 border-border text-sm rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-semibold">
                    Category
                  </Label>
                  <Select value={category} onValueChange={(val) => setCategory(val || "Technology")}>
                    <SelectTrigger id="category" className="bg-background/50 border-border rounded-xl text-sm">
                      <SelectValue placeholder="Select category" />
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
                  <Label htmlFor="source" className="text-xs font-semibold">
                    Event Source / Organizer
                  </Label>
                  <Input
                    id="source"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g. UniNest Campus, SEMICON India..."
                    className="bg-background/50 border-border text-sm rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold">
                  Event Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description..."
                  rows={4}
                  className="bg-background/50 border-border text-sm rounded-xl"
                />
              </div>
            </div>

            {/* Date, Time & Location Section */}
            <div className="p-6 rounded-2xl bg-card/60 border border-border backdrop-blur-xl space-y-4">
              <h3 className="font-bold text-sm text-foreground border-b border-border pb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pink-400" /> Schedule & Location
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="date" className="text-xs font-semibold">
                    Start Date <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="bg-background/50 border-border text-sm rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="endDate" className="text-xs font-semibold">
                    End Date (Optional)
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-background/50 border-border text-sm rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-xs font-semibold">
                    Full Venue Location
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location..."
                    className="bg-background/50 border-border text-sm rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-semibold">
                    City / Region
                  </Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City..."
                    className="bg-background/50 border-border text-sm rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* External Links & Media Section */}
            <div className="p-6 rounded-2xl bg-card/60 border border-border backdrop-blur-xl space-y-4">
              <h3 className="font-bold text-sm text-foreground border-b border-border pb-3 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-indigo-400" /> Links & Banner Image
              </h3>

              <div className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-border">
                <div>
                  <div className="text-xs font-bold text-foreground">External Event Toggle</div>
                  <div className="text-[11px] text-muted-foreground">
                    Mark as true if this event is hosted by an external platform.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExternal(!isExternal)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    isExternal
                      ? "bg-pink-600 border-pink-500 text-white shadow-md shadow-pink-600/20"
                      : "bg-background/80 border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isExternal ? "External Event" : "Campus Event"}
                </button>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bookingUrl" className="text-xs font-semibold flex items-center justify-between">
                  <span>Official Ticket / Booking URL</span>
                  <span className="text-[10px] text-emerald-400 font-normal">Renders "Book Now ↗" card button</span>
                </Label>
                <Input
                  id="bookingUrl"
                  type="url"
                  value={bookingUrl}
                  onChange={(e) => setBookingUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-background/50 border-border text-sm rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sourceUrl" className="text-xs font-semibold flex items-center justify-between">
                  <span>Official Event Info Page URL</span>
                  <span className="text-[10px] text-indigo-400 font-normal">Renders "View Event ↗" fallback link</span>
                </Label>
                <Input
                  id="sourceUrl"
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-background/50 border-border text-sm rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="imageUrl" className="text-xs font-semibold">
                  Banner Image URL
                </Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-background/50 border-border text-sm rounded-xl"
                />
                {imageUrl && (
                  <div className="mt-2 w-full h-32 rounded-xl overflow-hidden bg-slate-900 border border-border relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Tags Section */}
            <div className="p-6 rounded-2xl bg-card/60 border border-border backdrop-blur-xl space-y-4">
              <h3 className="font-bold text-sm text-foreground border-b border-border pb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-400" /> Event Tags
              </h3>

              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Type tag and press Add..."
                  className="bg-background/50 border-border text-sm rounded-xl"
                />
                <Button type="button" onClick={handleAddTag} variant="secondary" className="rounded-xl shrink-0">
                  <Plus className="w-4 h-4 mr-1" /> Add Tag
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="px-3 py-1 bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs flex items-center gap-1.5 rounded-lg"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Link href="/admin/events">
                <Button type="button" variant="ghost" className="rounded-xl">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-6 shadow-lg shadow-indigo-600/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  "Update Event"
                )}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
