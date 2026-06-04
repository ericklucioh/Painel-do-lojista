import { rmSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

const prismaBinary = resolve("node_modules/.bin/prisma");
const testDatabasePath = "/tmp/painel-do-lojista-test.db";

function runCommand(binary, args) {
    execFileSync(binary, args, {
        stdio: "inherit",
    });
}

function removeIfExists(path) {
    try {
        rmSync(path);
    } catch (error) {
        if (error && typeof error === "object" && "code" in error) {
            const code = String(error.code);
            if (code === "ENOENT") {
                return;
            }
        }

        throw error;
    }
}

const testDatabaseFiles = [
    testDatabasePath,
    `${testDatabasePath}-wal`,
    `${testDatabasePath}-shm`,
    `${testDatabasePath}-journal`,
];

for (const filePath of testDatabaseFiles) {
    removeIfExists(filePath);
}

runCommand(prismaBinary, ["db", "push", "--config", "prisma/test.config.ts"]);
runCommand(process.execPath, ["prisma/test/seed.mjs"]);
