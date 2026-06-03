"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/components/sales/sales.helpers";
import type { SaleDto, SaleItem } from "@/types/api";

type ReceiptModalProps = {
    sale: SaleDto;
    errorMessage: string | null;
    isPrinting: boolean;
    isCancellingSale: boolean;
    onClose: () => void;
    onRetryPrint: () => void;
    onCancelSale: () => void;
};

export function ReceiptModal({
    sale,
    errorMessage,
    isPrinting,
    isCancellingSale,
    onClose,
    onRetryPrint,
    onCancelSale,
}: ReceiptModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.22)]">
                <div className="mb-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Recibo
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                        Venda #{sale.receiptNumber}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                        {formatDate(sale.createdAt)} - {sale.soldByUserName}
                    </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                <th className="px-4 py-3">Produto</th>
                                <th className="px-4 py-3">Qtd</th>
                                <th className="px-4 py-3">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sale.items.map((item: SaleItem) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-950">
                                            {item.productNameSnapshot}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {item.productEanSnapshot}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {item.quantity}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {formatCurrency(item.subtotal)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            Bruto
                        </div>
                        <div className="mt-1 text-lg font-semibold text-slate-950">
                            {formatCurrency(sale.subtotal)}
                        </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            Desconto
                        </div>
                        <div className="mt-1 text-lg font-semibold text-slate-950">
                            {formatCurrency(sale.discountAmount)}
                        </div>
                    </div>
                    <div className="rounded-2xl bg-slate-950 p-4 text-white">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-300">
                            Total
                        </div>
                        <div className="mt-1 text-lg font-semibold">
                            {formatCurrency(sale.totalAmount)}
                        </div>
                    </div>
                </div>

                {errorMessage ? (
                    <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                        {errorMessage}
                    </div>
                ) : null}

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button variant="outline" type="button" onClick={onClose}>
                        Fechar
                    </Button>
                    <Button
                        variant="destructive"
                        type="button"
                        onClick={onCancelSale}
                        disabled={isCancellingSale}
                    >
                        {isCancellingSale ? "Cancelando..." : "Cancelar venda"}
                    </Button>
                    <Button
                        type="button"
                        onClick={onRetryPrint}
                        disabled={isPrinting}
                    >
                        {isPrinting ? "Imprimindo..." : "Reimprimir recibo"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
