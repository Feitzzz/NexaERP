import { Head, Link, router } from '@inertiajs/react';
import { Building2, Eye, Pencil, Plus, Search, Trash2, UserCheck, Users, WalletCards, X } from 'lucide-react';
import { useState } from 'react';
import { DataPanel, EmptyTable, PageHeader, Pagination, StatCard, StatusPill } from '@/components/page-primitives';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Index({ customers, filters, summary }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const submit = (event) => { event.preventDefault(); router.get('/customers', { search }, { preserveState: true, replace: true }); };
    const clear = () => { setSearch(''); router.get('/customers', {}, { preserveState: true, replace: true }); };
    const destroy = (customer) => confirm(`Delete ${customer.name}?`) && router.delete(`/customers/${customer.id}`, { preserveScroll: true });

    return <><Head title="Customers" /><div className="nexa-page">
        <PageHeader title="Customers" description="Manage customer records, contact details and account activity."><Button asChild><Link href="/customers/create"><Plus />New customer</Link></Button></PageHeader>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total customers" value={summary.total.toLocaleString()} detail="All customer records" icon={Users} />
            <StatCard label="Active" value={summary.active.toLocaleString()} detail="Available for invoicing" icon={UserCheck} tone="success" />
            <StatCard label="Business accounts" value={summary.businesses.toLocaleString()} detail="Registered organizations" icon={Building2} />
            <StatCard label="Outstanding" value={money(summary.outstanding)} detail="Across issued invoices" icon={WalletCards} tone={summary.outstanding > 0 ? 'warning' : 'default'} />
        </div>

        <form onSubmit={submit} className="nexa-card flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
            <div className="relative max-w-xl flex-1"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, code, TIN, email or phone…" /></div>
            {filters.search && <Button type="button" variant="ghost" onClick={clear}><X />Clear</Button>}
            <Button type="submit" variant="outline">Search</Button>
        </form>

        <DataPanel title="Customer directory" description="A complete view of customers connected to this business" count={customers.total}>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><Th>Customer</Th><Th>Type</Th><Th>Contact</Th><Th>Location</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr></thead><tbody>
                {!customers.data.length && <EmptyTable colSpan={6} icon={Users} title={filters.search ? 'No matching customers' : 'No customers yet'} description={filters.search ? 'Try a different name, code or contact detail.' : 'Add your first customer to begin creating invoices.'} href={!filters.search ? '/customers/create' : undefined} action="Add customer" />}
                {customers.data.map((customer) => <tr key={customer.id} className="border-t">
                    <Td><Link href={`/customers/${customer.id}`} className="flex items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">{initials(customer.name)}</span><span><span className="block font-medium text-foreground hover:text-primary">{customer.name}</span><span className="mt-0.5 block text-xs text-muted-foreground">{customer.customer_code}{customer.tin ? ` · TIN ${customer.tin}` : ''}</span></span></Link></Td>
                    <Td><span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">{title(customer.customer_type)}</span></Td>
                    <Td><span className="block">{customer.phone}</span><span className="mt-0.5 block text-xs text-muted-foreground">{customer.email || 'No email provided'}</span></Td>
                    <Td className="text-muted-foreground">{[customer.city, customer.state].filter(Boolean).join(', ') || 'Not provided'}</Td>
                    <Td><StatusPill status={customer.is_active ? 'Active' : 'Inactive'} /></Td>
                    <Td><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" asChild><Link href={`/customers/${customer.id}`} aria-label="View customer"><Eye /></Link></Button><Button variant="ghost" size="icon" asChild><Link href={`/customers/${customer.id}/edit`} aria-label="Edit customer"><Pencil /></Link></Button><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => destroy(customer)} aria-label="Delete customer"><Trash2 /></Button></div></Td>
                </tr>)}
            </tbody></table></div>
        </DataPanel>
        <Pagination links={customers.links} from={customers.from} to={customers.to} total={customers.total} />
    </div></>;
}

function Th({ children, className = '' }) { return <th className={`px-5 py-3 font-medium whitespace-nowrap ${className}`}>{children}</th>; }
function Td({ children, className = '' }) { return <td className={`px-5 py-3.5 align-middle ${className}`}>{children}</td>; }
function title(value) { return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(); }
function initials(value) { return value.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase(); }
function money(value) { return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(Number(value)); }
Index.layout = { breadcrumbs: [{ title: 'Customers', href: '/customers' }] };
