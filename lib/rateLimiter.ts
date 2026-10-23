import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Robust In-Memory Sliding Window Fallback
class InMemoryRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowSeconds: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowSeconds * 1000;
  }

  async limit(identifier: string) {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) || [];
    const validTimestamps = timestamps.filter((t) => now - t < this.windowMs);

    if (validTimestamps.length >= this.maxRequests) {
      const oldest = validTimestamps[0];
      const reset = oldest + this.windowMs;
      return {
        success: false,
        remaining: 0,
        reset,
      };
    }

    validTimestamps.push(now);
    this.requests.set(identifier, validTimestamps);

    // Periodic cleanup of stale keys
    if (this.requests.size > 1000) {
      for (const [key, times] of this.requests.entries()) {
        if (times.every((t) => now - t >= this.windowMs)) {
          this.requests.delete(key);
        }
      }
    }

    return {
      success: true,
      remaining: this.maxRequests - validTimestamps.length,
      reset: now + this.windowMs,
    };
  }
}

const memoryChatLimiter = new InMemoryRateLimiter(30, 60); // 30 requests/minute
const memoryAnalyzeLimiter = new InMemoryRateLimiter(5, 3600); // 5 requests/hour
const memoryUploadLimiter = new InMemoryRateLimiter(10, 3600); // 10 requests/hour

let upstashChatLimit: Ratelimit | null = null;
let upstashAnalyzeLimit: Ratelimit | null = null;
let upstashUploadLimit: Ratelimit | null = null;

const hasUpstash =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

if (hasUpstash) {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    upstashChatLimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      analytics: false,
    });

    upstashAnalyzeLimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: false,
    });

    upstashUploadLimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      analytics: false,
    });
  } catch (e) {
    console.warn("Failed to initialize Upstash Redis, using in-memory rate limiter:", e);
  }
}

export const chatRateLimit = {
  async limit(identifier: string) {
    if (upstashChatLimit) {
      try {
        return await upstashChatLimit.limit(identifier);
      } catch (err) {
        // Network/DNS/Upstash error: failover gracefully to in-memory limiter
        return memoryChatLimiter.limit(identifier);
      }
    }
    return memoryChatLimiter.limit(identifier);
  },
};

export const analyzeRateLimit = {
  async limit(identifier: string) {
    if (upstashAnalyzeLimit) {
      try {
        return await upstashAnalyzeLimit.limit(identifier);
      } catch (err) {
        return memoryAnalyzeLimiter.limit(identifier);
      }
    }
    return memoryAnalyzeLimiter.limit(identifier);
  },
};

export const uploadRateLimit = {
  async limit(identifier: string) {
    if (upstashUploadLimit) {
      try {
        return await upstashUploadLimit.limit(identifier);
      } catch (err) {
        return memoryUploadLimiter.limit(identifier);
      }
    }
    return memoryUploadLimiter.limit(identifier);
  },
};

export default upstashChatLimit;