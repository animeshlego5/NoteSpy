/**
 * Rate Limiting Utility
 * Implements a sliding window rate limiter using in-memory storage
 */

interface RateLimitConfig {
    maxRequests: number;    // Maximum requests allowed per window
    windowMs: number;       // Time window in milliseconds
    message?: string;       // Custom error message
}

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store for rate limiting
// Note: In production with multiple instances, use Redis
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;

    lastCleanup = now;
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetTime < now) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Extract client IP from request headers
 */
export function getClientIP(request: Request): string {
    // Check x-forwarded-for header (common for proxied requests)
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        // Take the first IP in the chain (original client)
        return forwardedFor.split(',')[0].trim();
    }

    // Check x-real-ip header
    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    // Fallback to a generic identifier
    return 'unknown';
}

/**
 * Check if a request should be rate limited
 * @returns Object with limited status and headers
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): {
    limited: boolean;
    remaining: number;
    resetTime: number;
    headers: Record<string, string>;
} {
    cleanupExpiredEntries();

    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    // Initialize or reset if window expired
    if (!entry || entry.resetTime < now) {
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return {
            limited: false,
            remaining: config.maxRequests - 1,
            resetTime: now + config.windowMs,
            headers: {
                'X-RateLimit-Limit': config.maxRequests.toString(),
                'X-RateLimit-Remaining': (config.maxRequests - 1).toString(),
                'X-RateLimit-Reset': new Date(now + config.windowMs).toISOString(),
            },
        };
    }

    // Increment count
    entry.count++;

    const remaining = Math.max(0, config.maxRequests - entry.count);
    const limited = entry.count > config.maxRequests;

    return {
        limited,
        remaining,
        resetTime: entry.resetTime,
        headers: {
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
            ...(limited && { 'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString() }),
        },
    };
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
    // Audio matching - more restrictive (expensive operation)
    matchProxy: {
        maxRequests: 10,       // 10 requests
        windowMs: 60 * 1000,   // per minute
        message: 'Too many song matching requests. Please wait a moment before trying again.',
    },
    // iTunes search - less restrictive
    itunesSearch: {
        maxRequests: 30,       // 30 requests
        windowMs: 60 * 1000,   // per minute
        message: 'Too many search requests. Please slow down.',
    },
    // Recommendations - lightweight GET endpoint
    recommendations: {
        maxRequests: 20,       // 20 requests
        windowMs: 60 * 1000,   // per minute
        message: 'Too many recommendation requests. Please wait a moment.',
    },
    // General API rate limit
    general: {
        maxRequests: 100,      // 100 requests
        windowMs: 60 * 1000,   // per minute
        message: 'Rate limit exceeded. Please try again later.',
    },
} as const;
