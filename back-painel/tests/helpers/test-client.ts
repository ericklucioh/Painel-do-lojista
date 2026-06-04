import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/test-client";

export function createTestClient(): PrismaClient {
    return new PrismaClient({
        adapter: new PrismaBetterSqlite3({
            url: "file:/tmp/painel-do-lojista-test.db",
        }),
    });
}
