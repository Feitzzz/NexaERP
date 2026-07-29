import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
export default function Index({ summary, filters, customers, products }) {
    const [data, setData] = useState({
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
        customer_id: filters.customer_id ? String(filters.customer_id) : 'all',
        product_id: filters.product_id ? String(filters.product_id) : 'all',
    });
    const update = (key, value) =>
        setData((current) => ({ ...current, [key]: value }));
    const submit = (event) => {
        event.preventDefault();
        router.get(
            '/sales',
            {
                ...data,
                customer_id: data.customer_id === 'all' ? '' : data.customer_id,
                product_id: data.product_id === 'all' ? '' : data.product_id,
            },
            { preserveState: true, replace: true },
        );
    };
    return (
        <>
            <Head title="Sales" />
            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <Heading
                    title="Sales"
                    description="Issued-invoice sales visibility. Draft invoices are excluded."
                />
                <form onSubmit={submit} className="grid gap-3 md:grid-cols-5">
                    <Input
                        type="date"
                        value={data.date_from}
                        onChange={(event) =>
                            update('date_from', event.target.value)
                        }
                    />
                    <Input
                        type="date"
                        value={data.date_to}
                        onChange={(event) =>
                            update('date_to', event.target.value)
                        }
                    />
                    <Choice
                        value={data.customer_id}
                        set={(value) => update('customer_id', value)}
                        all="All Customers"
                        options={customers}
                        label={(item) => item.name}
                    />
                    <Choice
                        value={data.product_id}
                        set={(value) => update('product_id', value)}
                        all="All Products/Services"
                        options={products}
                        label={(item) => item.name}
                    />
                    <Button variant="outline">Filter</Button>
                </form>
                <div className="grid gap-4 md:grid-cols-3">
                    <Metric
                        label="Total Sales"
                        value={money(summary.total_sales)}
                    />
                    <Metric
                        label="Issued Invoices"
                        value={summary.issued_invoices}
                    />
                    <Metric
                        label="Average Invoice Value"
                        value={money(summary.average_invoice_value)}
                    />
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                    <Section
                        title="Top Customers"
                        headings={['Customer', 'Invoices', 'Sales']}
                        rows={summary.by_customer.map((item) => [
                            item.name,
                            item.invoice_count,
                            money(item.total_sales),
                        ])}
                    />
                    <Section
                        title="Top Products / Services"
                        headings={['Item', 'Type', 'Quantity', 'Sales']}
                        rows={summary.by_product.map((item) => [
                            item.name,
                            item.item_type,
                            item.quantity,
                            money(item.total_sales),
                        ])}
                    />
                </div>
                <Section
                    title="Recent Issued Invoices"
                    headings={['Invoice', 'Customer', 'Issue Date', 'Value']}
                    rows={summary.recent_invoices.map((item) => [
                        <Link
                            className="underline"
                            href={`/invoices/${item.id}`}
                        >
                            {item.invoice_number}
                        </Link>,
                        item.customer.name,
                        new Date(item.issue_date).toLocaleDateString(),
                        money(item.payable_amount),
                    ])}
                />
            </div>
        </>
    );
}
const money = (value) =>
    new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
    }).format(Number(value));
function Metric({ label, value }) {
    return (
        <div className="rounded-lg border p-5">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
        </div>
    );
}
function Choice({ value, set, all, options, label }) {
    return (
        <Select value={value} onValueChange={set}>
            <SelectTrigger>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">{all}</SelectItem>
                {options.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                        {label(item)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
function Section({ title, headings, rows }) {
    return (
        <div className="space-y-3">
            <h2 className="font-semibold">{title}</h2>
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
                        {rows.length === 0 && (
                            <tr>
                                <td
                                    colSpan={headings.length}
                                    className="p-8 text-center text-muted-foreground"
                                >
                                    No issued sales found.
                                </td>
                            </tr>
                        )}
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
        </div>
    );
}
