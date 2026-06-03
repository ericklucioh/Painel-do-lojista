"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductFormSchema } from "@/schemas/product.schema";
import type { ProductFormValues } from "@/schemas/product.schema";
import type { ProductListItem } from "@/types/api";

type ProductFormDialogProps = {
    open: boolean;
    product: ProductListItem | null;
    onClose: () => void;
    onSubmitCreate: (values: ProductFormValues) => Promise<void>;
    onSubmitUpdate: (id: string, values: ProductFormValues) => Promise<void>;
};

function fieldClassName(hasError: boolean): string {
    return cn(
        "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400",
        hasError ? "border-rose-300" : "border-slate-200",
    );
}

function formatCurrencyInput(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export function ProductFormDialog({
    open,
    product,
    onClose,
    onSubmitCreate,
    onSubmitUpdate,
}: ProductFormDialogProps) {
    const isEditing = product !== null;

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(ProductFormSchema),
        defaultValues: {
            ean: "",
            name: "",
            price: 0,
            minStock: 0,
            maxStock: 0,
        },
    });

    useEffect(() => {
        if (!open) {
            form.reset();
            return;
        }

        if (product) {
            form.reset({
                ean: product.ean,
                name: product.name,
                price: product.price,
                minStock: product.minStock,
                maxStock: product.maxStock,
            });
            return;
        }

        form.reset({
            ean: "",
            name: "",
            price: 0,
            minStock: 0,
            maxStock: 0,
        });
    }, [form, open, product]);

    if (!open) {
        return null;
    }

    const title = isEditing ? "Editar produto" : "Novo produto";
    const description = isEditing
        ? "Atualize os dados do catálogo."
        : "Cadastre um produto com EAN, preço e limites de estoque.";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.22)]">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Produtos
                        </p>
                        <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                            {title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            {description}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={onClose}
                    >
                        Fechar
                    </Button>
                </div>

                {isEditing && product ? (
                    <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                        Editando{" "}
                        <strong className="text-slate-950">
                            {product.name}
                        </strong>
                        .
                    </div>
                ) : null}

                <form
                    className="grid gap-4"
                    onSubmit={form.handleSubmit(async (values) => {
                        if (product) {
                            await onSubmitUpdate(product.id, values);
                            return;
                        }

                        await onSubmitCreate(values);
                    })}
                >
                    <label className="grid gap-2">
                        <span className="text-sm font-medium text-slate-700">
                            EAN
                        </span>
                        <input
                            className={fieldClassName(
                                Boolean(form.formState.errors.ean),
                            )}
                            type="text"
                            inputMode="numeric"
                            maxLength={13}
                            placeholder="0000000000000"
                            {...form.register("ean")}
                        />
                        {form.formState.errors.ean ? (
                            <span className="text-sm text-rose-600">
                                {form.formState.errors.ean.message}
                            </span>
                        ) : null}
                    </label>

                    <label className="grid gap-2">
                        <span className="text-sm font-medium text-slate-700">
                            Nome do produto
                        </span>
                        <input
                            className={fieldClassName(
                                Boolean(form.formState.errors.name),
                            )}
                            type="text"
                            autoComplete="off"
                            {...form.register("name")}
                        />
                        {form.formState.errors.name ? (
                            <span className="text-sm text-rose-600">
                                {form.formState.errors.name.message}
                            </span>
                        ) : null}
                    </label>

                    <div className="grid gap-4 md:grid-cols-3">
                        <label className="grid gap-2 md:col-span-1">
                            <span className="text-sm font-medium text-slate-700">
                                Preço
                            </span>
                            <input
                                className={fieldClassName(
                                    Boolean(form.formState.errors.price),
                                )}
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0,00"
                                {...form.register("price", {
                                    valueAsNumber: true,
                                })}
                            />
                            {form.formState.errors.price ? (
                                <span className="text-sm text-rose-600">
                                    {form.formState.errors.price.message}
                                </span>
                            ) : null}
                        </label>

                        <label className="grid gap-2 md:col-span-1">
                            <span className="text-sm font-medium text-slate-700">
                                Estoque mínimo
                            </span>
                            <input
                                className={fieldClassName(
                                    Boolean(form.formState.errors.minStock),
                                )}
                                type="number"
                                step="1"
                                min="0"
                                placeholder="0"
                                {...form.register("minStock", {
                                    valueAsNumber: true,
                                })}
                            />
                            {form.formState.errors.minStock ? (
                                <span className="text-sm text-rose-600">
                                    {form.formState.errors.minStock.message}
                                </span>
                            ) : null}
                        </label>

                        <label className="grid gap-2 md:col-span-1">
                            <span className="text-sm font-medium text-slate-700">
                                Estoque máximo
                            </span>
                            <input
                                className={fieldClassName(
                                    Boolean(form.formState.errors.maxStock),
                                )}
                                type="number"
                                step="1"
                                min="1"
                                placeholder="0"
                                {...form.register("maxStock", {
                                    valueAsNumber: true,
                                })}
                            />
                            {form.formState.errors.maxStock ? (
                                <span className="text-sm text-rose-600">
                                    {form.formState.errors.maxStock.message}
                                </span>
                            ) : null}
                        </label>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                        Exemplo de preço formatado: {formatCurrencyInput(19.9)}
                    </div>

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
                                ? "Salvando..."
                                : "Salvar"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
