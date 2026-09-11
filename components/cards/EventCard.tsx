import Link from "next/link";
import { MapPin, Calendar, Clock, User, ExternalLink, Globe } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreBadge } from "@/components/shared/ScoreBadge";
import { ReasonChips } from "@/components/shared/ReasonChips";
import { isValidExternalUrl } from "@/lib/utils";

export interface EventCardData {
  _id: string;
  name: string;
  title?: string;
  description?: string;
  date?: string | Date;
  time?: string;
  location?: string;
  city?: string;
  category?: string;
  tags: string[];
  organizer?: string;
  registrationLink?: string;
  bookingUrl?: string;
  imageUrl?: string;
  source?: string;
  sourceUrl?: string;
  externalEventId?: string;
  isExternal?: boolean;
  score?: number;
  reasons?: string[];
}

export function EventCard({
  event,
  onViewDetails,
}: {
  event: EventCardData;
  onViewDetails: (event: EventCardData) => void;
}) {
  const formattedDate = event.date
    ? format(new Date(event.date), "EEE, MMM d, yyyy")
    : "TBA";

  const eventTitle = event.title || event.name;
  const rawBookingUrl = event.bookingUrl || event.registrationLink || "";
  const rawSourceUrl = event.sourceUrl || "";

  const hasValidBookingUrl = isValidExternalUrl(rawBookingUrl);
  const hasValidSourceUrl = isValidExternalUrl(rawSourceUrl);

  const eventSource = event.source || (event.isExternal ? "External Provider" : "UniNest Campus");
  const displayLocation = event.city && !event.location?.toLowerCase().includes(event.city.toLowerCase())
    ? `${event.location} • ${event.city}`
    : event.location || event.city || "Campus";

  return (
    <Card className="h-full bg-card/60 border-border backdrop-blur-xl hover:border-pink-500/40 transition-all duration-200 flex flex-col overflow-hidden group shadow-lg">
      {/* 1. Image Container (Fixed height: h-52, width: 100%, object-cover) */}
      <div className="relative h-52 w-full bg-slate-900 overflow-hidden shrink-0">
        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt={eventTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-950/60 via-purple-950/40 to-slate-900 flex items-center justify-center p-6 text-center">
            <span className="text-2xl font-black text-pink-500/30 tracking-wider uppercase line-clamp-1">
              {event.category || "UniNest Event"}
            </span>
          </div>
        )}
      </div>

      {/* Main Content Area (flex-1 to ensure equal height & bottom alignment) */}
      <div className="flex-1 flex flex-col p-5 space-y-3 min-w-0">
        {/* 2. Badges Row (flex items-center gap-2 flex-wrap) */}
        <div className="flex items-center gap-2 flex-wrap min-h-[28px]">
          <Badge variant="outline" className="px-2.5 py-0.5 border-pink-500/40 text-pink-300 bg-pink-950/30 text-xs font-semibold shrink-0">
            {event.category || "Event"}
          </Badge>

          {eventSource && (
            <Badge variant="secondary" className="px-2 py-0.5 bg-accent/70 text-[10px] text-zinc-300 border border-border flex items-center gap-1 shrink-0">
              <Globe className="w-3 h-3 text-indigo-400" />
              <span>{eventSource}</span>
            </Badge>
          )}

          {typeof event.score === "number" && (
            <div className="shrink-0">
              <ScoreBadge score={event.score} />
            </div>
          )}
        </div>

        {/* 3. Event Title (min-h-[56px] flex items-start line-clamp-2) */}
        <div className="min-h-[56px] flex items-start">
          <Link href={`/events/${event._id}`} className="w-full">
            <h3 className="font-bold text-base md:text-lg text-foreground line-clamp-2 group-hover:text-pink-400 transition-colors leading-snug cursor-pointer">
              {eventTitle}
            </h3>
          </Link>
        </div>

        {/* Reason Chips if available */}
        {event.reasons && event.reasons.length > 0 && (
          <div className="min-h-[28px] flex items-center">
            <ReasonChips reasons={event.reasons} />
          </div>
        )}

        {/* 4. Description Area (min-h-[60px] line-clamp-3) */}
        <div className="min-h-[60px]">
          <p className="line-clamp-3 text-xs leading-relaxed text-foreground/80">
            {event.description || "No description provided."}
          </p>
        </div>

        {/* 5. Metadata Grid (Date, Time, Location, Organizer) */}
        <div className="space-y-1.5 pt-2 text-xs text-muted-foreground mt-auto">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span className="font-medium text-foreground">{formattedDate}</span>
          </div>

          {event.time && (
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{event.time}</span>
            </div>
          )}

          {displayLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="line-clamp-1">{displayLocation}</span>
            </div>
          )}

          {event.organizer && (
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="line-clamp-1">By {event.organizer}</span>
            </div>
          )}
        </div>

        {/* 6. Tags */}
        <div className="min-h-[26px] flex flex-wrap items-center gap-1 pt-1">
          {event.tags && event.tags.length > 0 && (
            event.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-accent/60 text-muted-foreground border border-border/50"
              >
                #{tag}
              </span>
            ))
          )}
        </div>
      </div>

      {/* 7. Action Button (mt-auto ensures bottom horizontal alignment across row) */}
      <div className="p-5 pt-3 gap-2 border-t border-border/40 mt-auto flex items-center shrink-0">
        {hasValidBookingUrl ? (
          <a
            href={rawBookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button
              className="w-full rounded-xl text-xs font-semibold bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-600/20 flex items-center justify-center gap-1.5"
            >
              <span>Book Now</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        ) : hasValidSourceUrl ? (
          <a
            href={rawSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button
              variant="outline"
              className="w-full rounded-xl text-xs font-semibold bg-indigo-950/30 border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/50 flex items-center justify-center gap-1.5"
            >
              <span>View Event</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        ) : !event.isExternal ? (
          <Link href={`/events/${event._id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full rounded-xl text-xs font-semibold bg-background hover:bg-accent border-border"
            >
              Campus Registration
            </Button>
          </Link>
        ) : (
          <Link href={`/events/${event._id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full rounded-xl text-xs font-semibold bg-background hover:bg-accent border-border"
            >
              View Details
            </Button>
          </Link>
        )}

        <Button
          onClick={() => onViewDetails(event)}
          variant="ghost"
          size="sm"
          className="rounded-xl text-xs text-muted-foreground hover:text-foreground px-3 shrink-0"
        >
          View
        </Button>
      </div>
    </Card>
  );
}
