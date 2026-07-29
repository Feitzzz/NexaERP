import { Head, Link, router, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Index({ warehouses }) {
    const errors = usePage().props.errors ?? {};
    return (
        <>
            <Head title="Warehouses" />
            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <div className="flex justify-between">
                    <Heading
                        title="Warehouses"
                        description="Manage stock locations."
                    />
                    <Button asChild>
                        <Link href="/warehouses/create">New Warehouse</Link>
                    </Button>
                </div>
                <InputError message={errors.warehouse} />
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/40">
                            <tr>
                                <Th>Code</Th>
                                <Th>Name</Th>
                                <Th>Default</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {warehouses.data.map((warehouse) => (
                                <tr
                                    key={warehouse.id}
                                    className="border-b last:border-0"
                                >
                                    <Td>{warehouse.code}</Td>
                                    <Td>{warehouse.name}</Td>
                                    <Td>
                                        {warehouse.is_default ? (
                                            <Badge>Default</Badge>
                                        ) : (
                                            '—'
                                        )}
                                    </Td>
                                    <Td>
                                        <Badge
                                            variant={
                                                warehouse.is_active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {warehouse.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                asChild
                                            >
                                                <Link
                                                    href={`/warehouses/${warehouse.id}/edit`}
                                                >
                                                    Edit
                                                </Link>
                                            </Button>
                                            {!warehouse.is_default && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.patch(
                                                            `/warehouses/${warehouse.id}/default`,
                                                        )
                                                    }
                                                >
                                                    Set default
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    router.patch(
                                                        `/warehouses/${warehouse.id}/status`,
                                                    )
                                                }
                                            >
                                                {warehouse.is_active
                                                    ? 'Deactivate'
                                                    : 'Activate'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    confirm(
                                                        `Delete ${warehouse.name}?`,
                                                    ) &&
                                                    router.delete(
                                                        `/warehouses/${warehouse.id}`,
                                                    )
                                                }
                                            >
                                                Delete
                                            </Button>
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
function Th({ children }) {
    return <th className="px-4 py-3 font-medium">{children}</th>;
}
function Td({ children }) {
    return <td className="px-4 py-3">{children}</td>;
}
