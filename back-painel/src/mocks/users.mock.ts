import type {
    CreateUserResponse,
    DeactivateUserResponse,
    UpdateUserResponse,
    UsersListResponse,
} from "../modules/users/users.schema";

export const usersListMock: UsersListResponse = {
    data: [
        {
            id: "user_admin_1",
            fullName: "Admin do Sistema",
            email: "admin@painel.com",
            role: "ADMIN",
            isActive: true,
            createdAt: "2026-05-24T10:00:00.000Z",
            updatedAt: "2026-05-24T10:00:00.000Z",
        },
        {
            id: "user_vendor_1",
            fullName: "Joao Vendedor",
            email: "joao@painel.com",
            role: "VENDEDOR",
            isActive: true,
            createdAt: "2026-05-24T10:00:00.000Z",
            updatedAt: "2026-05-24T10:00:00.000Z",
        },
    ],
    page: 1,
    pageSize: 10,
    totalItems: 2,
    totalPages: 1,
};

export const userSingleMock = usersListMock.data[0]!;

export const createUserMock: CreateUserResponse = {
    user: {
        ...userSingleMock,
        deletedAt: null,
    },
};

export const updateUserMock: UpdateUserResponse = createUserMock;

export const deactivateUserMock: DeactivateUserResponse = {
    success: true,
    user: {
        ...userSingleMock,
        deletedAt: "2026-05-27T10:00:00.000Z",
        isActive: false,
    },
};
