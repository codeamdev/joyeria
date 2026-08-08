import { RateLimiterMemory } from "rate-limiter-flexible";

// En memoria: suficiente para un único proceso Node en un VPS. Si en el futuro
// se despliega en varias instancias, cambiar a un backend compartido (Redis).
export const loginRateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 15 * 60,
  blockDuration: 15 * 60,
});

export const contactFormRateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 60,
});

export const customOrderRateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 60,
});

export async function checkRateLimit(
  limiter: RateLimiterMemory,
  key: string,
): Promise<{ allowed: true } | { allowed: false; retryAfterSeconds: number }> {
  try {
    await limiter.consume(key);
    return { allowed: true };
  } catch (rejection) {
    const retryAfterSeconds =
      rejection && typeof rejection === "object" && "msBeforeNext" in rejection
        ? Math.ceil((rejection as { msBeforeNext: number }).msBeforeNext / 1000)
        : 60;
    return { allowed: false, retryAfterSeconds };
  }
}
