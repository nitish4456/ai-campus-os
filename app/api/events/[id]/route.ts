import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Event from "@/models/Event";

import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    let event: any = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      event = await Event.findById(id).populate("createdBy", "name email").lean();
    }

    if (!event) {
      event = await Event.findOne({ externalEventId: id }).lean();
    }

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const normalizedEvent = {
      ...event,
      title: event.title || event.name,
      bookingUrl: event.bookingUrl || event.registrationLink || "",
      registrationLink: event.registrationLink || event.bookingUrl || "",
      source: event.source || "UniNest",
    };

    return NextResponse.json({ event: normalizedEvent });
  } catch (error) {
    console.error("Error fetching event by id:", error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}
