import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Item from "@/models/Item";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const item = await Item.findById(id).populate("userId", "name email").lean();

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error fetching item by id:", error);
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dbUser = await getCurrentDbUser();

    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const item = await Item.findById(id);

    if (!item) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Ownership Verification
    if (item.userId.toString() !== dbUser._id.toString()) {
      return NextResponse.json(
        { error: "Forbidden: You can only edit your own reports" },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (body.itemName) item.itemName = body.itemName.trim();
    if (body.description) item.description = body.description.trim();
    if (body.category) item.category = body.category;
    if (body.location) item.location = body.location.trim();
    if (body.date) item.date = new Date(body.date);
    if (typeof body.imageUrl === "string") item.imageUrl = body.imageUrl.trim();

    await item.save();

    return NextResponse.json({
      item,
      message: "Report updated successfully!",
    });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(req, { params });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dbUser = await getCurrentDbUser();

    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const item = await Item.findById(id);

    if (!item) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Ownership Verification
    if (item.userId.toString() !== dbUser._id.toString()) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own reports" },
        { status: 403 }
      );
    }

    await Item.findByIdAndDelete(id);

    return NextResponse.json({ message: "Lost item report deleted successfully!" });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}
