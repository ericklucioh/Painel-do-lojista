import { api } from "@/lib/api";
import type {
    CreateUserInput,
    CreateUserResponse,
    DeactivateUserResponse,
    UpdateUserInput,
    UpdateUserResponse,
    UsersListResponse,
    UsersQuery,
} from "@/types/api";

export const usersService = {
    list: async (query: UsersQuery = {}) => {
        const response = await api.get<UsersListResponse>("/api/users", {
            params: query,
        });
        return response.data;
    },
    create: async (payload: CreateUserInput) => {
        const response = await api.post<CreateUserResponse>(
            "/api/users",
            payload,
        );
        return response.data;
    },
    update: async (id: string, payload: UpdateUserInput) => {
        const response = await api.put<UpdateUserResponse>(
            `/api/users/${id}`,
            payload,
        );
        return response.data;
    },
    deactivate: async (id: string) => {
        const response = await api.patch<DeactivateUserResponse>(
            `/api/users/${id}/deactivate`,
        );
        return response.data;
    },
};
