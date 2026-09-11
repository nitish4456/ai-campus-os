import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentDbUser } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Opportunity from "@/models/Opportunity";

const opportunitySchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().optional().default(""),
  category: z.string().optional().default("Project"),
  requiredSkills: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  teamSize: z.number().optional().default(2),
});

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const skill = searchParams.get("skill");
    const search = searchParams.get("search");

    const query: any = {};

    if (category && category !== "all") {
      query.category = category;
    }

    if (skill && skill !== "all") {
      query.requiredSkills = { $in: [new RegExp(skill, "i")] };
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { requiredSkills: { $in: [searchRegex] } },
        { tags: { $in: [searchRegex] } },
      ];
    }

    const opportunities = await Opportunity.find(query)
      .populate("createdBy", "name email")
      .populate("interestedUsers", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const dbUser = await getCurrentDbUser();

    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = opportunitySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid opportunity data", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    await connectToDatabase();

    const newOpportunity = await Opportunity.create({
      createdBy: dbUser._id,
      title: data.title,
      description: data.description,
      category: data.category,
      requiredSkills: data.requiredSkills,
      tags: data.tags,
      teamSize: data.teamSize,
      interestedUsers: [],
    });

    return NextResponse.json({
      opportunity: newOpportunity,
      message: "Opportunity created successfully",
    });
  } catch (error) {
    console.error("Error creating opportunity:", error);
    return NextResponse.json({ error: "Failed to create opportunity" }, { status: 500 });
  }
}
