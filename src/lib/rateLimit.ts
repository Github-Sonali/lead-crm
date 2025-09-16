import { RateLimiterMemory } from "rate-limiter-flexible";

const limiter = new RateLimiterMemory({
  points: 10, // 10 requests
  duration: 60, // per 60 seconds
});

export async function consumeRateLimit(key: string) {
  try {
    await limiter.consume(key);
    return true;
  } catch (e) {
    return false;
  }
}
