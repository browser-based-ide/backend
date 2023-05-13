import { NextFunction, Request, Response, Router } from "express";
import { body, validationResult } from "express-validator";
import * as sessionService from "../services/session.service";
const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sessions = await sessionService.listSession();
        return res.status(200).json(sessions);
    } catch (error: any) {
        next(error);
    }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await sessionService.getSession(parseInt(req.params.id, 10));
        if (session) {
            return res.status(200).json(session);
        }
        return res.status(404).json({ error: "File not found" });
    } catch (error: any) {
        next(error);
    }
});

router.post(
    "/",
    body("startTime").isString(),
    body("endTime").isString(),
    body("note").isString(),
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const session = req.body;
            // file.userId = req.user.id
            const newSession = await sessionService.createSession(session);
            return res.status(201).json(newSession);
        } catch (error: any) {
            next(error);
        }
    },
);

router.put(
    "/:id",
    body("language").isString(),
    body("code").isString(),
    body("title").isString(),
    body("question").isString(),
    body("label").isString(),
    body("output").isString(),
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const updateSession = req.body;
            // req.user.id = parseInt(req.params.id, 10);
            // else throw
            const updatedSession = await sessionService.updateSession(updateSession, parseInt(req.params.id, 10));
            return res.status(200).json(updatedSession);
        } catch (error: any) {
            next(error);
        }
    },
);

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        // req.user.id = parseInt(req.params.id, 10);
        // else throw
        const deletedSession = await sessionService.deleteSession(parseInt(req.params.id, 10));
        return res.status(200).json(deletedSession);
    } catch (error: any) {
        next(error);
    }
});

// Export the router
export default router;
