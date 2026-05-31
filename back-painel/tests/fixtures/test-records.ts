import type { Prisma } from "@prisma/client";

export type TestUserRecord = Prisma.UserGetPayload<{}>;
export type TestProductRecord = Prisma.ProductGetPayload<{}>;
export type TestInventoryMovementRecord = Prisma.InventoryMovementGetPayload<{}>;
