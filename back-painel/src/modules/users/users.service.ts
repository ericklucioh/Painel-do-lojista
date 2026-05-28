import { hash } from "bcryptjs";
import { createHttpError } from "../../utils/httpError";
import { usersListMock } from "../../mocks/users.mock";
import type {
    CreateUserBody,
    CreateUserResponse,
    DeactivateUserResponse,
    UpdateUserBody,
    UpdateUserResponse,
    UserDetailResponse,
    UserListItemResponse,
    UsersListResponse,
    UsersQuery,
} from "./users.schema";

type UserStoreItem = UserDetailResponse & {
    passwordHash: string;
};

export interface UsersService {
    list(query: UsersQuery): UsersListResponse;
    create(input: CreateUserBody): Promise<CreateUserResponse>;
    update(id: string, input: UpdateUserBody): Promise<UpdateUserResponse>;
    deactivate(id: string): Promise<DeactivateUserResponse>;
}

function toListItem(user: UserStoreItem): UserListItemResponse {
    return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

function toDetailItem(user: UserStoreItem): UserDetailResponse {
    return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt,
    };
}

export function createUsersService(): UsersService {
    const store = new Map<string, UserStoreItem>(
        usersListMock.data.map((user) => [
            user.id,
            {
                ...user,
                deletedAt: null,
                passwordHash: "mock-password-hash",
            },
        ]),
    );

    let nextIndex = store.size + 1;

    return {
        list(query) {
            const normalizedSearch = query.search?.trim().toLowerCase();
            const items = [...store.values()].filter((user) => {
                if (!user.isActive) {
                    return false;
                }

                if (normalizedSearch === undefined) {
                    return true;
                }

                return (
                    user.fullName.toLowerCase().includes(normalizedSearch) ||
                    user.email.toLowerCase().includes(normalizedSearch)
                );
            });

            const pageSize = 10;
            const totalItems = items.length;
            const totalPages =
                totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
            const page = Math.min(query.page, Math.max(totalPages, 1));
            const start = (page - 1) * pageSize;

            return {
                data: items.slice(start, start + pageSize).map(toListItem),
                page,
                pageSize,
                totalItems,
                totalPages,
                ...(query.search === undefined ? {} : { search: query.search }),
            };
        },

        async create(input) {
            const emailExists = [...store.values()].some(
                (user) => user.email === input.email,
            );
            if (emailExists) {
                throw createHttpError("Este e-mail já está registrado", 400);
            }

            const now = new Date().toISOString();
            const passwordHash = await hash(input.password, 10);
            const user: UserStoreItem = {
                id: `user_${String(nextIndex).padStart(3, "0")}`,
                fullName: input.fullName,
                email: input.email,
                role: input.role,
                isActive: true,
                createdAt: now,
                updatedAt: now,
                deletedAt: null,
                passwordHash,
            };

            nextIndex += 1;
            store.set(user.id, user);

            return {
                user: toDetailItem(user),
            };
        },

        async update(id, input) {
            const current = store.get(id);
            if (current === undefined || !current.isActive) {
                throw createHttpError("User not found", 404);
            }

            const updated: UserStoreItem = {
                ...current,
                fullName: input.fullName ?? current.fullName,
                role: input.role ?? current.role,
                updatedAt: new Date().toISOString(),
            };

            store.set(id, updated);

            return {
                user: toDetailItem(updated),
            };
        },

        async deactivate(id) {
            const current = store.get(id);
            if (current === undefined || !current.isActive) {
                throw createHttpError("User not found", 404);
            }

            const updated: UserStoreItem = {
                ...current,
                isActive: false,
                deletedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            store.set(id, updated);

            return {
                success: true,
                user: toDetailItem(updated),
            };
        },
    };
}
