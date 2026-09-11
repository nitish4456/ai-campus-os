"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  Search,
  Plus,
  Filter,
  MapPin,
  Calendar,
  Mail,
  User,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { ItemCard, ItemCardData } from "@/components/cards/ItemCard";
import { ItemForm, ITEM_CATEGORIES } from "@/components/forms/ItemForm";
import { ScoreBadge } from "@/components/shared/ScoreBadge";
import { ReasonChips } from "@/components/shared/ReasonChips";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
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

interface MatchedItem {
  score: number;
  reasons: string[];
  item: ItemCardData & {
    userId?: { name?: string; email?: string };
  };
}

export default function LostFoundPage() {
  const [items, setItems] = useState<ItemCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal States
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Item Detail & Match Modal
  const [selectedItem, setSelectedItem] = useState<
    (ItemCardData & { userId?: { name?: string; email?: string } }) | null
  >(null);
  const [matches, setMatches] = useState<MatchedItem[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  // Fetch Items
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/items?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.items) {
        setItems(data.items);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, searchQuery]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Handle Opening Item Details & Fetching Matches
  const handleViewDetails = async (item: ItemCardData) => {
    setSelectedItem(item);
    setMatches([]);
    setIsLoadingMatches(true);

    try {
      const res = await fetch(`/api/items/${item._id}/matches`);
      const data = await res.json();
      if (res.ok && data.matches) {
        setMatches(data.matches);
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setIsLoadingMatches(false);
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
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-0.5 border-rose-500/40 text-rose-400 bg-rose-950/30 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-rose-400 shrink-0" /> Active Campus Reports
                </Badge>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Campus Lost & Found Hub
              </h1>
              <p className="text-muted-foreground text-sm max-w-2xl">
                Report lost belongings with optional photo uploads and let Campus AI compute match probabilities across active campus items.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                onClick={() => setIsReportModalOpen(true)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-600/20 px-5"
              >
                <Plus className="w-4 h-4 mr-1.5 shrink-0" /> Report Lost Item
              </Button>
            </div>
          </div>

          {/* Search & Filters Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card/60 border border-border backdrop-blur-xl">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none shrink-0" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search headphones, keys, water bottle..."
                className="pl-9 bg-background/60 border-border text-sm rounded-xl w-full"
              />
            </div>

            {/* Category Dropdown */}
            <div className="w-full sm:w-56">
              <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || "all")}>
                <SelectTrigger className="bg-background/60 border-border text-xs rounded-xl w-full">
                  <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {ITEM_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
              <p className="text-xs text-muted-foreground">Scanning active lost items database...</p>
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title="No Active Lost Items Found"
              description="There are currently no active lost items matching your search or category filter."
              actionLabel="Report Lost Item"
              onAction={() => setIsReportModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {items.map((item) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}

          {/* Item Report Modal */}
          <ItemForm
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            onSuccess={fetchItems}
          />

          {/* Item Detail & Matches Modal */}
          <Dialog
            open={!!selectedItem}
            onOpenChange={(open) => !open && setSelectedItem(null)}
          >
            <DialogContent className="w-full max-w-2xl sm:max-w-2xl max-h-[90vh] overflow-hidden p-0 bg-card border-border backdrop-blur-2xl text-foreground rounded-2xl shadow-2xl flex flex-col">
              {selectedItem && (
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 min-w-0">
                  {/* Modal Header */}
                  <DialogHeader className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge className="bg-rose-600 text-white font-semibold shrink-0">
                        Lost Item Report
                      </Badge>
                      <Badge variant="outline" className="text-xs border-border text-muted-foreground shrink-0">
                        {selectedItem.category || "General"}
                      </Badge>
                    </div>
                    <DialogTitle className="text-2xl font-bold text-foreground break-words">
                      {selectedItem.itemName}
                    </DialogTitle>
                  </DialogHeader>

                  {/* Photo Preview if Available */}
                  {selectedItem.imageUrl && (
                    <div className="rounded-2xl overflow-hidden max-h-72 w-full bg-slate-900 border border-border flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedItem.imageUrl}
                        alt={selectedItem.itemName}
                        className="w-full max-h-72 object-cover object-center rounded-2xl"
                      />
                    </div>
                  )}

                  {/* Main Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-accent/30 p-4 rounded-2xl border border-border/60 text-xs min-w-0">
                    <div className="space-y-2.5 min-w-0">
                      {selectedItem.location && (
                        <div className="flex items-start gap-2 text-muted-foreground min-w-0">
                          <MapPin className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                          <span className="break-words min-w-0">
                            <strong className="text-foreground">Location Lost:</strong> {selectedItem.location}
                          </span>
                        </div>
                      )}
                      <div className="flex items-start gap-2 text-muted-foreground min-w-0">
                        <Calendar className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span className="break-words min-w-0">
                          <strong className="text-foreground">Date Lost:</strong>{" "}
                          {selectedItem.date
                            ? format(new Date(selectedItem.date), "PPP")
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5 min-w-0">
                      {selectedItem.userId?.name && (
                        <div className="flex items-start gap-2 text-muted-foreground min-w-0">
                          <User className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span className="break-words min-w-0">
                            <strong className="text-foreground">Reporter:</strong> {selectedItem.userId.name}
                          </span>
                        </div>
                      )}
                      {selectedItem.userId?.email && (
                        <div className="flex items-start gap-2 text-muted-foreground min-w-0">
                          <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="break-all min-w-0">
                            <strong className="text-foreground">Contact Email:</strong> {selectedItem.userId.email}
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedItem.description && (
                      <div className="sm:col-span-2 pt-2 border-t border-border/40 text-foreground leading-relaxed break-words min-w-0">
                        <strong className="text-muted-foreground block mb-1">Description:</strong>
                        <p className="whitespace-pre-wrap text-foreground/90">{selectedItem.description}</p>
                      </div>
                    )}
                  </div>

                  {/* AI POTENTIAL MATCHES SECTION */}
                  <div className="space-y-4 pt-4 border-t border-border min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                      <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>AI Potential Matches</span>
                      </h3>
                      <span className="text-xs text-muted-foreground font-mono">
                        Algorithm threshold ≥ 40%
                      </span>
                    </div>

                    {isLoadingMatches ? (
                      <div className="flex items-center justify-center py-8 gap-2 text-xs text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-500 shrink-0" />
                        <span>Scanning matching database...</span>
                      </div>
                    ) : matches.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-accent/20 border border-dashed border-border text-center space-y-1">
                        <p className="font-semibold text-xs text-foreground">No Strong Matches Detected Yet</p>
                        <p className="text-[11px] text-muted-foreground">
                          Campus AI will notify you when matching item details are detected.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 min-w-0">
                        {matches.map((m, idx) => (
                          <div
                            key={m.item._id || idx}
                            className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3 min-w-0 overflow-hidden"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                <ScoreBadge score={m.score} />
                                <span className="font-bold text-sm text-foreground truncate max-w-full">
                                  {m.item.itemName}
                                </span>
                              </div>
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0">
                                <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                                <span className="truncate max-w-[150px]">{m.item.location || "Campus"}</span>
                              </span>
                            </div>

                            <ReasonChips reasons={m.reasons} />

                            {m.item.description && (
                              <p className="text-xs text-slate-300 italic line-clamp-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 break-words min-w-0">
                                &ldquo;{m.item.description}&rdquo;
                              </p>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-indigo-500/20 text-xs min-w-0">
                              <div className="flex items-start gap-1.5 min-w-0 text-slate-400">
                                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span className="break-all min-w-0">
                                  Contact: <strong className="text-indigo-300">{m.item.userId?.email || "Reporter"}</strong>
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(m.item)}
                                className="w-full sm:w-auto h-8 text-xs bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-200 border-indigo-500/40 rounded-xl shrink-0"
                              >
                                View Match Item
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
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
