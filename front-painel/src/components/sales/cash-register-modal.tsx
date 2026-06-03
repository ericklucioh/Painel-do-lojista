"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    OpenCashRegisterFormSchema,
    type OpenCashRegisterFormValues,
} from "@/schemas/cash-register.schema";
import { cn } from "@/lib/utils";

type CashRegisterModalProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: OpenCashRegisterFormValues) => void | Promise<void>;
};

function fieldClassName(hasError: boolean): string {
    return cn(
        "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400",
        hasError ? "border-rose-300" : "border-slate-200",
    );
}

export function CashRegisterModal({
    open,
    onClose,
    onSubmit,
}: CashRegisterModalProps) {
    const form = useForm<OpenCashRegisterFormValues>({
        resolver: zodResolver(OpenCashRegisterFormSchema),
        defaultValues: {
            initialBalance: 150,
            note: "",
        },
    });

    useEffect(() => {
        if (!open) {
            form.reset({
                initialBalance: 150,
                note: "",
            });
        }
    }, [form, open]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.22)]">
                <div className="mb-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Caixa
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                        Abrir caixa
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        Abra um caixa com saldo inicial para liberar a
                        finalização da venda.
                    </p>
                </div>

                <form
                    className="grid gap-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <label className="grid gap-2">
                        <span className="text-sm font-medium text-slate-700">
                            Saldo inicial
                        </span>
                        <input
                            className={fieldClassName(
                                Boolean(form.formState.errors.initialBalance),
                            )}
                            type="number"
                            min="0.01"
                            step="0.01"
                            {...form.register("initialBalance", {
                                valueAsNumber: true,
                            })}
                        />
                        {form.formState.errors.initialBalance ? (
                            <span className="text-sm text-rose-600">
                                {form.formState.errors.initialBalance.message}
                            </span>
                        ) : null}
                    </label>

                    <label className="grid gap-2">
                        <span className="text-sm font-medium text-slate-700">
                            Observação
                        </span>
                        <textarea
                            className={fieldClassName(
                                Boolean(form.formState.errors.note),
                            )}
                            rows={4}
                            {...form.register("note")}
                        />
                        {form.formState.errors.note ? (
                            <span className="text-sm text-rose-600">
                                {form.formState.errors.note.message}
                            </span>
                        ) : null}
                    </label>

                    <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting
                                ? "Abrindo..."
                                : "Abrir caixa"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
