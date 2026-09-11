import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    const dbUser = await getCurrentDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      profileImage: dbUser.profileImage || null,
      name: dbUser.name,
    });
  } catch (error) {
    console.error("Error fetching profile photo:", error);
    return NextResponse.json({ error: "Failed to fetch profile photo" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const dbUser = await getCurrentDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing profile image URL" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: dbUser.clerkId },
      { $set: { profileImage: imageUrl } },
      { new: true }
    );

    return NextResponse.json({
      user: updatedUser,
      profileImage: updatedUser?.profileImage || imageUrl,
      message: "Profile picture updated successfully.",
    });
  } catch (error) {
    console.error("Error updating profile photo:", error);
    return NextResponse.json({ error: "Failed to update profile photo" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const dbUser = await getCurrentDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: dbUser.clerkId },
      { $set: { profileImage: null } },
      { new: true }
    );

    return NextResponse.json({
      user: updatedUser,
      profileImage: null,
      message: "Profile picture removed.",
    });
  } catch (error) {
    console.error("Error removing profile photo:", error);
    return NextResponse.json({ error: "Failed to remove profile photo" }, { status: 500 });
  }
}
