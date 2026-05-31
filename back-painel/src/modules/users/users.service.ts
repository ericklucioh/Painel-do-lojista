import { hash } from "bcryptjs";
import type { PrismaClient } from "@prisma/client";
import { createHttpError } from "../../utils/httpError";
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

type UserRecord = {
    id: string;
    cpf: string;
    fullName: string;
    email: string;
    role: "ADMIN" | "VENDEDOR";
    deactivatedAt: Date | null;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export interface UsersService {
    list(query: UsersQuery): Promise<UsersListResponse>;
    create(input: CreateUserBody): Promise<CreateUserResponse>;
    update(id: string, input: UpdateUserBody): Promise<UpdateUserResponse>;
    deactivate(id: string): Promise<DeactivateUserResponse>;
}

export interface CreateUsersServiceDependencies {
    prisma: Pick<PrismaClient, "user">;
}

function isActive(user: UserRecord): boolean {
    return user.deactivatedAt === null && user.deletedAt === null;
}

function toListItem(user: UserRecord): UserListItemResponse {
    return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: isActive(user),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
}

function toDetailItem(user: UserRecord): UserDetailResponse {
    return {
        ...toListItem(user),
        deletedAt: user.deletedAt?.toISOString() ?? null,
    };
}

function normalizeSearch(search: string | undefined): string | undefined {
    const normalized = search?.trim().toLowerCase();
    return normalized === undefined || normalized.length === 0
        ? undefined
        : normalized;
}

function buildActiveWhere(search?: string) {
    return {
        deactivatedAt: null,
        deletedAt: null,
        ...(search === undefined
            ? {}
            : {
                  OR: [
                      {
                          fullName: {
                              contains: search,
                          },
                      },
                      {
                          email: {
                              contains: search,
                          },
                      },
                  ],
              }),
    };
}

export function createUsersService({
    prisma,
}: CreateUsersServiceDependencies): UsersService {
    const pageSize = 10;

    return {
        async list(query) {
            const search = normalizeSearch(query.search);
            const where = buildActiveWhere(search);

            const totalItems = await prisma.user.count({ where });

            const totalPages =
                totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
            const page = Math.min(query.page, Math.max(totalPages, 1));

            const users = (await prisma.user.findMany({
                where,
                orderBy: {
                    createdAt: "asc",
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
            })) as UserRecord[];

            return {
                data: users.map((user) => toListItem(user as UserRecord)),
                page,
                pageSize,
                totalItems,
                totalPages,
                ...(query.search === undefined ? {} : { search: query.search }),
            };
        },

        async create(input) {
            const existingUser = (await prisma.user.findUnique({
                where: {
                    email: input.email,
                },
                select: {
                    id: true,
                },
            })) as { id: string } | null;

            if (existingUser !== null) {
                throw createHttpError("Este e-mail já está registrado", 400);
            }

            const passwordHash = await hash(input.password, 10);
            const createdUser = await prisma.user.create({
                data: {
                    cpf: input.cpf,
                    fullName: input.fullName,
                    email: input.email,
                    passwordHash,
                    role: input.role,
                    deactivatedAt: null,
                    deletedAt: null,
                },
            });

            return {
                user: toDetailItem(createdUser as UserRecord),
            };
        },

        async update(id, input) {
            const currentUser = (await prisma.user.findUnique({
                where: {
                    id,
                },
            })) as UserRecord | null;

            if (currentUser === null || !isActive(currentUser as UserRecord)) {
                throw createHttpError("User not found", 404);
            }

            const updatedUser = await prisma.user.update({
                where: {
                    id,
                },
                data: {
                    fullName: input.fullName ?? currentUser.fullName,
                    role: input.role ?? currentUser.role,
                },
            });

            return {
                user: toDetailItem(updatedUser as UserRecord),
            };
        },

        async deactivate(id) {
            const currentUser = (await prisma.user.findUnique({
                where: {
                    id,
                },
            })) as UserRecord | null;

            if (currentUser === null || !isActive(currentUser as UserRecord)) {
                throw createHttpError("User not found", 404);
            }

            const now = new Date();
            const deactivatedUser = await prisma.user.update({
                where: {
                    id,
                },
                data: {
                    deactivatedAt: now,
                    deletedAt: now,
                },
            });

            return {
                success: true,
                user: toDetailItem(deactivatedUser as UserRecord),
            };
        },
    };
}
