const testEnv = {
    JWT_SECRET: "test-jwt-secret",
    REFRESH_TOKEN_SECRET: "test-refresh-secret",
    CORS_ORIGINS: "http://localhost:3000",
    NODE_ENV: "test",
} as const;

for (const [key, value] of Object.entries(testEnv)) {
    if (process.env[key] === undefined || process.env[key]?.trim() === "") {
        process.env[key] = value;
    }
}
