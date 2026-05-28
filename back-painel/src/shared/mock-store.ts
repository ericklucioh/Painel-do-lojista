export type Identifiable = {
    id: string;
};

function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

export class MockStore<TItem extends Identifiable> {
    private readonly items: TItem[];

    public constructor(items: ReadonlyArray<TItem>) {
        this.items = clone(items) as TItem[];
    }

    public list(): TItem[] {
        return clone(this.items);
    }

    public findById(id: string): TItem | undefined {
        return this.items.find((item) => item.id === id);
    }

    public findOne(predicate: (item: TItem) => boolean): TItem | undefined {
        return this.items.find(predicate);
    }

    public insert(item: TItem): TItem {
        this.items.push(clone(item));
        return clone(item);
    }

    public updateById(
        id: string,
        updater: (current: TItem) => TItem,
    ): TItem | undefined {
        const index = this.items.findIndex((item) => item.id === id);
        if (index === -1) {
            return undefined;
        }

        const current = this.items[index];
        if (current === undefined) {
            return undefined;
        }

        const updated = updater(clone(current));
        this.items[index] = clone(updated);
        return clone(updated);
    }
}
