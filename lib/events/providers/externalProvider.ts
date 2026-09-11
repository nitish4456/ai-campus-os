import { EventProvider, FetchEventsParams, NormalizedEvent } from "../types";
import { MockEventProvider } from "./mock";
import { TicketmasterProvider } from "./ticketmaster";

export class ExternalEventProvider implements EventProvider {
  name = "External Provider Engine";

  private mockProvider = new MockEventProvider();
  private tmProvider = new TicketmasterProvider();

  async fetchEvents(params: FetchEventsParams): Promise<NormalizedEvent[]> {
    const results: NormalizedEvent[] = [];

    try {
      const mockResults = await this.mockProvider.fetchEvents(params);
      results.push(...mockResults);
    } catch (err) {
      console.warn("External Mock provider warning:", err);
    }

    try {
      const tmResults = await this.tmProvider.fetchEvents(params);
      results.push(...tmResults);
    } catch (err) {
      console.warn("External Ticketmaster provider warning:", err);
    }

    return results;
  }
}
