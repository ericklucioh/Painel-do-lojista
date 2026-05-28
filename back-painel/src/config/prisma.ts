import prismaClientPackage from "@prisma/client";

type PrismaClientConstructor = new () => {
    $disconnect: () => Promise<void>;
};

const PrismaClient = (
    prismaClientPackage as {
        PrismaClient: PrismaClientConstructor;
    }
).PrismaClient;

const globalForPrisma = globalThis as unknown as {
    prisma?: any;
};

export const prisma: any =
    globalForPrisma.prisma ??
    new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
