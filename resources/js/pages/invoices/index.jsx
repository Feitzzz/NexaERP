import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function Index({ invoices, customers, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [paymentStatus, setPaymentStatus] = useState(
        filters.payment_status || 'all',
    );
    const [customerId, setCustomerId] = useState(
        filters.customer_id ? String(filters.customer_id) : 'all',
    );
    const [issueDateFrom, setIssueDateFrom] = useState(
        filters.issue_date_from ?? '',
    );
    const [issueDateTo, setIssueDateTo] = useState(filters.issue_date_to ?? '');
    const errors = usePage().props.errors ?? {};

    function submit(event) {
        event.preventDefault();

        router.get(
            '/invoices',
            {
                search,
                status: status === 'all' ? '' : status,
                payment_status: paymentStatus === 'all' ? '' : paymentStatus,
                customer_id: customerId === 'all' ? '' : customerId,
                issue_date_from: issueDateFrom,
                issue_date_to: issueDateTo,
            },
            { preserveState: true, replace: true },
        );
    }

    function destroy(invoice) {
        if (confirm(`Delete ${invoice.invoice_number}?`)) {
            router.delete(`/invoices/${invoice.id}`, { preserveScroll: true });
        }
    }

    function issue(invoice) {
        if (confirm(`Issue ${invoice.invoice_number}?`)) {
            router.post(
                `/invoices/${invoice.id}/issue`,
                {},
                { preserveScroll: true },
            );
        }
    }

    return (
        <>
            <Head title="Invoices" />

            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Invoices"
                        description="Create and issue sales invoices."
                    />

                    <Button asChild>
                        <Link href="/invoices/create">
                            <Plus />
                            New Invoice
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="grid gap-3 lg:grid-cols-7">
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Invoice or customer"
                    />

                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="ISSUED">Issued</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={paymentStatus}
                        onValueChange={setPaymentStatus}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Payments</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PARTIAL">Partial</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={customerId} onValueChange={setCustomerId}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Customers</SelectItem>
                            {customers.map((customer) => (
                                <SelectItem
                                    key={customer.id}
                                    value={String(customer.id)}
                                >
                                    {customer.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        type="date"
                        value={issueDateFrom}
                        onChange={(event) =>
                            setIssueDateFrom(event.target.value)
                        }
                    />

                    <Input
                        type="date"
                        value={issueDateTo}
                        onChange={(event) => setIssueDateTo(event.target.value)}
                    />

                    <Button type="submit" variant="outline">
                        <Search />
                        Search
                    </Button>
                </form>

                <InputError message={errors.invoice} />

                <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/40 text-xs text-muted-foreground uppercase">
                                <tr>
                                    <Th>Invoice Number</Th>
                                    <Th>Customer</Th>
                                    <Th>Kind</Th>
                                    <Th>Issue Date</Th>
                                    <Th>Due Date</Th>
                                    <Th>Payable Amount</Th>
                                    <Th>Status</Th>
                                    <Th>Payment</Th>
                                    <Th>Actions</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="px-4 py-8 text-center text-muted-foreground"
                                        >
                                            No invoices found.
                                        </td>
                                    </tr>
                                )}

                                {invoices.data.map((invoice) => (
                                    <tr
                                        key={invoice.id}
                                        className="border-b last:border-b-0"
                                    >
                                        <Td className="font-medium">
                                            {invoice.invoice_number}
                                        </Td>
                                        <Td>{invoice.customer.name}</Td>
                                        <Td>{invoice.invoice_kind}</Td>
                                        <Td>
                                            {formatDate(invoice.issue_date)}
                                        </Td>
                                        <Td>{formatDate(invoice.due_date)}</Td>
                                        <Td>
                                            {formatMoney(
                                                invoice.payable_amount,
                                                invoice.currency_code,
                                            )}
                                        </Td>
                                        <Td>
                                            <StatusBadge
                                                status={invoice.status}
                                            />
                                        </Td>
                                        <Td>
                                            <Badge variant="secondary">
                                                {invoice.payment_status}
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
                                                        href={`/invoices/${invoice.id}`}
                                                        aria-label="View invoice"
                                                    >
                                                        <Eye />
                                                    </Link>
                                                </Button>
                                                {invoice.status === 'DRAFT' && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/invoices/${invoice.id}/edit`}
                                                                aria-label="Edit invoice"
                                                            >
                                                                <Pencil />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                issue(invoice)
                                                            }
                                                            aria-label="Issue invoice"
                                                        >
                                                            <Send />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                destroy(invoice)
                                                            }
                                                            aria-label="Delete invoice"
                                                        >
                                                            <Trash2 />
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

                <Pagination links={invoices.links} />
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

function StatusBadge({ status }) {
    return (
        <Badge variant={status === 'ISSUED' ? 'default' : 'secondary'}>
            {status}
        </Badge>
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

function formatDate(value) {
    return value ? String(value).slice(0, 10) : '-';
}

function formatMoney(value, currency = 'NGN') {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency,
    }).format(Number(value ?? 0));
}
