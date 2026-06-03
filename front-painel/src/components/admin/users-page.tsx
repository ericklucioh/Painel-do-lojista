"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserFormDialog } from "@/components/admin/user-form-dialog";
import { useToast } from "@/components/providers/toaster";
import { usersService } from "@/services/users.service";
import type {
    UserCreateFormValues,
    UserUpdateFormValues,
} from "@/schemas/user.schema";
import type { UserListItem } from "@/types/api";

type UsersApiError = {
    message?: string;
};

function userRoleLabel(role: UserListItem["role"]): string {
    return role === "ADMIN" ? "Admin" : "Vendedor";
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value));
}

export function UsersPage() {
    const { toast } = useToast();
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let active = true;

        const loadUsers = async () => {
            setLoading(true);

            try {
                const response = await usersService.list({
                    page,
                    search:
                        search.trim().length > 0 ? search.trim() : undefined,
                });

                if (!active) {
                    return;
                }

                setUsers(response.data);
                setTotalPages(response.totalPages);
            } catch (loadError) {
                if (!active) {
                    return;
                }

                const message =
                    (loadError as { response?: { data?: UsersApiError } })
                        .response?.data?.message ??
                    "Não foi possível carregar os usuários.";
                toast({
                    variant: "error",
                    title: "Falha ao carregar usuários",
                    description: message,
                });
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadUsers();

        return () => {
            active = false;
        };
    }, [page, search, toast]);

    const refreshUsers = async () => {
        const response = await usersService.list({
            page,
            search: search.trim().length > 0 ? search.trim() : undefined,
        });

        setUsers(response.data);
        setTotalPages(response.totalPages);
    };

    const handleCreate = async (values: UserCreateFormValues) => {
        setIsSaving(true);

        try {
            await usersService.create(values);
            await refreshUsers();
            setIsCreateOpen(false);
            toast({
                variant: "success",
                title: "Usuário criado com sucesso",
            });
        } catch (createError) {
            const apiError = createError as {
                response?: { data?: UsersApiError };
            };
            const message =
                apiError.response?.data?.message ??
                "Não foi possível criar o usuário.";
            toast({
                variant: "error",
                title: "Falha ao criar usuário",
                description: message,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdate = async (id: string, values: UserUpdateFormValues) => {
        setIsSaving(true);

        try {
            await usersService.update(id, values);
            await refreshUsers();
            setEditingUser(null);
            toast({
                variant: "success",
                title: "Usuário atualizado com sucesso",
            });
        } catch (updateError) {
            const apiError = updateError as {
                response?: { data?: UsersApiError };
            };
            const message =
                apiError.response?.data?.message ??
                "Não foi possível atualizar o usuário.";
            toast({
                variant: "error",
                title: "Falha ao atualizar usuário",
                description: message,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeactivate = async (id: string) => {
        const shouldDeactivate = window.confirm(
            "Deseja desativar este usuário?",
        );

        if (!shouldDeactivate) {
            return;
        }

        setIsSaving(true);

        try {
            await usersService.deactivate(id);
            await refreshUsers();
            toast({
                variant: "success",
                title: "Usuário desativado com sucesso",
            });
        } catch (deactivateError) {
            const apiError = deactivateError as {
                response?: { data?: UsersApiError };
            };
            const message =
                apiError.response?.data?.message ??
                "Não foi possível desativar o usuário.";
            toast({
                variant: "error",
                title: "Falha ao desativar usuário",
                description: message,
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.94))] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                            Admin / Usuários
                        </p>
                        <h2 className="text-3xl font-semibold tracking-tight">
                            Gestão de usuários
                        </h2>
                        <p className="max-w-2xl text-sm leading-6 text-slate-300">
                            Cadastro, edição e desativação com listagem paginada
                            e sessão protegida pelo Next.
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => {
                            setEditingUser(null);
                            setIsCreateOpen(true);
                        }}
                    >
                        Novo usuário
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-700">
                        {users.length} usuário(s) visível(is)
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
                        placeholder="Nome ou e-mail"
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
                                <th className="px-6 py-4">Nome</th>
                                <th className="px-6 py-4">E-mail</th>
                                <th className="px-6 py-4">Tipo</th>
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
                                        colSpan={6}
                                    >
                                        Carregando usuários...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td
                                        className="px-6 py-10 text-sm text-slate-500"
                                        colSpan={6}
                                    >
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className={
                                            user.isActive
                                                ? "bg-white"
                                                : "bg-slate-50/80"
                                        }
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-950">
                                                {user.fullName}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Criado em{" "}
                                                {formatDate(user.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {userRoleLabel(user.role)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={
                                                    user.isActive
                                                        ? "inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                                                        : "inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                                                }
                                            >
                                                {user.isActive
                                                    ? "Ativo"
                                                    : "Inativo"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {formatDate(user.updatedAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    type="button"
                                                    onClick={() => {
                                                        setIsCreateOpen(false);
                                                        setEditingUser(user);
                                                    }}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    type="button"
                                                    disabled={
                                                        !user.isActive ||
                                                        isSaving
                                                    }
                                                    onClick={() => {
                                                        void handleDeactivate(
                                                            user.id,
                                                        );
                                                    }}
                                                >
                                                    Desativar
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

            <UserFormDialog
                open={isCreateOpen || editingUser !== null}
                user={editingUser}
                onClose={() => {
                    setEditingUser(null);
                    setIsCreateOpen(false);
                }}
                onSubmitCreate={handleCreate}
                onSubmitUpdate={handleUpdate}
            />
        </div>
    );
}
