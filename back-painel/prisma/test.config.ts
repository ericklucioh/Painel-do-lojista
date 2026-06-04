import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ override: true });

export default defineConfig({
    schema: "test/schema.prisma",
    datasource: {
        url: "file:/tmp/painel-do-lojista-test.db",
    },
});
