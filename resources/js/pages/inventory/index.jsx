import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
export default function Index({ balances, warehouses, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [warehouse, setWarehouse] = useState(filters.warehouseId || 'all');
    const [lowStock, setLowStock] = useState(filters.lowStock ?? false);
    const submit = (event) => {
        event.preventDefault();
        router.get(
            '/inventory',
            {
                search,
                warehouse_id: warehouse === 'all' ? '' : warehouse,
                low_stock: lowStock ? 1 : 0,
            },
            { preserveState: true, replace: true },
        );
    };
    return (
        <>
            <Head title="Inventory" />
            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <div className="flex justify-between">
                    <Heading
                        title="Inventory"
                        description="Current warehouse stock and low-stock visibility."
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/inventory/movements">Movements</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/inventory-adjustments/create">
                                Adjust Stock
                            </Link>
                        </Button>
                    </div>
                </div>
                <form
                    onSubmit={submit}
                    className="grid gap-3 md:grid-cols-[2fr_1fr_auto_auto]"
                >
                    <Input
                        placeholder="Search product or SKU"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <Select value={warehouse} onValueChange={setWarehouse}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Warehouses</SelectItem>
                            {warehouses.map((item) => (
                                <SelectItem
                                    key={item.id}
                                    value={String(item.id)}
                                >
                                    {item.code} - {item.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                            checked={lowStock}
                            onCheckedChange={(value) =>
                                setLowStock(value === true)
                            }
                        />
                        Low stock only
                    </label>
                    <Button variant="outline">Filter</Button>
                </form>
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/40">
                            <tr>
                                {[
                                    'Product',
                                    'SKU',
                                    'Warehouse',
                                    'Quantity On Hand',
                                    'Reorder Level',
                                    'Stock Status',
                                    'Last Updated',
                                    'Actions',
                                ].map((item) => (
                                    <th key={item} className="px-4 py-3">
                                        {item}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {balances.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="p-8 text-center text-muted-foreground"
                                    >
                                        No inventory balances found. Use an
                                        opening-stock adjustment to introduce
                                        stock.
                                    </td>
                                </tr>
                            )}
                            {balances.data.flatMap((product) => {
                                const productBalances =
                                    product.inventory_balances.length > 0
                                        ? product.inventory_balances
                                        : [null];
                                const status = stockStatus(product);

                                return productBalances.map((balance) => (
                                    <tr
                                        key={
                                            balance?.id ??
                                            `product-${product.id}`
                                        }
                                        className="border-b last:border-0"
                                    >
                                        <Td>{product.name}</Td>
                                        <Td>{product.sku}</Td>
                                        <Td>
                                            {balance?.warehouse.name ??
                                                'No stock introduced'}
                                        </Td>
                                        <Td>
                                            {balance?.quantity_on_hand ??
                                                '0.0000'}{' '}
                                            {product.unit.code}
                                        </Td>
                                        <Td>{product.reorder_level ?? '—'}</Td>
                                        <Td>
                                            <Badge
                                                variant={
                                                    status === 'In Stock'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {status}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            {balance
                                                ? new Date(
                                                      balance.updated_at,
                                                  ).toLocaleString()
                                                : '—'}
                                        </Td>
                                        <Td>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                asChild
                                            >
                                                <Link
                                                    href={`/inventory/products/${product.id}`}
                                                >
                                                    History
                                                </Link>
                                            </Button>
                                        </Td>
                                    </tr>
                                ));
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
function stockStatus(product) {
    const quantity = Number(product.total_quantity_on_hand ?? 0);
    if (quantity <= 0) return 'Out of Stock';
    if (
        product.reorder_level !== null &&
        quantity <= Number(product.reorder_level)
    )
        return 'Low Stock';
    return 'In Stock';
}
function Td({ children }) {
    return <td className="px-4 py-3">{children}</td>;
}
