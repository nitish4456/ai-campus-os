import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Opportunity from "@/models/Opportunity";

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

    // $addToSet is idempotent in MongoDB
    const updatedOpportunity = await Opportunity.findByIdAndUpdate(
      id,
      { $addToSet: { interestedUsers: dbUser._id } },
      { new: true }
    )
      .populate("createdBy", "name email")
      .populate("interestedUsers", "name email");

    if (!updatedOpportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    return NextResponse.json({
      opportunity: updatedOpportunity,
      message: "Expressed interest successfully!",
    });
  } catch (error) {
    console.error("Error expressing interest in opportunity:", error);
    return NextResponse.json({ error: "Failed to express interest" }, { status: 500 });
  }
}
