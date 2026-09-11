import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentDbUser } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Item from "@/models/Item";

const createItemSchema = z.object({
  type: z.enum(["lost", "found"]).optional().default("lost"),
  itemName: z.string().min(1, "Item name is required").trim(),
  description: z.string().min(1, "Description is required").trim(),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required").trim(),
  date: z.string().or(z.date()).optional(),
  imageUrl: z.string().optional().default(""),
  contactPreference: z.string().optional().default("email"),
});

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Strictly filter to active items for public view
    const query: any = {
      status: { $in: ["ACTIVE", "active"] },
    };

    if (type && type !== "all") {
      query.type = type;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { itemName: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
      ];
    }

    const items = await Item.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const dbUser = await getCurrentDbUser();

    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = createItemSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      const firstError =
        errors.itemName?.[0] ||
        errors.description?.[0] ||
        errors.location?.[0] ||
        errors.category?.[0] ||
        "Invalid item data";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = validationResult.data;

    await connectToDatabase();

    const newItem = await Item.create({
      userId: dbUser._id,
      type: "lost", // Always report lost items
      itemName: data.itemName,
      description: data.description,
      category: data.category,
      location: data.location,
      date: data.date ? new Date(data.date) : new Date(),
      imageUrl: data.imageUrl,
      contactPreference: data.contactPreference,
      status: "ACTIVE",
    });

    return NextResponse.json({
      item: newItem,
      message: "Lost item reported successfully!",
    });
  } catch (error) {
    console.error("Error creating lost item:", error);
    return NextResponse.json({ error: "Failed to report lost item" }, { status: 500 });
  }
}
