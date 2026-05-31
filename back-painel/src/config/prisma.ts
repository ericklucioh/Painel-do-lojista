import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
    if (prisma === undefined) {
        const databaseUrl = process.env.DATABASE_URL?.trim();

        if (!databaseUrl) {
            throw new Error(
                "DATABASE_URL is required to initialize PrismaClient",
            );
        }

        prisma = new PrismaClient({
            adapter: new PrismaMariaDb(databaseUrl),
        });
    }

    return prisma;
}
