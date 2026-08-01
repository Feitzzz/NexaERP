import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    FileText,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plus,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Show({ customer, summary, recentInvoices }) {
    return (
        <>
            <Head title={customer.name} />
            <div className="nexa-page">
                <Link
                    href="/customers"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Customers
                </Link>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-semibold text-primary">
                            {initials(customer.name)}
                        </span>
                        <Heading
                            title={customer.name}
                            description={`${customer.customer_code} · ${title(customer.customer_type)} customer`}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/customers/${customer.id}/edit`}>
                                <Pencil />
                                Edit
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link
                                href={`/invoices/create?customer_id=${customer.id}`}
                            >
                                <Plus />
                                Create invoice
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Metric
                        label="Total invoiced"
                        value={money(summary.total_invoiced)}
                    />
                    <Metric
                        label="Outstanding balance"
                        value={money(summary.outstanding)}
                    />
                    <Metric
                        label="Invoices"
                        value={summary.invoice_count.toLocaleString()}
                    />
                </div>

                <div className="grid items-start gap-5 lg:grid-cols-[minmax(280px,.8fr)_minmax(0,1.7fr)]">
                    <section className="nexa-card">
                        <div className="nexa-card-header">
                            <div>
                                <h2 className="font-semibold">
                                    Customer information
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Contact and registration details
                                </p>
                            </div>
                            <Badge
                                variant={
                                    customer.is_active ? 'default' : 'secondary'
                                }
                            >
                                {customer.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <dl className="divide-y px-5">
                            <Description label="TIN" value={customer.tin} />
                            <Description
                                label="Email"
                                value={customer.email}
                                icon={Mail}
                            />
                            <Description
                                label="Phone"
                                value={customer.phone}
                                icon={Phone}
                            />
                            <Description
                                label="Address"
                                value={[
                                    customer.street,
                                    customer.city,
                                    customer.lga,
                                    customer.state,
                                    customer.country,
                                ]
                                    .filter(Boolean)
                                    .join(', ')}
                                icon={MapPin}
                            />
                        </dl>
                    </section>

                    <section className="nexa-card">
                        <div className="nexa-card-header">
                            <div>
                                <h2 className="font-semibold">
                                    Recent invoices
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Latest invoices for this customer
                                </p>
                            </div>
                            <Link
                                href={`/invoices?customer_id=${customer.id}`}
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                View all
                            </Link>
                        </div>
                        {recentInvoices.length ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr>
                                            <Th>Invoice</Th>
                                            <Th>Issued</Th>
                                            <Th>Status</Th>
                                            <Th className="text-right">
                                                Amount
                                            </Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentInvoices.map((invoice) => (
                                            <tr
                                                className="border-t"
                                                key={invoice.id}
                                            >
                                                <Td>
                                                    <Link
                                                        href={`/invoices/${invoice.id}`}
                                                        className="font-medium hover:text-primary"
                                                    >
                                                        {invoice.invoice_number}
                                                    </Link>
                                                </Td>
                                                <Td className="text-muted-foreground">
                                                    {date(invoice.issue_date)}
                                                </Td>
                                                <Td>
                                                    <Badge variant="outline">
                                                        {title(invoice.status)}
                                                    </Badge>
                                                </Td>
                                                <Td className="text-right font-medium">
                                                    {money(
                                                        invoice.payable_amount,
                                                        invoice.currency_code,
                                                    )}
                                                </Td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex min-h-52 flex-col items-center justify-center p-8 text-center">
                                <span className="flex size-10 items-center justify-center rounded-lg border">
                                    <FileText className="size-4 text-muted-foreground" />
                                </span>
                                <p className="mt-3 text-sm font-medium">
                                    No invoices for this customer
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Their invoice history will appear here.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}

function Metric({ label, value }) {
    return (
        <div className="nexa-card p-5">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
                {value}
            </p>
        </div>
    );
}
function Description({ label, value, icon: Icon }) {
    return (
        <div className="py-3.5">
            <dt className="text-xs font-medium text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-1 flex items-start gap-2 text-sm">
                {Icon && (
                    <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                )}
                {value || 'Not provided'}
            </dd>
        </div>
    );
}
function Th({ children, className = '' }) {
    return <th className={`px-5 py-3 font-medium ${className}`}>{children}</th>;
}
function Td({ children, className = '' }) {
    return (
        <td className={`px-5 py-3.5 whitespace-nowrap ${className}`}>
            {children}
        </td>
    );
}
function title(value) {
    return value
        ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
        : '';
}
function initials(value) {
    return value
        .split(' ')
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}
function money(value, currency = 'NGN') {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(Number(value));
}
function date(value) {
    return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(
        new Date(value),
    );
}

Show.layout = {
    breadcrumbs: [
        { title: 'Customers', href: '/customers' },
        { title: 'Customer', href: '#' },
    ],
};
