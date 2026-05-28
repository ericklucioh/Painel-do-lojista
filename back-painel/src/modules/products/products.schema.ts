import { z } from "zod";

export const ProductQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    search: z.string().trim().min(1).optional(),
});

export const ProductByEanParamsSchema = z.object({
    ean: z
        .string()
        .trim()
        .regex(/^\d{13}$/),
});

export const ProductIdParamsSchema = z.object({
    id: z.string().trim().min(1),
});

const ProductBodyBaseSchema = z.object({
    ean: z
        .string()
        .trim()
        .regex(/^\d{13}$/),
    name: z.string().trim().min(1),
    price: z.number().positive(),
    minStock: z.number().int().nonnegative(),
    maxStock: z.number().int().positive(),
});

export const CreateProductBodySchema = ProductBodyBaseSchema.refine(
    (data) => data.minStock < data.maxStock,
    {
        message: "minStock must be less than maxStock",
        path: ["minStock"],
    },
);

export const UpdateProductBodySchema = ProductBodyBaseSchema.partial().refine(
    (data) => {
        if (
            typeof data.minStock !== "number" ||
            typeof data.maxStock !== "number"
        ) {
            return true;
        }

        return data.minStock < data.maxStock;
    },
    {
        message: "minStock must be less than maxStock",
        path: ["minStock"],
    },
);

export const ProductListItemResponseSchema = z.object({
    id: z.string(),
    ean: z.string(),
    name: z.string(),
    price: z.number(),
    stockCurrent: z.number().int(),
    minStock: z.number().int().nonnegative(),
    maxStock: z.number().int().positive(),
    isCritical: z.boolean(),
    isActive: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const ProductByEanResponseSchema = z.object({
    id: z.string(),
    ean: z.string(),
    name: z.string(),
    price: z.number(),
    stockCurrent: z.number().int(),
    isActive: z.boolean(),
});

export const ProductDetailResponseSchema = ProductListItemResponseSchema.extend(
    {
        deletedAt: z.string().nullable(),
    },
);

export const ProductsListResponseSchema = z.object({
    data: z.array(ProductListItemResponseSchema),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    totalItems: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    search: z.string().optional(),
});

export const CreateProductResponseSchema = z.object({
    product: ProductDetailResponseSchema,
});

export const UpdateProductResponseSchema = z.object({
    product: ProductDetailResponseSchema,
});

export const DeactivateProductResponseSchema = z.object({
    success: z.literal(true),
    product: ProductDetailResponseSchema,
});

export type ProductQuery = z.infer<typeof ProductQuerySchema>;
export type ProductByEanParams = z.infer<typeof ProductByEanParamsSchema>;
export type ProductIdParams = z.infer<typeof ProductIdParamsSchema>;
export type CreateProductBody = z.infer<typeof CreateProductBodySchema>;
export type UpdateProductBody = z.infer<typeof UpdateProductBodySchema>;
export type ProductListItemResponse = z.infer<
    typeof ProductListItemResponseSchema
>;
export type ProductByEanResponse = z.infer<typeof ProductByEanResponseSchema>;
export type ProductDetailResponse = z.infer<typeof ProductDetailResponseSchema>;
export type ProductsListResponse = z.infer<typeof ProductsListResponseSchema>;
export type CreateProductResponse = z.infer<typeof CreateProductResponseSchema>;
export type UpdateProductResponse = z.infer<typeof UpdateProductResponseSchema>;
export type DeactivateProductResponse = z.infer<
    typeof DeactivateProductResponseSchema
>;
