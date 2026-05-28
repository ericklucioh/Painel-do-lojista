import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    const statusCode =
        typeof error?.statusCode === "number" ? error.statusCode : 500;
    const message =
        typeof error?.message === "string" && error.message.length > 0
            ? error.message
            : "Internal server error";

    res.status(statusCode).json({
        message,
    });
};
