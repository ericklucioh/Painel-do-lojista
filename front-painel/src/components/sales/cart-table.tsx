"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/components/sales/sales.helpers";
import type { CartItem } from "@/stores/cart.store";
import { cn } from "@/lib/utils";

type CartTableProps = {
    items: CartItem[];
    onQuantityChange: (productId: string, quantity: number) => void;
    onRemoveItem: (productId: string) => void;
};

function fieldClassName(hasError: boolean): string {
    return cn(
        "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400",
        hasError ? "border-rose-300" : "border-slate-200",
    );
}

export function CartTable({
    items,
    onQuantityChange,
    onRemoveItem,
}: CartTableProps) {
    return (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
                <h3 className="text-lg font-semibold text-slate-950">
                    Carrinho
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            <th className="px-5 py-4">Produto</th>
                            <th className="px-5 py-4">Qtd</th>
                            <th className="px-5 py-4">Unit.</th>
                            <th className="px-5 py-4">Subtotal</th>
                            <th className="px-5 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-5 py-10 text-sm text-slate-500"
                                >
                                    Nenhum item no carrinho.
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => {
                                const subtotal =
                                    item.unitPriceSnapshot * item.quantity;

                                return (
                                    <tr key={item.id}>
                                        <td className="px-5 py-4">
                                            <div className="font-medium text-slate-950">
                                                {item.name}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {item.ean}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <input
                                                className={fieldClassName(
                                                    false,
                                                )}
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={item.quantity}
                                                onChange={(event) => {
                                                    onQuantityChange(
                                                        item.id,
                                                        Number(
                                                            event.target.value,
                                                        ),
                                                    );
                                                }}
                                            />
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {formatCurrency(
                                                item.unitPriceSnapshot,
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-sm font-medium text-slate-950">
                                            {formatCurrency(subtotal)}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                type="button"
                                                onClick={() =>
                                                    onRemoveItem(item.id)
                                                }
                                            >
                                                Remover
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
