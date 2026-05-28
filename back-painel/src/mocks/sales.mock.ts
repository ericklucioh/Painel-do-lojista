import type {
    CreateSaleResponse,
    SaleDto,
} from "../modules/sales/sales.schema";

export const saleMock: SaleDto = {
    id: "sale_001",
    receiptNumber: "001",
    cashRegisterId: "cash_001",
    soldByUserId: "user_vendor_1",
    soldByUserName: "Joao Vendedor",
    subtotal: 42.8,
    discountAmount: 2.8,
    totalAmount: 40,
    paymentMethod: "DINHEIRO",
    status: "CONFIRMED",
    createdAt: "2026-05-27T12:00:00.000Z",
    items: [
        {
            id: "sale_item_001",
            productId: "prod_001",
            productNameSnapshot: "Refrigerante Cola 2L",
            productEanSnapshot: "7891000100015",
            unitPriceSnapshot: 12.9,
            quantity: 2,
            subtotal: 25.8,
        },
        {
            id: "sale_item_002",
            productId: "prod_003",
            productNameSnapshot: "Feijao Carioca 1kg",
            productEanSnapshot: "7891000100039",
            unitPriceSnapshot: 8.5,
            quantity: 2,
            subtotal: 17,
        },
    ],
};

export const createSaleMock: CreateSaleResponse = {
    sale: saleMock,
};
