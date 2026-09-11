import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Opportunity from "@/models/Opportunity";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const opportunity = await Opportunity.findById(id)
      .populate("createdBy", "name email")
      .populate("interestedUsers", "name email")
      .lean();

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    return NextResponse.json({ opportunity });
  } catch (error) {
    console.error("Error fetching opportunity by id:", error);
    return NextResponse.json({ error: "Failed to fetch opportunity" }, { status: 500 });
  }
}
