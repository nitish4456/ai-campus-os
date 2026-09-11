import { NextResponse } from "next/server";
import { z } from "zod";
import connectToDatabase from "@/lib/db";
import Event from "@/models/Event";
import { getCurrentDbUser } from "@/lib/auth";
import { isValidExternalUrl } from "@/lib/utils";

const adminEventSchema = z.object({
  title: z.string().min(1, "Event title is required").trim(),
  description: z.string().min(1, "Description is required").trim(),
  category: z.string().min(1, "Category is required").trim(),
  date: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  time: z.string().optional().default(""),
  location: z.string().min(1, "Location is required").trim(),
  city: z.string().optional().default("Campus"),
  imageUrl: z.string().optional().default(""),
  bookingUrl: z.string().optional().default(""),
  source: z.string().min(1, "Source is required").trim(),
  sourceUrl: z.string().optional().default(""),
  tags: z.array(z.string()).default([]),
  isExternal: z.boolean().default(false),
  organizer: z.string().optional().default(""),
});

export async function GET(req: Request) {
  try {
    const dbUser = await getCurrentDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const source = searchParams.get("source");
    const type = searchParams.get("type"); // "external" | "campus" | "all"
    const search = searchParams.get("search");

    const query: any = {};

    if (category && category !== "all") {
      query.category = new RegExp(category.trim(), "i");
    }

    if (city && city !== "all") {
      const cityRegex = new RegExp(city.trim(), "i");
      query.$or = [{ city: cityRegex }, { location: cityRegex }];
    }

    if (source && source !== "all") {
      query.source = new RegExp(source.trim(), "i");
    }

    if (type === "external") query.isExternal = true;
    if (type === "campus") query.isExternal = false;

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
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

    const events = await Event.find(query).sort({ date: 1 }).lean();

    const normalizedEvents = events.map((event: any) => ({
      ...event,
      title: event.title || event.name,
      bookingUrl: isValidExternalUrl(event.bookingUrl || event.registrationLink)
        ? event.bookingUrl || event.registrationLink
        : "",
      sourceUrl: isValidExternalUrl(event.sourceUrl) ? event.sourceUrl : "",
      source: event.source || (event.isExternal ? "External Provider" : "UniNest Campus"),
    }));

    return NextResponse.json({ events: normalizedEvents });
  } catch (error: any) {
    console.error("Error in GET /api/admin/events:", error);
    return NextResponse.json({ error: "Failed to fetch admin events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const dbUser = await getCurrentDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = adminEventSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid event data", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    await connectToDatabase();

    const validBooking = isValidExternalUrl(data.bookingUrl) ? data.bookingUrl.trim() : "";
    const validSource = isValidExternalUrl(data.sourceUrl) ? data.sourceUrl.trim() : "";

    // Deduplication check: source + title + date
    const eventDate = new Date(data.date);
    const existing = await Event.findOne({
      source: data.source,
      name: data.title,
      date: eventDate,
    });

    if (existing) {
      return NextResponse.json(
        { error: "An event with the same title, source, and date already exists." },
        { status: 409 }
      );
    }

    const newEvent = await Event.create({
      createdBy: dbUser._id,
      name: data.title,
      title: data.title,
      description: data.description,
      category: data.category,
      date: eventDate,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      time: data.time || "",
      location: data.location,
      city: data.city || "Campus",
      imageUrl: data.imageUrl || "",
      bookingUrl: validBooking,
      registrationLink: validBooking,
      source: data.source,
      sourceUrl: validSource,
      tags: data.tags || [],
      isExternal: Boolean(data.isExternal),
      organizer: data.organizer || data.source || dbUser.name,
    });

    return NextResponse.json({
      success: true,
      event: newEvent,
      message: "Event created successfully",
    });
  } catch (error: any) {
    console.error("Error in POST /api/admin/events:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
