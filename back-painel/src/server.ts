import { config as loadEnv } from "dotenv";

loadEnv({ override: process.env.DOCKER_DEV !== "true" });

const PORT = Number(process.env.PORT ?? 3001);

async function bootstrap(): Promise<void> {
    const { createApp } = await import("./app.js");
    const app = createApp();

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Backend running on http://localhost:${PORT}`);
    });
}

void bootstrap().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
});
