import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export const ErrorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const { code, meta } = err;
        if (meta?.cause) {
            res.status(500).json({ error: meta.cause });
        } else if (meta?.target) {
            res.status(500).json({ error: `${meta.target} field failed` });
        } else {
            res.status(500).json({ error: `An error occurred: ${err.message}` });
        }
    } else {
        res.status(500).json({ error: `An error occurred: ${err.message}` });
    }
};
