import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Item from "@/models/Item";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dbUser = await getCurrentDbUser();

    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !["ACTIVE", "RETURNED", "REMOVED", "active", "resolved"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    await connectToDatabase();
    const item = await Item.findById(id);

    if (!item) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Ownership Verification
    if (item.userId.toString() !== dbUser._id.toString()) {
      return NextResponse.json(
        { error: "Forbidden: You can only update your own reports" },
        { status: 403 }
      );
    }

    item.status = status.toUpperCase() as any;
    await item.save();

    return NextResponse.json({
      item,
      message: `Item status updated to ${item.status}!`,
    });
  } catch (error) {
    console.error("Error updating item status:", error);
    return NextResponse.json({ error: "Failed to update item status" }, { status: 500 });
  }
}
