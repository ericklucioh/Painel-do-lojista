import type { CreateSaleInput } from "@/types/api";
import type { CartItem } from "@/stores/cart.store";

export type SaleSummary = {
    itemCount: number;
    subtotal: number;
    discount: number;
    total: number;
};

function clampDiscount(value: number, subtotal: number): number {
    if (!Number.isFinite(value) || value <= 0) {
        return 0;
    }

    return Math.min(value, subtotal);
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

export function formatDate(value: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value));
}

export function calculateSaleSummary(
    items: CartItem[],
    discountInput: string,
): SaleSummary {
    const subtotal = items.reduce(
        (sum, item) => sum + item.unitPriceSnapshot * item.quantity,
        0,
    );
    const discount = clampDiscount(Number(discountInput), subtotal);

    return {
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal,
        discount,
        total: Math.max(subtotal - discount, 0),
    };
}

export function toSaleItems(cartItems: CartItem[]): CreateSaleInput["items"] {
    return cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
    }));
}

type ApiError = {
    message?: string;
};

export function getApiErrorMessage(
    error: unknown,
    fallbackMessage: string,
): string {
    const possibleError = error as {
        response?: { data?: ApiError };
        message?: string;
    };

    const responseMessage = possibleError.response?.data?.message;
    if (
        typeof responseMessage === "string" &&
        responseMessage.trim().length > 0
    ) {
        return responseMessage;
    }

    if (
        typeof possibleError.message === "string" &&
        possibleError.message.trim().length > 0
    ) {
        return possibleError.message;
    }

    return fallbackMessage;
}
