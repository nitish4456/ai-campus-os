import { GoogleGenAI } from "@google/genai";

export interface LLMResponse {
  reply: string;
  geminiCalled: boolean;
  geminiSuccess: boolean;
  error?: string;
}

const SYSTEM_PROMPT = `You are Friday, the intelligent AI assistant for UniNest, an intelligent campus platform.

You are friendly, helpful, intelligent, and conversational.

You help students with:
- Campus events
- Lost and found
- Student skills
- Finding teammates
- Opportunities
- Campus information
- General questions
- Programming and technology
- Student guidance

When campus database information is provided, use that information accurately and do not invent campus-specific facts.

When no campus data is available, you can still answer general questions normally.

When introducing yourself, say:
"Hi! I'm Friday, your AI assistant for UniNest. How can I help you today?"

Do not refer to yourself as AI Campus Assistant or AI Campus OS Assistant.

Always identify yourself as Friday when appropriate.`;

export async function generateHybridResponse(
  userQuestion: string,
  retrievedContext: string,
  hasCampusContext: boolean
): Promise<LLMResponse> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  const isKeyValid = Boolean(apiKey && apiKey !== "your_gemini_api_key");

  if (!isKeyValid) {
    console.warn("⚠️ GEMINI_API_KEY is missing or set to placeholder. Using conversational fallback engine.");
    return {
      reply: generateFallbackResponse(userQuestion, retrievedContext, hasCampusContext),
      geminiCalled: false,
      geminiSuccess: false,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    let userPrompt = "";
    if (hasCampusContext && retrievedContext) {
      userPrompt = `CAMPUS DATABASE CONTEXT:
${retrievedContext}

USER QUESTION: ${userQuestion}

Instructions: Answer the user's question using the provided campus database context. Do not invent non-existent campus facts. Identify yourself as Friday if appropriate.`;
    } else {
      userPrompt = `USER QUESTION: ${userQuestion}

Instructions: Respond naturally as Friday, the AI assistant for UniNest. Respond friendly to greetings, casual conversation, general knowledge, or programming questions. If the user asked about a specific campus item or event that is not in the database, politely state that no matching campus records were found while offering helpful general guidance.`;
    }

    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro",
    ];
    let responseText = "";
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: "user",
              parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }],
            },
          ],
        });

        if (response.text) {
          responseText = response.text.trim();
          break;
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (responseText) {
      return {
        reply: responseText,
        geminiCalled: true,
        geminiSuccess: true,
      };
    }

    throw lastError || new Error("Empty response returned from Gemini API");
  } catch (error: any) {
    console.error("❌ Gemini API call error:", error?.message || error);
    return {
      reply: generateFallbackResponse(userQuestion, retrievedContext, hasCampusContext),
      geminiCalled: true,
      geminiSuccess: false,
      error: error?.message || "Gemini API failure",
    };
  }
}

// Backward-compatibility wrapper for existing function signature
export async function generateGroundedResponse(
  userQuestion: string,
  retrievedContext: string,
  hasCampusContext: boolean = false
): Promise<string> {
  const result = await generateHybridResponse(userQuestion, retrievedContext, hasCampusContext);
  return result.reply;
}

function generateFallbackResponse(
  userQuestion: string,
  retrievedContext: string,
  hasCampusContext: boolean
): string {
  const lower = userQuestion.toLowerCase().trim();

  // Greetings
  if (/^(hello|hi|hey|greetings|good morning|good afternoon|good evening|howdy)/i.test(lower)) {
    return "Hi! I'm Friday, your AI assistant for UniNest. How can I help you today?";
  }

  // Casual query
  if (/^(how are you|how's it going|what's up)/i.test(lower)) {
    return "I'm doing great, thank you! I'm Friday, ready to help you discover campus events, report lost items, or match with team project opportunities.";
  }

  // General questions & programming terms
  if (lower.includes("machine learning") || lower.includes("what is ml")) {
    return "Machine Learning (ML) is a branch of artificial intelligence focused on building applications that learn from data and improve their accuracy over time without being explicitly programmed.";
  }
  if (lower.includes("html")) {
    return "HTML (HyperText Markup Language) is the standard markup language used to structure web pages and their content.";
  }
  if (lower.includes("javascript")) {
    return "JavaScript is a versatile programming language used to create interactive web applications on both the client and server sides.";
  }
  if (lower.includes("python")) {
    return "Python is a popular high-level programming language widely used in AI, data science, web development, and automation.";
  }
  if (lower.includes("react")) {
    return "React is an open-source JavaScript library for building user interfaces based on reusable components.";
  }

  // Grounded context fallback if available
  if (hasCampusContext && retrievedContext && !retrievedContext.includes("NO RELEVANT CAMPUS RECORDS FOUND")) {
    const lines = retrievedContext.split("\n").filter((l) => l.startsWith("- "));
    
    // Check if user specifically requested a booking link
    if (/\b(booking link|registration link|link|first one|second one|ticket|booking url)\b/i.test(lower)) {
      const firstWithLink = lines.find((l) => l.includes("Booking URL: http"));
      if (firstWithLink) {
        const titleMatch = firstWithLink.match(/Event Title: "([^"]+)"/);
        const urlMatch = firstWithLink.match(/Booking URL: (https?:\/\/[^\s|]+)/);
        if (urlMatch) {
          return `Here is the official booking link for ${titleMatch ? `"${titleMatch[1]}"` : "the event"}:\n\n🎟 **Booking Link**: ${urlMatch[1]}`;
        }
      }
    }

    return `I found ${lines.length} events for you:\n\n${lines.map((l, index) => {
      const titleMatch = l.match(/Event Title: "([^"]+)"/) || l.match(/Event Name: "([^"]+)"/);
      const dateMatch = l.match(/Date: ([^|]+)/);
      const locMatch = l.match(/Location: ([^|]+)/);
      const cityMatch = l.match(/City: ([^|]+)/);
      const srcMatch = l.match(/Source: ([^|]+)/);
      const urlMatch = l.match(/Booking URL: (https?:\/\/[^\s|]+)/) || l.match(/Booking Link: (https?:\/\/[^\s|]+)/);

      const title = titleMatch ? titleMatch[1] : "Event";
      const date = dateMatch ? dateMatch[1].trim() : "TBA";
      const city = cityMatch ? cityMatch[1].trim() : "";
      const loc = locMatch ? locMatch[1].trim() : city || "Campus";
      const src = srcMatch ? srcMatch[1].trim() : "UniNest Campus";
      const url = urlMatch ? urlMatch[1] : null;

      const displayLoc = city && !loc.toLowerCase().includes(city.toLowerCase()) ? `${loc}, ${city}` : loc;

      return `${index + 1}. **${title}**\n📍 ${displayLoc}\n📅 ${date}\n🎟 Booking ${url ? `available via ${src}` : `available (${src})`}`;
    }).join("\n\n")}\n\nWould you like me to get you any specific booking links?`;
  }

  return "Hi there! I'm Friday, your AI assistant for UniNest. Feel free to ask me general questions, search upcoming events, report lost items, or check out project opportunities!";
}
