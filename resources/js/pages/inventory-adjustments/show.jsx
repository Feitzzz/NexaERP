import { Head, Link, router, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
export default function Show({ adjustment, movements }) {
    const errors = usePage().props.errors ?? {};
    return (
        <>
            <Head title={adjustment.adjustment_number} />
            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <div className="flex justify-between">
                    <Heading
                        title={adjustment.adjustment_number}
                        description={`${adjustment.reason.replaceAll('_', ' ')} · ${adjustment.warehouse.name}`}
                    />
                    <div className="flex gap-2">
                        {adjustment.status === 'DRAFT' && (
                            <>
                                <Button variant="outline" asChild>
                                    <Link
                                        href={`/inventory-adjustments/${adjustment.id}/edit`}
                                    >
                                        Edit
                                    </Link>
                                </Button>
                                <Button
                                    onClick={() =>
                                        confirm(
                                            'Once posted, this adjustment will update stock and cannot be edited.',
                                        ) &&
                                        router.post(
                                            `/inventory-adjustments/${adjustment.id}/post`,
                                        )
                                    }
                                >
                                    Post
                                </Button>
                            </>
                        )}
                        <Badge>{adjustment.status}</Badge>
                    </div>
                </div>
                <InputError message={errors.adjustment} />
                <InputError message={errors.stock} />
                <Table
                    headings={[
                        'Product',
                        'SKU',
                        'Quantity Delta',
                        'Unit Cost',
                        'Notes',
                    ]}
                    rows={adjustment.lines.map((line) => [
                        line.product.name,
                        line.product.sku,
                        line.quantity_delta,
                        line.unit_cost ?? '—',
                        line.notes ?? '—',
                    ])}
                />
                {adjustment.status === 'POSTED' && (
                    <>
                        <h2 className="font-semibold">Posted movements</h2>
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
                                item.movement_type,
                                item.direction,
                                item.quantity,
                                item.balance_before,
                                item.balance_after,
                                new Date(item.occurred_at).toLocaleString(),
                            ])}
                        />
                    </>
                )}
            </div>
        </>
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
