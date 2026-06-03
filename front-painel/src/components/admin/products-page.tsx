"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import { useToast } from "@/components/providers/toaster";
import { productsService } from "@/services/products.service";
import type { ProductFormValues } from "@/schemas/product.schema";
import type { ProductListItem } from "@/types/api";

type ProductApiError = {
    message?: string;
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value));
}

export function ProductsPage() {
    const { toast } = useToast();
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] =
        useState<ProductListItem | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let active = true;

        const loadProducts = async () => {
            setLoading(true);

            try {
                const response = await productsService.list({
                    page,
                    search:
                        search.trim().length > 0 ? search.trim() : undefined,
                });

                if (!active) {
                    return;
                }

                setProducts(response.data);
                setTotalPages(response.totalPages);
            } catch (loadError) {
                if (!active) {
                    return;
                }

                const message =
                    (loadError as { response?: { data?: ProductApiError } })
                        .response?.data?.message ??
                    "Não foi possível carregar os produtos.";
                toast({
                    variant: "error",
                    title: "Falha ao carregar produtos",
                    description: message,
                });
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadProducts();

        return () => {
            active = false;
        };
    }, [page, search, toast]);

    const refreshProducts = async () => {
        const response = await productsService.list({
            page,
            search: search.trim().length > 0 ? search.trim() : undefined,
        });

        setProducts(response.data);
        setTotalPages(response.totalPages);
    };

    const handleCreate = async (values: ProductFormValues) => {
        setIsSaving(true);

        try {
            await productsService.create(values);
            await refreshProducts();
            setIsCreateOpen(false);
            toast({
                variant: "success",
                title: "Produto criado com sucesso",
            });
        } catch (createError) {
            const apiError = createError as {
                response?: { data?: ProductApiError };
            };
            const message =
                apiError.response?.data?.message ??
                "Não foi possível criar o produto.";
            toast({
                variant: "error",
                title: "Falha ao criar produto",
                description: message,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdate = async (id: string, values: ProductFormValues) => {
        setIsSaving(true);

        try {
            await productsService.update(id, values);
            await refreshProducts();
            setEditingProduct(null);
            toast({
                variant: "success",
                title: "Produto atualizado com sucesso",
            });
        } catch (updateError) {
            const apiError = updateError as {
                response?: { data?: ProductApiError };
            };
            const message =
                apiError.response?.data?.message ??
                "Não foi possível atualizar o produto.";
            toast({
                variant: "error",
                title: "Falha ao atualizar produto",
                description: message,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeactivate = async (id: string) => {
        const shouldDeactivate = window.confirm(
            "Deseja inativar este produto?",
        );

        if (!shouldDeactivate) {
            return;
        }

        setIsSaving(true);

        try {
            await productsService.deactivate(id);
            await refreshProducts();
            toast({
                variant: "success",
                title: "Produto inativado com sucesso",
            });
        } catch (deactivateError) {
            const apiError = deactivateError as {
                response?: { data?: ProductApiError };
            };
            const message =
                apiError.response?.data?.message ??
                "Não foi possível inativar o produto.";
            toast({
                variant: "error",
                title: "Falha ao inativar produto",
                description: message,
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(7,89,133,0.98),rgba(14,116,144,0.92))] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
                            Admin / Produtos
                        </p>
                        <h2 className="text-3xl font-semibold tracking-tight">
                            Gestão de produtos
                        </h2>
                        <p className="max-w-2xl text-sm leading-6 text-cyan-50/80">
                            Catalogação com busca por nome ou EAN, destaque de
                            estoque crítico e ações de criar, editar e inativar.
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => {
                            setEditingProduct(null);
                            setIsCreateOpen(true);
                        }}
                    >
                        Novo produto
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-700">
                        {products.length} produto(s) visível(is)
                    </p>
                    <p className="text-sm text-slate-500">
                        Página {page} de {totalPages}
                    </p>
                </div>

                <label className="flex w-full max-w-md flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Buscar
                    </span>
                    <input
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                        placeholder="Nome ou EAN"
                        value={search}
                        onChange={(event) => {
                            setPage(1);
                            setSearch(event.target.value);
                        }}
                    />
                </label>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                <th className="px-6 py-4">EAN</th>
                                <th className="px-6 py-4">Nome</th>
                                <th className="px-6 py-4">Preço</th>
                                <th className="px-6 py-4">Estoque</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Atualizado</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td
                                        className="px-6 py-10 text-sm text-slate-500"
                                        colSpan={7}
                                    >
                                        Carregando produtos...
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td
                                        className="px-6 py-10 text-sm text-slate-500"
                                        colSpan={7}
                                    >
                                        Nenhum produto encontrado.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr
                                        key={product.id}
                                        className={
                                            product.isCritical
                                                ? "bg-rose-50/50"
                                                : "bg-white"
                                        }
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                            {product.ean}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-950">
                                                {product.name}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Criado em{" "}
                                                {formatDate(product.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {formatCurrency(product.price)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <span className="font-medium text-slate-900">
                                                {product.stockCurrent}
                                            </span>{" "}
                                            / {product.minStock} a{" "}
                                            {product.maxStock}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                <span
                                                    className={
                                                        product.isActive
                                                            ? "inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                                                            : "inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                                                    }
                                                >
                                                    {product.isActive
                                                        ? "Ativo"
                                                        : "Inativo"}
                                                </span>
                                                {product.isCritical ? (
                                                    <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                                                        Crítico
                                                    </span>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {formatDate(product.updatedAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    type="button"
                                                    onClick={() => {
                                                        setIsCreateOpen(false);
                                                        setEditingProduct(
                                                            product,
                                                        );
                                                    }}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    type="button"
                                                    disabled={
                                                        !product.isActive ||
                                                        isSaving
                                                    }
                                                    onClick={() => {
                                                        void handleDeactivate(
                                                            product.id,
                                                        );
                                                    }}
                                                >
                                                    Inativar
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3">
                <Button
                    variant="outline"
                    type="button"
                    disabled={page <= 1}
                    onClick={() => {
                        setPage((currentPage) => Math.max(1, currentPage - 1));
                    }}
                >
                    Anterior
                </Button>

                <div className="text-sm text-slate-500">
                    Página {page} de {totalPages}
                </div>

                <Button
                    variant="outline"
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => {
                        setPage((currentPage) => currentPage + 1);
                    }}
                >
                    Próxima
                </Button>
            </div>

            <ProductFormDialog
                open={isCreateOpen || editingProduct !== null}
                product={editingProduct}
                onClose={() => {
                    setEditingProduct(null);
                    setIsCreateOpen(false);
                }}
                onSubmitCreate={handleCreate}
                onSubmitUpdate={handleUpdate}
            />
        </div>
    );
}
