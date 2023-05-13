import { NextFunction, Request, Response, Router } from "express";
import { body, validationResult } from "express-validator";
import * as FileService from "../services/file.service";
const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await FileService.listFiles();
        return res.status(200).json(users);
    } catch (error: any) {
        next(error);
    }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const file = await FileService.getFile(parseInt(req.params.id, 10));
        if (file) {
            return res.status(200).json(file);
        }
        return res.status(404).json({ error: "File not found" });
    } catch (error: any) {
        next(error);
    }
});

router.post(
    "/",
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
            const file = req.body;
            // file.userId = req.user.id
            const newFile = await FileService.createFile(file);
            return res.status(201).json(newFile);
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
            const file = req.body;
            // req.user.id = parseInt(req.params.id, 10);
            // else throw
            const updatedFile = await FileService.updateFile(file, parseInt(req.params.id, 10));
            return res.status(200).json(updatedFile);
        } catch (error: any) {
            next(error);
        }
    },
);

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        // req.user.id = parseInt(req.params.id, 10);
        // else throw
        const deletedFile = await FileService.deleteFile(parseInt(req.params.id, 10));
        return res.status(200).json(deletedFile);
    } catch (error: any) {
        next(error);
    }
});

// Export the router
export default router;
