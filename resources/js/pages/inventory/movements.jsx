import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowLeft,
    ArrowUpRight,
    History,
    Search,
    X,
} from 'lucide-react';
import { useState } from 'react';
import {
    DataPanel,
    EmptyTable,
    PageHeader,
    Pagination,
} from '@/components/page-primitives';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function Movements({
    movements,
    products,
    warehouses,
    filters,
}) {
    const [data, setData] = useState({
        product_id: filters.productId || 'all',
        warehouse_id: filters.warehouseId || 'all',
        movement_type: filters.movementType || 'all',
        date_from: filters.dateFrom || '',
        date_to: filters.dateTo || '',
    });
    const update = (key, value) =>
        setData((current) => ({ ...current, [key]: value }));
    const hasFilters = Boolean(
        filters.productId ||
        filters.warehouseId ||
        filters.movementType ||
        filters.dateFrom ||
        filters.dateTo,
    );
    const submit = (event) => {
        event.preventDefault();
        router.get(
            '/inventory/movements',
            Object.fromEntries(
                Object.entries(data).map(([key, value]) => [
                    key,
                    value === 'all' ? '' : value,
                ]),
            ),
            { preserveState: true, replace: true },
        );
    };
    return (
        <>
            <Head title="Stock Movements" />
            <div className="nexa-page">
                <PageHeader
                    title="Stock movements"
                    description="An immutable history of every posted stock change."
                >
                    <Button variant="outline" asChild>
                        <Link href="/inventory">
                            <ArrowLeft />
                            Back to inventory
                        </Link>
                    </Button>
                </PageHeader>
                <form
                    onSubmit={submit}
                    className="nexa-card grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-[repeat(5,minmax(150px,1fr))_auto]"
                >
                    <Choice
                        value={data.product_id}
                        set={(value) => update('product_id', value)}
                        all="All products"
                        options={products}
                        label={(item) => `${item.sku} · ${item.name}`}
                    />
                    <Choice
                        value={data.warehouse_id}
                        set={(value) => update('warehouse_id', value)}
                        all="All warehouses"
                        options={warehouses}
                        label={(item) => item.name}
                    />
                    <Select
                        value={data.movement_type}
                        onValueChange={(value) =>
                            update('movement_type', value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                All movement types
                            </SelectItem>
                            {[
                                'OPENING_BALANCE',
                                'ADJUSTMENT_IN',
                                'ADJUSTMENT_OUT',
                                'SALE_ISSUE',
                            ].map((item) => (
                                <SelectItem key={item} value={item}>
                                    {words(item)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        aria-label="Date from"
                        type="date"
                        value={data.date_from}
                        onChange={(event) =>
                            update('date_from', event.target.value)
                        }
                    />
                    <Input
                        aria-label="Date to"
                        type="date"
                        value={data.date_to}
                        onChange={(event) =>
                            update('date_to', event.target.value)
                        }
                    />
                    <div className="flex gap-1">
                        {hasFilters && (
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                    router.get('/inventory/movements')
                                }
                            >
                                <X />
                            </Button>
                        )}
                        <Button variant="outline">
                            <Search />
                            Filter
                        </Button>
                    </div>
                </form>
                <DataPanel
                    title="Movement ledger"
                    description="Posted quantity changes and resulting balances"
                    count={movements.total}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr>
                                    <Th>Date</Th>
                                    <Th>Product</Th>
                                    <Th>Warehouse</Th>
                                    <Th>Movement</Th>
                                    <Th>Quantity</Th>
                                    <Th>Balance</Th>
                                    <Th>Reference</Th>
                                    <Th>Notes</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {!movements.data.length && (
                                    <EmptyTable
                                        colSpan={8}
                                        icon={History}
                                        title={
                                            hasFilters
                                                ? 'No matching movements'
                                                : 'No stock movements yet'
                                        }
                                        description={
                                            hasFilters
                                                ? 'Change or clear the current ledger filters.'
                                                : 'Posted adjustments and issued invoice stock changes will appear here.'
                                        }
                                    />
                                )}
                                {movements.data.map((item) => {
                                    const inbound = item.direction === 'IN';
                                    const Icon = inbound
                                        ? ArrowDownLeft
                                        : ArrowUpRight;
                                    return (
                                        <tr key={item.id} className="border-t">
                                            <Td>
                                                <span className="block text-xs font-medium whitespace-nowrap">
                                                    {dateTime(item.occurred_at)}
                                                </span>
                                            </Td>
                                            <Td>
                                                <span className="block font-medium">
                                                    {item.product.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {item.product.sku}
                                                </span>
                                            </Td>
                                            <Td>{item.warehouse.name}</Td>
                                            <Td>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        inbound
                                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                            : 'border-amber-200 bg-amber-50 text-amber-700'
                                                    }
                                                >
                                                    <Icon className="size-3" />
                                                    {words(item.movement_type)}
                                                </Badge>
                                            </Td>
                                            <Td>
                                                <span className="font-semibold">
                                                    {inbound ? '+' : '−'}
                                                    {Number(
                                                        item.quantity,
                                                    ).toLocaleString()}
                                                </span>
                                            </Td>
                                            <Td>
                                                <span className="text-xs whitespace-nowrap text-muted-foreground">
                                                    {Number(
                                                        item.balance_before,
                                                    ).toLocaleString()}{' '}
                                                    →{' '}
                                                </span>
                                                <strong>
                                                    {Number(
                                                        item.balance_after,
                                                    ).toLocaleString()}
                                                </strong>
                                            </Td>
                                            <Td className="text-xs text-muted-foreground">
                                                {item.reference_type
                                                    ? `${item.reference_type.split('\\').pop()} #${item.reference_id}`
                                                    : '—'}
                                            </Td>
                                            <Td className="max-w-xs text-xs text-muted-foreground">
                                                {item.notes ?? '—'}
                                            </Td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </DataPanel>
                <Pagination
                    links={movements.links}
                    from={movements.from}
                    to={movements.to}
                    total={movements.total}
                />
            </div>
        </>
    );
}
function Choice({ value, set, all, options, label }) {
    return (
        <Select value={value} onValueChange={set}>
            <SelectTrigger>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">{all}</SelectItem>
                {options.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                        {label(item)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
function Th({ children }) {
    return (
        <th className="px-5 py-3 font-medium whitespace-nowrap">{children}</th>
    );
}
function Td({ children }) {
    return <td className="px-5 py-3.5 align-middle">{children}</td>;
}
const words = (value) =>
    value
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
const dateTime = (value) =>
    new Intl.DateTimeFormat('en-NG', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
