import { MapPin, Calendar, Tag, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ItemCardData {
  _id: string;
  type?: "lost" | "found";
  itemName: string;
  description?: string;
  category?: string;
  location?: string;
  date?: string | Date;
  imageUrl?: string;
  status?: "ACTIVE" | "RETURNED" | "REMOVED" | "active" | "resolved";
  createdAt?: string | Date;
}

export function ItemCard({
  item,
  onViewDetails,
}: {
  item: ItemCardData;
  onViewDetails: (item: ItemCardData) => void;
}) {
  const formattedDate = item.date
    ? format(new Date(item.date), "MMM d, yyyy")
    : "Recent";

  const currentStatus = item.status ? item.status.toUpperCase() : "ACTIVE";

  return (
    <Card className="h-full w-full bg-card/60 border-border backdrop-blur-xl hover:border-indigo-500/40 transition-all duration-200 flex flex-col justify-between overflow-hidden group shadow-lg">
      <div className="flex-1 flex flex-col min-w-0">
        {/* 1. Image / No Photo Area (Fixed Container Height: h-[230px]) */}
        <div className="relative h-[230px] w-full bg-slate-900 overflow-hidden flex items-center justify-center border-b border-border/50 shrink-0">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={item.itemName}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground/60 p-4 text-center w-full h-full select-none">
              <ImageIcon className="w-10 h-10 text-rose-400/40 shrink-0" />
              <span className="text-xs font-medium text-muted-foreground/70">No photo provided</span>
            </div>
          )}

          {/* Type Badge Overlay */}
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-rose-600 text-white font-semibold shadow-md px-2.5 py-0.5 text-[10px]">
              Lost
            </Badge>
          </div>

          {/* Status Badge Overlay */}
          <div className="absolute top-3 right-3 z-10">
            {currentStatus === "RETURNED" ? (
              <Badge variant="secondary" className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md text-[10px]">
                Returned
              </Badge>
            ) : currentStatus === "REMOVED" ? (
              <Badge variant="secondary" className="bg-slate-900/80 text-slate-400 border border-slate-700 backdrop-blur-md text-[10px]">
                Removed
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-rose-950/80 text-rose-300 border border-rose-500/40 backdrop-blur-md text-[10px]">
                Active
              </Badge>
            )}
          </div>
        </div>

        {/* 2. Card Content (flex-grow / flex-1) */}
        <div className="p-5 flex-1 flex flex-col space-y-3 min-w-0">
          {/* Title Area (Reserved min-h-[48px] with line-clamp-2) */}
          <div className="min-h-[48px] flex items-start">
            <h3 className="font-bold text-base text-foreground line-clamp-2 group-hover:text-rose-400 transition-colors leading-snug cursor-pointer break-words" onClick={() => onViewDetails(item)}>
              {item.itemName}
            </h3>
          </div>

          {/* Description Area (Reserved min-h-[40px] with line-clamp-2) */}
          <div className="min-h-[40px] flex items-start">
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed break-words">
              {item.description || "No description provided."}
            </p>
          </div>

          {/* Metadata Section (Category, Location, Date) */}
          <div className="space-y-2 text-xs text-muted-foreground mt-auto pt-2 border-t border-border/30 min-w-0">
            {item.category && (
              <div className="flex items-center gap-2 min-w-0">
                <Tag className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-medium text-foreground truncate">{item.category}</span>
              </div>
            )}
            {item.location && (
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span className="truncate">{item.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">Lost on {formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Dedicated Card Footer (margin-top: auto, bottom-aligned across row) */}
      <CardFooter className="mt-auto p-4 pt-3 border-t border-border/40 flex items-center justify-center shrink-0 w-full bg-card/40">
        <Button
          onClick={() => onViewDetails(item)}
          variant="outline"
          className="w-full h-10 rounded-xl text-xs font-semibold bg-background hover:bg-accent border-border text-foreground shadow-sm flex items-center justify-center gap-1.5 transition-colors"
        >
          View Details & Matches
        </Button>
      </CardFooter>
    </Card>
  );
}
