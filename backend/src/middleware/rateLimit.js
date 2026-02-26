import { RateLimiterMemory } from "rate-limiter-flexible";

const limiter = new RateLimiterMemory({ points: 30, duration: 60 }); // 30 req/min per IP

export async function rateLimit(req, res, next) {
  try {
    await limiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ error: "Too many requests. Try again later." });
  }
}