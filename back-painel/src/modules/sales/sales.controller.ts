import type { RequestHandler } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { createHttpError } from "../../utils/httpError";
import {
    CancelSaleResponseSchema,
    CreateSaleBodySchema,
    CreateSaleResponseSchema,
    PrintReceiptBodySchema,
    PrintReceiptResponseSchema,
    SaleIdParamsSchema,
} from "./sales.schema";
import type { SalesService } from "./sales.service";

export interface SalesController {
    create: RequestHandler;
    printReceipt: RequestHandler;
    cancel: RequestHandler;
}

export interface CreateSalesControllerDependencies {
    service: SalesService;
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

export function createSalesController({
    service,
}: CreateSalesControllerDependencies): SalesController {
    return {
        create: asyncHandler(async (req, res) => {
            const parsedBody = CreateSaleBodySchema.safeParse(req.body);
            if (!parsedBody.success) {
                sendValidationError(res, parsedBody.error.issues);
                return;
            }

            const authUser = req.authUser;
            if (authUser === undefined) {
                throw createHttpError("Token inválido", 401);
            }

            const response = await service.create({
                cashRegisterId: parsedBody.data.cashRegisterId,
                discountAmount: parsedBody.data.discountAmount,
                paymentMethod: parsedBody.data.paymentMethod,
                items: parsedBody.data.items,
                soldByUserId: authUser.sub,
                soldByUserName: authUser.nome,
            });

            res.status(201).json(CreateSaleResponseSchema.parse(response));
        }),

        printReceipt: asyncHandler(async (req, res) => {
            const parsedBody = PrintReceiptBodySchema.safeParse(req.body);
            if (!parsedBody.success) {
                sendValidationError(res, parsedBody.error.issues);
                return;
            }

            const response = await service.printReceipt({
                saleId: parsedBody.data.saleId,
            });

            res.status(200).json(PrintReceiptResponseSchema.parse(response));
        }),

        cancel: asyncHandler(async (req, res) => {
            const parsedParams = SaleIdParamsSchema.safeParse(req.params);
            if (!parsedParams.success) {
                sendValidationError(res, parsedParams.error.issues);
                return;
            }

            const authUser = req.authUser;
            if (authUser === undefined) {
                throw createHttpError("Token inválido", 401);
            }

            const response = await service.cancel({
                saleId: parsedParams.data.id,
                cancelledByUserId: authUser.sub,
                cancelledByUserName: authUser.nome,
            });

            res.status(200).json(CancelSaleResponseSchema.parse(response));
        }),
    };
}
