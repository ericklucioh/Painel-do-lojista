"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cashRegistersService } from "@/services/cash-registers.service";
import { productsService } from "@/services/products.service";
import { salesService } from "@/services/sales.service";
import { CashRegisterStatus } from "@/components/sales/cash-register-status";
import { EanScanner } from "@/components/sales/ean-scanner";
import { CartTable } from "@/components/sales/cart-table";
import { SaleSummaryCard } from "@/components/sales/sale-summary-card";
import { SaleSummaryModal } from "@/components/sales/sale-summary-modal";
import { ReceiptModal } from "@/components/sales/receipt-modal";
import { CashRegisterModal } from "@/components/sales/cash-register-modal";
import {
    calculateSaleSummary,
    formatCurrency,
    getApiErrorMessage,
    toSaleItems,
} from "@/components/sales/sales.helpers";
import { useToast } from "@/components/providers/toaster";
import { useCartStore } from "@/stores/cart.store";
import type { CashRegister, ProductListItem, SaleDto } from "@/types/api";

export function SalesPage() {
    const { toast } = useToast();
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [eanInput, setEanInput] = useState("");
    const [cashRegister, setCashRegister] = useState<CashRegister | null>(
        () => {
            if (typeof window === "undefined") {
                return null;
            }

            const raw = window.localStorage.getItem(
                "painel-do-lojista:cash-register",
            );
            if (!raw) {
                return null;
            }

            try {
                return JSON.parse(raw) as CashRegister;
            } catch {
                return null;
            }
        },
    );
    const [isCashRegisterModalOpen, setIsCashRegisterModalOpen] =
        useState(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [activeSale, setActiveSale] = useState<SaleDto | null>(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isCancellingSale, setIsCancellingSale] = useState(false);
    const [receiptError, setReceiptError] = useState<string | null>(null);
    const [isCreatingSale, setIsCreatingSale] = useState(false);

    const cartItems = useCartStore((state) => state.items);
    const discountInput = useCartStore((state) => state.discountInput);
    const addItem = useCartStore((state) => state.addItem);
    const setQuantity = useCartStore((state) => state.setQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const clearCart = useCartStore((state) => state.clearCart);
    const setDiscountInput = useCartStore((state) => state.setDiscountInput);

    useEffect(() => {
        let active = true;

        const loadProducts = async () => {
            setLoadingProducts(true);

            try {
                const response = await productsService.list({ page: 1 });
                if (!active) {
                    return;
                }

                setProducts(response.data);
            } catch (error) {
                if (!active) {
                    return;
                }

                const message = getApiErrorMessage(
                    error,
                    "Não foi possível carregar os produtos.",
                );
                toast({
                    variant: "error",
                    title: "Falha ao carregar produtos",
                    description: message,
                });
            } finally {
                if (active) {
                    setLoadingProducts(false);
                }
            }
        };

        void loadProducts();

        return () => {
            active = false;
        };
    }, [toast]);

    useEffect(() => {
        if (cashRegister === null || typeof window === "undefined") {
            return;
        }

        window.localStorage.setItem(
            "painel-do-lojista:cash-register",
            JSON.stringify(cashRegister),
        );
    }, [cashRegister]);

    const summary = useMemo(
        () => calculateSaleSummary(cartItems, discountInput),
        [cartItems, discountInput],
    );

    const quickProducts = useMemo(() => products.slice(0, 6), [products]);

    const handleAddProduct = async (value?: string) => {
        const normalizedEan = (value ?? eanInput).trim();
        if (normalizedEan.length === 0) {
            return;
        }

        try {
            const product = await productsService.getByEan(normalizedEan);

            if (!product.isActive) {
                const message = "Produto não disponível para venda.";
                toast({
                    variant: "error",
                    title: "Produto indisponível",
                    description: message,
                });
                return;
            }

            addItem(product);
            setEanInput("");
            toast({
                variant: "success",
                title: "Produto adicionado",
                description: product.name,
            });
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                "Produto não encontrado.",
            );
            toast({
                variant: "error",
                title: "Não foi possível adicionar o produto",
                description: message,
            });
        }
    };

    const handleOpenCashRegister = async (
        values: Parameters<typeof cashRegistersService.open>[0],
    ) => {
        try {
            const response = await cashRegistersService.open(values);
            setCashRegister(response.cashRegister);
            setIsCashRegisterModalOpen(false);
            toast({
                variant: "success",
                title: "Caixa aberto com sucesso",
            });
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                "Não foi possível abrir o caixa.",
            );
            toast({
                variant: "error",
                title: "Erro ao abrir caixa",
                description: message,
            });
        }
    };

    const handleFinalizeSale = async () => {
        if (cashRegister === null) {
            toast({
                variant: "error",
                title: "Abra um caixa antes de vender",
            });
            return;
        }

        if (cartItems.length === 0) {
            toast({
                variant: "error",
                title: "Adicione ao menos um produto ao carrinho",
            });
            return;
        }

        setIsCreatingSale(true);
        setReceiptError(null);

        try {
            const response = await salesService.create({
                cashRegisterId: cashRegister.id,
                items: toSaleItems(cartItems),
                discountAmount: summary.discount,
                paymentMethod: "DINHEIRO",
            });

            setActiveSale(response.sale);
            setIsSummaryModalOpen(false);
            setIsReceiptModalOpen(true);

            try {
                setIsPrinting(true);
                await salesService.printReceipt(response.sale.id);
                clearCart();
                toast({
                    variant: "success",
                    title: "Recibo impresso com sucesso",
                });
            } catch (error) {
                const message = getApiErrorMessage(
                    error,
                    "Não foi possível imprimir o recibo.",
                );
                setReceiptError(message);
                toast({
                    variant: "error",
                    title: "Erro ao imprimir recibo",
                    description: message,
                });
            } finally {
                setIsPrinting(false);
            }
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                "Não foi possível finalizar a venda.",
            );
            toast({
                variant: "error",
                title: "Erro ao finalizar venda",
                description: message,
            });
        } finally {
            setIsCreatingSale(false);
        }
    };

    const handleRetryPrint = async () => {
        if (activeSale === null) {
            return;
        }

        setReceiptError(null);
        setIsPrinting(true);

        try {
            await salesService.printReceipt(activeSale.id);
            clearCart();
            toast({
                variant: "success",
                title: "Recibo impresso com sucesso",
            });
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                "Não foi possível imprimir o recibo.",
            );
            setReceiptError(message);
            toast({
                variant: "error",
                title: "Erro ao imprimir recibo",
                description: message,
            });
        } finally {
            setIsPrinting(false);
        }
    };

    const handleCancelSale = async () => {
        if (activeSale === null) {
            return;
        }

        setIsCancellingSale(true);

        try {
            await salesService.cancel(activeSale.id);
            clearCart();
            setActiveSale(null);
            setIsReceiptModalOpen(false);
            setReceiptError(null);
            toast({
                variant: "success",
                title: "Venda cancelada com sucesso",
            });
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                "Não foi possível cancelar a venda.",
            );
            toast({
                variant: "error",
                title: "Erro ao cancelar venda",
                description: message,
            });
        } finally {
            setIsCancellingSale(false);
        }
    };

    const handleClearCart = () => {
        clearCart();
        toast({
            variant: "info",
            title: "Carrinho limpo",
        });
    };

    const selectedLastSale = activeSale;

    return (
        <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(37,99,235,0.92))] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100/75">
                            Vendas / PDV
                        </p>
                        <h2 className="text-3xl font-semibold tracking-tight">
                            Carrinho, desconto e finalização
                        </h2>
                        <p className="max-w-2xl text-sm leading-6 text-blue-50/80">
                            Use o EAN para adicionar itens, ajuste quantidades,
                            abra o caixa e finalize a venda em dinheiro.
                        </p>
                    </div>

                    <CashRegisterStatus
                        cashRegister={cashRegister}
                        onOpenCashRegister={() =>
                            setIsCashRegisterModalOpen(true)
                        }
                    />
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-6">
                    <EanScanner
                        value={eanInput}
                        onValueChange={setEanInput}
                        onSubmit={() => {
                            void handleAddProduct();
                        }}
                        onOpenCashRegister={() =>
                            setIsCashRegisterModalOpen(true)
                        }
                    />

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 space-y-1">
                            <h3 className="text-lg font-semibold text-slate-950">
                                Atalhos de produto
                            </h3>
                            <p className="text-sm text-slate-500">
                                Produtos ativos do seed para acelerar a demo.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {loadingProducts ? (
                                <div className="col-span-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                                    Carregando produtos...
                                </div>
                            ) : quickProducts.length === 0 ? (
                                <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                                    Nenhum produto ativo disponível.
                                </div>
                            ) : (
                                quickProducts.map((product) => (
                                    <button
                                        key={product.id}
                                        type="button"
                                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-white"
                                        onClick={() => {
                                            void handleAddProduct(product.ean);
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <strong className="block text-sm text-slate-950">
                                                    {product.name}
                                                </strong>
                                                <span className="mt-1 block text-xs text-slate-500">
                                                    {product.ean}
                                                </span>
                                            </div>
                                            <span
                                                className={
                                                    product.isCritical
                                                        ? "rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-700"
                                                        : "rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700"
                                                }
                                            >
                                                {product.isCritical
                                                    ? "Crítico"
                                                    : "OK"}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                                            <span>
                                                {formatCurrency(product.price)}
                                            </span>
                                            <span>
                                                Estoque {product.stockCurrent}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </section>

                    <CartTable
                        items={cartItems}
                        onQuantityChange={setQuantity}
                        onRemoveItem={removeItem}
                    />
                </div>

                <aside className="space-y-6">
                    <SaleSummaryCard
                        summary={summary}
                        discountInput={discountInput}
                        cashRegister={cashRegister}
                        onDiscountChange={setDiscountInput}
                        onOpenSummary={() => setIsSummaryModalOpen(true)}
                        onClearCart={handleClearCart}
                    />

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 space-y-1">
                            <h3 className="text-lg font-semibold text-slate-950">
                                Última venda
                            </h3>
                            <p className="text-sm text-slate-500">
                                Recibo e ações após confirmação.
                            </p>
                        </div>

                        {selectedLastSale ? (
                            <div className="space-y-4 text-sm">
                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">
                                            Recibo #
                                            {selectedLastSale.receiptNumber}
                                        </span>
                                        <span className="font-medium text-slate-950">
                                            {new Intl.DateTimeFormat("pt-BR", {
                                                dateStyle: "short",
                                                timeStyle: "short",
                                            }).format(
                                                new Date(
                                                    selectedLastSale.createdAt,
                                                ),
                                            )}
                                        </span>
                                    </div>
                                    <div className="mt-3 text-slate-700">
                                        Vendedor:{" "}
                                        {selectedLastSale.soldByUserName}
                                    </div>
                                    <div className="mt-1 text-slate-700">
                                        Total:{" "}
                                        {formatCurrency(
                                            selectedLastSale.totalAmount,
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setReceiptError(null);
                                            setIsReceiptModalOpen(true);
                                        }}
                                    >
                                        Ver recibo
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        type="button"
                                        onClick={() => {
                                            void handleCancelSale();
                                        }}
                                        disabled={isCancellingSale}
                                    >
                                        {isCancellingSale
                                            ? "Cancelando..."
                                            : "Cancelar venda"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                                Nenhuma venda concluída ainda.
                            </div>
                        )}
                    </section>
                </aside>
            </div>

            <CashRegisterModal
                open={isCashRegisterModalOpen}
                onClose={() => setIsCashRegisterModalOpen(false)}
                onSubmit={(values) => {
                    void handleOpenCashRegister(values);
                }}
            />

            {isSummaryModalOpen ? (
                <SaleSummaryModal
                    summary={summary}
                    onClose={() => setIsSummaryModalOpen(false)}
                    onConfirm={() => {
                        void handleFinalizeSale();
                    }}
                    isSubmitting={isCreatingSale}
                />
            ) : null}

            {isReceiptModalOpen && activeSale ? (
                <ReceiptModal
                    sale={activeSale}
                    errorMessage={receiptError}
                    isPrinting={isPrinting}
                    isCancellingSale={isCancellingSale}
                    onClose={() => {
                        setIsReceiptModalOpen(false);
                        setReceiptError(null);
                    }}
                    onRetryPrint={() => {
                        void handleRetryPrint();
                    }}
                    onCancelSale={() => {
                        void handleCancelSale();
                    }}
                />
            ) : null}
        </div>
    );
}
