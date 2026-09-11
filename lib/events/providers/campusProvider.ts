import connectToDatabase from "@/lib/db";
import Event from "@/models/Event";
import { EventProvider, FetchEventsParams, NormalizedEvent } from "../types";

export class CampusEventProvider implements EventProvider {
  name = "UniNest Campus Provider";

  async fetchEvents(params: FetchEventsParams): Promise<NormalizedEvent[]> {
    await connectToDatabase();

    const query: any = {
      $or: [{ isExternal: false }, { isExternal: { $exists: false } }],
    };

    if (params.category && params.category !== "all") {
      query.category = new RegExp(params.category.trim(), "i");
    }

    if (params.city && params.city !== "all") {
      query.$or = [
        { city: new RegExp(params.city.trim(), "i") },
        { location: new RegExp(params.city.trim(), "i") },
      ];
    }

    if (params.keyword) {
      const searchRegex = new RegExp(params.keyword.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        { tags: { $in: [searchRegex] } },
      ];
    }

    const events = await Event.find(query).sort({ date: 1 }).limit(params.limit || 50).lean();

    return events.map((evt: any): NormalizedEvent => {
      const bookingLink = evt.bookingUrl || evt.registrationLink || "";

      return {
        externalEventId: String(evt._id),
        title: evt.title || evt.name,
        name: evt.name || evt.title,
        description: evt.description || "",
        category: evt.category || "Campus Life",
        date: evt.date ? new Date(evt.date) : new Date(),
        endDate: evt.endDate ? new Date(evt.endDate) : undefined,
        location: evt.location || "Campus",
        city: evt.city || "Campus",
        imageUrl: evt.imageUrl || "",
        bookingUrl: bookingLink,
        registrationLink: bookingLink,
        source: evt.source || "UniNest Campus",
        sourceUrl: evt.sourceUrl || "",
        tags: evt.tags || [],
        isExternal: false,
        organizer: evt.organizer || "Student Organization",
      };
    });
  }
}
