import rateLimit from "express-rate-limit"
export default (options) => {
    const limiter = rateLimit({
        windowMs: options.windowMs || 60 * 1000, // 1 minute by default
        max: options.max || 100, // 100 requests per windowMs by default
        message: options.message || "Too many requests, please try again later."
    });

    return limiter;
}