import { User } from "@prisma/client";
import { dbContext } from "../utils/db.server";

export const listUser = async (): Promise<User[]> => {
    return await dbContext.prisma.user.findMany();
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
    return await dbContext.prisma.user.findUnique({
        where: {
            email,
        },
    });
};

export const getUser = async (id: number): Promise<User | null> => {
    return await dbContext.prisma.user.findUnique({
        where: {
            id,
        },
    });
};

export const createUser = async (newUser: Omit<User, "id">): Promise<User> => {
    return await dbContext.prisma.user.create({
        data: newUser,
    });
};

export const updateUser = async (UpdateUser: Omit<User, "id">, id: number): Promise<User> => {
    return await dbContext.prisma.user.update({
        where: {
            id,
        },
        data: {
            firstName: UpdateUser.firstName,
            lastName: UpdateUser.lastName,
        },
    });
};

export const deleteUser = async (id: number): Promise<User> => {
    return await dbContext.prisma.user.delete({
        where: {
            id,
        },
    });
};
