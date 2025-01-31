const rateLimit = require('express-rate-limit');

// IGDB API rate limits: Max 4 requests per second
const gameSearchLimiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 4, // Limit each IP to 4 requests per second
    message: { error: "Rate limit exceeded. You can only make 4 requests per second." },
    headers: true,
    standardHeaders: true, // Includes `RateLimit-*` headers in response
    legacyHeaders: false, // Disables `X-RateLimit-*` headers
});

// Middleware to prevent more than 8 concurrent requests (queue them)
const concurrentRequestLimiter = (req, res, next) => {
    const maxConcurrentRequests = 8;
    const ongoingRequests = new Set();

    if (ongoingRequests.size >= maxConcurrentRequests) {
        return res.status(429).json({ error: "Too many concurrent requests. Please try again later." });
    }

    ongoingRequests.add(req);
    res.on("finish", () => ongoingRequests.delete(req)); // Remove when request finishes

    next();
};

module.exports = { gameSearchLimiter, concurrentRequestLimiter };
