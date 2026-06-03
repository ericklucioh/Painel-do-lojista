"use client";

import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export type ToastInput = {
    title: string;
    description?: string;
    variant?: ToastVariant;
    duration?: number;
};

type ToastItem = ToastInput & {
    id: string;
    variant: ToastVariant;
};

type ToastContextValue = {
    toast: (input: ToastInput) => string;
    dismiss: (id: string) => void;
    clear: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4500;

function createToastId(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toastVariantClasses(variant: ToastVariant): string {
    switch (variant) {
        case "success":
            return "border-emerald-200 bg-emerald-50 text-emerald-950 shadow-emerald-950/5";
        case "error":
            return "border-rose-200 bg-rose-50 text-rose-950 shadow-rose-950/5";
        case "warning":
            return "border-amber-200 bg-amber-50 text-amber-950 shadow-amber-950/5";
        case "info":
            return "border-sky-200 bg-sky-50 text-sky-950 shadow-sky-950/5";
        default:
            return "border-slate-200 bg-white text-slate-950 shadow-slate-950/10";
    }
}

export function ToasterProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const clear = useCallback(() => {
        setToasts([]);
    }, []);

    const toast = useCallback(
        (input: ToastInput): string => {
            const id = createToastId();
            const nextToast: ToastItem = {
                id,
                title: input.title,
                description: input.description,
                variant: input.variant ?? "default",
                duration: input.duration ?? DEFAULT_DURATION,
            };

            setToasts((current) => [nextToast, ...current].slice(0, 4));

            window.setTimeout(() => {
                dismiss(id);
            }, nextToast.duration);

            return id;
        },
        [dismiss],
    );

    const value: ToastContextValue = {
        toast,
        dismiss,
        clear,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}

            <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-3 px-4">
                {toasts.map((toastItem) => (
                    <div
                        key={toastItem.id}
                        className={cn(
                            "pointer-events-auto w-full max-w-md rounded-2xl border p-4 shadow-lg backdrop-blur",
                            toastVariantClasses(toastItem.variant),
                        )}
                        role="status"
                        aria-live="polite"
                    >
                        <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1 space-y-1">
                                <p className="text-sm font-semibold">
                                    {toastItem.title}
                                </p>
                                {toastItem.description ? (
                                    <p className="text-sm leading-6 text-current/80">
                                        {toastItem.description}
                                    </p>
                                ) : null}
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="shrink-0 rounded-full"
                                onClick={() => dismiss(toastItem.id)}
                                aria-label="Fechar notificação"
                            >
                                <X className="size-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (context === null) {
        throw new Error("useToast must be used within ToasterProvider.");
    }

    return context;
}
