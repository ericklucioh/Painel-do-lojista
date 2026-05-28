import type { RequestHandler } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import {
    CreateUserBodySchema,
    UserIdParamsSchema,
    UsersQuerySchema,
    UpdateUserBodySchema,
} from "./users.schema";
import type { UsersService } from "./users.service";

export interface UsersController {
    list: RequestHandler;
    create: RequestHandler;
    update: RequestHandler;
    deactivate: RequestHandler;
}

export interface CreateUsersControllerDependencies {
    service: UsersService;
}

function sendValidationError(
    res: Parameters<RequestHandler>[1],
    issues: unknown,
): void {
    res.status(400).json({
        message: "Validation error",
        issues,
    });
}

export function createUsersController({
    service,
}: CreateUsersControllerDependencies): UsersController {
    return {
        list: asyncHandler((req, res) => {
            const parsedQuery = UsersQuerySchema.safeParse(req.query);
            if (!parsedQuery.success) {
                sendValidationError(res, parsedQuery.error.issues);
                return;
            }

            res.status(200).json(service.list(parsedQuery.data));
        }),

        create: asyncHandler(async (req, res) => {
            const parsedBody = CreateUserBodySchema.safeParse(req.body);
            if (!parsedBody.success) {
                sendValidationError(res, parsedBody.error.issues);
                return;
            }

            const response = await service.create(parsedBody.data);
            res.status(201).json(response);
        }),

        update: asyncHandler(async (req, res) => {
            const parsedParams = UserIdParamsSchema.safeParse(req.params);
            if (!parsedParams.success) {
                sendValidationError(res, parsedParams.error.issues);
                return;
            }

            const parsedBody = UpdateUserBodySchema.safeParse(req.body);
            if (!parsedBody.success) {
                sendValidationError(res, parsedBody.error.issues);
                return;
            }

            const response = await service.update(
                parsedParams.data.id,
                parsedBody.data,
            );
            res.status(200).json(response);
        }),

        deactivate: asyncHandler(async (req, res) => {
            const parsedParams = UserIdParamsSchema.safeParse(req.params);
            if (!parsedParams.success) {
                sendValidationError(res, parsedParams.error.issues);
                return;
            }

            const response = await service.deactivate(parsedParams.data.id);
            res.status(200).json(response);
        }),
    };
}
