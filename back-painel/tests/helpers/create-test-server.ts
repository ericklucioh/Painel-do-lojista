import http, { type Server } from "node:http";
import type { Express } from "express";

export async function createTestServer(app: Express): Promise<Server> {
    const server = http.createServer(app);

    await new Promise<void>((resolve, reject) => {
        const onError = (error: Error) => {
            reject(error);
        };

        server.once("error", onError);
        server.listen(0, "127.0.0.1", () => {
            server.off("error", onError);
            resolve();
        });
    });

    return server;
}

export async function closeTestServer(server: Server): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        server.close((error) => {
            if (error !== undefined) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}
