import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Boxes, Pencil, Send } from 'lucide-react';
import InputError from '@/components/input-error';
import {
    DataPanel,
    EmptyTable,
    PageHeader,
    StatusPill,
} from '@/components/page-primitives';
import { Button } from '@/components/ui/button';

export default function Show({ adjustment, movements }) {
    const errors = usePage().props.errors ?? {};
    const post = () =>
        confirm(
            'Once posted, this adjustment will update stock and cannot be edited.',
        ) && router.post(`/inventory-adjustments/${adjustment.id}/post`);
    return (
        <>
            <Head title={adjustment.adjustment_number} />
            <div className="nexa-page">
                <Link
                    href="/inventory-adjustments"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Stock adjustments
                </Link>
                <PageHeader
                    title={adjustment.adjustment_number}
                    description={`${words(adjustment.reason)} · ${adjustment.warehouse.name}`}
                >
                    <StatusPill status={adjustment.status} />
                    {adjustment.status === 'DRAFT' && (
                        <>
                            <Button variant="outline" asChild>
                                <Link
                                    href={`/inventory-adjustments/${adjustment.id}/edit`}
                                >
                                    <Pencil />
                                    Edit
                                </Link>
                            </Button>
                            <Button onClick={post}>
                                <Send />
                                Post adjustment
                            </Button>
                        </>
                    )}
                </PageHeader>
                <InputError message={errors.adjustment} />
                <InputError message={errors.stock} />
                <DataPanel
                    title="Adjustment lines"
                    description="Products and quantity changes in this document"
                    count={adjustment.lines.length}
                >
                    <Table
                        headings={[
                            'Product',
                            'SKU',
                            'Quantity delta',
                            'Unit cost',
                            'Notes',
                        ]}
                        rows={adjustment.lines.map((line) => [
                            <span className="font-medium">
                                {line.product.name}
                            </span>,
                            line.product.sku,
                            <strong
                                className={
                                    Number(line.quantity_delta) >= 0
                                        ? 'text-emerald-600'
                                        : 'text-amber-600'
                                }
                            >
                                {Number(line.quantity_delta) >= 0 ? '+' : ''}
                                {Number(line.quantity_delta).toLocaleString()}
                            </strong>,
                            line.unit_cost ?? '—',
                            line.notes ?? '—',
                        ])}
                    />
                </DataPanel>
                {adjustment.status === 'POSTED' && (
                    <DataPanel
                        title="Posted movements"
                        description="Inventory ledger entries created by this adjustment"
                        count={movements.length}
                    >
                        <Table
                            headings={[
                                'Type',
                                'Direction',
                                'Quantity',
                                'Before',
                                'After',
                                'Posted',
                            ]}
                            rows={movements.map((item) => [
                                words(item.movement_type),
                                item.direction,
                                item.quantity,
                                item.balance_before,
                                item.balance_after,
                                dateTime(item.occurred_at),
                            ])}
                        />
                    </DataPanel>
                )}
            </div>
        </>
    );
}
function Table({ headings, rows }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr>
                        {headings.map((heading) => (
                            <th
                                key={heading}
                                className="px-5 py-3 font-medium whitespace-nowrap"
                            >
                                {heading}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {!rows.length && (
                        <EmptyTable
                            colSpan={headings.length}
                            icon={Boxes}
                            title="No records"
                            description="There is nothing to display here yet."
                        />
                    )}
                    {rows.map((row, index) => (
                        <tr key={index} className="border-t">
                            {row.map((value, position) => (
                                <td
                                    key={position}
                                    className="px-5 py-3.5 whitespace-nowrap"
                                >
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
