import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { rateLimit } from "express-rate-limit";

// Configure request rate limiter for public APIs
export const apiRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    handler: function (req: Request, res: Response, next: NextFunction) {
        console.log("Too many requests from " + req.ip);

        return res.status(429).json({
            error: "You have sent too many requests. Please wait a while then try again.",
        });
    },
});
