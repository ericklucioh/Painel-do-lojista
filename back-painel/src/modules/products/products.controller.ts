import type { RequestHandler } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import {
    CreateProductBodySchema,
    ProductByEanParamsSchema,
    ProductIdParamsSchema,
    ProductQuerySchema,
    UpdateProductBodySchema,
} from "./products.schema";
import type { ProductsService } from "./products.service";

export interface ProductsController {
    list: RequestHandler;
    getByEan: RequestHandler;
    create: RequestHandler;
    update: RequestHandler;
    deactivate: RequestHandler;
}

export interface CreateProductsControllerDependencies {
    service: ProductsService;
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

export function createProductsController({
    service,
}: CreateProductsControllerDependencies): ProductsController {
    return {
        list: asyncHandler(async (req, res) => {
            const parsedQuery = ProductQuerySchema.safeParse(req.query);
            if (!parsedQuery.success) {
                sendValidationError(res, parsedQuery.error.issues);
                return;
            }

            const response = await service.list(parsedQuery.data);
            res.status(200).json(response);
        }),

        getByEan: asyncHandler(async (req, res) => {
            const parsedParams = ProductByEanParamsSchema.safeParse(req.params);
            if (!parsedParams.success) {
                sendValidationError(res, parsedParams.error.issues);
                return;
            }

            const product = await service.getByEan(parsedParams.data.ean);
            if (product === undefined) {
                res.status(404).json({
                    message: "Product not found",
                });
                return;
            }

            res.status(200).json(product);
        }),

        create: asyncHandler(async (req, res) => {
            const parsedBody = CreateProductBodySchema.safeParse(req.body);
            if (!parsedBody.success) {
                sendValidationError(res, parsedBody.error.issues);
                return;
            }

            const response = await service.create(parsedBody.data);
            res.status(201).json(response);
        }),

        update: asyncHandler(async (req, res) => {
            const parsedParams = ProductIdParamsSchema.safeParse(req.params);
            if (!parsedParams.success) {
                sendValidationError(res, parsedParams.error.issues);
                return;
            }

            const parsedBody = UpdateProductBodySchema.safeParse(req.body);
            if (!parsedBody.success) {
                sendValidationError(res, parsedBody.error.issues);
                return;
            }

            const response = await service.update(
                parsedParams.data.id,
                parsedBody.data,
            );
            if (response === undefined) {
                res.status(404).json({
                    message: "Product not found",
                });
                return;
            }

            res.status(200).json(response);
        }),

        deactivate: asyncHandler(async (req, res) => {
            const parsedParams = ProductIdParamsSchema.safeParse(req.params);
            if (!parsedParams.success) {
                sendValidationError(res, parsedParams.error.issues);
                return;
            }

            const response = await service.deactivate(parsedParams.data.id);
            if (response === undefined) {
                res.status(404).json({
                    message: "Product not found",
                });
                return;
            }

            res.status(200).json(response);
        }),
    };
}
