import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
export default function ProductShow({ product, totalQuantity, movements }) {
    return (
        <>
            <Head title={`${product.name} Inventory`} />
            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <div className="flex justify-between">
                    <Heading
                        title={product.name}
                        description={`${product.sku} · ${product.unit.code}`}
                    />
                    <Button variant="outline" asChild>
                        <Link href="/inventory">Back to Inventory</Link>
                    </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <Info label="Tracking">
                        <Badge
                            variant={
                                product.track_inventory
                                    ? 'default'
                                    : 'secondary'
                            }
                        >
                            {product.track_inventory
                                ? 'Tracked'
                                : 'Not Tracked'}
                        </Badge>
                    </Info>
                    <Info label="Total Quantity">{totalQuantity}</Info>
                    <Info label="Reorder Level">
                        {product.reorder_level ?? 'Not set'}
                    </Info>
                </div>
                <h2 className="font-semibold">Warehouse balances</h2>
                <Table
                    headings={['Warehouse', 'Quantity', 'Updated']}
                    rows={product.inventory_balances.map((item) => [
                        item.warehouse.name,
                        item.quantity_on_hand,
                        new Date(item.updated_at).toLocaleString(),
                    ])}
                />
                <h2 className="font-semibold">Recent movements</h2>
                <Table
                    headings={[
                        'Date',
                        'Warehouse',
                        'Type',
                        'Direction',
                        'Quantity',
                        'Before',
                        'After',
                    ]}
                    rows={movements.data.map((item) => [
                        new Date(item.occurred_at).toLocaleString(),
                        item.warehouse.name,
                        item.movement_type,
                        item.direction,
                        item.quantity,
                        item.balance_before,
                        item.balance_after,
                    ])}
                />
            </div>
        </>
    );
}
function Info({ label, children }) {
    return (
        <div className="rounded-lg border p-4">
            <div className="text-xs text-muted-foreground uppercase">
                {label}
            </div>
            <div className="mt-2 font-semibold">{children}</div>
        </div>
    );
}
function Table({ headings, rows }) {
    return (
        <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40">
                    <tr>
                        {headings.map((item) => (
                            <th key={item} className="px-4 py-3">
                                {item}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 && (
                        <tr>
                            <td
                                colSpan={headings.length}
                                className="p-8 text-center text-muted-foreground"
                            >
                                No records yet.
                            </td>
                        </tr>
                    )}
                    {rows.map((row, index) => (
                        <tr key={index} className="border-b last:border-0">
                            {row.map((value, position) => (
                                <td key={position} className="px-4 py-3">
                                    {value}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
