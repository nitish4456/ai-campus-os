import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Conversation from "@/models/Conversation";
import { routeAndRetrieveContext } from "@/lib/assistant/router";
import { generateHybridResponse } from "@/lib/llm";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { aiChatSchema } from "@/lib/validations/schemas";

export async function POST(req: Request) {
  try {
    const dbUser = await getCurrentDbUser();

    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate Limiting Protection (15 requests / minute per authenticated user)
    const rateLimit = checkRateLimit(`ai_chat:${dbUser._id}`, { limit: 15, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetMs);
    }

    const body = await req.json();
    const validationResult = aiChatSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.flatten().fieldErrors.message?.[0] || "Invalid request payload";
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      );
    }

    const { message, conversationId } = validationResult.data;

    // 1. Intent Routing & Context Retrieval
    const { contextText, references, hasCampusContext, resultCount, eventsCount, intentDetected } = await routeAndRetrieveContext(message);

    // 2. Generate Hybrid Response via LLM
    const llmResult = await generateHybridResponse(message, contextText, hasCampusContext);
    const reply = llmResult.reply;

    // Dev Server Logging
    console.log("----------------------------------------");
    console.log("🤖 FRIDAY AI ASSISTANT CHAT REQUEST:");
    console.log(`- User Query: "${message}"`);
    console.log(`- Intent Detected: ${intentDetected}`);
    console.log(`- Campus Context Found: ${hasCampusContext}`);
    console.log(`- Number of Events Returned: ${eventsCount}`);
    console.log(`- Number of Total References: ${resultCount}`);
    console.log(`- Gemini API Called: ${llmResult.geminiCalled}`);
    console.log(`- Gemini API Success: ${llmResult.geminiSuccess}`);
    if (llmResult.error) {
      console.log(`- Gemini Error: ${llmResult.error}`);
    }
    console.log("----------------------------------------");

    // 3. Persist Conversation in MongoDB
    await connectToDatabase();

    let conversation;

    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        userId: dbUser._id,
      });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        userId: dbUser._id,
        messages: [],
      });
    }

    const now = new Date();

    // Cap message history length (keep last 20 messages)
    conversation.messages.push({
      role: "user",
      content: message,
      timestamp: now,
    });

    conversation.messages.push({
      role: "assistant",
      content: reply,
      timestamp: now,
    });

    if (conversation.messages.length > 20) {
      conversation.messages = conversation.messages.slice(-20);
    }

    await conversation.save();

    return NextResponse.json({
      reply,
      references,
      conversationId: String(conversation._id),
    });
  } catch (error) {
    console.error("Error processing assistant chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const dbUser = await getCurrentDbUser();

    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const conversation = await Conversation.findOne({ userId: dbUser._id })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      conversation: conversation || null,
    });
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation history" },
      { status: 500 }
    );
  }
}
