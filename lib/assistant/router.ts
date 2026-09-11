import connectToDatabase from "@/lib/db";
import Event from "@/models/Event";
import Opportunity from "@/models/Opportunity";
import Item from "@/models/Item";
import User from "@/models/User";
import { searchCampusOS } from "@/lib/search";

export interface ReferenceCardItem {
  type: "event" | "opportunity" | "item";
  id: string;
  title: string;
  subtitle: string;
  link: string;
}

export interface RoutedContext {
  contextText: string;
  references: ReferenceCardItem[];
  hasCampusContext: boolean;
  resultCount: number;
  eventsCount: number;
  intentDetected: string;
}

const EVENT_FILLER_WORDS = new Set([
  "event", "events", "happening", "upcoming", "available", "show", "me", "list",
  "get", "find", "this", "month", "week", "today", "tomorrow", "calendar", "schedule",
  "any", "what", "are", "is", "the", "a", "an", "for", "in", "on", "at", "please"
]);

const GENERAL_STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he",
  "in", "is", "it", "its", "of", "on", "that", "the", "to", "was", "were", "will",
  "with", "find", "looking", "show", "me", "get", "any", "where", "can", "i",
  "what", "is", "how", "are", "you", "tell", "explain", "about"
]);

function extractTopicTerms(rawQuery: string, fillerSet: Set<string>): string[] {
  const words = rawQuery
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);

  return words.filter((w) => !fillerSet.has(w));
}

export async function routeAndRetrieveContext(userQuery: string): Promise<RoutedContext> {
  const query = userQuery.trim().toLowerCase();

  // 1. Fast-track greetings & casual conversational queries
  const isCasualGreeting = /^(hello|hi|hey|howdy|greetings|good morning|good afternoon|good evening|how are you|what's up|how is it going|who are you|thank you|thanks)\b/i.test(query) &&
    !/\b(event|events|lost|found|opportunity|team|hackathon|item|workshop|seminar|job|project)\b/i.test(query);

  if (isCasualGreeting) {
    return {
      contextText: "NO RELEVANT CAMPUS RECORDS FOUND.",
      references: [],
      hasCampusContext: false,
      resultCount: 0,
      eventsCount: 0,
      intentDetected: "CASUAL_GREETING",
    };
  }

  // 2. Fast-track general knowledge / explanations ("explain machine learning", "what is HTML")
  const isGeneralExplanation = /^(explain|what is|what are|how to|how does|why is)\b/i.test(query) &&
    !/\b(event|events|workshop|workshops|lost|found|item|items|team|teams|opportunity|opportunities|hackathon)\b/i.test(query);

  if (isGeneralExplanation) {
    return {
      contextText: "NO RELEVANT CAMPUS RECORDS FOUND.",
      references: [],
      hasCampusContext: false,
      resultCount: 0,
      eventsCount: 0,
      intentDetected: "GENERAL_KNOWLEDGE",
    };
  }

  // 3. Detect specific intent types
  const isEventIntent = /\b(event|events|workshop|workshops|seminar|seminars|competition|bootcamp|happening|upcoming|fair|booking|booking link|registration link|ticket|tickets|book now|first one|second one|link)\b/i.test(query);
  const isOpportunityIntent = /\b(team|teams|opportunity|opportunities|hackathon|project|projects|skill|skills|developer|engineer|designer|researcher|role)\b/i.test(query);
  const isItemIntent = /\b(lost|found|item|items|headphones|headphone|keys|wallet|bottle|flask|charger|jacket|calculator|airpods)\b/i.test(query);

  await connectToDatabase();
  const _userModel = User;

  const contextLines: string[] = [];
  const references: ReferenceCardItem[] = [];
  let eventsCount = 0;
  let intentDetected = "GENERAL_KNOWLEDGE";

  if (isEventIntent) {
    intentDetected = "EVENT_QUERY";
  } else if (isOpportunityIntent) {
    intentDetected = "OPPORTUNITY_QUERY";
  } else if (isItemIntent) {
    intentDetected = "ITEM_QUERY";
  }

  // 4. Search Events Collection
  if (isEventIntent) {
    const topicTerms = extractTopicTerms(query, EVENT_FILLER_WORDS);

    // Extract city if present in user query
    const knownCities = ["delhi", "bengaluru", "mumbai", "chandigarh", "hyderabad", "pune", "online"];
    const detectedCity = knownCities.find((c) => query.includes(c));

    // Trigger real events & manual Indian events provider sync
    try {
      const { fetchAndSyncAllEvents } = await import("@/lib/events");
      await fetchAndSyncAllEvents({
        keyword: topicTerms.length > 0 ? topicTerms[0] : undefined,
        city: detectedCity,
      });
    } catch (syncErr) {
      console.warn("Router events sync warning:", syncErr);
    }

    const termRegexes = topicTerms.map((t) => new RegExp(t, "i"));

    let eventFilter: any = {};
    if (termRegexes.length > 0) {
      eventFilter = {
        $or: [
          { name: { $in: termRegexes } },
          { title: { $in: termRegexes } },
          { description: { $in: termRegexes } },
          { tags: { $in: termRegexes } },
          { category: { $in: termRegexes } },
          { location: { $in: termRegexes } },
          { city: { $in: termRegexes } },
          { organizer: { $in: termRegexes } },
          { source: { $in: termRegexes } },
        ],
      };
    }

    if (detectedCity) {
      const cityRegex = new RegExp(detectedCity, "i");
      eventFilter.$and = [
        { $or: [{ city: cityRegex }, { location: cityRegex }] },
      ];
    }

    const events = await Event.find(eventFilter)
      .sort({ date: 1 })
      .limit(6)
      .lean();

    if (events.length > 0) {
      eventsCount = events.length;
      contextLines.push("=== AGGREGATED CAMPUS & REAL EXTERNAL EVENTS ===");
      events.forEach((evt) => {
        const titleStr = evt.title || evt.name;
        const bUrl = evt.bookingUrl || evt.registrationLink || "";
        const sUrl = evt.sourceUrl || "";
        const sourceStr = evt.source || (evt.isExternal ? "External Provider" : "UniNest Campus");
        const cityStr = evt.city || "Campus";

        contextLines.push(
          `- Event Title: "${titleStr}" | Category: ${evt.category || "General"} | Date: ${evt.date ? new Date(evt.date).toDateString() : "TBA"} | Location: ${evt.location || "Campus"} | City: ${cityStr} | Source: ${sourceStr} | Booking Available: ${bUrl ? "YES" : "NO"} | Booking URL: ${bUrl || "None"} | Source URL: ${sUrl || "None"} | Description: ${evt.description}`
        );
        references.push({
          type: "event",
          id: String(evt._id),
          title: titleStr,
          subtitle: `[${sourceStr}] ${cityStr} • ${evt.category || "Event"}`,
          link: `/events/${evt._id}`,
        });
      });
    }
  }

  // 5. Search Opportunity Collection
  if (isOpportunityIntent) {
    const topicTerms = extractTopicTerms(query, GENERAL_STOP_WORDS);
    const termRegexes = topicTerms.map((t) => new RegExp(t, "i"));

    let oppFilter = {};
    if (termRegexes.length > 0) {
      oppFilter = {
        $or: [
          { title: { $in: termRegexes } },
          { description: { $in: termRegexes } },
          { requiredSkills: { $in: termRegexes } },
          { tags: { $in: termRegexes } },
          { category: { $in: termRegexes } },
        ],
      };
    }

    const opps = await Opportunity.find(oppFilter)
      .limit(4)
      .lean();

    if (opps.length > 0) {
      contextLines.push("=== SKILL OPPORTUNITIES & TEAMS ===");
      opps.forEach((opp) => {
        contextLines.push(
          `- Opportunity: "${opp.title}" | Category: ${opp.category} | Team Size: ${opp.teamSize} | Required Skills: ${opp.requiredSkills?.join(", ") || ""} | Tags: ${opp.tags?.join(", ") || ""} | Description: ${opp.description}`
        );
        references.push({
          type: "opportunity",
          id: String(opp._id),
          title: opp.title,
          subtitle: `Skills: ${opp.requiredSkills?.join(", ") || "General"}`,
          link: "/skill-connect",
        });
      });
    }
  }

  // 6. Search Lost & Found Collection
  if (isItemIntent) {
    const topicTerms = extractTopicTerms(query, GENERAL_STOP_WORDS);
    const termRegexes = topicTerms.map((t) => new RegExp(t, "i"));

    let itemFilter = {};
    if (termRegexes.length > 0) {
      itemFilter = {
        $or: [
          { itemName: { $in: termRegexes } },
          { description: { $in: termRegexes } },
          { category: { $in: termRegexes } },
          { location: { $in: termRegexes } },
        ],
      };
    }

    const items = await Item.find(itemFilter)
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    if (items.length > 0) {
      contextLines.push("=== LOST & FOUND ITEMS ===");
      items.forEach((item) => {
        contextLines.push(
          `- Item: "${item.itemName}" | Type: ${item.type.toUpperCase()} | Category: ${item.category} | Location: ${item.location} | Date: ${item.date ? new Date(item.date).toDateString() : "Recent"} | Description: ${item.description}`
        );
        references.push({
          type: "item",
          id: String(item._id),
          title: item.itemName,
          subtitle: `[${item.type.toUpperCase()}] ${item.location || "Campus"}`,
          link: "/lost-found",
        });
      });
    }
  }

  // Fallback search engine if no records matched specifically but an explicit intent was present
  if (contextLines.length === 0 && (isEventIntent || isOpportunityIntent || isItemIntent)) {
    const searchResults = await searchCampusOS(userQuery);

    if (searchResults.events.length > 0) {
      eventsCount = searchResults.events.length;
      contextLines.push("=== CAMPUS EVENTS ===");
      searchResults.events.forEach((evt) => {
        contextLines.push(`- Event Name: "${evt.name}" | Category: ${evt.category} | Location: ${evt.location} | Tags: ${evt.tags?.join(", ")}`);
        references.push({
          type: "event",
          id: String(evt._id),
          title: evt.name,
          subtitle: evt.category || "Event",
          link: "/events",
        });
      });
    }

    if (searchResults.opportunities.length > 0) {
      contextLines.push("=== SKILL OPPORTUNITIES ===");
      searchResults.opportunities.forEach((opp) => {
        contextLines.push(`- Opportunity: "${opp.title}" | Required Skills: ${opp.requiredSkills?.join(", ")}`);
        references.push({
          type: "opportunity",
          id: String(opp._id),
          title: opp.title,
          subtitle: `Skills: ${opp.requiredSkills?.join(", ")}`,
          link: "/skill-connect",
        });
      });
    }

    if (searchResults.items.length > 0) {
      contextLines.push("=== LOST & FOUND ITEMS ===");
      searchResults.items.forEach((item) => {
        contextLines.push(`- Item: "${item.itemName}" | Type: ${item.type} | Location: ${item.location}`);
        references.push({
          type: "item",
          id: String(item._id),
          title: item.itemName,
          subtitle: `[${item.type.toUpperCase()}] ${item.location}`,
          link: "/lost-found",
        });
      });
    }
  }

  const hasCampusContext = contextLines.length > 0;
  return {
    contextText: hasCampusContext ? contextLines.join("\n") : "NO RELEVANT CAMPUS RECORDS FOUND.",
    references,
    hasCampusContext,
    resultCount: references.length,
    eventsCount,
    intentDetected,
  };
}
