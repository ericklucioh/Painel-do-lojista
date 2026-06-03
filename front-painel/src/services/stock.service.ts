import { api } from "@/lib/api";
import type {
    StockEntryInput,
    StockEntryResponse,
    StockExitInput,
    StockExitResponse,
    StockHistoryResponse,
} from "@/types/api";

export const stockService = {
    entry: async (payload: StockEntryInput) => {
        const response = await api.post<StockEntryResponse>(
            "/stock/entry",
            payload,
        );
        return response.data;
    },
    exit: async (payload: StockExitInput) => {
        const response = await api.post<StockExitResponse>(
            "/stock/exit",
            payload,
        );
        return response.data;
    },
    history: async (productId: string) => {
        const response = await api.get<StockHistoryResponse>("/stock/history", {
            params: {
                produto_id: productId,
            },
        });
        return response.data;
    },
};
