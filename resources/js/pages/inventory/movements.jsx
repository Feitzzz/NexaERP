import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
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
            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <Heading
                    title="Stock Movements"
                    description="Immutable history of every posted stock change."
                />
                <form
                    onSubmit={submit}
                    className="grid gap-3 md:grid-cols-3 lg:grid-cols-6"
                >
                    <Choice
                        value={data.product_id}
                        set={(value) => update('product_id', value)}
                        all="All Products"
                        options={products}
                        label={(item) => `${item.sku} - ${item.name}`}
                    />
                    <Choice
                        value={data.warehouse_id}
                        set={(value) => update('warehouse_id', value)}
                        all="All Warehouses"
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
                            <SelectItem value="all">All Types</SelectItem>
                            {[
                                'OPENING_BALANCE',
                                'ADJUSTMENT_IN',
                                'ADJUSTMENT_OUT',
                                'SALE_ISSUE',
                            ].map((item) => (
                                <SelectItem key={item} value={item}>
                                    {item.replaceAll('_', ' ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="date"
                        value={data.date_from}
                        onChange={(event) =>
                            update('date_from', event.target.value)
                        }
                    />
                    <Input
                        type="date"
                        value={data.date_to}
                        onChange={(event) =>
                            update('date_to', event.target.value)
                        }
                    />
                    <Button variant="outline">Filter</Button>
                </form>
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/40">
                            <tr>
                                {[
                                    'Date',
                                    'Product',
                                    'Warehouse',
                                    'Type',
                                    'Direction',
                                    'Quantity',
                                    'Before',
                                    'After',
                                    'Reference',
                                    'Notes',
                                ].map((item) => (
                                    <th key={item} className="px-4 py-3">
                                        {item}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {movements.data.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b last:border-0"
                                >
                                    {[
                                        new Date(
                                            item.occurred_at,
                                        ).toLocaleString(),
                                        item.product.name,
                                        item.warehouse.name,
                                        item.movement_type,
                                        item.direction,
                                        item.quantity,
                                        item.balance_before,
                                        item.balance_after,
                                        item.reference_type
                                            ? `${item.reference_type.split('\\').pop()} #${item.reference_id}`
                                            : '—',
                                        item.notes ?? '—',
                                    ].map((value, index) => (
                                        <td key={index} className="px-4 py-3">
                                            {value}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
