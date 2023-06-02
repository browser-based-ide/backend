import { NextFunction, Request, Response, Router } from "express";
import { body, validationResult } from "express-validator";
import { checkJwt } from "../middleware/auth0";
import * as UserService from "../services/user.service";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.query;
    console.log(email);

    if (email) {
        try {
            const user = await UserService.getUserByEmail(email as string);
            return res.status(200).json(user);
        } catch (error: any) {
            next(error);
        }
    } else {
        try {
            const users = await UserService.listUser();
            return res.status(200).json(users);
        } catch (error: any) {
            next(error);
        }
    }
});

router.get("/:id", checkJwt, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserService.getUser(parseInt(req.params.id, 10));
        if (user) {
            return res.status(200).json(user);
        }
        return res.status(200).json({ error: "User not found" });
    } catch (error: any) {
        next(error);
    }
});

router.post(
    "/",
    body("email").isEmail(),
    body("firstName").isString().isLength({ min: 1 }),
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const user = req.body;
            const newUser = await UserService.createUser(user);
            return res.status(201).json(newUser);
        } catch (error: any) {
            console.log(error);
            next(error);
        }
    },
);

router.put(
    "/:id",
    body("firstName").isString().isLength({ min: 1 }),
    body("lastName").isString().isLength({ min: 1 }),
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const user = req.body;
            // req.user.id = parseInt(req.params.id, 10);
            // else throw
            const updatedUser = await UserService.updateUser(user, parseInt(req.params.id, 10));
            return res.status(200).json(updatedUser);
        } catch (error: any) {
            next(error);
        }
    },
);

router.delete("/:id", checkJwt, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // req.user.id = parseInt(req.params.id, 10);
        // else throw
        const deletedUser = await UserService.deleteUser(parseInt(req.params.id, 10));
        return res.status(200).json(deletedUser);
    } catch (error: any) {
        next(error);
    }
});

// Export the router
export default router;
