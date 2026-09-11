import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Opportunity from "@/models/Opportunity";
import { calculateOpportunityScore } from "@/lib/matching/opportunityScore";

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

    const opportunity = await Opportunity.findById(id).lean();

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    const matchResult = calculateOpportunityScore(dbUser, opportunity as any);

    return NextResponse.json({
      score: matchResult.score,
      reasons: matchResult.reasons,
    });
  } catch (error) {
    console.error("Error calculating opportunity match:", error);
    return NextResponse.json({ error: "Failed to calculate compatibility" }, { status: 500 });
  }
}
