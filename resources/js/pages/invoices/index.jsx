import { Head, Link, router, usePage } from '@inertiajs/react';
import { CircleDollarSign, Clock3, Eye, FilePlus2, Files, Pencil, Search, Send, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { DataPanel, EmptyTable, PageHeader, Pagination, StatCard, StatusPill } from '@/components/page-primitives';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Index({ invoices, customers, filters, summary }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [paymentStatus, setPaymentStatus] = useState(filters.payment_status || 'all');
    const [customerId, setCustomerId] = useState(filters.customer_id ? String(filters.customer_id) : 'all');
    const [issueDateFrom, setIssueDateFrom] = useState(filters.issue_date_from ?? '');
    const [issueDateTo, setIssueDateTo] = useState(filters.issue_date_to ?? '');
    const errors = usePage().props.errors ?? {};
    const hasFilters = Boolean(filters.search || filters.status || filters.payment_status || filters.customer_id || filters.issue_date_from || filters.issue_date_to);
    const submit = (event) => { event.preventDefault(); router.get('/invoices', { search, status: status === 'all' ? '' : status, payment_status: paymentStatus === 'all' ? '' : paymentStatus, customer_id: customerId === 'all' ? '' : customerId, issue_date_from: issueDateFrom, issue_date_to: issueDateTo }, { preserveState: true, replace: true }); };
    const clear = () => { setSearch(''); setStatus('all'); setPaymentStatus('all'); setCustomerId('all'); setIssueDateFrom(''); setIssueDateTo(''); router.get('/invoices'); };
    const destroy = (invoice) => confirm(`Delete ${invoice.invoice_number}?`) && router.delete(`/invoices/${invoice.id}`, { preserveScroll: true });
    const issue = (invoice) => confirm(`Issue ${invoice.invoice_number}? Issued invoices cannot be edited.`) && router.post(`/invoices/${invoice.id}/issue`, {}, { preserveScroll: true });

    return <><Head title="Invoices" /><div className="nexa-page">
        <PageHeader title="Invoices" description="Create, review and issue customer sales invoices."><Button asChild><Link href="/invoices/create"><FilePlus2 />Create invoice</Link></Button></PageHeader>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="All invoices" value={summary.total.toLocaleString()} detail="Every invoice record" icon={Files} /><StatCard label="Drafts" value={summary.drafts.toLocaleString()} detail="Still editable" icon={Pencil} /><StatCard label="Issued" value={summary.issued.toLocaleString()} detail="Finalized documents" icon={Send} tone="success" /><StatCard label="Outstanding" value={money(summary.outstanding)} detail="Pending and partial payments" icon={CircleDollarSign} tone={summary.outstanding > 0 ? 'warning' : 'default'} /></div>

        <form onSubmit={submit} className="nexa-card space-y-3 p-3"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_repeat(3,minmax(140px,1fr))]">
            <div className="relative"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Invoice number or customer…" /></div>
            <Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All invoice statuses</SelectItem><SelectItem value="DRAFT">Draft</SelectItem><SelectItem value="ISSUED">Issued</SelectItem></SelectContent></Select>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All payment statuses</SelectItem><SelectItem value="PENDING">Pending</SelectItem><SelectItem value="PARTIAL">Partial</SelectItem><SelectItem value="PAID">Paid</SelectItem></SelectContent></Select>
            <Select value={customerId} onValueChange={setCustomerId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All customers</SelectItem>{customers.map((customer) => <SelectItem key={customer.id} value={String(customer.id)}>{customer.name}</SelectItem>)}</SelectContent></Select>
        </div><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><span className="text-xs font-medium text-muted-foreground">Issue date</span><Input className="sm:w-40" aria-label="Issue date from" type="date" value={issueDateFrom} onChange={(event) => setIssueDateFrom(event.target.value)} /><span className="text-xs text-muted-foreground">to</span><Input className="sm:w-40" aria-label="Issue date to" type="date" value={issueDateTo} onChange={(event) => setIssueDateTo(event.target.value)} /><div className="flex gap-2 sm:ml-auto">{hasFilters && <Button type="button" variant="ghost" onClick={clear}><X />Clear</Button>}<Button type="submit" variant="outline">Apply filters</Button></div></div></form>
        <InputError message={errors.invoice} />

        <DataPanel title="Invoice register" description="Draft and issued sales documents" count={invoices.total}><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><Th>Invoice</Th><Th>Customer</Th><Th>Dates</Th><Th>Amount</Th><Th>Invoice status</Th><Th>Payment</Th><Th className="text-right">Actions</Th></tr></thead><tbody>
            {!invoices.data.length && <EmptyTable colSpan={7} icon={Files} title={hasFilters ? 'No matching invoices' : 'No invoices yet'} description={hasFilters ? 'Try changing or clearing the current invoice filters.' : 'Create a draft invoice to begin billing a customer.'} href={!hasFilters ? '/invoices/create' : undefined} action="Create invoice" />}
            {invoices.data.map((invoice) => <tr key={invoice.id} className="border-t"><Td><Link href={`/invoices/${invoice.id}`}><span className="block font-medium text-foreground hover:text-primary">{invoice.invoice_number}</span><span className="mt-0.5 block text-xs text-muted-foreground">{invoice.invoice_kind}</span></Link></Td><Td><span className="block font-medium">{invoice.customer.name}</span></Td><Td><span className="block">{date(invoice.issue_date)}</span><span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="size-3" />Due {date(invoice.due_date)}</span></Td><Td className="font-semibold">{money(invoice.payable_amount, invoice.currency_code)}</Td><Td><StatusPill status={invoice.status} /></Td><Td><StatusPill status={invoice.payment_status} /></Td><Td><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" asChild><Link href={`/invoices/${invoice.id}`} aria-label="View invoice"><Eye /></Link></Button>{invoice.status === 'DRAFT' && <><Button variant="ghost" size="icon" asChild><Link href={`/invoices/${invoice.id}/edit`} aria-label="Edit invoice"><Pencil /></Link></Button><Button variant="ghost" size="icon" onClick={() => issue(invoice)} aria-label="Issue invoice"><Send /></Button><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => destroy(invoice)} aria-label="Delete invoice"><Trash2 /></Button></>}</div></Td></tr>)}
        </tbody></table></div></DataPanel>
        <Pagination links={invoices.links} from={invoices.from} to={invoices.to} total={invoices.total} />
    </div></>;
}

function Th({ children, className = '' }) { return <th className={`px-5 py-3 font-medium whitespace-nowrap ${className}`}>{children}</th>; }
function Td({ children, className = '' }) { return <td className={`px-5 py-3.5 align-middle whitespace-nowrap ${className}`}>{children}</td>; }
function date(value) { return value ? new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(new Date(value)) : '—'; }
function money(value, currency = 'NGN') { return new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(value ?? 0)); }
Index.layout = { breadcrumbs: [{ title: 'Invoices', href: '/invoices' }] };
