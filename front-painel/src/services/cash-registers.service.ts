import { api } from "@/lib/api";
import type {
    OpenCashRegisterInput,
    OpenCashRegisterResponse,
} from "@/types/api";

export const cashRegistersService = {
    open: async (payload: OpenCashRegisterInput) => {
        const response = await api.post<OpenCashRegisterResponse>(
            "/cash-registers/open",
            payload,
        );
        return response.data;
    },
};
