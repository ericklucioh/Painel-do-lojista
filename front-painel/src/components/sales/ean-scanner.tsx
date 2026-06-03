"use client";

import { Button } from "@/components/ui/button";

type EanScannerProps = {
    value: string;
    onValueChange: (value: string) => void;
    onSubmit: () => void;
    onOpenCashRegister: () => void;
};

export function EanScanner({
    value,
    onValueChange,
    onSubmit,
    onOpenCashRegister,
}: EanScannerProps) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-950">
                        Leitura por EAN
                    </h3>
                    <p className="text-sm text-slate-500">
                        Escaneie ou digite o código e pressione Enter.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={onOpenCashRegister}
                >
                    Abrir caixa
                </Button>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
                <input
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                    placeholder="EAN do produto"
                    value={value}
                    onChange={(event) => onValueChange(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            onSubmit();
                        }
                    }}
                />

                <Button
                    type="button"
                    onClick={() => {
                        onSubmit();
                    }}
                >
                    Adicionar
                </Button>
            </div>
        </section>
    );
}
