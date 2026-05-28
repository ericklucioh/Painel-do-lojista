import { api } from "@/lib/api";
import type {
    CreateProductInput,
    CreateProductResponse,
    DeactivateProductResponse,
    ProductByEanResponse,
    ProductQuery,
    ProductsListResponse,
    UpdateProductInput,
    UpdateProductResponse,
} from "@/types/api";

export const productsService = {
    list: async (query: ProductQuery = {}) => {
        const response = await api.get<ProductsListResponse>("/api/products", {
            params: query,
        });
        return response.data;
    },
    getByEan: async (ean: string) => {
        const response = await api.get<ProductByEanResponse>(
            `/api/products/by-ean/${ean}`,
        );
        return response.data;
    },
    create: async (payload: CreateProductInput) => {
        const response = await api.post<CreateProductResponse>(
            "/api/products",
            payload,
        );
        return response.data;
    },
    update: async (id: string, payload: UpdateProductInput) => {
        const response = await api.put<UpdateProductResponse>(
            `/api/products/${id}`,
            payload,
        );
        return response.data;
    },
    deactivate: async (id: string) => {
        const response = await api.patch<DeactivateProductResponse>(
            `/api/products/${id}/deactivate`,
        );
        return response.data;
    },
};
