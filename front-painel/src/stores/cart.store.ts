"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { z } from "zod";
import type { ProductByEanResponse } from "@/types/api";

export type CartItem = ProductByEanResponse & {
    quantity: number;
    unitPriceSnapshot: number;
};

type CartStoreState = {
    items: CartItem[];
    discountInput: string;
    addItem: (product: ProductByEanResponse) => void;
    setQuantity: (productId: string, quantity: number) => void;
    removeItem: (productId: string) => void;
    clearCart: () => void;
    setDiscountInput: (value: string) => void;
};

const cartItemSchema = z
    .object({
        id: z.string().min(1),
        ean: z.string().min(1),
        name: z.string().min(1),
        price: z.number().finite().nonnegative(),
        stockCurrent: z.number().finite(),
        isActive: z.boolean(),
        quantity: z.number().int().positive(),
        unitPriceSnapshot: z.number().finite().nonnegative(),
    })
    .strict();

const persistedCartSchema = z
    .object({
        items: z.array(cartItemSchema),
        discountInput: z.string(),
    })
    .strict();

const cartStorage = {
    getItem: (name: string): string | null => {
        if (typeof window === "undefined") {
            return null;
        }

        return window.localStorage.getItem(name);
    },
    setItem: (name: string, value: string): void => {
        if (typeof window === "undefined") {
            return;
        }

        window.localStorage.setItem(name, value);
    },
    removeItem: (name: string): void => {
        if (typeof window === "undefined") {
            return;
        }

        window.localStorage.removeItem(name);
    },
};

function buildCartItem(product: ProductByEanResponse): CartItem {
    return {
        ...product,
        quantity: 1,
        unitPriceSnapshot: product.price,
    };
}

function normalizeQuantity(quantity: number): number {
    if (!Number.isFinite(quantity)) {
        return 0;
    }

    return Math.trunc(quantity);
}

export const useCartStore = create<CartStoreState>()(
    persist(
        (set, get) => ({
            items: [],
            discountInput: "0",
            addItem: (product) => {
                const currentItems = get().items;
                const existingItem = currentItems.find(
                    (item) => item.id === product.id,
                );

                if (existingItem === undefined) {
                    set({
                        items: [...currentItems, buildCartItem(product)],
                    });
                    return;
                }

                set({
                    items: currentItems.map((item) =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item,
                    ),
                });
            },
            setQuantity: (productId, quantity) => {
                const nextQuantity = normalizeQuantity(quantity);

                if (nextQuantity <= 0) {
                    set({
                        items: get().items.filter(
                            (item) => item.id !== productId,
                        ),
                    });
                    return;
                }

                set({
                    items: get().items.map((item) =>
                        item.id === productId
                            ? { ...item, quantity: nextQuantity }
                            : item,
                    ),
                });
            },
            removeItem: (productId) => {
                set({
                    items: get().items.filter((item) => item.id !== productId),
                });
            },
            clearCart: () => {
                set({
                    items: [],
                    discountInput: "0",
                });
            },
            setDiscountInput: (value) => {
                set({ discountInput: value });
            },
        }),
        {
            name: "painel-do-lojista:sales-cart",
            storage: createJSONStorage(() => cartStorage),
            partialize: (state) => ({
                items: state.items,
                discountInput: state.discountInput,
            }),
            merge: (persistedState, currentState) => {
                const parsed = persistedCartSchema.safeParse(persistedState);
                if (!parsed.success) {
                    return currentState;
                }

                return {
                    ...currentState,
                    items: parsed.data.items,
                    discountInput: parsed.data.discountInput,
                };
            },
        },
    ),
);

export { buildCartItem };
