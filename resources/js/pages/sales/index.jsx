import { Head, Link, router } from '@inertiajs/react';
import { BarChart3, CalendarDays, CircleDollarSign, FileCheck2, PackageCheck, Search, TrendingUp, Users, X } from 'lucide-react';
import { useState } from 'react';
import { DataPanel, EmptyTable, PageHeader, StatCard } from '@/components/page-primitives';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Index({ summary, filters, customers, products }) {
    const [data, setData] = useState({ date_from: filters.date_from ?? '', date_to: filters.date_to ?? '', customer_id: filters.customer_id ? String(filters.customer_id) : 'all', product_id: filters.product_id ? String(filters.product_id) : 'all' });
    const update = (key, value) => setData((current) => ({ ...current, [key]: value }));
    const hasFilters = Boolean(filters.date_from || filters.date_to || filters.customer_id || filters.product_id);
    const submit = (event) => { event.preventDefault(); router.get('/sales', { ...data, customer_id: data.customer_id === 'all' ? '' : data.customer_id, product_id: data.product_id === 'all' ? '' : data.product_id }, { preserveState: true, replace: true }); };
    const clear = () => router.get('/sales');

    return <><Head title="Sales" /><div className="nexa-page">
        <PageHeader title="Sales" description="Performance insights based on issued invoices. Drafts are excluded." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total sales" value={money(summary.total_sales)} detail="Issued invoice value" icon={CircleDollarSign} tone="success" /><StatCard label="Issued invoices" value={Number(summary.issued_invoices).toLocaleString()} detail="Documents in this period" icon={FileCheck2} /><StatCard label="Units sold" value={Number(summary.units_sold).toLocaleString()} detail="Products and services" icon={PackageCheck} /><StatCard label="Average invoice" value={money(summary.average_invoice_value)} detail="Average order value" icon={TrendingUp} /></div>

        <form onSubmit={submit} className="nexa-card grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-[repeat(4,minmax(150px,1fr))_auto]"><DateInput label="From" value={data.date_from} set={(value) => update('date_from', value)} /><DateInput label="To" value={data.date_to} set={(value) => update('date_to', value)} /><Choice value={data.customer_id} set={(value) => update('customer_id', value)} all="All customers" options={customers} /><Choice value={data.product_id} set={(value) => update('product_id', value)} all="All products and services" options={products} /><div className="flex gap-1">{hasFilters && <Button type="button" variant="ghost" size="icon" onClick={clear} aria-label="Clear filters"><X /></Button>}<Button variant="outline"><Search />Filter</Button></div></form>

        <div className="grid items-start gap-5 xl:grid-cols-2">
            <DataPanel title="Top customers" description="Customers ranked by issued invoice value" count={summary.by_customer.length}><SimpleTable headings={['Customer','Invoices','Sales']} rows={summary.by_customer.map((item) => [<span className="inline-flex items-center gap-2 font-medium"><span className="flex size-7 items-center justify-center rounded-md bg-primary/10"><Users className="size-3.5 text-primary" /></span>{item.name}</span>, Number(item.invoice_count).toLocaleString(), <strong>{money(item.total_sales)}</strong>])} empty="No customer sales in this period." /></DataPanel>
            <DataPanel title="Top products and services" description="Items ranked by quantity sold" count={summary.by_product.length}><SimpleTable headings={['Item','Type','Quantity','Sales']} rows={summary.by_product.map((item) => [<span className="font-medium">{item.name}</span>, title(item.item_type), Number(item.quantity).toLocaleString(), <strong>{money(item.total_sales)}</strong>])} empty="No product sales in this period." /></DataPanel>
        </div>

        <DataPanel title="Recent issued invoices" description="Latest sales contributing to this report" count={summary.recent_invoices.length}><SimpleTable headings={['Invoice','Customer','Issue date','Value']} rows={summary.recent_invoices.map((item) => [<Link className="font-medium text-foreground hover:text-primary" href={`/invoices/${item.id}`}>{item.invoice_number}</Link>, item.customer.name, date(item.issue_date), <strong>{money(item.payable_amount)}</strong>])} empty="No issued sales found for the selected period." /></DataPanel>
    </div></>;
}

function DateInput({ label, value, set }) { return <div className="relative"><CalendarDays className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={label} className="pl-9" type="date" value={value} onChange={(event) => set(event.target.value)} /></div>; }
function Choice({ value, set, all, options }) { return <Select value={value} onValueChange={set}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{all}</SelectItem>{options.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select>; }
function SimpleTable({ headings, rows, empty }) { return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{headings.map((heading) => <th className="px-5 py-3 font-medium whitespace-nowrap" key={heading}>{heading}</th>)}</tr></thead><tbody>{!rows.length && <EmptyTable colSpan={headings.length} icon={BarChart3} title="Nothing to report yet" description={empty} />}{rows.map((row, index) => <tr className="border-t" key={index}>{row.map((value, position) => <td className="px-5 py-3.5 whitespace-nowrap" key={position}>{value}</td>)}</tr>)}</tbody></table></div>; }
const money = (value) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(Number(value));
const date = (value) => new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(new Date(value));
const title = (value) => value.charAt(0) + value.slice(1).toLowerCase();
