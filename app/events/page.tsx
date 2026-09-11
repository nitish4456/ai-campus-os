"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  User,
  ExternalLink,
  Sparkles,
  Loader2,
  Tag,
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { EventCard, EventCardData } from "@/components/cards/EventCard";
import { EventForm, EVENT_CATEGORIES } from "@/components/forms/EventForm";
import { ScoreBadge } from "@/components/shared/ScoreBadge";
import { ReasonChips } from "@/components/shared/ReasonChips";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { isValidExternalUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function EventsPage() {
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<EventCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventCardData | null>(null);

  // Fetch Recommended Events
  const fetchRecommendedEvents = useCallback(async () => {
    setIsLoadingRecs(true);
    try {
      const res = await fetch("/api/events/recommended");
      const data = await res.json();
      if (res.ok && data.recommendations) {
        setRecommendedEvents(data.recommendations);
      }
    } catch (error) {
      console.error("Failed to fetch event recommendations:", error);
    } finally {
      setIsLoadingRecs(false);
    }
  }, []);

  // Fetch All Events
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (cityFilter !== "all") params.append("city", cityFilter);
      if (sourceFilter !== "all") params.append("source", sourceFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.events) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, cityFilter, sourceFilter, typeFilter, searchQuery]);

  useEffect(() => {
    fetchEvents();
    fetchRecommendedEvents();
  }, [fetchEvents, fetchRecommendedEvents]);

  const handleRefresh = () => {
    fetchEvents();
    fetchRecommendedEvents();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-10">
          {/* Page Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-0.5 border-pink-500/40 text-pink-400 bg-pink-950/30">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Dynamic AI Matching
                </Badge>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Campus Events Hub
              </h1>
              <p className="text-muted-foreground text-sm max-w-2xl">
                Discover workshops, hackathons, and guest lectures personalized based on your profile skills & interests.
              </p>
            </div>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-xl shrink-0 shadow-lg shadow-pink-600/20"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Create Event
            </Button>
          </div>

          {/* SECTION 1: RECOMMENDED FOR YOU */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-xl text-foreground tracking-tight">
                    Recommended for You
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Personalized match scores computed on-the-fly based on your profile skills & interests.
                  </p>
                </div>
              </div>
            </div>

            {isLoadingRecs ? (
              <div className="flex items-center justify-center py-10 gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                <span>Analyzing your interests & computing recommendation scores...</span>
              </div>
            ) : recommendedEvents.length === 0 ? (
              <div className="p-6 rounded-2xl bg-card/40 border border-dashed border-border text-center text-xs text-muted-foreground">
                No recommendations found yet. Add skills and interests to your profile to see personalized matches!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {recommendedEvents.slice(0, 3).map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    onViewDetails={setSelectedEvent}
                  />
                ))}
              </div>
            )}
          </section>

          {/* SECTION 2: ALL AGGREGATED EVENTS */}
          <section className="space-y-6 pt-4 border-t border-border">
            <div className="flex flex-col gap-4 p-5 rounded-2xl bg-card/60 border border-border backdrop-blur-xl space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="font-bold text-lg text-foreground flex items-center gap-2 shrink-0">
                  <Calendar className="w-5 h-5 text-indigo-400" /> Aggregated Events Hub
                </h2>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search AI, Delhi, Hackathon..."
                    className="pl-9 bg-background/60 border-border text-sm rounded-xl"
                  />
                </div>
              </div>

              {/* Multi-Criteria Filters Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Category Dropdown */}
                <div>
                  <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || "all")}>
                    <SelectTrigger className="bg-background/60 border-border text-xs rounded-xl">
                      <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
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
                </div>

                {/* City Dropdown */}
                <div>
                  <Select value={cityFilter} onValueChange={(val) => setCityFilter(val || "all")}>
                    <SelectTrigger className="bg-background/60 border-border text-xs rounded-xl">
                      <MapPin className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                      <SelectItem value="Bengaluru">Bengaluru</SelectItem>
                      <SelectItem value="Mumbai">Mumbai</SelectItem>
                      <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                      <SelectItem value="Online">Online / Virtual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Source Dropdown */}
                <div>
                  <Select value={sourceFilter} onValueChange={(val) => setSourceFilter(val || "all")}>
                    <SelectTrigger className="bg-background/60 border-border text-xs rounded-xl">
                      <Tag className="w-3.5 h-3.5 mr-2 text-pink-400" />
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="UniNest Campus">UniNest Campus</SelectItem>
                      <SelectItem value="BookMyShow">BookMyShow</SelectItem>
                      <SelectItem value="Paytm Insider">Paytm Insider</SelectItem>
                      <SelectItem value="Devfolio">Devfolio</SelectItem>
                      <SelectItem value="Eventbrite">Eventbrite</SelectItem>
                      <SelectItem value="Luma">Luma</SelectItem>
                      <SelectItem value="Devpost">Devpost</SelectItem>
                      <SelectItem value="Ticketmaster">Ticketmaster</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Event Type (Campus vs External) */}
                <div>
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
            </div>

            {/* Events Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-2">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                <p className="text-xs text-muted-foreground">Loading campus events...</p>
              </div>
            ) : events.length === 0 ? (
              <EmptyState
                title="No Events Found"
                description="There are currently no events matching your search or category filter. Be the first to create one!"
                actionLabel="Create Event"
                onAction={() => setIsCreateModalOpen(true)}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {events.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    onViewDetails={setSelectedEvent}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Create Event Modal */}
          <EventForm
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={handleRefresh}
          />

          {/* Event Detail Modal */}
          <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
            <DialogContent className="max-w-xl bg-card border-border backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
              {selectedEvent && (
                <div className="space-y-6">
                  <DialogHeader>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Badge variant="outline" className="px-3 py-0.5 border-pink-500/40 text-pink-400 bg-pink-950/30">
                        {selectedEvent.category || "Event"}
                      </Badge>
                      {typeof selectedEvent.score === "number" && (
                        <ScoreBadge score={selectedEvent.score} />
                      )}
                    </div>
                    <DialogTitle className="text-2xl font-bold text-foreground">
                      {selectedEvent.name}
                    </DialogTitle>
                    {selectedEvent.reasons && selectedEvent.reasons.length > 0 && (
                      <div className="pt-1">
                        <ReasonChips reasons={selectedEvent.reasons} />
                      </div>
                    )}
                  </DialogHeader>

                  {/* Metadata Grid */}
                  <div className="p-4 rounded-2xl bg-accent/30 border border-border/60 text-xs space-y-2.5">
                    <div className="flex items-center gap-2 text-foreground">
                      <Calendar className="w-4 h-4 text-pink-400 shrink-0" />
                      <span>
                        <strong>Date:</strong>{" "}
                        {selectedEvent.date
                          ? format(new Date(selectedEvent.date), "EEEE, MMMM d, yyyy")
                          : "TBA"}
                      </span>
                    </div>

                    {selectedEvent.time && (
                      <div className="flex items-center gap-2 text-foreground">
                        <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                        <span><strong>Time:</strong> {selectedEvent.time}</span>
                      </div>
                    )}

                    {selectedEvent.location && (
                      <div className="flex items-center gap-2 text-foreground">
                        <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span><strong>Location:</strong> {selectedEvent.location}</span>
                      </div>
                    )}

                    {selectedEvent.organizer && (
                      <div className="flex items-center gap-2 text-foreground">
                        <User className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span><strong>Organizer:</strong> {selectedEvent.organizer}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground block">Event Tags:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEvent.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="px-2.5 py-0.5 text-xs bg-accent border border-border">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {selectedEvent.description && (
                    <div className="space-y-1 text-sm text-foreground/90 leading-relaxed pt-2 border-t border-border">
                      <strong className="text-muted-foreground block text-xs">About Event:</strong>
                      <p className="bg-accent/20 p-4 rounded-xl border border-border/40 whitespace-pre-wrap">
                        {selectedEvent.description}
                      </p>
                    </div>
                  )}

                  {/* Registration Action Button */}
                  <div className="pt-2 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setSelectedEvent(null)}>
                      Close
                    </Button>
                    {isValidExternalUrl(selectedEvent.bookingUrl || selectedEvent.registrationLink) ? (
                      <a
                        href={selectedEvent.bookingUrl || selectedEvent.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-xl flex items-center gap-1.5">
                          <span>Book Now</span>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    ) : (
                      <Button disabled className="bg-muted text-muted-foreground rounded-xl">
                        Campus Event
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
