"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Search,
  Filter,
  Code2,
  Tag,
  Mail,
  User,
  Heart,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { OpportunityCard, OpportunityCardData } from "@/components/cards/OpportunityCard";
import { OpportunityForm, OPPORTUNITY_CATEGORIES } from "@/components/forms/OpportunityForm";
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

export default function SkillConnectPage() {
  const [opportunities, setOpportunities] = useState<OpportunityCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Opportunity Detail Modal
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityCardData | null>(null);
  const [matchData, setMatchData] = useState<{ score: number; reasons: string[] } | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [isExpressingInterest, setIsExpressingInterest] = useState(false);

  // Fetch Opportunities
  const fetchOpportunities = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (skillFilter !== "all") params.append("skill", skillFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/opportunities?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.opportunities) {
        // Fetch match scores for each opportunity to display inline
        const oppsWithScores = await Promise.all(
          data.opportunities.map(async (opp: OpportunityCardData) => {
            try {
              const matchRes = await fetch(`/api/opportunities/${opp._id}/match`);
              const matchJson = await matchRes.json();
              if (matchRes.ok) {
                return {
                  ...opp,
                  score: matchJson.score,
                  reasons: matchJson.reasons,
                };
              }
            } catch (e) {
              console.error(e);
            }
            return opp;
          })
        );

        setOpportunities(oppsWithScores);
      }
    } catch (error) {
      console.error("Failed to fetch opportunities:", error);
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, skillFilter, searchQuery]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // View Details & Fetch Specific Match
  const handleViewDetails = async (opp: OpportunityCardData) => {
    setSelectedOpportunity(opp);
    setMatchData(
      typeof opp.score === "number"
        ? { score: opp.score, reasons: opp.reasons || [] }
        : null
    );
    setIsLoadingMatch(true);

    try {
      const res = await fetch(`/api/opportunities/${opp._id}/match`);
      const data = await res.json();
      if (res.ok) {
        setMatchData({ score: data.score, reasons: data.reasons });
      }
    } catch (error) {
      console.error("Failed to fetch match:", error);
    } finally {
      setIsLoadingMatch(false);
    }
  };

  // Express Interest Action
  const handleExpressInterest = async () => {
    if (!selectedOpportunity) return;
    setIsExpressingInterest(true);

    try {
      const res = await fetch(`/api/opportunities/${selectedOpportunity._id}/interest`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to express interest.");
      }

      toast.success("Interest expressed successfully! The creator has been notified.");

      if (data.opportunity) {
        setSelectedOpportunity(data.opportunity);
      }

      fetchOpportunities();
    } catch (err: any) {
      toast.error(err.message || "Failed to express interest.");
    } finally {
      setIsExpressingInterest(false);
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
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-0.5 border-purple-500/40 text-purple-400 bg-purple-950/30">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-400" /> Skill & Team Finder
                </Badge>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Skill Connect Hub
              </h1>
              <p className="text-muted-foreground text-sm max-w-2xl">
                Find student teammates for hackathons, research projects, and open-source initiatives matched against your technical skills and interests.
              </p>
            </div>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shrink-0 shadow-lg shadow-purple-600/20"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Post Opportunity
            </Button>
          </div>

          {/* Search & Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card/60 border border-border backdrop-blur-xl">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search React, Python, Hackathon..."
                className="pl-9 bg-background/60 border-border text-sm rounded-xl"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Category Dropdown */}
              <div className="w-full sm:w-44">
                <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || "all")}>
                  <SelectTrigger className="bg-background/60 border-border text-xs rounded-xl">
                    <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {OPPORTUNITY_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Skill Filter Dropdown */}
              <div className="w-full sm:w-44">
                <Select value={skillFilter} onValueChange={(val) => setSkillFilter(val || "all")}>
                  <SelectTrigger className="bg-background/60 border-border text-xs rounded-xl">
                    <Code2 className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                    <SelectValue placeholder="Filter Skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    <SelectItem value="React">React</SelectItem>
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="Figma">Figma</SelectItem>
                    <SelectItem value="Node.js">Node.js</SelectItem>
                    <SelectItem value="MongoDB">MongoDB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Opportunities Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-xs text-muted-foreground">Calculating skill compatibility & fetching opportunities...</p>
            </div>
          ) : opportunities.length === 0 ? (
            <EmptyState
              title="No Skill Opportunities Found"
              description="There are currently no team or project opportunities matching your filters. Post a new opportunity to recruit teammates!"
              actionLabel="Post Opportunity"
              onAction={() => setIsCreateModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {opportunities.map((opp) => (
                <OpportunityCard
                  key={opp._id}
                  opportunity={opp}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}

          {/* Create Opportunity Modal */}
          <OpportunityForm
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={fetchOpportunities}
          />

          {/* Opportunity Detail Modal */}
          <Dialog open={!!selectedOpportunity} onOpenChange={(open) => !open && setSelectedOpportunity(null)}>
            <DialogContent className="max-w-xl bg-card border-border backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
              {selectedOpportunity && (
                <div className="space-y-6">
                  <DialogHeader>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Badge variant="outline" className="px-3 py-0.5 border-purple-500/40 text-purple-400 bg-purple-950/30">
                        {selectedOpportunity.category || "Project"}
                      </Badge>
                      {matchData && typeof matchData.score === "number" && (
                        <ScoreBadge score={matchData.score} />
                      )}
                    </div>
                    <DialogTitle className="text-2xl font-bold text-foreground">
                      {selectedOpportunity.title}
                    </DialogTitle>
                    {matchData && matchData.reasons.length > 0 && (
                      <div className="pt-1">
                        <ReasonChips reasons={matchData.reasons} />
                      </div>
                    )}
                  </DialogHeader>

                  {/* Metadata Grid */}
                  <div className="p-4 rounded-2xl bg-accent/30 border border-border/60 text-xs space-y-2.5">
                    {selectedOpportunity.createdBy?.name && (
                      <div className="flex items-center gap-2 text-foreground">
                        <User className="w-4 h-4 text-purple-400 shrink-0" />
                        <span><strong>Posted by:</strong> {selectedOpportunity.createdBy.name}</span>
                      </div>
                    )}
                    {selectedOpportunity.createdBy?.email && (
                      <div className="flex items-center gap-2 text-foreground">
                        <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span><strong>Contact Email:</strong> {selectedOpportunity.createdBy.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-foreground">
                      <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span><strong>Target Team Size:</strong> {selectedOpportunity.teamSize || 1} members</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <Heart className="w-4 h-4 text-pink-400 shrink-0" />
                      <span><strong>Interested Students:</strong> {selectedOpportunity.interestedUsers?.length || 0} expressed interest</span>
                    </div>
                  </div>

                  {/* Required Skills */}
                  {selectedOpportunity.requiredSkills && selectedOpportunity.requiredSkills.length > 0 && (
                    <div className="space-y-1.5">
                      <strong className="text-xs text-muted-foreground block font-semibold flex items-center gap-1">
                        <Code2 className="w-4 h-4 text-indigo-400" /> Required Skills:
                      </strong>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedOpportunity.requiredSkills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Topic Tags */}
                  {selectedOpportunity.tags && selectedOpportunity.tags.length > 0 && (
                    <div className="space-y-1.5">
                      <strong className="text-xs text-muted-foreground block font-semibold">Topic Tags:</strong>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedOpportunity.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="px-2.5 py-0.5 text-xs bg-accent border border-border">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {selectedOpportunity.description && (
                    <div className="space-y-1 text-sm text-foreground/90 leading-relaxed pt-2 border-t border-border">
                      <strong className="text-muted-foreground block text-xs font-semibold">Project Description & Goal:</strong>
                      <p className="bg-accent/20 p-4 rounded-xl border border-border/40 whitespace-pre-wrap">
                        {selectedOpportunity.description}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setSelectedOpportunity(null)}>
                      Close
                    </Button>
                    <Button
                      onClick={handleExpressInterest}
                      disabled={isExpressingInterest}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/25"
                    >
                      {isExpressingInterest ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4 mr-2 text-pink-300 fill-pink-300" />
                          <span>Express Interest</span>
                        </>
                      )}
                    </Button>
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
