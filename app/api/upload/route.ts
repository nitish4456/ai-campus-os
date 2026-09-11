import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const dbUser = await getCurrentDbUser();
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // Rate Limiting Protection (10 uploads / minute per authenticated user)
    const rateLimit = checkRateLimit(`image_upload:${dbUser._id}`, { limit: 10, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetMs);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate size: 5MB maximum
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "Image size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Validate image format
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "Only JPG, PNG and WEBP images are allowed" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const fileUri = `data:${file.type};base64,${base64Data}`;

    // Attempt Cloudinary upload
    try {
      const uploadRes = await uploadImage(fileUri, "uninest-lost-found");
      if (uploadRes && uploadRes.secure_url) {
        return NextResponse.json({
          success: true,
          url: uploadRes.secure_url,
          publicId: uploadRes.public_id,
        });
      }
    } catch (cloudinaryError: any) {
      console.warn(
        "Cloudinary upload fallback to inline data URI:",
        cloudinaryError?.message || cloudinaryError
      );
    }

    // Fallback to Base64 Data URI if Cloudinary is unconfigured or unavailable
    return NextResponse.json({
      success: true,
      url: fileUri,
    });
  } catch (error: any) {
    console.error("Image upload server error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process image upload" },
      { status: 500 }
    );
  }
}
