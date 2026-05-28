import { createMockCrudService } from "../../shared/mock-crud.service";
import { productsListMock, productByEanMock } from "../../mocks/products.mock";
import type {
    CreateProductBody,
    CreateProductResponse,
    DeactivateProductResponse,
    ProductByEanResponse,
    ProductDetailResponse,
    ProductListItemResponse,
    ProductQuery,
    ProductsListResponse,
    UpdateProductBody,
    UpdateProductResponse,
} from "./products.schema";

export interface ProductsService {
    list(query: ProductQuery): ProductsListResponse;
    getByEan(ean: string): ProductByEanResponse | undefined;
    create(input: CreateProductBody): CreateProductResponse;
    update(
        id: string,
        input: UpdateProductBody,
    ): UpdateProductResponse | undefined;
    deactivate(id: string): DeactivateProductResponse | undefined;
}

type ProductsStoreItem = ProductDetailResponse;

function deriveIsCritical(
    item: Pick<ProductsStoreItem, "stockCurrent" | "minStock">,
): boolean {
    return item.stockCurrent <= item.minStock;
}

function toListItem(product: ProductsStoreItem): ProductListItemResponse {
    return {
        id: product.id,
        ean: product.ean,
        name: product.name,
        price: product.price,
        stockCurrent: product.stockCurrent,
        minStock: product.minStock,
        maxStock: product.maxStock,
        isCritical: deriveIsCritical(product),
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
    };
}

export function createProductsService(): ProductsService {
    let nextIndex = productsListMock.data.length + 1;

    const baseService = createMockCrudService<
        ProductsStoreItem,
        CreateProductBody,
        UpdateProductBody,
        ProductListItemResponse,
        ProductByEanResponse,
        CreateProductResponse,
        UpdateProductResponse,
        DeactivateProductResponse
    >({
        initialItems: productsListMock.data.map((item) => ({
            ...item,
            deletedAt: null,
        })),
        pageSize: 10,
        filterItem: (item, search) => {
            if (search === undefined) {
                return true;
            }

            return (
                item.name.toLowerCase().includes(search) ||
                item.ean.includes(search)
            );
        },
        toListItem,
        resolveByKey: (_store, key) => productByEanMock[key],
        createItem: (_store, input) => {
            const now = new Date().toISOString();
            const item: ProductsStoreItem = {
                id: `prod_${String(nextIndex).padStart(3, "0")}`,
                ean: input.ean,
                name: input.name,
                price: input.price,
                stockCurrent: 0,
                minStock: input.minStock,
                maxStock: input.maxStock,
                isCritical: false,
                isActive: true,
                createdAt: now,
                updatedAt: now,
                deletedAt: null,
            };
            nextIndex += 1;
            return item;
        },
        toCreateResponse: (item) => ({
            product: item,
        }),
        updateItem: (store, id, input) => {
            const current = store.findById(id);
            if (current === undefined) {
                return undefined;
            }

            const updated: ProductsStoreItem = {
                ...current,
                ean: input.ean ?? current.ean,
                name: input.name ?? current.name,
                price: input.price ?? current.price,
                minStock: input.minStock ?? current.minStock,
                maxStock: input.maxStock ?? current.maxStock,
                updatedAt: new Date().toISOString(),
            };

            store.updateById(id, () => updated);
            return updated;
        },
        toUpdateResponse: (item) => ({
            product: item,
        }),
        deactivateItem: (store, id) => {
            const current = store.findById(id);
            if (current === undefined) {
                return undefined;
            }

            const updated: ProductsStoreItem = {
                ...current,
                isActive: false,
                deletedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            store.updateById(id, () => updated);
            return updated;
        },
        toDeactivateResponse: (item) => ({
            success: true as const,
            product: item,
        }),
    });

    return {
        ...baseService,
        getByEan(ean) {
            return baseService.getByKey(ean);
        },
    };
}
