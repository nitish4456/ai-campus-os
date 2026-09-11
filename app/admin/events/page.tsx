"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  Globe,
  ExternalLink,
  Edit,
  Trash2,
  Copy,
  Eye,
  Loader2,
  Tag,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventCardData } from "@/components/cards/EventCard";
import { EVENT_CATEGORIES } from "@/components/forms/EventForm";
import { isValidExternalUrl } from "@/lib/utils";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (cityFilter !== "all") params.append("city", cityFilter);
      if (sourceFilter !== "all") params.append("source", sourceFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/admin/events?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.events) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error("Failed to fetch admin events:", err);
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, cityFilter, sourceFilter, typeFilter, searchQuery]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: `Event "${title}" deleted successfully.` });
        fetchEvents();
      } else {
        setMessage({ type: "error", text: "Failed to delete event." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error deleting event." });
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.event) {
        setMessage({ type: "success", text: `Event duplicated successfully!` });
        fetchEvents();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to duplicate event." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error duplicating event." });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="px-3 py-0.5 border-purple-500/40 text-purple-400 bg-purple-950/30">
                  Admin Portal
                </Badge>
              </div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                Event Management Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Add, edit, delete, duplicate, and manage all campus & real external events.
              </p>
            </div>

            <Link href="/admin/events/new">
              <Button className="bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-xl shrink-0 shadow-lg shadow-pink-600/20">
                <Plus className="w-4 h-4 mr-2" /> Add Event
              </Button>
            </Link>
          </div>

          {/* Feedback Messages */}
          {message && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center justify-between ${
                message.type === "success"
                  ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-300"
                  : "bg-rose-950/40 border border-rose-500/40 text-rose-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {message.type === "success" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>{message.text}</span>
              </div>
              <button onClick={() => setMessage(null)} className="hover:opacity-80">
                ✕
              </button>
            </div>
          )}

          {/* Multi-Criteria Filters Bar */}
          <div className="p-5 rounded-2xl bg-card/60 border border-border backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Filter className="w-4 h-4 text-pink-400" /> Filter & Search Events
              </h3>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, city, source..."
                  className="pl-9 bg-background/60 border-border text-sm rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Category Dropdown */}
              <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || "all")}>
                <SelectTrigger className="bg-background/60 border-border text-xs rounded-xl">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {EVENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* City Dropdown */}
              <Select value={cityFilter} onValueChange={(val) => setCityFilter(val || "all")}>
                <SelectTrigger className="bg-background/60 border-border text-xs rounded-xl">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  <SelectItem value="Delhi">Delhi / New Delhi</SelectItem>
                  <SelectItem value="Bengaluru">Bengaluru</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                  <SelectItem value="Campus">Campus</SelectItem>
                </SelectContent>
              </Select>

              {/* Source Dropdown */}
              <Select value={sourceFilter} onValueChange={(val) => setSourceFilter(val || "all")}>
                <SelectTrigger className="bg-background/60 border-border text-xs rounded-xl">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="UniNest Campus">UniNest Campus</SelectItem>
                  <SelectItem value="SEMICON India">SEMICON India</SelectItem>
                  <SelectItem value="Bengaluru Tech Summit">Bengaluru Tech Summit</SelectItem>
                  <SelectItem value="BookMyShow">BookMyShow</SelectItem>
                  <SelectItem value="Paytm Insider">Paytm Insider</SelectItem>
                  <SelectItem value="Devfolio">Devfolio</SelectItem>
                  <SelectItem value="Ticketmaster">Ticketmaster</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Dropdown */}
              <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val || "all")}>
                <SelectTrigger className="bg-background/60 border-border text-xs rounded-xl">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="campus">Campus Events</SelectItem>
                  <SelectItem value="external">External Events</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Events List / Table */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
              <p className="text-xs text-muted-foreground">Loading admin events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 rounded-2xl bg-card border border-dashed border-border text-center space-y-4">
              <p className="text-sm text-muted-foreground">No events match your current filter criteria.</p>
              <Link href="/admin/events/new">
                <Button className="bg-pink-600 text-white rounded-xl">
                  <Plus className="w-4 h-4 mr-2" /> Add First Event
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground px-1">
                Showing <strong>{events.length}</strong> events
              </div>

              <div className="grid grid-cols-1 gap-4">
                {events.map((evt) => {
                  const title = evt.title || evt.name;
                  const dateStr = evt.date ? format(new Date(evt.date), "MMM d, yyyy") : "TBA";
                  const bUrl = evt.bookingUrl || evt.registrationLink || "";
                  const sUrl = evt.sourceUrl || "";
                  const hasValidBooking = isValidExternalUrl(bUrl);
                  const hasValidSource = isValidExternalUrl(sUrl);

                  return (
                    <div
                      key={evt._id}
                      className="p-5 rounded-2xl bg-card/70 border border-border hover:border-purple-500/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md"
                    >
                      {/* Left side: Thumbnail & Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-border">
                          {evt.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={evt.imageUrl} alt={title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-pink-950 to-purple-950 flex items-center justify-center text-pink-400 font-bold text-xs">
                              {evt.category?.slice(0, 3) || "EVT"}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="px-2 py-0.5 border-pink-500/40 text-pink-300 text-[10px]">
                              {evt.category || "Event"}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={`px-2 py-0.5 text-[10px] ${
                                evt.isExternal
                                  ? "bg-indigo-950/50 text-indigo-300 border border-indigo-500/30"
                                  : "bg-emerald-950/50 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {evt.isExternal ? "External Event" : "Campus Event"}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">Source: {evt.source || "UniNest"}</span>
                          </div>

                          <h3 className="font-bold text-base text-foreground line-clamp-1">{title}</h3>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-pink-400" /> {dateStr}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {evt.location || evt.city || "Campus"}
                            </span>
                            {hasValidBooking && (
                              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                                <ExternalLink className="w-3 h-3" /> Booking Link Valid
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side: Admin Action Buttons */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <Link href={`/events/${evt._id}`}>
                          <Button variant="ghost" size="sm" className="rounded-xl text-xs gap-1">
                            <Eye className="w-3.5 h-3.5" /> View
                          </Button>
                        </Link>

                        <Link href={`/admin/events/${evt._id}/edit`}>
                          <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1 border-border">
                            <Edit className="w-3.5 h-3.5 text-indigo-400" /> Edit
                          </Button>
                        </Link>

                        <Button
                          onClick={() => handleDuplicate(evt._id)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs gap-1 border-border"
                        >
                          <Copy className="w-3.5 h-3.5 text-purple-400" /> Duplicate
                        </Button>

                        <Button
                          onClick={() => handleDelete(evt._id, title)}
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-xs gap-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
