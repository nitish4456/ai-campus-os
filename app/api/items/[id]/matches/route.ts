import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Item from "@/models/Item";
import Match from "@/models/Match";
import { calculateItemScore } from "@/lib/matching/itemScore";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const targetItem = await Item.findById(id).lean();

    if (!targetItem) {
      return NextResponse.json({ error: "Target item not found" }, { status: 404 });
    }

    // Do not return matches if the target item is returned or removed
    const isActive = targetItem.status === "ACTIVE" || targetItem.status === "active";
    if (!isActive) {
      return NextResponse.json({ matches: [] });
    }

    // Opposite type: lost -> found, found -> lost
    const oppositeType = targetItem.type === "lost" ? "found" : "lost";

    // Query active candidate items of opposite type
    const candidateItems = await Item.find({
      _id: { $ne: targetItem._id },
      type: oppositeType,
      status: { $in: ["ACTIVE", "active"] },
    })
      .populate("userId", "name email")
      .lean();

    // Compute scores for each candidate item
    const matchesWithScores = candidateItems.map((candidate) => {
      const matchResult = calculateItemScore(targetItem, candidate);
      return {
        candidateItem: candidate,
        score: matchResult.score,
        reasons: matchResult.reasons,
      };
    });

    // Filter to matches >= 40% and sort descending
    const filteredMatches = matchesWithScores
      .filter((m) => m.score >= 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // top 3

    // Persist matches in MongoDB
    for (const m of filteredMatches) {
      await Match.findOneAndUpdate(
        {
          sourceItemId: targetItem._id,
          targetItemId: m.candidateItem._id,
        },
        {
          $set: {
            score: m.score,
            reasons: m.reasons,
            createdAt: new Date(),
          },
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    return NextResponse.json({
      matches: filteredMatches.map((m) => ({
        score: m.score,
        reasons: m.reasons,
        item: m.candidateItem,
      })),
    });
  } catch (error) {
    console.error("Error generating item matches:", error);
    return NextResponse.json({ error: "Failed to generate item matches" }, { status: 500 });
  }
}
