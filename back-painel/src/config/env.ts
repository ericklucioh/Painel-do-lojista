import { z } from "zod";

const EnvSchema = z.object({
    JWT_SECRET: z.string().min(1).default("dev-access-secret"),
    REFRESH_TOKEN_SECRET: z.string().min(1).default("dev-refresh-secret"),
    ACCESS_TOKEN_EXPIRES_IN: z.string().min(1).default("15m"),
    REFRESH_TOKEN_EXPIRES_IN: z.string().min(1).default("7d"),
    ACCESS_TOKEN_COOKIE_NAME: z.string().min(1).default("accessToken"),
    AUTH_COOKIE_NAME: z.string().min(1).default("refreshToken"),
    NODE_ENV: z.string().optional(),
});

const parsedEnv = EnvSchema.parse(process.env);

export const env = {
    jwtSecret: parsedEnv.JWT_SECRET,
    refreshTokenSecret: parsedEnv.REFRESH_TOKEN_SECRET,
    accessTokenExpiresIn: parsedEnv.ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresIn: parsedEnv.REFRESH_TOKEN_EXPIRES_IN,
    accessTokenCookieName: parsedEnv.ACCESS_TOKEN_COOKIE_NAME,
    authCookieName: parsedEnv.AUTH_COOKIE_NAME,
    nodeEnv: parsedEnv.NODE_ENV ?? "development",
} as const;
