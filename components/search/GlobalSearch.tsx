"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, Users, SearchX, Loader2, ArrowRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SearchGroupedResults {
  events: Array<{ _id: string; name: string; category?: string; date?: string }>;
  opportunities: Array<{ _id: string; title: string; category?: string; requiredSkills?: string[] }>;
  items: Array<{ _id: string; itemName: string; type: "lost" | "found"; location?: string }>;
}

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchGroupedResults>({
    events: [],
    opportunities: [],
    items: [],
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut listener (⌘K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search fetch
  useEffect(() => {
    if (!query.trim()) {
      setResults({ events: [], opportunities: [], items: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (res.ok) {
          setResults({
            events: data.events || [],
            opportunities: data.opportunities || [],
            items: data.items || [],
          });
        }
      } catch (error) {
        console.error("Global search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  const totalResultsCount =
    results.events.length + results.opportunities.length + results.items.length;

  return (
    <div className="relative max-w-md w-full">
      {/* Input Field */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="Search items, events, opportunities, skills..."
          className="pl-9 pr-14 py-1.5 h-9 bg-accent/40 border-border/80 focus:bg-background text-sm rounded-xl transition-all"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="absolute right-2 px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground font-mono pointer-events-none">
            ⌘K
          </div>
        )}
      </div>

      {/* Command Palette Dropdown List */}
      {isOpen && query.trim() !== "" && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-11 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[80vh] overflow-y-auto backdrop-blur-2xl p-2 space-y-3"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Searching Campus OS...</span>
            </div>
          ) : totalResultsCount === 0 ? (
            <div className="p-6 text-center space-y-1 text-xs text-muted-foreground">
              <SearchX className="w-6 h-6 mx-auto text-muted-foreground/60 mb-1" />
              <p className="font-semibold text-foreground">No matches found for &ldquo;{query}&rdquo;</p>
              <p className="text-[11px]">Try searching by category, tag, location, or skill keyword.</p>
            </div>
          ) : (
            <>
              {/* 1. EVENTS SECTION */}
              {results.events.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-pink-400 flex items-center gap-1.5 uppercase">
                    <Calendar className="w-3.5 h-3.5" /> Events
                  </div>
                  {results.events.map((evt) => (
                    <button
                      key={evt._id}
                      onClick={() => handleSelectResult("/events")}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-accent/60 flex items-center justify-between transition-colors group"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <p className="text-sm font-semibold text-foreground group-hover:text-pink-400 transition-colors truncate">
                          {evt.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Category: {evt.category || "General"}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* 2. OPPORTUNITIES SECTION */}
              {results.opportunities.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-border/40">
                  <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-purple-400 flex items-center gap-1.5 uppercase">
                    <Users className="w-3.5 h-3.5" /> Opportunities & Teams
                  </div>
                  {results.opportunities.map((opp) => (
                    <button
                      key={opp._id}
                      onClick={() => handleSelectResult("/skill-connect")}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-accent/60 flex items-center justify-between transition-colors group"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <p className="text-sm font-semibold text-foreground group-hover:text-purple-400 transition-colors truncate">
                          {opp.title}
                        </p>
                        {opp.requiredSkills && opp.requiredSkills.length > 0 && (
                          <div className="flex gap-1 flex-wrap pt-0.5">
                            {opp.requiredSkills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-[9px] px-1.5 py-0 bg-indigo-500/10 text-indigo-400">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* 3. LOST & FOUND SECTION */}
              {results.items.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-border/40">
                  <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-indigo-400 flex items-center gap-1.5 uppercase">
                    <Search className="w-3.5 h-3.5" /> Lost & Found
                  </div>
                  {results.items.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => handleSelectResult("/lost-found")}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-accent/60 flex items-center justify-between transition-colors group"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              item.type === "lost"
                                ? "bg-rose-500/80 text-[10px] px-1.5 py-0"
                                : "bg-emerald-500/80 text-[10px] px-1.5 py-0"
                            }
                          >
                            {item.type.toUpperCase()}
                          </Badge>
                          <p className="text-sm font-semibold text-foreground group-hover:text-indigo-400 transition-colors truncate">
                            {item.itemName}
                          </p>
                        </div>
                        {item.location && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            Location: {item.location}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
