import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
export default function Index({ adjustments }) {
    return (
        <>
            <Head title="Stock Adjustments" />
            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <div className="flex justify-between">
                    <Heading
                        title="Stock Adjustments"
                        description="Draft and post auditable stock changes."
                    />
                    <Button asChild>
                        <Link href="/inventory-adjustments/create">
                            New Adjustment
                        </Link>
                    </Button>
                </div>
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/40">
                            <tr>
                                <Th>Number</Th>
                                <Th>Warehouse</Th>
                                <Th>Reason</Th>
                                <Th>Status</Th>
                                <Th>Created</Th>
                                <Th>Posted</Th>
                                <Th>Actions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {adjustments.data.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b last:border-0"
                                >
                                    <Td>{item.adjustment_number}</Td>
                                    <Td>{item.warehouse.name}</Td>
                                    <Td>{item.reason.replaceAll('_', ' ')}</Td>
                                    <Td>
                                        <Badge
                                            variant={
                                                item.status === 'POSTED'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {item.status}
                                        </Badge>
                                    </Td>
                                    <Td>{date(item.created_at)}</Td>
                                    <Td>
                                        {item.posted_at
                                            ? date(item.posted_at)
                                            : '—'}
                                    </Td>
                                    <Td>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                asChild
                                            >
                                                <Link
                                                    href={`/inventory-adjustments/${item.id}`}
                                                >
                                                    View
                                                </Link>
                                            </Button>
                                            {item.status === 'DRAFT' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/inventory-adjustments/${item.id}/edit`}
                                                        >
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            confirm(
                                                                'Once posted, this adjustment cannot be edited. Continue?',
                                                            ) &&
                                                            router.post(
                                                                `/inventory-adjustments/${item.id}/post`,
                                                            )
                                                        }
                                                    >
                                                        Post
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            confirm(
                                                                'Delete this draft?',
                                                            ) &&
                                                            router.delete(
                                                                `/inventory-adjustments/${item.id}`,
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
const date = (value) =>
    new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(
        new Date(value),
    );
function Th({ children }) {
    return <th className="px-4 py-3 font-medium">{children}</th>;
}
function Td({ children }) {
    return <td className="px-4 py-3">{children}</td>;
}
