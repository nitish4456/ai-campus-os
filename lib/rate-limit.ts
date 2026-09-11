import { NextResponse } from "next/server";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitStore>();

// Cleanup stale entries every 5 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  limit: number;       // Maximum requests allowed within duration window
  windowMs: number;    // Window duration in milliseconds
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 15, windowMs: 60 * 1000 }
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetMs: config.windowMs,
    };
  }

  if (record.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetMs: record.resetTime - now,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: config.limit - record.count,
    resetMs: record.resetTime - now,
  };
}

export function rateLimitResponse(resetMs: number) {
  const seconds = Math.ceil(resetMs / 1000);
  return NextResponse.json(
    {
      error: "Too many requests. Please try again shortly.",
      retryAfterSeconds: seconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(seconds),
      },
    }
  );
}
