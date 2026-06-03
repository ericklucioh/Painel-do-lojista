"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { UserCreateSchema, UserUpdateSchema } from "@/schemas/user.schema";
import type {
    UserCreateFormValues,
    UserUpdateFormValues,
} from "@/schemas/user.schema";
import type { UserListItem, UserRole } from "@/types/api";
import { cn } from "@/lib/utils";

type UserFormDialogProps = {
    open: boolean;
    user: UserListItem | null;
    onClose: () => void;
    onSubmitCreate: (values: UserCreateFormValues) => Promise<void>;
    onSubmitUpdate: (id: string, values: UserUpdateFormValues) => Promise<void>;
};

function roleLabel(role: UserRole): string {
    return role === "ADMIN" ? "Admin" : "Vendedor";
}

function fieldClassName(hasError: boolean): string {
    return cn(
        "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400",
        hasError ? "border-rose-300" : "border-slate-200",
    );
}

export function UserFormDialog({
    open,
    user,
    onClose,
    onSubmitCreate,
    onSubmitUpdate,
}: UserFormDialogProps) {
    const isEditing = user !== null;

    const createForm = useForm<UserCreateFormValues>({
        resolver: zodResolver(UserCreateSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            role: "VENDEDOR",
        },
    });

    const updateForm = useForm<UserUpdateFormValues>({
        resolver: zodResolver(UserUpdateSchema),
        defaultValues: {
            fullName: "",
            role: "VENDEDOR",
        },
    });

    useEffect(() => {
        if (!open) {
            createForm.reset();
            updateForm.reset();
            return;
        }

        if (user) {
            updateForm.reset({
                fullName: user.fullName,
                role: user.role,
            });
            return;
        }

        createForm.reset({
            fullName: "",
            email: "",
            password: "",
            role: "VENDEDOR",
        });
    }, [createForm, open, updateForm, user]);

    if (!open) {
        return null;
    }

    const title = isEditing ? "Editar usuário" : "Novo usuário";
    const description = isEditing
        ? "Atualize nome e perfil de acesso."
        : "Crie um novo usuário com e-mail e senha.";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.22)]">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Usuários
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

                {isEditing && user ? (
                    <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                        Editando{" "}
                        <strong className="text-slate-950">
                            {user.fullName}
                        </strong>{" "}
                        como {roleLabel(user.role)}.
                    </div>
                ) : null}

                {isEditing && user ? (
                    <form
                        className="grid gap-4"
                        onSubmit={updateForm.handleSubmit(async (values) => {
                            await onSubmitUpdate(user.id, values);
                        })}
                    >
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">
                                Nome completo
                            </span>
                            <input
                                className={fieldClassName(
                                    Boolean(
                                        updateForm.formState.errors.fullName,
                                    ),
                                )}
                                type="text"
                                autoComplete="name"
                                {...updateForm.register("fullName")}
                            />
                            {updateForm.formState.errors.fullName ? (
                                <span className="text-sm text-rose-600">
                                    {
                                        updateForm.formState.errors.fullName
                                            .message
                                    }
                                </span>
                            ) : null}
                        </label>

                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">
                                Tipo
                            </span>
                            <select
                                className={fieldClassName(
                                    Boolean(updateForm.formState.errors.role),
                                )}
                                {...updateForm.register("role")}
                            >
                                <option value="ADMIN">Admin</option>
                                <option value="VENDEDOR">Vendedor</option>
                            </select>
                            {updateForm.formState.errors.role ? (
                                <span className="text-sm text-rose-600">
                                    {updateForm.formState.errors.role.message}
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
                                disabled={updateForm.formState.isSubmitting}
                            >
                                {updateForm.formState.isSubmitting
                                    ? "Salvando..."
                                    : "Salvar alterações"}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <form
                        className="grid gap-4"
                        onSubmit={createForm.handleSubmit(async (values) => {
                            await onSubmitCreate(values);
                        })}
                    >
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">
                                Nome completo
                            </span>
                            <input
                                className={fieldClassName(
                                    Boolean(
                                        createForm.formState.errors.fullName,
                                    ),
                                )}
                                type="text"
                                autoComplete="name"
                                {...createForm.register("fullName")}
                            />
                            {createForm.formState.errors.fullName ? (
                                <span className="text-sm text-rose-600">
                                    {
                                        createForm.formState.errors.fullName
                                            .message
                                    }
                                </span>
                            ) : null}
                        </label>

                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">
                                E-mail
                            </span>
                            <input
                                className={fieldClassName(
                                    Boolean(createForm.formState.errors.email),
                                )}
                                type="email"
                                autoComplete="email"
                                {...createForm.register("email")}
                            />
                            {createForm.formState.errors.email ? (
                                <span className="text-sm text-rose-600">
                                    {createForm.formState.errors.email.message}
                                </span>
                            ) : null}
                        </label>

                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">
                                Senha
                            </span>
                            <input
                                className={fieldClassName(
                                    Boolean(
                                        createForm.formState.errors.password,
                                    ),
                                )}
                                type="password"
                                autoComplete="new-password"
                                {...createForm.register("password")}
                            />
                            {createForm.formState.errors.password ? (
                                <span className="text-sm text-rose-600">
                                    {
                                        createForm.formState.errors.password
                                            .message
                                    }
                                </span>
                            ) : null}
                        </label>

                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">
                                Tipo
                            </span>
                            <select
                                className={fieldClassName(
                                    Boolean(createForm.formState.errors.role),
                                )}
                                {...createForm.register("role")}
                            >
                                <option value="ADMIN">Admin</option>
                                <option value="VENDEDOR">Vendedor</option>
                            </select>
                            {createForm.formState.errors.role ? (
                                <span className="text-sm text-rose-600">
                                    {createForm.formState.errors.role.message}
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
                                disabled={createForm.formState.isSubmitting}
                            >
                                {createForm.formState.isSubmitting
                                    ? "Criando..."
                                    : "Criar usuário"}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
