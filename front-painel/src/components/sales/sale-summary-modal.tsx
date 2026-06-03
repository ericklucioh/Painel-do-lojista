"use client";

import { Button } from "@/components/ui/button";
import {
    formatCurrency,
    type SaleSummary,
} from "@/components/sales/sales.helpers";

type SaleSummaryModalProps = {
    summary: SaleSummary;
    onClose: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
};

export function SaleSummaryModal({
    summary,
    onClose,
    onConfirm,
    isSubmitting,
}: SaleSummaryModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.22)]">
                <div className="mb-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Venda
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                        Resumo da venda
                    </h3>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-sm text-slate-500">Itens</div>
                        <div className="mt-1 text-xl font-semibold text-slate-950">
                            {summary.itemCount}
                        </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-sm text-slate-500">
                            Forma de pagamento
                        </div>
                        <div className="mt-1 text-xl font-semibold text-slate-950">
                            Dinheiro
                        </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-sm text-slate-500">
                            Valor bruto
                        </div>
                        <div className="mt-1 text-xl font-semibold text-slate-950">
                            {formatCurrency(summary.subtotal)}
                        </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-sm text-slate-500">Desconto</div>
                        <div className="mt-1 text-xl font-semibold text-slate-950">
                            {formatCurrency(summary.discount)}
                        </div>
                    </div>
                    <div className="rounded-2xl bg-slate-950 p-4 text-white md:col-span-2">
                        <div className="text-sm text-slate-300">
                            Total final
                        </div>
                        <div className="mt-1 text-3xl font-semibold">
                            {formatCurrency(summary.total)}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button variant="outline" type="button" onClick={onClose}>
                        Voltar
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Processando..." : "Confirmar venda"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
