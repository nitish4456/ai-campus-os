export interface NormalizedEvent {
  externalEventId?: string;
  title: string;
  name?: string;
  description: string;
  category: string;
  date: Date;
  endDate?: Date;
  time?: string;
  location: string;
  city?: string;
  imageUrl?: string;
  bookingUrl?: string;
  registrationLink?: string;
  source: string;
  sourceUrl?: string;
  tags: string[];
  isExternal: boolean;
  organizer?: string;
  createdAt?: Date | string;
}

// Backward compatibility alias
export type UniNestEvent = NormalizedEvent;

export interface FetchEventsParams {
  city?: string;
  category?: string;
  source?: string;
  isExternal?: boolean;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface EventProvider {
  name: string;
  fetchEvents(params: FetchEventsParams): Promise<NormalizedEvent[]>;
}
