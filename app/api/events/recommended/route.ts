import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Event from "@/models/Event";
import { calculateEventScore } from "@/lib/matching/eventScore";

export async function GET() {
  try {
    const dbUser = await getCurrentDbUser();

    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { fetchAndSyncAllEvents } = await import("@/lib/events");
    await fetchAndSyncAllEvents();

    const now = new Date(Date.now() - 86400000); // include today's events

    const events = await Event.find({
      $or: [{ date: { $gte: now } }, { endDate: { $gte: now } }],
    })
      .populate("createdBy", "name email")
      .sort({ date: 1 })
      .lean();

    const scoredEvents = events.map((event: any) => {
      const matchResult = calculateEventScore(dbUser, event as any);
      return {
        event: {
          ...event,
          title: event.title || event.name,
          bookingUrl: event.bookingUrl || event.registrationLink || "",
          source: event.source || (event.isExternal ? "External Provider" : "UniNest Campus"),
          score: matchResult.score,
          reasons: matchResult.reasons,
        },
        score: matchResult.score,
        reasons: matchResult.reasons,
      };
    });

    // Sort descending by score, then by date
    scoredEvents.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      recommendations: scoredEvents.map((item) => item.event),
    });
  } catch (error) {
    console.error("Error generating event recommendations:", error);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
