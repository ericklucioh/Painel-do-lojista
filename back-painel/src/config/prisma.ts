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

export function getPrisma(): any {
    if (globalForPrisma.prisma === undefined) {
        globalForPrisma.prisma = new PrismaClient();
    }

    return globalForPrisma.prisma;
}
