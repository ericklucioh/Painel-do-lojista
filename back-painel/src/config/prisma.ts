import { config as loadEnv } from "dotenv";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

loadEnv({ override: process.env.DOCKER_DEV !== "true" });

let prisma: PrismaClient | undefined;

function parseMysqlUrl(databaseUrl: string): {
    host: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    allowPublicKeyRetrieval: boolean;
    connectTimeout: number;
} {
    const url = new URL(databaseUrl);
    if (url.protocol !== "mysql:" && url.protocol !== "mariadb:") {
        throw new Error(
            "DATABASE_URL must use the mysql:// or mariadb:// protocol",
        );
    }

    const database = url.pathname.replace(/^\/+/, "") || undefined;

    return {
        host: url.hostname,
        port: url.port ? Number(url.port) : undefined,
        user: url.username || undefined,
        password: url.password || undefined,
        database,
        allowPublicKeyRetrieval: true,
        connectTimeout: 10000,
    };
}

export function getPrisma(): PrismaClient {
    if (prisma === undefined) {
        const databaseUrl = process.env.DATABASE_URL?.trim();

        if (!databaseUrl) {
            throw new Error(
                "DATABASE_URL is required to initialize PrismaClient",
            );
        }

        const connectionOptions = parseMysqlUrl(databaseUrl);

        prisma = new PrismaClient({
            adapter: new PrismaMariaDb(connectionOptions),
        });
    }

    return prisma;
}
