import { Head, Link, router, usePage } from '@inertiajs/react';
import { MapPin, Pencil, Plus, Star, Trash2, Warehouse } from 'lucide-react';
import InputError from '@/components/input-error';
import {
    DataPanel,
    EmptyTable,
    PageHeader,
    Pagination,
    StatusPill,
} from '@/components/page-primitives';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Index({ warehouses }) {
    const errors = usePage().props.errors ?? {};
    const setDefault = (item) => router.patch(`/warehouses/${item.id}/default`);
    const toggle = (item) => router.patch(`/warehouses/${item.id}/status`);
    const destroy = (item) =>
        confirm(`Delete ${item.name}?`) &&
        router.delete(`/warehouses/${item.id}`);
    return (
        <>
            <Head title="Warehouses" />
            <div className="nexa-page">
                <PageHeader
                    title="Warehouses"
                    description="Manage the physical locations where inventory is held."
                >
                    <Button asChild>
                        <Link href="/warehouses/create">
                            <Plus />
                            New warehouse
                        </Link>
                    </Button>
                </PageHeader>
                <InputError message={errors.warehouse} />
                <DataPanel
                    title="Stock locations"
                    description="Active and default inventory locations"
                    count={warehouses.total}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr>
                                    <Th>Warehouse</Th>
                                    <Th>Code</Th>
                                    <Th>Role</Th>
                                    <Th>Status</Th>
                                    <Th className="text-right">Actions</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {!warehouses.data.length && (
                                    <EmptyTable
                                        colSpan={5}
                                        icon={Warehouse}
                                        title="No warehouses yet"
                                        description="Create a warehouse before introducing or adjusting inventory."
                                        href="/warehouses/create"
                                        action="Create warehouse"
                                    />
                                )}
                                {warehouses.data.map((item) => (
                                    <tr key={item.id} className="border-t">
                                        <Td>
                                            <span className="flex items-center gap-3">
                                                <span className="flex size-9 items-center justify-center rounded-lg bg-muted/60">
                                                    <Warehouse className="size-4 text-muted-foreground" />
                                                </span>
                                                <span>
                                                    <span className="block font-medium text-foreground">
                                                        {item.name}
                                                    </span>
                                                    <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                                        <MapPin className="size-3" />
                                                        Stock location
                                                    </span>
                                                </span>
                                            </span>
                                        </Td>
                                        <Td>
                                            <code className="rounded bg-muted px-2 py-1 text-xs">
                                                {item.code}
                                            </code>
                                        </Td>
                                        <Td>
                                            {item.is_default ? (
                                                <Badge
                                                    variant="outline"
                                                    className="border-amber-200 bg-amber-50 text-amber-700"
                                                >
                                                    <Star className="size-3 fill-current" />
                                                    Default
                                                </Badge>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setDefault(item)
                                                    }
                                                >
                                                    Set as default
                                                </Button>
                                            )}
                                        </Td>
                                        <Td>
                                            <StatusPill
                                                status={
                                                    item.is_active
                                                        ? 'Active'
                                                        : 'Inactive'
                                                }
                                            />
                                        </Td>
                                        <Td>
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/warehouses/${item.id}/edit`}
                                                    >
                                                        <Pencil />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggle(item)}
                                                >
                                                    {item.is_active
                                                        ? 'Deactivate'
                                                        : 'Activate'}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="hover:text-destructive"
                                                    onClick={() =>
                                                        destroy(item)
                                                    }
                                                >
                                                    <Trash2 />
                                                </Button>
                                            </div>
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </DataPanel>
                <Pagination
                    links={warehouses.links}
                    from={warehouses.from}
                    to={warehouses.to}
                    total={warehouses.total}
                />
            </div>
        </>
    );
}
function Th({ children, className = '' }) {
    return (
        <th className={`px-5 py-3 font-medium whitespace-nowrap ${className}`}>
            {children}
        </th>
    );
}
function Td({ children }) {
    return <td className="px-5 py-3.5 align-middle">{children}</td>;
}
