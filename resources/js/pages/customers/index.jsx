import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Index({ customers, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');

    function submit(event) {
        event.preventDefault();

        router.get(
            '/customers',
            { search },
            {
                preserveState: true,
                replace: true,
            },
        );
    }

    function destroy(customer) {
        if (confirm(`Delete ${customer.name}?`)) {
            router.delete(`/customers/${customer.id}`, {
                preserveScroll: true,
            });
        }
    }

    return (
        <>
            <Head title="Customers" />

            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Customers"
                        description="Manage customer records and contact details."
                    />

                    <Button asChild>
                        <Link href="/customers/create">
                            <Plus />
                            New Customer
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="flex max-w-lg gap-2">
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search customers"
                    />
                    <Button type="submit" variant="outline">
                        <Search />
                        Search
                    </Button>
                </form>

                <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/40 text-xs text-muted-foreground uppercase">
                                <tr>
                                    <Th>Customer Code</Th>
                                    <Th>Name</Th>
                                    <Th>Customer Type</Th>
                                    <Th>Phone</Th>
                                    <Th>Email</Th>
                                    <Th>City</Th>
                                    <Th>Status</Th>
                                    <Th>Actions</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-4 py-8 text-center text-muted-foreground"
                                        >
                                            No customers found.
                                        </td>
                                    </tr>
                                )}

                                {customers.data.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className="border-b last:border-b-0"
                                    >
                                        <Td className="font-medium">
                                            {customer.customer_code}
                                        </Td>
                                        <Td>{customer.name}</Td>
                                        <Td>
                                            {formatType(customer.customer_type)}
                                        </Td>
                                        <Td>{customer.phone}</Td>
                                        <Td>
                                            {customer.email || 'Not provided'}
                                        </Td>
                                        <Td>{customer.city}</Td>
                                        <Td>
                                            <Badge
                                                variant={
                                                    customer.is_active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {customer.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/customers/${customer.id}`}
                                                        aria-label="View customer"
                                                    >
                                                        <Eye />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/customers/${customer.id}/edit`}
                                                        aria-label="Edit customer"
                                                    >
                                                        <Pencil />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        destroy(customer)
                                                    }
                                                    aria-label="Delete customer"
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
                </div>

                <Pagination links={customers.links} />
            </div>
        </>
    );
}

function Pagination({ links }) {
    return (
        <div className="flex flex-wrap gap-2">
            {links.map((link, index) => (
                <Button
                    key={`${link.label}-${index}`}
                    variant={link.active ? 'default' : 'outline'}
                    size="sm"
                    disabled={!link.url}
                    asChild={Boolean(link.url)}
                >
                    {link.url ? (
                        <Link
                            href={link.url}
                            preserveScroll
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    )}
                </Button>
            ))}
        </div>
    );
}

function Th({ children }) {
    return (
        <th className="px-4 py-3 font-medium whitespace-nowrap">{children}</th>
    );
}

function Td({ children, className = '' }) {
    return (
        <td className={`px-4 py-3 whitespace-nowrap ${className}`}>
            {children}
        </td>
    );
}

function formatType(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Customers',
            href: '/customers',
        },
    ],
};
