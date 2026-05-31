import type { RequestHandler } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import {
    CashRegisterSchema,
    OpenCashRegisterResponseSchema,
} from "./cash-registers.schema";

export interface CashRegistersController {
    open: RequestHandler;
}

export interface CreateCashRegistersControllerDependencies {}

function toNumber(value: unknown): number {
    return Number(value);
}

export function createCashRegistersController(): CashRegistersController {
    return {
        open: asyncHandler(async (req, res) => {
            const body = req.body as {
                initialBalance?: number;
                note?: string;
            };

            const response = OpenCashRegisterResponseSchema.parse({
                cashRegister: CashRegisterSchema.parse({
                    id: "cash_register_fake_1",
                    openedByUserId: req.authUser?.sub ?? "",
                    activeOpenedByUserId: req.authUser?.sub ?? "",
                    initialBalance: toNumber(body.initialBalance ?? 0),
                    status: "ABERTO",
                    openedAt: new Date().toISOString(),
                    closedAt: null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    deletedAt: null,
                }),
            });

            res.status(201).json(response);
        }),
    };
}
