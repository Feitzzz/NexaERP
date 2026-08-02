import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Boxes,
    History,
    PackageSearch,
    Warehouse,
} from 'lucide-react';
import {
    DataPanel,
    EmptyTable,
    PageHeader,
    Pagination,
    StatCard,
    StatusPill,
} from '@/components/page-primitives';
import { Button } from '@/components/ui/button';

export default function ProductShow({ product, totalQuantity, movements }) {
    const low =
        product.reorder_level !== null &&
        Number(totalQuantity) <= Number(product.reorder_level);
    return (
        <>
            <Head title={`${product.name} Inventory`} />
            <div className="nexa-page">
                <PageHeader
                    title={product.name}
                    description={`${product.sku} · Inventory history and warehouse balances`}
                >
                    <Button variant="outline" asChild>
                        <Link href="/inventory">
                            <ArrowLeft />
                            Back to inventory
                        </Link>
                    </Button>
                </PageHeader>
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        label="Total quantity"
                        value={`${Number(totalQuantity).toLocaleString()} ${product.unit.code}`}
                        detail="Across all warehouses"
                        icon={Boxes}
                    />
                    <StatCard
                        label="Reorder level"
                        value={product.reorder_level ?? 'Not set'}
                        detail={
                            low
                                ? 'Current quantity needs attention'
                                : 'Stock threshold'
                        }
                        icon={AlertTriangle}
                        tone={low ? 'warning' : 'default'}
                    />
                    <StatCard
                        label="Tracking"
                        value={product.track_inventory ? 'Enabled' : 'Disabled'}
                        detail="Inventory behavior"
                        icon={PackageSearch}
                        tone={product.track_inventory ? 'success' : 'default'}
                    />
                </div>
                <DataPanel
                    title="Warehouse balances"
                    description="Current quantity at each stock location"
                    count={product.inventory_balances.length}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr>
                                    <Th>Warehouse</Th>
                                    <Th>Quantity</Th>
                                    <Th>Status</Th>
                                    <Th>Last updated</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {!product.inventory_balances.length && (
                                    <EmptyTable
                                        colSpan={4}
                                        icon={Warehouse}
                                        title="No warehouse balances"
                                        description="Introduce stock through an opening-balance adjustment."
                                    />
                                )}
                                {product.inventory_balances.map((item) => (
                                    <tr key={item.id} className="border-t">
                                        <Td>
                                            <span className="inline-flex items-center gap-2 font-medium">
                                                <Warehouse className="size-4 text-muted-foreground" />
                                                {item.warehouse.name}
                                            </span>
                                        </Td>
                                        <Td>
                                            <strong>
                                                {Number(
                                                    item.quantity_on_hand,
                                                ).toLocaleString()}
                                            </strong>{' '}
                                            <span className="text-xs text-muted-foreground">
                                                {product.unit.code}
                                            </span>
                                        </Td>
                                        <Td>
                                            <StatusPill
                                                status={
                                                    Number(
                                                        item.quantity_on_hand,
                                                    ) <= 0
                                                        ? 'Out of stock'
                                                        : low
                                                          ? 'Low stock'
                                                          : 'In stock'
                                                }
                                            />
                                        </Td>
                                        <Td className="text-xs text-muted-foreground">
                                            {dateTime(item.updated_at)}
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </DataPanel>
                <DataPanel
                    title="Movement history"
                    description="Posted changes for this product"
                    count={movements.total}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr>
                                    <Th>Date</Th>
                                    <Th>Warehouse</Th>
                                    <Th>Type</Th>
                                    <Th>Direction</Th>
                                    <Th>Quantity</Th>
                                    <Th>Balance change</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {!movements.data.length && (
                                    <EmptyTable
                                        colSpan={6}
                                        icon={History}
                                        title="No movements yet"
                                        description="Posted stock changes will appear in this history."
                                    />
                                )}
                                {movements.data.map((item) => (
                                    <tr key={item.id} className="border-t">
                                        <Td className="text-xs">
                                            {dateTime(item.occurred_at)}
                                        </Td>
                                        <Td>{item.warehouse.name}</Td>
                                        <Td>{words(item.movement_type)}</Td>
                                        <Td>
                                            <StatusPill
                                                status={
                                                    item.direction === 'IN'
                                                        ? 'In stock'
                                                        : 'Pending'
                                                }
                                            />
                                        </Td>
                                        <Td className="font-semibold">
                                            {Number(
                                                item.quantity,
                                            ).toLocaleString()}
                                        </Td>
                                        <Td>
                                            <span className="text-muted-foreground">
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
                                    </tr>
                                ))}
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
function Th({ children }) {
    return (
        <th className="px-5 py-3 font-medium whitespace-nowrap">{children}</th>
    );
}
function Td({ children, className = '' }) {
    return (
        <td className={`px-5 py-3.5 align-middle ${className}`}>{children}</td>
    );
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
