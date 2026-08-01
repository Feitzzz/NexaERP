import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Boxes,
    ChevronRight,
    FilePlus2,
    FileText,
    Package,
    Users,
    WalletCards,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';

type Metrics = {
    revenue: number;
    invoices_issued: number;
    outstanding: number;
    outstanding_customers: number;
    customers: number;
    active_customers: number;
    products: number;
    active_products: number;
    low_stock: number;
};

type Invoice = {
    id: number;
    invoice_number: string;
    issue_date: string;
    status: string;
    payment_status: string;
    payable_amount: number;
    currency_code: string;
    customer: { name: string };
};

type LowStockItem = {
    id: number;
    name: string;
    sku: string;
    quantity: number;
    reorder_level: number;
    unit: string;
};

type Activity = {
    id: string;
    type: 'invoice' | 'customer' | 'product';
    title: string;
    detail: string;
    occurred_at: string;
};

export default function Dashboard({
    metrics,
    recentInvoices,
    lowStockItems,
    activity,
}: {
    business: { name: string; email: string };
    metrics: Metrics;
    recentInvoices: Invoice[];
    lowStockItems: LowStockItem[];
    activity: Activity[];
}) {
    const cards = [
        {
            label: 'Revenue',
            value: money(metrics.revenue),
            note: 'from issued invoices',
            icon: WalletCards,
            direction: 'up',
        },
        {
            label: 'Invoices issued',
            value: metrics.invoices_issued.toLocaleString(),
            note: 'issued in total',
            icon: FileText,
            direction: 'up',
        },
        {
            label: 'Outstanding',
            value: money(metrics.outstanding),
            note: `across ${metrics.outstanding_customers} customer${metrics.outstanding_customers === 1 ? '' : 's'}`,
            icon: ArrowUpRight,
            direction: 'down',
        },
        {
            label: 'Customers',
            value: metrics.customers.toLocaleString(),
            note: `${metrics.active_customers} active`,
            icon: Users,
            direction: 'up',
        },
        {
            label: 'Products',
            value: metrics.products.toLocaleString(),
            note: `${metrics.active_products} in catalogue`,
            icon: Package,
            direction: 'neutral',
        },
        {
            label: 'Low stock items',
            value: metrics.low_stock.toLocaleString(),
            note: metrics.low_stock ? 'needs attention' : 'inventory is healthy',
            icon: AlertTriangle,
            direction: metrics.low_stock ? 'down' : 'neutral',
        },
    ];

    return (
        <>
            <Head title="Dashboard" />
            <div className="nexa-page">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Dashboard</h1>
                        <p className="mt-1 text-sm text-muted-foreground">A snapshot of your business performance and recent activity.</p>
                    </div>
                    <Button asChild><Link href="/invoices/create"><FilePlus2 />Create invoice</Link></Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {cards.map(({ label, value, note, icon: Icon, direction }) => (
                        <div key={label} className="nexa-card p-5">
                            <div className="flex items-start justify-between">
                                <span className="text-sm font-medium text-muted-foreground">{label}</span>
                                <span className="flex size-9 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground"><Icon className="size-4" /></span>
                            </div>
                            <div className="mt-4 text-2xl font-semibold tracking-[-0.03em]">{value}</div>
                            <p className={`mt-1.5 flex items-center gap-1 text-xs ${direction === 'down' ? 'text-rose-500' : direction === 'up' ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                {direction === 'up' && <ArrowUpRight className="size-3" />}
                                {direction === 'down' && <ArrowDownRight className="size-3" />}
                                {note}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(310px,1fr)]">
                    <section className="nexa-card">
                        <CardHeader title="Recent invoices" description="Latest activity across your invoices" href="/invoices" />
                        {recentInvoices.length ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead><tr><Th>Invoice</Th><Th>Customer</Th><Th>Issued</Th><Th>Status</Th><Th className="text-right">Amount</Th></tr></thead>
                                    <tbody>{recentInvoices.map((invoice) => (
                                        <tr key={invoice.id} className="border-t">
                                            <Td><Link href={`/invoices/${invoice.id}`} className="font-medium hover:text-primary">{invoice.invoice_number}</Link></Td>
                                            <Td className="text-muted-foreground">{invoice.customer.name}</Td>
                                            <Td className="text-muted-foreground">{date(invoice.issue_date)}</Td>
                                            <Td><Status status={invoice.status === 'ISSUED' && invoice.payment_status === 'PAID' ? 'PAID' : invoice.status} /></Td>
                                            <Td className="text-right font-medium">{money(invoice.payable_amount, invoice.currency_code)}</Td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>
                        ) : <Empty icon={FileText} title="No invoices yet" copy="Create your first invoice to start tracking revenue and payments." href="/invoices/create" action="Create invoice" />}
                    </section>

                    <section className="nexa-card">
                        <CardHeader title="Quick actions" description="Jump straight into common tasks" />
                        <div className="divide-y">
                            <QuickAction title="Create invoice" copy="Draft a new invoice" icon={FilePlus2} href="/invoices/create" />
                            <QuickAction title="Add customer" copy="Register a new customer" icon={Users} href="/customers/create" />
                            <QuickAction title="Add product" copy="Add to your catalogue" icon={Package} href="/products/create" />
                            <QuickAction title="Adjust stock" copy="Record a stock movement" icon={Boxes} href="/inventory-adjustments/create" />
                        </div>
                    </section>
                </div>

                <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(310px,1fr)]">
                    <section className="nexa-card">
                        <div className="nexa-card-header"><div><h2 className="flex items-center gap-2 font-semibold"><AlertTriangle className="size-4 text-amber-500" />Low stock alerts</h2><p className="mt-1 text-sm text-muted-foreground">Products at or below their reorder level</p></div></div>
                        {lowStockItems.length ? <div className="divide-y px-5">{lowStockItems.map((item) => (
                            <Link href={`/inventory/products/${item.id}`} key={item.id} className="flex items-center gap-3 py-3.5">
                                <span className="flex size-9 items-center justify-center rounded-lg border bg-muted/25"><Boxes className="size-4 text-muted-foreground" /></span>
                                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{item.name}</span><span className="block text-xs text-muted-foreground">{item.sku}</span></span>
                                <span className="text-right"><span className="block text-sm font-semibold">{item.quantity} {item.unit}</span><span className="block text-xs text-muted-foreground">reorder at {item.reorder_level}</span></span>
                            </Link>
                        ))}</div> : <div className="flex min-h-28 items-center justify-center px-6 py-8 text-sm text-muted-foreground">No low stock items. Your inventory is healthy.</div>}
                    </section>

                    <section className="nexa-card">
                        <CardHeader title="Recent activity" description="What's happening across your business" />
                        {activity.length ? <div className="px-5 py-2">{activity.map((item, index) => <ActivityItem key={item.id} item={item} last={index === activity.length - 1} />)}</div> : <div className="flex min-h-28 items-center justify-center px-6 py-8 text-sm text-muted-foreground">Activity will appear here.</div>}
                    </section>
                </div>
            </div>
        </>
    );
}

function CardHeader({ title, description, href }: { title: string; description: string; href?: string }) {
    return <div className="nexa-card-header"><div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>{href && <Link href={href} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">View all <ArrowUpRight className="size-3.5" /></Link>}</div>;
}

function QuickAction({ title, copy, icon: Icon, href }: { title: string; copy: string; icon: typeof FileText; href: string }) {
    return <Link href={href} className="group flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30"><span className="flex size-9 items-center justify-center rounded-lg border bg-background"><Icon className="size-4 text-muted-foreground" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{title}</span><span className="block text-xs text-muted-foreground">{copy}</span></span><ChevronRight className="size-4 text-muted-foreground/60 group-hover:text-foreground" /></Link>;
}

function ActivityItem({ item, last }: { item: Activity; last: boolean }) {
    const Icon = item.type === 'invoice' ? FileText : item.type === 'customer' ? Users : Package;

    return <div className="relative flex gap-3 py-3">{!last && <span className="absolute top-10 bottom-[-12px] left-[17px] w-px bg-border" />}<span className="z-10 flex size-9 shrink-0 items-center justify-center rounded-full border bg-background"><Icon className="size-4 text-muted-foreground" /></span><span className="min-w-0 pt-0.5"><span className="block truncate text-sm font-medium">{item.title}</span><span className="block truncate text-xs text-muted-foreground">{item.detail}</span><span className="mt-0.5 block text-[11px] text-muted-foreground/70">{relativeTime(item.occurred_at)}</span></span></div>;
}

function Empty({ icon: Icon, title, copy, href, action }: { icon: typeof FileText; title: string; copy: string; href: string; action: string }) {
    return <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center"><span className="flex size-11 items-center justify-center rounded-xl border bg-muted/30"><Icon className="size-5 text-muted-foreground" /></span><h3 className="mt-4 text-sm font-semibold">{title}</h3><p className="mt-1 max-w-xs text-sm text-muted-foreground">{copy}</p><Button size="sm" className="mt-4" asChild><Link href={href}><FilePlus2 />{action}</Link></Button></div>;
}

function Status({ status }: { status: string }) {
    const styles = status === 'PAID' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400' : status === 'ISSUED' ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-400' : 'border-border bg-muted/50 text-muted-foreground';

    return <Badge variant="outline" className={styles}><span className="mr-1 size-1.5 rounded-full bg-current" />{status[0] + status.slice(1).toLowerCase()}</Badge>;
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
 return <th className={`px-5 py-3 font-medium ${className}`}>{children}</th>; 
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
 return <td className={`px-5 py-3.5 whitespace-nowrap ${className}`}>{children}</td>; 
}
function money(value: number, currency = 'NGN') {
 return new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(value)); 
}
function date(value: string) {
 return new Intl.DateTimeFormat('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)); 
}
function relativeTime(value: string) {
 const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000);

 return days <= 0 ? 'Today' : days === 1 ? '1d ago' : `${days}d ago`; 
}

Dashboard.layout = { breadcrumbs: [{ title: 'Dashboard', href: dashboard() }] };
