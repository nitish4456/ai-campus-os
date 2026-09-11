"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Package,
  CheckCircle,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Tag,
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ItemForm, ItemFormEditData } from "@/components/forms/ItemForm";

export interface MyItemData {
  _id: string;
  itemName: string;
  category?: string;
  description?: string;
  location?: string;
  date?: string | Date;
  imageUrl?: string;
  status: "ACTIVE" | "RETURNED" | "REMOVED" | "active" | "resolved";
  createdAt?: string | Date;
}

export function MyLostItems() {
  const [items, setItems] = useState<MyItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "returned" | "all">("active");

  // Modals & Action States
  const [editingItem, setEditingItem] = useState<ItemFormEditData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Return Confirmation Modal
  const [returnConfirmItem, setReturnConfirmItem] = useState<MyItemData | null>(null);
  const [isMarkingReturned, setIsMarkingReturned] = useState(false);

  // Delete Confirmation Modal
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<MyItemData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMyItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/items/my-items");
      const data = await res.json();
      if (res.ok && data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error("Failed to fetch my lost items:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyItems();
  }, [fetchMyItems]);

  // Handle Mark as Returned
  const handleConfirmReturned = async () => {
    if (!returnConfirmItem) return;
    setIsMarkingReturned(true);

    try {
      const res = await fetch(`/api/items/${returnConfirmItem._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RETURNED" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update item status.");
      }

      toast.success(`"${returnConfirmItem.itemName}" marked as returned!`);
      setReturnConfirmItem(null);
      fetchMyItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to mark item as returned.");
    } finally {
      setIsMarkingReturned(false);
    }
  };

  // Handle Delete Report
  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/items/${deleteConfirmItem._id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete report.");
      }

      toast.success(`Report "${deleteConfirmItem.itemName}" deleted.`);
      setDeleteConfirmItem(null);
      fetchMyItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete report.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter items based on activeTab
  const activeItems = items.filter(
    (item) => item.status === "ACTIVE" || item.status === "active"
  );
  const returnedItems = items.filter(
    (item) => item.status === "RETURNED" || item.status === "resolved"
  );

  const displayedItems =
    activeTab === "active"
      ? activeItems
      : activeTab === "returned"
      ? returnedItems
      : items;

  return (
    <div className="space-y-6 pt-6 border-t border-border min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
        <div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-rose-400 shrink-0" />
            <span>My Lost Items</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Track, edit, mark as returned, or manage your reported lost belongings.
          </p>
        </div>

        {/* Tabs Filter */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as any)}
          className="w-full sm:w-auto shrink-0"
        >
          <TabsList className="bg-background/60 border border-border rounded-xl p-1">
            <TabsTrigger value="active" className="rounded-lg text-xs font-medium">
              Active ({activeItems.length})
            </TabsTrigger>
            <TabsTrigger value="returned" className="rounded-lg text-xs font-medium text-emerald-400">
              Returned ({returnedItems.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="rounded-lg text-xs font-medium">
              All ({items.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-rose-500 shrink-0" />
          <span>Loading your lost item reports...</span>
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="p-8 rounded-2xl bg-card/40 border border-dashed border-border text-center space-y-2">
          <Package className="w-8 h-8 text-muted-foreground mx-auto shrink-0" />
          <p className="font-semibold text-sm text-foreground">
            {activeTab === "active"
              ? "No Active Lost Reports"
              : activeTab === "returned"
              ? "No Returned Items History"
              : "No Lost Item Reports Found"}
          </p>
          <p className="text-xs text-muted-foreground">
            {activeTab === "active"
              ? "All your reported items have been marked as returned or deleted."
              : "Items you mark as returned will appear here for history."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {displayedItems.map((item) => {
            const normalizedStatus = item.status ? item.status.toUpperCase() : "ACTIVE";
            const isActive = normalizedStatus === "ACTIVE";
            const isReturned = normalizedStatus === "RETURNED" || normalizedStatus === "RESOLVED";

            return (
              <Card
                key={item._id}
                className="bg-card/70 border-border backdrop-blur-xl hover:border-indigo-500/40 transition-all p-5 flex flex-col justify-between space-y-4 shadow-md min-w-0"
              >
                <div className="space-y-3 min-w-0">
                  {/* Top Bar: Thumbnail & Title */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-16 h-16 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-border flex items-center justify-center">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.itemName}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-rose-400/40 shrink-0" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="px-2 py-0.5 border-border text-[10px] shrink-0">
                          {item.category || "General"}
                        </Badge>

                        {/* Status Badge */}
                        {isReturned ? (
                          <Badge className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] shrink-0">
                            Returned
                          </Badge>
                        ) : normalizedStatus === "REMOVED" ? (
                          <Badge className="bg-slate-900/80 text-slate-400 border border-slate-700 text-[10px] shrink-0">
                            Removed
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-950/80 text-rose-300 border border-rose-500/40 text-[10px] shrink-0">
                            Active
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-foreground line-clamp-1 break-words">
                        {item.itemName}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed break-words">
                      {item.description}
                    </p>
                  )}

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 min-w-0">
                    {item.location && (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="truncate">
                        Lost: {item.date ? format(new Date(item.date), "MMM d, yyyy") : "Recent"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Owner Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/50 shrink-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isActive && (
                      <Button
                        size="sm"
                        onClick={() => setReturnConfirmItem(item)}
                        className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl gap-1 shadow-sm shrink-0"
                      >
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" /> Mark as Returned
                      </Button>
                    )}

                    {isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingItem({
                            _id: item._id,
                            itemName: item.itemName,
                            category: item.category || "Electronics",
                            description: item.description || "",
                            location: item.location || "",
                            date: item.date,
                            imageUrl: item.imageUrl || "",
                          });
                          setIsEditModalOpen(true);
                        }}
                        className="h-8 border-border text-xs rounded-xl gap-1 shrink-0"
                      >
                        <Edit className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> Edit
                      </Button>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteConfirmItem(item)}
                    className="h-8 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl gap-1 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" /> Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Form Modal */}
      <ItemForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        editItem={editingItem}
        onSuccess={fetchMyItems}
      />

      {/* Mark Returned Confirmation Modal */}
      <Dialog
        open={!!returnConfirmItem}
        onOpenChange={(open) => !open && setReturnConfirmItem(null)}
      >
        <DialogContent className="w-full max-w-md bg-card border-border backdrop-blur-2xl p-6 rounded-2xl shadow-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> Mark as Returned?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Mark &ldquo;{returnConfirmItem?.itemName}&rdquo; as returned? This will remove the item from the public Lost & Found page, but keep it in your profile history.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => setReturnConfirmItem(null)}
              disabled={isMarkingReturned}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReturned}
              disabled={isMarkingReturned}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs px-4"
            >
              {isMarkingReturned ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin shrink-0" /> Updating...
                </>
              ) : (
                "Yes, Mark as Returned"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deleteConfirmItem}
        onOpenChange={(open) => !open && setDeleteConfirmItem(null)}
      >
        <DialogContent className="w-full max-w-md bg-card border-border backdrop-blur-2xl p-6 rounded-2xl shadow-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" /> Delete Report?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Delete lost item report &ldquo;{deleteConfirmItem?.itemName}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirmItem(null)}
              disabled={isDeleting}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs px-4"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin shrink-0" /> Deleting...
                </>
              ) : (
                "Delete Report"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
