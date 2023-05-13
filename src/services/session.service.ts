import { Session } from "@prisma/client";
import { dbContext } from "../utils/db.server";

export const listSession = async (): Promise<Session[]> => {
    return await dbContext.prisma.session.findMany();
};

export const getSession = async (id: number): Promise<Session | null> => {
    return await dbContext.prisma.session.findUnique({
        where: {
            id,
        },
    });
};

export const createSession = async (newSession: Omit<Session, "id">): Promise<Session> => {
    return await dbContext.prisma.session.create({
        data: newSession,
    });
};

export const updateSession = async (updateSession: Omit<Session, "id">, id: number): Promise<Session> => {
    return await dbContext.prisma.session.update({
        where: {
            id,
        },
        data: {
            endTime: updateSession.endTime,
            note: updateSession.note,
        },
    });
};

export const deleteSession = async (id: number): Promise<Session> => {
    return await dbContext.prisma.session.delete({
        where: {
            id,
        },
    });
};
