import connectToDatabase from "@/lib/db";
import Event, { IEvent } from "@/models/Event";
import { FetchEventsParams, NormalizedEvent } from "./types";
import { CampusEventProvider } from "./providers/campusProvider";
import { ExternalEventProvider } from "./providers/externalProvider";
import { ManualIndianEventsProvider } from "./providers/manualProvider";

const campusProvider = new CampusEventProvider();
const externalProvider = new ExternalEventProvider();
const manualIndianProvider = new ManualIndianEventsProvider();

export async function fetchAndSyncAllEvents(params: FetchEventsParams = {}): Promise<IEvent[]> {
  await connectToDatabase();

  // 1. Fetch from External and Manual Indian providers to sync fresh records into MongoDB
  const externalEvents: NormalizedEvent[] = [];

  try {
    const extResults = await externalProvider.fetchEvents(params);
    externalEvents.push(...extResults);
  } catch (err) {
    console.warn("External provider sync warning:", err);
  }

  try {
    const indianResults = await manualIndianProvider.fetchEvents(params);
    externalEvents.push(...indianResults);
  } catch (err) {
    console.warn("Manual Indian provider sync warning:", err);
  }

  // 2. Upsert fetched external events into MongoDB cache preventing duplicates
  for (const item of externalEvents) {
    const bookingLink = item.bookingUrl || item.registrationLink || "";
    const eventTitle = item.title || item.name || "";

    // External deduplication query
    let dedupeQuery: any = {};

    if (item.source && item.externalEventId) {
      dedupeQuery = {
        source: item.source,
        externalEventId: item.externalEventId,
      };
    } else {
      // Manual deduplication fallback: source + title + date
      dedupeQuery = {
        source: item.source || "UniNest",
        name: eventTitle,
        date: item.date ? new Date(item.date) : new Date(),
      };
    }

    await Event.findOneAndUpdate(
      dedupeQuery,
      {
        $set: {
          name: eventTitle,
          title: eventTitle,
          description: item.description || "",
          category: item.category || "Technology",
          date: item.date ? new Date(item.date) : new Date(),
          endDate: item.endDate ? new Date(item.endDate) : undefined,
          location: item.location || "Online / TBA",
          city: item.city || "",
          imageUrl: item.imageUrl || "",
          bookingUrl: bookingLink,
          registrationLink: bookingLink,
          source: item.source || "External",
          sourceUrl: item.sourceUrl || "",
          externalEventId: item.externalEventId || "",
          tags: item.tags || [],
          isExternal: true,
          organizer: item.organizer || item.source,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
  }

  // 3. Query combined normalized events from MongoDB
  const query: any = {};

  if (params.isExternal !== undefined) {
    query.isExternal = params.isExternal;
  }

  if (params.category && params.category !== "all") {
    query.category = new RegExp(params.category.trim(), "i");
  }

  if (params.city && params.city !== "all") {
    const cityRegex = new RegExp(params.city.trim(), "i");
    query.$or = [{ city: cityRegex }, { location: cityRegex }];
  }

  if (params.source && params.source !== "all") {
    query.source = new RegExp(params.source.trim(), "i");
  }

  if (params.keyword) {
    const searchRegex = new RegExp(params.keyword.trim(), "i");
    const existingOr = query.$or || [];
    query.$or = [
      ...existingOr,
      { name: searchRegex },
      { title: searchRegex },
      { description: searchRegex },
      { location: searchRegex },
      { city: searchRegex },
      { source: searchRegex },
      { tags: { $in: [searchRegex] } },
    ];
  }

  const events = await Event.find(query)
    .sort({ date: 1 })
    .limit(params.limit || 60)
    .lean();

  return events as any;
}

// Backward compatibility function
export async function fetchAndSyncRealEvents(params: FetchEventsParams = {}): Promise<IEvent[]> {
  return fetchAndSyncAllEvents(params);
}
