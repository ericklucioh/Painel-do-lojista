import type {
    CreateProductResponse,
    ProductByEanResponse,
    ProductListItemResponse,
    ProductsListResponse,
} from "../modules/products/products.schema";

export const productsListMock: ProductsListResponse = {
    data: [
        {
            id: "prod_001",
            ean: "7891000100015",
            name: "Refrigerante Cola 2L",
            price: 12.9,
            stockCurrent: 18,
            minStock: 10,
            maxStock: 80,
            isCritical: false,
            isActive: true,
            createdAt: "2026-05-24T10:00:00.000Z",
            updatedAt: "2026-05-24T10:00:00.000Z",
        },
        {
            id: "prod_002",
            ean: "7891000100022",
            name: "Arroz 5kg",
            price: 29.9,
            stockCurrent: 7,
            minStock: 12,
            maxStock: 100,
            isCritical: true,
            isActive: true,
            createdAt: "2026-05-24T10:00:00.000Z",
            updatedAt: "2026-05-24T10:00:00.000Z",
        },
        {
            id: "prod_003",
            ean: "7891000100039",
            name: "Feijao Carioca 1kg",
            price: 8.5,
            stockCurrent: 24,
            minStock: 8,
            maxStock: 60,
            isCritical: false,
            isActive: true,
            createdAt: "2026-05-24T10:00:00.000Z",
            updatedAt: "2026-05-24T10:00:00.000Z",
        },
        {
            id: "prod_004",
            ean: "7891000100046",
            name: "Leite Integral 1L",
            price: 5.99,
            stockCurrent: 4,
            minStock: 6,
            maxStock: 40,
            isCritical: true,
            isActive: true,
            createdAt: "2026-05-24T10:00:00.000Z",
            updatedAt: "2026-05-24T10:00:00.000Z",
        },
    ],
    page: 1,
    pageSize: 10,
    totalItems: 4,
    totalPages: 1,
};

export const productByEanMock: Record<string, ProductByEanResponse> = {
    "7891000100015": {
        id: "prod_001",
        ean: "7891000100015",
        name: "Refrigerante Cola 2L",
        price: 12.9,
        stockCurrent: 18,
        isActive: true,
    },
    "7891000100022": {
        id: "prod_002",
        ean: "7891000100022",
        name: "Arroz 5kg",
        price: 29.9,
        stockCurrent: 7,
        isActive: true,
    },
    "7891000100039": {
        id: "prod_003",
        ean: "7891000100039",
        name: "Feijao Carioca 1kg",
        price: 8.5,
        stockCurrent: 24,
        isActive: true,
    },
    "7891000100046": {
        id: "prod_004",
        ean: "7891000100046",
        name: "Leite Integral 1L",
        price: 5.99,
        stockCurrent: 4,
        isActive: true,
    },
};

export const productCreateMock: CreateProductResponse = {
    product: {
        ...productsListMock.data[0]!,
        deletedAt: null,
    },
};

export const productListItemMock: ProductListItemResponse =
    productsListMock.data[0]!;
