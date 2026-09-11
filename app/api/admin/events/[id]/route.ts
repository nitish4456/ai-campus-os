import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/db";
import Event from "@/models/Event";
import { getCurrentDbUser } from "@/lib/auth";
import { isValidExternalUrl } from "@/lib/utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const dbUser = await getCurrentDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    let event: any = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      event = await Event.findById(id).lean();
    } else {
      event = await Event.findOne({ externalEventId: id }).lean();
    }

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      event: {
        ...event,
        title: event.title || event.name,
      },
    });
  } catch (error: any) {
    console.error("Error fetching admin event:", error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const dbUser = await getCurrentDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    await connectToDatabase();

    const validBooking = isValidExternalUrl(body.bookingUrl) ? body.bookingUrl.trim() : "";
    const validSource = isValidExternalUrl(body.sourceUrl) ? body.sourceUrl.trim() : "";

    const updateFields: any = {
      name: body.title || body.name,
      title: body.title || body.name,
      description: body.description || "",
      category: body.category || "Technology",
      date: body.date ? new Date(body.date) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      time: body.time || "",
      location: body.location || "",
      city: body.city || "Campus",
      imageUrl: body.imageUrl || "",
      bookingUrl: validBooking,
      registrationLink: validBooking,
      source: body.source || "UniNest",
      sourceUrl: validSource,
      tags: body.tags || [],
      isExternal: Boolean(body.isExternal),
      organizer: body.organizer || body.source || "",
    };

    const updatedEvent = await Event.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).lean();

    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      message: "Event updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating admin event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const dbUser = await getCurrentDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting admin event:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const dbUser = await getCurrentDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const original = await Event.findById(id).lean();
    if (!original) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const duplicatedEvent = await Event.create({
      createdBy: dbUser._id,
      name: `${original.name || original.title} (Copy)`,
      title: `${original.title || original.name} (Copy)`,
      description: original.description,
      category: original.category,
      date: original.date,
      endDate: original.endDate,
      time: original.time,
      location: original.location,
      city: original.city,
      imageUrl: original.imageUrl,
      bookingUrl: original.bookingUrl,
      registrationLink: original.registrationLink,
      source: original.source,
      sourceUrl: original.sourceUrl,
      tags: original.tags,
      isExternal: original.isExternal,
      organizer: original.organizer,
    });

    return NextResponse.json({
      success: true,
      event: duplicatedEvent,
      message: "Event duplicated successfully",
    });
  } catch (error: any) {
    console.error("Error duplicating admin event:", error);
    return NextResponse.json({ error: "Failed to duplicate event" }, { status: 500 });
  }
}
