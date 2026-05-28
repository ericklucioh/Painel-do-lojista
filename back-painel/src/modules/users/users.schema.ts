import { z } from "zod";

export const UsersQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    search: z.string().trim().min(1).optional(),
});

export const UserIdParamsSchema = z.object({
    id: z.string().trim().min(1),
});

export const CreateUserBodySchema = z.object({
    fullName: z.string().trim().min(1),
    cpf: z.string().trim().min(1),
    email: z.string().email(),
    password: z.string().min(1),
    role: z.enum(["ADMIN", "VENDEDOR"]),
});

export const UpdateUserBodySchema = z.object({
    fullName: z.string().trim().min(1).optional(),
    role: z.enum(["ADMIN", "VENDEDOR"]).optional(),
});

export const UserListItemResponseSchema = z.object({
    id: z.string(),
    fullName: z.string(),
    email: z.string().email(),
    role: z.enum(["ADMIN", "VENDEDOR"]),
    isActive: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const UserDetailResponseSchema = UserListItemResponseSchema.extend({
    deletedAt: z.string().nullable(),
});

export const UsersListResponseSchema = z.object({
    data: z.array(UserListItemResponseSchema),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    totalItems: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    search: z.string().optional(),
});

export const CreateUserResponseSchema = z.object({
    user: UserDetailResponseSchema,
});

export const UpdateUserResponseSchema = z.object({
    user: UserDetailResponseSchema,
});

export const DeactivateUserResponseSchema = z.object({
    success: z.literal(true),
    user: UserDetailResponseSchema,
});

export type UsersQuery = z.infer<typeof UsersQuerySchema>;
export type UserIdParams = z.infer<typeof UserIdParamsSchema>;
export type CreateUserBody = z.infer<typeof CreateUserBodySchema>;
export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>;
export type UserListItemResponse = z.infer<typeof UserListItemResponseSchema>;
export type UserDetailResponse = z.infer<typeof UserDetailResponseSchema>;
export type UsersListResponse = z.infer<typeof UsersListResponseSchema>;
export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;
export type DeactivateUserResponse = z.infer<
    typeof DeactivateUserResponseSchema
>;
