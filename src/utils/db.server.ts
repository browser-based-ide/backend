import { PrismaClient } from "@prisma/client";

export interface Context {
    prisma: PrismaClient;
}

const prisma = new PrismaClient();

const createContext = (): Context => {
    return { prisma };
};

export interface DbContext {
    prisma: PrismaClient;
}

const context = createContext();

export const dbContext: DbContext = {
    prisma: context.prisma,
};
