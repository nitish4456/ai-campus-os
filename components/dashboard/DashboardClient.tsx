"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Search,
  Users,
  Bot,
  Sparkles,
  Plus,
  ArrowRight,
  Send,
  MapPin,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { EventCard, EventCardData } from "@/components/cards/EventCard";
import { OpportunityCard, OpportunityCardData } from "@/components/cards/OpportunityCard";
import { ItemCard, ItemCardData } from "@/components/cards/ItemCard";
import { ItemForm } from "@/components/forms/ItemForm";
import { ScoreBadge } from "@/components/shared/ScoreBadge";
import { ReasonChips } from "@/components/shared/ReasonChips";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface DashboardClientProps {
  userName: string;
}

export function DashboardClient({ userName }: DashboardClientProps) {
  const router = useRouter();

  // Data states
  const [recommendedEvents, setRecommendedEvents] = useState<EventCardData[]>([]);
  const [itemMatches, setItemMatches] = useState<
    Array<{ item: ItemCardData; topMatch?: { score: number; targetItemName: string } }>
  >([]);
  const [matchedOpportunities, setMatchedOpportunities] = useState<OpportunityCardData[]>([]);

  // Loading states
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isLoadingOpps, setIsLoadingOpps] = useState(true);

  // Quick Action Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // AI Prompt Widget Input State
  const [aiPromptInput, setAiPromptInput] = useState("");

  // Fetch Recommended Events
  useEffect(() => {
    async function loadEvents() {
      setIsLoadingEvents(true);
      try {
        const res = await fetch("/api/events/recommended");
        const data = await res.json();
        if (res.ok && data.recommendations) {
          setRecommendedEvents(data.recommendations.slice(0, 3));
        }
      } catch (e) {
        console.error("Error loading recommended events:", e);
      } finally {
        setIsLoadingEvents(false);
      }
    }
    loadEvents();
  }, []);

  // Fetch Item Matches
  useEffect(() => {
    async function loadItems() {
      setIsLoadingItems(true);
      try {
        const res = await fetch("/api/items");
        const data = await res.json();
        if (res.ok && data.items) {
          const userItems: ItemCardData[] = data.items.slice(0, 4);

          // Fetch top match for each item
          const itemsWithMatches = await Promise.all(
            userItems.map(async (item) => {
              try {
                const matchRes = await fetch(`/api/items/${item._id}/matches`);
                const matchData = await matchRes.json();
                if (matchRes.ok && matchData.matches && matchData.matches.length > 0) {
                  const top = matchData.matches[0];
                  return {
                    item,
                    topMatch: {
                      score: top.score,
                      targetItemName: top.item.itemName,
                    },
                  };
                }
              } catch (err) {
                console.error(err);
              }
              return { item };
            })
          );

          setItemMatches(itemsWithMatches);
        }
      } catch (e) {
        console.error("Error loading items:", e);
      } finally {
        setIsLoadingItems(false);
      }
    }
    loadItems();
  }, []);

  // Fetch Matched Opportunities
  useEffect(() => {
    async function loadOpportunities() {
      setIsLoadingOpps(true);
      try {
        const res = await fetch("/api/opportunities");
        const data = await res.json();
        if (res.ok && data.opportunities) {
          const opps = data.opportunities.slice(0, 3);
          const scoredOpps = await Promise.all(
            opps.map(async (opp: OpportunityCardData) => {
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
          scoredOpps.sort((a, b) => (b.score || 0) - (a.score || 0));
          setMatchedOpportunities(scoredOpps);
        }
      } catch (e) {
        console.error("Error loading opportunities:", e);
      } finally {
        setIsLoadingOpps(false);
      }
    }
    loadOpportunities();
  }, []);

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiPromptInput.trim()) {
      router.push(`/assistant`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border border-indigo-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="relative z-10 space-y-3">
          <Badge variant="outline" className="px-3 py-0.5 border-indigo-400/40 text-indigo-300 bg-indigo-950/60 font-semibold">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Student Dashboard
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
            Your connected campus platform. UniNest helps you discover lost items, connect with skilled students, explore opportunities, and find relevant campus events in real time.
          </p>
        </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Button
          onClick={() => setIsReportModalOpen(true)}
          className="h-auto p-4 flex flex-col items-center justify-center gap-2 rounded-2xl bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 text-rose-300 font-semibold transition-all group shadow-lg"
        >
          <Search className="w-6 h-6 text-rose-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs">Report Lost Item</span>
        </Button>

        <Link href="/events" className="w-full">
          <Button
            variant="outline"
            className="w-full h-full p-4 flex flex-col items-center justify-center gap-2 rounded-2xl bg-pink-600/10 hover:bg-pink-600/20 border border-pink-500/30 text-pink-300 font-semibold transition-all group shadow-lg"
          >
            <Calendar className="w-6 h-6 text-pink-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs">Browse Events</span>
          </Button>
        </Link>

        <Link href="/skill-connect" className="w-full">
          <Button
            variant="outline"
            className="w-full h-full p-4 flex flex-col items-center justify-center gap-2 rounded-2xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-purple-300 font-semibold transition-all group shadow-lg"
          >
            <Users className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs">Find Opportunities</span>
          </Button>
        </Link>

        <Link href="/assistant" className="w-full">
          <Button
            variant="outline"
            className="w-full h-full p-4 flex flex-col items-center justify-center gap-2 rounded-2xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-semibold transition-all group shadow-lg"
          >
            <Bot className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs">Ask Friday</span>
          </Button>
        </Link>
      </div>

      {/* SECTION 1: RECOMMENDED FOR YOU (EVENTS) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-xl text-foreground flex items-center gap-2 tracking-tight">
            <Calendar className="w-5 h-5 text-pink-400" />
            Recommended Events
          </h2>
          <Link href="/events" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingEvents ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        ) : recommendedEvents.length === 0 ? (
          <EmptyState
            title="No Recommended Events Yet"
            description="Add your interests and skills to your profile to get personalized campus event recommendations!"
            actionLabel="Update Profile"
            onAction={() => router.push("/profile")}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {recommendedEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onViewDetails={() => router.push("/events")}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: POTENTIAL ITEM MATCHES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-xl text-foreground flex items-center gap-2 tracking-tight">
            <Search className="w-5 h-5 text-rose-400" />
            Potential Lost & Found Matches
          </h2>
          <Link href="/lost-found" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
            <span>View Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingItems ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        ) : itemMatches.length === 0 ? (
          <EmptyState
            title="No Active Items Reported"
            description="Report lost or found belongings to receive instant AI probability matching."
            actionLabel="Report Lost Item"
            onAction={() => setIsReportModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {itemMatches.map(({ item, topMatch }) => (
              <Card
                key={item._id}
                onClick={() => router.push("/lost-found")}
                className="bg-card/60 border-border backdrop-blur-xl hover:border-indigo-500/40 transition-all p-4 cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        (item.type || "lost") === "lost"
                          ? "bg-rose-500/80 text-[10px] px-2 py-0"
                          : "bg-emerald-500/80 text-[10px] px-2 py-0"
                      }
                    >
                      {(item.type || "lost").toUpperCase()}
                    </Badge>
                    <p className="font-bold text-sm text-foreground truncate group-hover:text-indigo-400 transition-colors">
                      {item.itemName}
                    </p>
                  </div>
                  {item.location && (
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-pink-400" /> {item.location}
                    </p>
                  )}
                  {topMatch && (
                    <p className="text-xs text-indigo-300 font-medium pt-1">
                      Matched: &ldquo;{topMatch.targetItemName}&rdquo;
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {topMatch ? (
                    <ScoreBadge score={topMatch.score} />
                  ) : (
                    <Badge variant="outline" className="text-[11px] border-border text-muted-foreground">
                      Scanning...
                    </Badge>
                  )}
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 3: OPPORTUNITIES MATCHING YOUR SKILLS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-xl text-foreground flex items-center gap-2 tracking-tight">
            <Users className="w-5 h-5 text-purple-400" />
            Opportunities Matching Your Skills
          </h2>
          <Link href="/skill-connect" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingOpps ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        ) : matchedOpportunities.length === 0 ? (
          <EmptyState
            title="No Skills Matched Opportunities"
            description="Explore open team opportunities or post a project to recruit student collaborators."
            actionLabel="Skill Connect"
            onAction={() => router.push("/skill-connect")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {matchedOpportunities.map((opp) => (
              <OpportunityCard
                key={opp._id}
                opportunity={opp}
                onViewDetails={() => router.push("/skill-connect")}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 4: ASK CAMPUS AI EMBEDDED WIDGET */}
      <Card className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 backdrop-blur-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Bot className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <span>Ask Friday</span>
                <Badge variant="outline" className="text-[10px] px-2 py-0 border-indigo-400/40 text-indigo-300">
                  Grounded
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground">Your intelligent campus assistant for UniNest.</p>
            </div>
          </div>
        </div>

        {/* Form Input */}
        <form onSubmit={handleAiSubmit} className="flex gap-2">
          <Input
            value={aiPromptInput}
            onChange={(e) => setAiPromptInput(e.target.value)}
            placeholder="Ask Friday: e.g. Find opportunities for Python developers..."
            className="bg-background/80 border-border text-sm rounded-xl"
          />
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 font-semibold">
            <span>Chat</span>
            <Send className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        {/* Suggested Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-muted-foreground">Try asking:</span>
          {[
            "AI events this week",
            "Find hackathon teams",
            "Find lost headphones",
            "Opportunities for Python",
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => router.push(`/assistant`)}
              className="px-3 py-1 rounded-xl bg-accent/50 hover:bg-indigo-600/20 hover:text-indigo-400 border border-border/60 text-xs font-medium text-muted-foreground transition-colors"
            >
              &ldquo;{chip}&rdquo;
            </button>
          ))}
        </div>
      </Card>

      {/* Report Modal */}
      <ItemForm
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        defaultType="lost"
        onSuccess={() => router.push("/lost-found")}
      />
    </div>
  );
}
