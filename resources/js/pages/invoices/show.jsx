import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Send, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function Show({ invoice }) {
    const supplier = invoice.supplier_snapshot;
    const customerSnapshot = invoice.customer_snapshot;
    const customer = customerSnapshot ?? invoice.customer;
    const isDraft = invoice.status === 'DRAFT';
    const errors = usePage().props.errors ?? {};
    const paymentStatusRank = {
        PENDING: 0,
        PARTIAL: 1,
        PAID: 2,
    };

    function destroy() {
        if (confirm(`Delete ${invoice.invoice_number}?`)) {
            router.delete(`/invoices/${invoice.id}`, { preserveScroll: true });
        }
    }

    function issue() {
        if (confirm(`Issue ${invoice.invoice_number}?`)) {
            router.post(
                `/invoices/${invoice.id}/issue`,
                {},
                { preserveScroll: true },
            );
        }
    }

    function updatePaymentStatus(paymentStatus) {
        router.patch(
            `/invoices/${invoice.id}/payment-status`,
            { payment_status: paymentStatus },
            { preserveScroll: true },
        );
    }

    function isPreviousPaymentStatus(paymentStatus) {
        return (
            paymentStatusRank[paymentStatus] <
            paymentStatusRank[invoice.payment_status]
        );
    }

    return (
        <>
            <Head title={invoice.invoice_number} />

            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title={invoice.invoice_number}
                        description={`${invoice.invoice_kind} sales invoice`}
                    />

                    <div className="flex flex-wrap gap-2">
                        {isDraft && (
                            <>
                                <Button variant="outline" asChild>
                                    <Link href={`/invoices/${invoice.id}/edit`}>
                                        <Pencil />
                                        Edit
                                    </Link>
                                </Button>
                                <Button type="button" onClick={issue}>
                                    <Send />
                                    Issue
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={destroy}
                                >
                                    <Trash2 />
                                    Delete
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <InputError message={errors.invoice} />

                <div className="grid gap-4 md:grid-cols-3">
                    <Info label="Status">
                        <Badge
                            variant={
                                invoice.status === 'ISSUED'
                                    ? 'default'
                                    : 'secondary'
                            }
                        >
                            {invoice.status}
                        </Badge>
                    </Info>
                    <Info label="Payment Status">
                        {invoice.status === 'ISSUED' ? (
                            <div className="space-y-2">
                                <Select
                                    value={invoice.payment_status}
                                    onValueChange={updatePaymentStatus}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            value="PENDING"
                                            disabled={isPreviousPaymentStatus(
                                                'PENDING',
                                            )}
                                        >
                                            Pending
                                        </SelectItem>
                                        <SelectItem
                                            value="PARTIAL"
                                            disabled={isPreviousPaymentStatus(
                                                'PARTIAL',
                                            )}
                                        >
                                            Partial
                                        </SelectItem>
                                        <SelectItem
                                            value="PAID"
                                            disabled={isPreviousPaymentStatus(
                                                'PAID',
                                            )}
                                        >
                                            Paid
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.payment_status} />
                            </div>
                        ) : (
                            <Badge variant="secondary">
                                {invoice.payment_status}
                            </Badge>
                        )}
                    </Info>
                    <Info label="Currency">{invoice.currency_code}</Info>
                    <Info label="Issue Date">
                        {formatDate(invoice.issue_date)}
                    </Info>
                    <Info label="Issue Time">{invoice.issue_time}</Info>
                    <Info label="Due Date">{formatDate(invoice.due_date)}</Info>
                    <Info label="Tax Point Date">
                        {formatDate(invoice.tax_point_date)}
                    </Info>
                    <Info label="Issued At">
                        {invoice.issued_at
                            ? formatDate(invoice.issued_at)
                            : 'Not issued'}
                    </Info>
                    <Info label="Tax Currency">
                        {invoice.tax_currency_code}
                    </Info>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Party title="Supplier" party={supplier} />
                    <Party title="Customer" party={customer} />
                </div>

                <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/40 text-xs text-muted-foreground uppercase">
                                <tr>
                                    <Th>#</Th>
                                    <Th>SKU</Th>
                                    <Th>Item</Th>
                                    <Th>Type</Th>
                                    <Th>Unit</Th>
                                    <Th>Qty</Th>
                                    <Th>Unit Price</Th>
                                    <Th>Discount</Th>
                                    <Th>Tax</Th>
                                    <Th>Tax Amount</Th>
                                    <Th>Total</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b last:border-b-0"
                                    >
                                        <Td>{item.line_number}</Td>
                                        <Td>{item.product_sku}</Td>
                                        <Td>
                                            <div className="font-medium">
                                                {item.item_name}
                                            </div>
                                            {item.item_description && (
                                                <div className="max-w-80 whitespace-normal text-muted-foreground">
                                                    {item.item_description}
                                                </div>
                                            )}
                                        </Td>
                                        <Td>{item.item_type}</Td>
                                        <Td>
                                            {item.unit_code} - {item.unit_name}
                                        </Td>
                                        <Td>{item.quantity}</Td>
                                        <Td>
                                            {formatMoney(
                                                item.unit_price,
                                                invoice.currency_code,
                                            )}
                                        </Td>
                                        <Td>
                                            {item.discount_rate}% (
                                            {formatMoney(
                                                item.discount_amount,
                                                invoice.currency_code,
                                            )}
                                            )
                                        </Td>
                                        <Td>
                                            {item.tax_category_code}{' '}
                                            {item.tax_rate}%
                                        </Td>
                                        <Td>
                                            {formatMoney(
                                                item.tax_amount,
                                                invoice.currency_code,
                                            )}
                                        </Td>
                                        <Td>
                                            {formatMoney(
                                                item.line_total,
                                                invoice.currency_code,
                                            )}
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-[1fr_24rem]">
                    <div className="rounded-lg border p-4">
                        <h2 className="mb-2 text-base font-semibold">Notes</h2>
                        <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                            {invoice.notes || 'No notes.'}
                        </p>
                    </div>

                    <div className="space-y-2 rounded-lg border p-4 text-sm">
                        <Total
                            label="Subtotal"
                            value={invoice.subtotal}
                            currency={invoice.currency_code}
                        />
                        <Total
                            label="Discount Total"
                            value={invoice.discount_total}
                            currency={invoice.currency_code}
                        />
                        <Total
                            label="Tax Exclusive Total"
                            value={invoice.tax_exclusive_total}
                            currency={invoice.currency_code}
                        />
                        <Total
                            label="Tax Total"
                            value={invoice.tax_total}
                            currency={invoice.currency_code}
                        />
                        <Total
                            label="Tax Inclusive Total"
                            value={invoice.tax_inclusive_total}
                            currency={invoice.currency_code}
                        />
                        <div className="border-t pt-2">
                            <Total
                                label="Payable Amount"
                                value={invoice.payable_amount}
                                currency={invoice.currency_code}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function Party({ title, party }) {
    return (
        <div className="rounded-lg border p-4">
            <h2 className="mb-3 text-base font-semibold">{title}</h2>
            {party ? (
                <div className="grid gap-1 text-sm">
                    <div className="font-medium">{party.name}</div>
                    <div className="text-muted-foreground">
                        TIN: {party.tin || 'Not provided'}
                    </div>
                    <div className="text-muted-foreground">
                        Email: {party.email || 'Not provided'}
                    </div>
                    <div className="text-muted-foreground">
                        Phone: {party.phone || 'Not provided'}
                    </div>
                    <div className="text-muted-foreground">
                        {[
                            party.street,
                            party.city,
                            party.state,
                            party.country_code,
                        ]
                            .filter(Boolean)
                            .join(', ') || 'No address'}
                    </div>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">Pending issue.</p>
            )}
        </div>
    );
}

function Info({ label, children }) {
    return (
        <div className="rounded-lg border p-4">
            <div className="text-xs text-muted-foreground uppercase">
                {label}
            </div>
            <div className="mt-1 font-medium">{children}</div>
        </div>
    );
}

function Total({ label, value, currency }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{formatMoney(value, currency)}</span>
        </div>
    );
}

function Th({ children }) {
    return (
        <th className="px-4 py-3 font-medium whitespace-nowrap">{children}</th>
    );
}

function Td({ children }) {
    return <td className="px-4 py-3 whitespace-nowrap">{children}</td>;
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
