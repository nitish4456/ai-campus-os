import { EventProvider, FetchEventsParams, UniNestEvent } from "../types";

export class TicketmasterProvider implements EventProvider {
  name = "Ticketmaster";

  async fetchEvents(params: FetchEventsParams): Promise<UniNestEvent[]> {
    const apiKey = process.env.TICKETMASTER_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ Ticketmaster API key not configured (TICKETMASTER_API_KEY). Skipping Ticketmaster fetch.");
      return [];
    }

    try {
      const url = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
      url.searchParams.set("apikey", apiKey);
      url.searchParams.set("size", String(params.limit || 20));

      if (params.city) {
        url.searchParams.set("city", params.city);
      }
      if (params.keyword) {
        url.searchParams.set("keyword", params.keyword);
      }
      if (params.category && params.category !== "all") {
        url.searchParams.set("classificationName", params.category);
      }
      if (params.startDate) {
        url.searchParams.set("startDateTime", new Date(params.startDate).toISOString().replace(/\.\d{3}Z$/, "Z"));
      }

      const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
      if (!res.ok) {
        console.error(`Ticketmaster API returned status ${res.status}`);
        return [];
      }

      const data = await res.json();
      const rawEvents = data._embedded?.events || [];

      return rawEvents.map((item: any): UniNestEvent => {
        const venue = item._embedded?.venues?.[0];
        const locationStr = venue
          ? `${venue.name || ""}, ${venue.city?.name || ""}, ${venue.state?.stateCode || venue.country?.countryCode || ""}`.replace(/^, /, "")
          : item.pleaseNote || "TBA Location";

        const image = item.images?.find((img: any) => img.width > 500) || item.images?.[0];
        const bookingUrl = item.url || (item.outlets?.[0]?.url) || "";

        const eventDate = item.dates?.start?.dateTime
          ? new Date(item.dates.start.dateTime)
          : item.dates?.start?.localDate
          ? new Date(item.dates.start.localDate)
          : new Date();

        const timeStr = item.dates?.start?.localTime || "See official link";

        const categoryName = item.classifications?.[0]?.segment?.name || item.classifications?.[0]?.genre?.name || "Music & Arts";

        return {
          title: item.name,
          name: item.name,
          description: item.info || item.description || item.pleaseNote || `Official ticketed event listed on Ticketmaster: ${item.name}`,
          category: categoryName,
          date: eventDate,
          time: timeStr,
          location: locationStr,
          imageUrl: image?.url || "",
          bookingUrl: bookingUrl,
          registrationLink: bookingUrl,
          source: "Ticketmaster",
          externalEventId: item.id,
          tags: [categoryName, "Ticketmaster", item.classifications?.[0]?.genre?.name || "Live"].filter(Boolean),
          isExternal: true,
          organizer: item._embedded?.attractions?.[0]?.name || "Ticketmaster Event Host",
        };
      });
    } catch (error) {
      console.error("Error fetching from Ticketmaster provider:", error);
      return [];
    }
  }
}
