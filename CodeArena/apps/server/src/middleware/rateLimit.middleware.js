
import {
    RateLimiterRedis,
    RateLimiterRes
} from "rate-limiter-flexible";

import redis from "../redis.js";

const createRateLimit = ({ keyPrefix, points, duration }) => {
    const limiter = new RateLimiterRedis({
        storeClient: redis,
        keyPrefix,
        points,
        duration
    });

    return async (req, res, next) => {
        const key = req.ip || req.socket.remoteAddress;

        try {
            await limiter.consume(key);
            next();
        } catch (error) {
            if (error instanceof RateLimiterRes) {
                const retryAfter = Math.ceil(
                    error.msBeforeNext / 1000
                );

                res.set("Retry-After", String(retryAfter));

                return res.status(429).json({
                    error: "Too many requests. Please try again later.",
                    retryAfter
                });
            }

            next(error);
        }
    };
};

export const registerRateLimit = createRateLimit({
    keyPrefix: "rate-limit:register",
    points: 5,
    duration: 900
});

export const verifyEmailRateLimit = createRateLimit({
    keyPrefix: "rate-limit:verify-email",
    points: 10,
    duration: 900
});

export const loginRateLimit = createRateLimit({
    keyPrefix: "rate-limit:login",
    points: 10,
    duration: 15 * 60
});