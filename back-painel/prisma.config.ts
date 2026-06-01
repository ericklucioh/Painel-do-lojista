import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

loadEnv({ override: process.env.DOCKER_DEV !== "true" });

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: env("DATABASE_URL"),
        shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
    },
});
