import type { StockHistoryResponse } from "../modules/stock/stock.schema";

export const stockHistoryMock: StockHistoryResponse = {
    product: {
        id: "prod_002",
        ean: "7891000100022",
        name: "Arroz 5kg",
    },
    data: [
        {
            id: "mov_001",
            type: "ENTRY",
            reason: "COMPRA",
            quantity: 20,
            balanceAfter: 20,
            note: "Compra inicial",
            createdAt: "2026-05-24T10:00:00.000Z",
        },
        {
            id: "mov_002",
            type: "EXIT",
            reason: "PERDA",
            quantity: 3,
            balanceAfter: 17,
            note: "Avaria",
            createdAt: "2026-05-25T10:00:00.000Z",
        },
    ],
};
