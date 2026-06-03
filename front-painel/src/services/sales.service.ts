import { api } from "@/lib/api";
import type {
    CancelSaleResponse,
    CreateSaleInput,
    CreateSaleResponse,
    PrintReceiptResponse,
} from "@/types/api";

export const salesService = {
    create: async (payload: CreateSaleInput) => {
        const response = await api.post<CreateSaleResponse>("/sales", payload);
        return response.data;
    },
    printReceipt: async (saleId: string) => {
        const response = await api.post<PrintReceiptResponse>(
            "/sales/print-receipt",
            {
                saleId,
            },
        );
        return response.data;
    },
    cancel: async (saleId: string) => {
        const response = await api.delete<CancelSaleResponse>(
            `/sales/${saleId}`,
        );
        return response.data;
    },
};
