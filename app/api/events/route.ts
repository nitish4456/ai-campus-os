import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentDbUser } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Event from "@/models/Event";

const eventSchema = z.object({
  name: z.string().min(1, "Event name is required").trim(),
  description: z.string().optional().default(""),
  date: z.string().or(z.date()).optional(),
  time: z.string().optional().default(""),
  location: z.string().optional().default(""),
  category: z.string().optional().default("Technology"),
  tags: z.array(z.string()).default([]),
  organizer: z.string().optional().default(""),
  registrationLink: z.string().optional().default(""),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category") || undefined;
    const city = searchParams.get("city") || undefined;
    const source = searchParams.get("source") || undefined;
    const type = searchParams.get("type"); // "external" | "campus" | "all"
    const search = searchParams.get("search") || undefined;

    let isExternal: boolean | undefined = undefined;
    if (type === "external") isExternal = true;
    if (type === "campus") isExternal = false;

    const { fetchAndSyncAllEvents } = await import("@/lib/events");

    const events = await fetchAndSyncAllEvents({
      category: category && category !== "all" ? category : undefined,
      city: city && city !== "all" ? city : undefined,
      source: source && source !== "all" ? source : undefined,
      isExternal,
      keyword: search,
    });

    const normalizedEvents = events.map((event: any) => ({
      ...event,
      title: event.title || event.name,
      bookingUrl: event.bookingUrl || event.registrationLink || "",
      registrationLink: event.registrationLink || event.bookingUrl || "",
      source: event.source || (event.isExternal ? "External Provider" : "UniNest Campus"),
      sourceUrl: event.sourceUrl || "",
    }));

    return NextResponse.json({ events: normalizedEvents });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const dbUser = await getCurrentDbUser();

    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = eventSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid event data", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    await connectToDatabase();

    const newEvent = await Event.create({
      createdBy: dbUser._id,
      name: data.name,
      description: data.description,
      date: data.date ? new Date(data.date) : new Date(),
      time: data.time,
      location: data.location,
      category: data.category,
      tags: data.tags,
      organizer: data.organizer || dbUser.name,
      registrationLink: data.registrationLink,
    });

    return NextResponse.json({ event: newEvent, message: "Event created successfully" });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
