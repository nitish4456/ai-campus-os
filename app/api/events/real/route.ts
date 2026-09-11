import { NextResponse } from "next/server";
import { fetchAndSyncRealEvents } from "@/lib/events";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const city = searchParams.get("city") || undefined;
    const category = searchParams.get("category") || undefined;
    const keyword = searchParams.get("keyword") || searchParams.get("search") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const events = await fetchAndSyncRealEvents({
      city,
      category,
      keyword,
      startDate,
      endDate,
    });

    // Ensure every event has normalized bookingUrl & source fields
    const normalizedEvents = events.map((event: any) => ({
      ...event,
      title: event.title || event.name,
      bookingUrl: event.bookingUrl || event.registrationLink || "",
      registrationLink: event.registrationLink || event.bookingUrl || "",
      source: event.source || "UniNest",
    }));

    return NextResponse.json({
      success: true,
      count: normalizedEvents.length,
      events: normalizedEvents,
    });
  } catch (error: any) {
    console.error("Error in GET /api/events/real:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch real events",
        details: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
