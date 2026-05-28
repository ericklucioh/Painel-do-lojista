import { MockStore, type Identifiable } from "./mock-store";

export interface MockCrudQuery {
    page: number;
    search?: string;
}

export interface MockCrudListResult<TListItem> {
    data: TListItem[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    search?: string;
}

export interface MockCrudService<
    TItem extends Identifiable,
    TCreateInput,
    TUpdateInput,
    TListItem,
    TByKeyItem,
    TCreateResponse,
    TUpdateResponse,
    TDeactivateResponse,
> {
    list(query: MockCrudQuery): MockCrudListResult<TListItem>;
    getByKey(key: string): TByKeyItem | undefined;
    create(input: TCreateInput): TCreateResponse;
    update(id: string, input: TUpdateInput): TUpdateResponse | undefined;
    deactivate(id: string): TDeactivateResponse | undefined;
}

export interface CreateMockCrudServiceOptions<
    TItem extends Identifiable,
    TCreateInput,
    TUpdateInput,
    TListItem,
    TByKeyItem,
    TCreateResponse,
    TUpdateResponse,
    TDeactivateResponse,
> {
    initialItems: ReadonlyArray<TItem>;
    pageSize: number;
    filterItem: (item: TItem, search?: string) => boolean;
    toListItem: (item: TItem) => TListItem;
    resolveByKey: (
        store: MockStore<TItem>,
        key: string,
    ) => TByKeyItem | undefined;
    createItem: (store: MockStore<TItem>, input: TCreateInput) => TItem;
    toCreateResponse: (item: TItem) => TCreateResponse;
    updateItem: (
        store: MockStore<TItem>,
        id: string,
        input: TUpdateInput,
    ) => TItem | undefined;
    toUpdateResponse: (item: TItem) => TUpdateResponse;
    deactivateItem: (store: MockStore<TItem>, id: string) => TItem | undefined;
    toDeactivateResponse: (item: TItem) => TDeactivateResponse;
}

export function createMockCrudService<
    TItem extends Identifiable,
    TCreateInput,
    TUpdateInput,
    TListItem,
    TByKeyItem,
    TCreateResponse,
    TUpdateResponse,
    TDeactivateResponse,
>(
    options: CreateMockCrudServiceOptions<
        TItem,
        TCreateInput,
        TUpdateInput,
        TListItem,
        TByKeyItem,
        TCreateResponse,
        TUpdateResponse,
        TDeactivateResponse
    >,
): MockCrudService<
    TItem,
    TCreateInput,
    TUpdateInput,
    TListItem,
    TByKeyItem,
    TCreateResponse,
    TUpdateResponse,
    TDeactivateResponse
> {
    const store = new MockStore<TItem>(options.initialItems);

    return {
        list(query) {
            const normalizedSearch = query.search?.trim().toLowerCase();
            const items = store
                .list()
                .filter((item) => options.filterItem(item, normalizedSearch));

            const totalItems = items.length;
            const totalPages =
                totalItems === 0 ? 0 : Math.ceil(totalItems / options.pageSize);
            const page = Math.min(query.page, Math.max(totalPages, 1));
            const start = (page - 1) * options.pageSize;
            const data = items
                .slice(start, start + options.pageSize)
                .map(options.toListItem);

            return {
                data,
                page,
                pageSize: options.pageSize,
                totalItems,
                totalPages,
                ...(query.search === undefined ? {} : { search: query.search }),
            };
        },

        getByKey(key) {
            return options.resolveByKey(store, key);
        },

        create(input) {
            const created = options.createItem(store, input);
            store.insert(created);
            return options.toCreateResponse(created);
        },

        update(id, input) {
            const updated = options.updateItem(store, id, input);
            return updated === undefined
                ? undefined
                : options.toUpdateResponse(updated);
        },

        deactivate(id) {
            const deactivated = options.deactivateItem(store, id);
            return deactivated === undefined
                ? undefined
                : options.toDeactivateResponse(deactivated);
        },
    };
}
