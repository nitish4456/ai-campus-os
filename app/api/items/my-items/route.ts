import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Item from "@/models/Item";

export async function GET() {
  try {
    const dbUser = await getCurrentDbUser();

    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const items = await Item.find({ userId: dbUser._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching user items:", error);
    return NextResponse.json({ error: "Failed to fetch user items" }, { status: 500 });
  }
}
