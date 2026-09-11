import { NextResponse } from "next/server";
import { searchCampusOS } from "@/lib/search";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    if (!q.trim()) {
      return NextResponse.json({ events: [], opportunities: [], items: [] });
    }

    const results = await searchCampusOS(q);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error executing cross-platform search:", error);
    return NextResponse.json(
      { error: "Failed to perform campus search" },
      { status: 500 }
    );
  }
}
