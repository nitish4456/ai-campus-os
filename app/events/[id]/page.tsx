"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ExternalLink,
  Globe,
  ArrowLeft,
  Tag,
  Loader2,
  Share2,
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventCardData } from "@/components/cards/EventCard";
import { isValidExternalUrl } from "@/lib/utils";

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [event, setEvent] = useState<EventCardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEventDetails() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        if (res.ok && data.event) {
          setEvent(data.event);
        } else {
          setError(data.error || "Event not found");
        }
      } catch (err) {
        console.error("Failed to fetch event details:", err);
        setError("Failed to load event details");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const bookingLink = event?.bookingUrl || event?.registrationLink || "";
  const eventTitle = event?.title || event?.name || "";
  const formattedDate = event?.date
    ? format(new Date(event.date), "EEEE, MMMM d, yyyy")
    : "TBA";
  const eventSource = event?.source || (event?.isExternal ? "External Provider" : "UniNest");

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto space-y-8">
          {/* Back Button */}
          <div>
            <Link href="/events">
              <Button variant="ghost" className="rounded-xl text-xs gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
                Back to Events Hub
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
              <p className="text-xs text-muted-foreground">Loading event details...</p>
            </div>
          ) : error || !event ? (
            <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-4">
              <h2 className="text-xl font-bold text-foreground">Event Not Found</h2>
              <p className="text-sm text-muted-foreground">{error || "The requested event could not be found."}</p>
              <Link href="/events">
                <Button className="bg-pink-600 hover:bg-pink-500 text-white rounded-xl">
                  Browse All Events
                </Button>
              </Link>
            </div>
          ) : (
            <article className="space-y-8">
              {/* Event Header Banner */}
              <div className="relative h-72 md:h-96 w-full rounded-3xl overflow-hidden bg-slate-900 border border-border shadow-2xl">
                {event.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.imageUrl}
                    alt={eventTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-950 via-purple-950 to-slate-900 flex items-center justify-center p-8 text-center">
                    <span className="text-4xl md:text-6xl font-black text-pink-500/20 tracking-wider uppercase">
                      {event.category || "UniNest Event"}
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                {/* Header Overlay Content */}
                <div className="absolute bottom-6 left-6 right-6 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 border-pink-500/50 text-pink-300 bg-black/60 backdrop-blur-md text-xs font-semibold">
                      {event.category || "Event"}
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1 bg-black/60 backdrop-blur-md text-xs text-zinc-300 border border-white/10 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Source: {eventSource}</span>
                    </Badge>
                  </div>

                  <h1 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                    {eventTitle}
                  </h1>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 Columns: Description & Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* About Section */}
                  <div className="p-6 rounded-2xl bg-card/60 border border-border backdrop-blur-xl space-y-4 shadow-sm">
                    <h3 className="text-lg font-bold text-foreground">About This Event</h3>
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {event.description || "No description provided for this event."}
                    </p>
                  </div>

                  {/* Tags */}
                  {event.tags && event.tags.length > 0 && (
                    <div className="p-6 rounded-2xl bg-card/60 border border-border backdrop-blur-xl space-y-3">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-pink-400" /> Event Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="px-3 py-1 text-xs bg-accent border border-border">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Metadata & Book Now CTA */}
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-card/80 border border-border backdrop-blur-2xl space-y-6 shadow-xl sticky top-24">
                    <h3 className="text-base font-bold text-foreground border-b border-border pb-3">
                      Event Details
                    </h3>

                    <div className="space-y-4 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block font-medium">Date</span>
                          <span className="text-foreground font-semibold">{formattedDate}</span>
                        </div>
                      </div>

                      {event.time && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block font-medium">Time</span>
                            <span className="text-foreground font-medium">{event.time}</span>
                          </div>
                        </div>
                      )}

                      {event.location && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block font-medium">Location</span>
                            <span className="text-foreground font-medium">{event.location}</span>
                          </div>
                        </div>
                      )}

                      {event.organizer && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block font-medium">Host / Organizer</span>
                            <span className="text-foreground font-medium">{event.organizer}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-border space-y-3">
                      {isValidExternalUrl(bookingLink) ? (
                        <a
                          href={bookingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full"
                        >
                          <Button className="w-full bg-pink-600 hover:bg-pink-500 text-white font-semibold py-6 rounded-xl shadow-lg shadow-pink-600/25 flex items-center justify-center gap-2 text-sm">
                            <span>Book Now</span>
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      ) : isValidExternalUrl(event.sourceUrl) ? (
                        <a
                          href={event.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full"
                        >
                          <Button className="w-full bg-indigo-950/40 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60 font-semibold py-6 rounded-xl flex items-center justify-center gap-2 text-sm">
                            <span>View Event</span>
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      ) : !event.isExternal ? (
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-6 rounded-xl shadow-lg shadow-emerald-600/20 text-sm">
                          <span>Campus Registration Open</span>
                        </Button>
                      ) : (
                        <Button disabled className="w-full bg-muted/60 text-muted-foreground rounded-xl py-6 border border-border">
                          Event Details Listed
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          )}
        </main>
      </div>
    </div>
  );
}
