export type UserRole = "ADMIN" | "VENDEDOR";

export type AuthUser = {
    id: string;
    nome: string;
    tipo: UserRole;
};

export type AuthLoginInput = {
    email: string;
    password: string;
};

export type AuthLoginResponse = {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: AuthUser;
};

export type AuthRefreshResponse = {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
};

export type PaginatedResponse<T> = {
    data: T[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    search?: string;
};

export type UserListItem = {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type UserDetail = UserListItem & {
    deletedAt: string | null;
};

export type UsersQuery = {
    page?: number;
    search?: string;
};

export type CreateUserInput = {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
};

export type UpdateUserInput = {
    fullName?: string;
    role?: UserRole;
};

export type UsersListResponse = PaginatedResponse<UserListItem>;
export type CreateUserResponse = {
    user: UserDetail;
};
export type UpdateUserResponse = {
    user: UserDetail;
};
export type DeactivateUserResponse = {
    success: true;
    user: UserDetail;
};

export type ProductQuery = {
    page?: number;
    search?: string;
};

export type ProductListItem = {
    id: string;
    ean: string;
    name: string;
    price: number;
    stockCurrent: number;
    minStock: number;
    maxStock: number;
    isCritical: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type ProductDetail = ProductListItem & {
    deletedAt: string | null;
};

export type ProductByEanResponse = {
    id: string;
    ean: string;
    name: string;
    price: number;
    stockCurrent: number;
    isActive: boolean;
};

export type CreateProductInput = {
    ean: string;
    name: string;
    price: number;
    minStock: number;
    maxStock: number;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type ProductsListResponse = PaginatedResponse<ProductListItem>;
export type CreateProductResponse = {
    product: ProductDetail;
};
export type UpdateProductResponse = {
    product: ProductDetail;
};
export type DeactivateProductResponse = {
    success: true;
    product: ProductDetail;
};

export type StockMovement = {
    id: string;
    productId: string;
    productName: string;
    type: "ENTRY" | "EXIT";
    reason: string;
    quantity: number;
    note: string | null;
    balanceBefore: number;
    balanceAfter: number;
    createdAt: string;
};

export type StockHistoryResponse = {
    product: {
        id: string;
        ean: string;
        name: string;
    };
    data: StockMovement[];
};

export type StockEntryInput = {
    productId: string;
    type: "COMPRA" | "DEVOLUCAO" | "OUTROS";
    quantity: number;
    note?: string;
};

export type StockExitInput = {
    productId: string;
    type: "DANIFICADO" | "PERDA";
    quantity: number;
    note?: string;
};

export type StockEntryResponse = {
    movement: StockMovement;
    stockCurrent: number;
};

export type StockExitResponse = {
    movement: StockMovement;
    stockCurrent: number;
};

export type OpenCashRegisterInput = {
    initialBalance: number;
    note?: string;
};

export type CashRegister = {
    id: string;
    openedByUserId: string;
    openedByUserName: string;
    initialBalance: number;
    currentBalance: number;
    status: "OPEN" | "CLOSED";
    openedAt: string;
    closedAt: string | null;
    note: string | null;
};

export type OpenCashRegisterResponse = {
    cashRegister: CashRegister;
};

export type SaleItem = {
    id: string;
    productId: string;
    productNameSnapshot: string;
    productEanSnapshot: string;
    unitPriceSnapshot: number;
    quantity: number;
    subtotal: number;
};

export type SaleDto = {
    id: string;
    receiptNumber: string;
    cashRegisterId: string;
    soldByUserId: string;
    soldByUserName: string;
    subtotal: number;
    discountAmount: number;
    totalAmount: number;
    paymentMethod: "DINHEIRO";
    status: "CONFIRMED" | "CANCELLED";
    createdAt: string;
    items: SaleItem[];
};

export type CreateSaleInput = {
    cashRegisterId: string;
    items: Array<{
        productId: string;
        quantity: number;
    }>;
    discountAmount?: number;
    paymentMethod: "DINHEIRO";
};

export type CreateSaleResponse = {
    sale: SaleDto;
};

export type CancelSaleResponse = {
    saleId: string;
    status: "CANCELLED";
    reverted: true;
};

export type PrintReceiptResponse = {
    success: boolean;
    message: string;
    saleId?: string;
};
