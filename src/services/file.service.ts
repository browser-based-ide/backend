import { File } from "@prisma/client";
import { dbContext } from "../utils/db.server";

export const listFiles = async (): Promise<File[]> => {
    return await dbContext.prisma.file.findMany();
};

export const getFile = async (id: number): Promise<File | null> => {
    return await dbContext.prisma.file.findUnique({
        where: {
            id,
        },
    });
};

export const createFile = async (newFile: Omit<File, "id">): Promise<File> => {
    return await dbContext.prisma.file.create({
        data: {
            language: newFile.language,
            code: newFile.code,
            title: newFile.title,
            question: newFile.question,
            label: newFile.label,
            output: newFile.output,
        },
    });
};

export const updateFile = async (updateFile: Omit<File, "id">, id: number): Promise<File> => {
    return await dbContext.prisma.file.update({
        where: {
            id,
        },
        data: {
            language: updateFile.language,
            code: updateFile.code,
            title: updateFile.title,
            question: updateFile.question,
            label: updateFile.label,
            output: updateFile.output,
        },
    });
};

export const deleteFile = async (id: number): Promise<File> => {
    return await dbContext.prisma.file.delete({
        where: {
            id,
        },
    });
};
