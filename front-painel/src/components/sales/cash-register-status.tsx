"use client";

import { Button } from "@/components/ui/button";
import type { CashRegister } from "@/types/api";
import { formatCurrency } from "@/components/sales/sales.helpers";

type CashRegisterStatusProps = {
    cashRegister: CashRegister | null;
    onOpenCashRegister: () => void;
};

export function CashRegisterStatus({
    cashRegister,
    onOpenCashRegister,
}: CashRegisterStatusProps) {
    return (
        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-blue-50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <div className="font-medium text-white">
                        {cashRegister ? "Caixa aberto" : "Caixa fechado"}
                    </div>
                    {cashRegister ? (
                        <div className="text-xs text-blue-50/80">
                            {cashRegister.openedByUserName} · Saldo inicial{" "}
                            {formatCurrency(cashRegister.initialBalance)}
                        </div>
                    ) : (
                        <div className="text-xs text-blue-50/80">
                            Abra um caixa para liberar a finalização.
                        </div>
                    )}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    onClick={onOpenCashRegister}
                >
                    {cashRegister ? "Abrir outro caixa" : "Abrir caixa"}
                </Button>
            </div>
        </div>
    );
}
