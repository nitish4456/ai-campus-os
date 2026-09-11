import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Event, { IEvent } from "@/models/Event";
import Opportunity, { IOpportunity } from "@/models/Opportunity";
import Item, { IItem } from "@/models/Item";

export interface SearchResults {
  events: IEvent[];
  opportunities: IOpportunity[];
  items: IItem[];
}

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he",
  "in", "is", "it", "its", "of", "on", "that", "the", "to", "was", "were", "will",
  "with", "team", "teams", "event", "events", "item", "items", "find", "looking", "for"
]);

function extractSearchTerms(rawQuery: string): string[] {
  const words = rawQuery
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);

  // Keep meaningful keywords
  const filtered = words.filter((w) => !STOP_WORDS.has(w));
  return filtered.length > 0 ? filtered : words;
}

export async function searchCampusOS(rawQuery: string): Promise<SearchResults> {
  const query = rawQuery.trim();
  if (!query) {
    return { events: [], opportunities: [], items: [] };
  }

  await connectToDatabase();
  // Touch User model to ensure schema registration for populate references
  const _userModel = User;

  const terms = extractSearchTerms(query);
  const regexes = terms.map((t) => new RegExp(t, "i"));
  const fullRegex = new RegExp(query.replace(/[^\w\s]/g, "\\$&"), "i");

  // 1. Search Events (Sync real events if needed)
  try {
    const { fetchAndSyncRealEvents } = await import("@/lib/events");
    await fetchAndSyncRealEvents({ keyword: query });
  } catch (syncErr) {
    console.warn("Search real events sync warning:", syncErr);
  }

  const eventQuery = {
    $or: [
      { name: fullRegex },
      { title: fullRegex },
      { description: fullRegex },
      { category: fullRegex },
      { tags: { $in: regexes } },
      { organizer: fullRegex },
      { location: fullRegex },
      { source: fullRegex },
    ],
  };

  const events = await Event.find(eventQuery)
    .populate("createdBy", "name email")
    .sort({ date: 1 })
    .limit(5)
    .lean();

  // 2. Search Opportunities
  const opportunityQuery = {
    $or: [
      { title: fullRegex },
      { description: fullRegex },
      { category: fullRegex },
      { requiredSkills: { $in: regexes } },
      { tags: { $in: regexes } },
    ],
  };

  const opportunities = await Opportunity.find(opportunityQuery)
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // 3. Search Lost & Found Items
  const itemQuery = {
    $or: [
      { itemName: fullRegex },
      { description: fullRegex },
      { category: fullRegex },
      { location: fullRegex },
    ],
  };

  // If query contains terms like "black" & "headphones", match both
  if (terms.length > 1) {
    (itemQuery.$or as any[]).push({
      $and: terms.map((t) => ({
        $or: [
          { itemName: new RegExp(t, "i") },
          { description: new RegExp(t, "i") },
          { location: new RegExp(t, "i") },
        ],
      })),
    });
  }

  const items = await Item.find(itemQuery)
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return {
    events: events as any,
    opportunities: opportunities as any,
    items: items as any,
  };
}
