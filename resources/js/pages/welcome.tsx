import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    BarChart3,
    Boxes,
    Check,
    ChevronRight,
    CircleDollarSign,
    FileCheck2,
    FilePlus2,
    FileText,
    LayoutDashboard,
    PackageSearch,
    ReceiptText,
    Users,
    Warehouse,
} from 'lucide-react';
import { Brand, ThemeToggle } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Business Management Software for Growing Nigerian Businesses">
                <meta
                    name="description"
                    content="Manage customers, products, inventory, sales, invoices, taxes and reporting from one connected business platform built for growing Nigerian businesses."
                />
            </Head>
            <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
                <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-xl">
                    <div className="mx-auto flex h-16 max-w-7xl items-center px-5 lg:px-8">
                        <Brand />
                        <nav className="ml-10 hidden items-center gap-7 text-sm text-muted-foreground md:flex">
                            <a
                                href="#platform"
                                className="transition-colors hover:text-foreground"
                            >
                                Why NexaERP
                            </a>
                            <a
                                href="#modules"
                                className="transition-colors hover:text-foreground"
                            >
                                Features
                            </a>
                            <a
                                href="#workflow"
                                className="transition-colors hover:text-foreground"
                            >
                                How it works
                            </a>
                        </nav>
                        <div className="ml-auto flex items-center gap-2">
                            <ThemeToggle />
                            {auth.user ? (
                                <Button size="sm" asChild>
                                    <Link href={dashboard()}>
                                        Open dashboard <ArrowRight />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="hidden sm:inline-flex"
                                        asChild
                                    >
                                        <Link href={login()}>Sign in</Link>
                                    </Button>
                                    <Button size="sm" asChild>
                                        <Link href={register()}>
                                            Get started <ArrowRight />
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main>
                    <section className="relative border-b">
                        <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_82%)] [background-size:22px_22px] opacity-[0.35]" />
                        <div className="relative mx-auto max-w-7xl px-5 pt-20 pb-16 text-center sm:pt-28 lg:px-8 lg:pb-24">
                            <div className="mx-auto max-w-4xl">
                                <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium shadow-sm">
                                    <span className="size-1.5 rounded-full bg-emerald-500" />
                                    Unified operations for Nigerian businesses
                                </span>
                                <h1 className="mx-auto mt-7 max-w-4xl text-4xl leading-[1.05] font-semibold tracking-[-0.05em] text-balance sm:text-6xl lg:text-[68px]">
                                    Run your business with clarity, control, and
                                    confidence.
                                </h1>
                                <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                                    Manage customers, products, inventory,
                                    sales, invoicing, taxes and reporting from
                                    one connected platform—without relying on
                                    scattered spreadsheets and disconnected
                                    tools.
                                </p>
                                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                    <Button size="lg" asChild>
                                        <Link
                                            href={
                                                auth.user
                                                    ? dashboard()
                                                    : register()
                                            }
                                        >
                                            {auth.user
                                                ? 'Go to dashboard'
                                                : 'Start managing your business'}{' '}
                                            <ArrowRight />
                                        </Link>
                                    </Button>
                                    {!auth.user && (
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            asChild
                                        >
                                            <Link href={login()}>
                                                Sign in to NexaERP
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Check className="size-3.5 text-emerald-600" />
                                        One connected business record
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Check className="size-3.5 text-emerald-600" />
                                        Nigerian Naira support
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Check className="size-3.5 text-emerald-600" />
                                        Clear operational visibility
                                    </span>
                                </div>
                            </div>

                            <ProductPreview />
                        </div>
                    </section>

                    <section id="platform" className="border-b py-20 sm:py-24">
                        <div className="mx-auto max-w-7xl px-5 lg:px-8">
                            <SectionIntro
                                eyebrow="One source of truth"
                                title="Your business should not be scattered across separate tools."
                                copy="NexaERP brings customer details, product records, stock activity, sales and invoices into one organized system—so you spend less time piecing information together and more time acting on it."
                            />
                            <div className="mt-12 grid overflow-hidden rounded-2xl border bg-border md:grid-cols-3 md:gap-px">
                                <Value
                                    icon={LayoutDashboard}
                                    title="Bring your records together"
                                    copy="Keep the information behind customers, products, stock, sales and invoices connected instead of spread across paper, messages and spreadsheets."
                                />
                                <Value
                                    icon={FileCheck2}
                                    title="Make daily work more consistent"
                                    copy="Move from organized records to sales and professional invoices without entering the same business information in separate tools."
                                />
                                <Value
                                    icon={PackageSearch}
                                    title="See what needs attention"
                                    copy="Follow sales performance, stock quantities, warehouse movements, outstanding invoices and low-stock items from one workspace."
                                />
                            </div>
                        </div>
                    </section>

                    <section
                        id="modules"
                        className="bg-muted/25 py-20 sm:py-24"
                    >
                        <div className="mx-auto max-w-7xl px-5 lg:px-8">
                            <SectionIntro
                                eyebrow="Connected capabilities"
                                title="The essential parts of your operation, working together."
                                copy="From the moment you add a customer or product to the moment you issue an invoice and review performance, NexaERP keeps the business record connected."
                            />
                            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <Module
                                    icon={FileText}
                                    title="Invoicing"
                                    copy="Turn business transactions into clear draft and issued invoices with consistent tax calculations and protected final records."
                                />
                                <Module
                                    icon={Users}
                                    title="Customers"
                                    copy="Keep contact details, customer type, TIN, location and related invoice activity organized in one profile."
                                />
                                <Module
                                    icon={Boxes}
                                    title="Products & services"
                                    copy="Organize your catalogue, SKUs, pricing, categories, units and tax settings for consistent sales records."
                                />
                                <Module
                                    icon={Warehouse}
                                    title="Inventory"
                                    copy="Understand current stock, warehouse balances, movements, adjustments, reorder levels and items that need attention."
                                />
                                <Module
                                    icon={CircleDollarSign}
                                    title="Sales"
                                    copy="Review revenue, units sold, recent sales, top customers and the products driving the business."
                                />
                                <Module
                                    icon={ReceiptText}
                                    title="Reporting & tax visibility"
                                    copy="Replace guesswork with clearer sales, inventory, invoice and tax-rate information for day-to-day decisions."
                                />
                            </div>
                        </div>
                    </section>

                    <section id="workflow" className="border-y py-20 sm:py-24">
                        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:px-8">
                            <div>
                                <span className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                                    One connected workflow
                                </span>
                                <h2 className="mt-4 max-w-lg text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                                    From daily records to better decisions,
                                    everything stays connected.
                                </h2>
                                <p className="mt-4 max-w-lg text-[15px] leading-7 text-muted-foreground">
                                    Customer and product records support each
                                    sale. Inventory reflects posted stock
                                    activity. Invoices preserve the transaction,
                                    while reporting gives you a clearer view of
                                    what is happening across the business.
                                </p>
                                <div className="mt-7 space-y-3">
                                    <CheckLine text="Organize customers, products, pricing and tax settings" />
                                    <CheckLine text="Track warehouse stock, movements and reorder levels" />
                                    <CheckLine text="Turn sales activity into consistent invoice records" />
                                    <CheckLine text="Review revenue, units sold and operational performance" />
                                </div>
                            </div>
                            <WorkflowCard />
                        </div>
                    </section>

                    <section className="py-20 sm:py-24">
                        <div className="mx-auto max-w-5xl px-5 lg:px-8">
                            <div className="relative overflow-hidden rounded-2xl bg-[#0b1739] px-6 py-12 text-center text-white sm:px-12 sm:py-16">
                                <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.08]" />
                                <div className="relative">
                                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-white text-base font-bold text-blue-700">
                                        N
                                    </span>
                                    <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                                        Bring your business operations together.
                                    </h2>
                                    <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-blue-100/70">
                                        Spend less time managing scattered
                                        records and get a clearer view of
                                        customers, products, inventory, sales,
                                        invoices and performance.
                                    </p>
                                    <Button
                                        size="lg"
                                        className="mt-8 bg-white text-[#0b1739] hover:bg-blue-50"
                                        asChild
                                    >
                                        <Link
                                            href={
                                                auth.user
                                                    ? dashboard()
                                                    : register()
                                            }
                                        >
                                            {auth.user
                                                ? 'Open NexaERP'
                                                : 'Start managing your business'}{' '}
                                            <ArrowRight />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t">
                    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center lg:px-8">
                        <Brand />
                        <p className="text-xs text-muted-foreground sm:ml-auto">
                            © {new Date().getFullYear()} NexaERP. Unified
                            business operations for growing Nigerian businesses.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

function ProductPreview() {
    const nav = [
        [LayoutDashboard, 'Dashboard', true],
        [FileText, 'Invoices', false],
        [Users, 'Customers', false],
        [Boxes, 'Products', false],
        [PackageSearch, 'Inventory', false],
        [BarChart3, 'Sales', false],
    ] as const;

    return (
        <div className="relative mx-auto mt-16 max-w-6xl text-left sm:mt-20">
            <div className="absolute inset-x-16 -bottom-8 h-20 bg-primary/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-xl border bg-card shadow-[0_24px_70px_rgba(15,23,42,.12)]">
                <div className="flex h-10 items-center gap-1.5 border-b bg-muted/30 px-4">
                    <span className="size-2.5 rounded-full bg-rose-400" />
                    <span className="size-2.5 rounded-full bg-amber-400" />
                    <span className="size-2.5 rounded-full bg-emerald-400" />
                    <span className="mx-auto h-5 w-48 rounded-md border bg-background sm:w-72" />
                </div>
                <div className="grid min-h-[430px] grid-cols-[54px_minmax(0,1fr)] sm:grid-cols-[190px_minmax(0,1fr)]">
                    <aside className="border-r bg-muted/15 p-2 sm:p-3">
                        <div className="mb-5 flex items-center gap-2 px-1.5 py-2">
                            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
                                N
                            </span>
                            <span className="hidden text-xs font-semibold sm:block">
                                NexaERP
                            </span>
                        </div>
                        <div className="space-y-1">
                            {nav.map(([Icon, label, active]) => (
                                <div
                                    key={label}
                                    className={`flex h-8 items-center gap-2 rounded-md px-2 text-xs ${active ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground'}`}
                                >
                                    <Icon className="size-3.5 shrink-0" />
                                    <span className="hidden sm:block">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </aside>
                    <div className="min-w-0">
                        <div className="flex h-12 items-center border-b px-4">
                            <div className="h-7 w-44 rounded-md border bg-muted/20" />
                            <span className="ml-auto size-7 rounded-full bg-primary/15" />
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="h-5 w-28 rounded bg-foreground/90" />
                                    <div className="mt-2 h-2.5 w-52 rounded bg-muted-foreground/20" />
                                </div>
                                <div className="h-8 w-28 rounded-md bg-primary" />
                            </div>
                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                {[
                                    ['Revenue', '₦1.2M'],
                                    ['Invoices issued', '42'],
                                    ['Outstanding', '₦385K'],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="rounded-lg border p-3 sm:p-4"
                                    >
                                        <p className="text-[9px] text-muted-foreground sm:text-[10px]">
                                            {label}
                                        </p>
                                        <p className="mt-3 text-base font-semibold sm:text-xl">
                                            {value}
                                        </p>
                                        <p className="mt-1 text-[8px] text-emerald-600 sm:text-[9px]">
                                            ↗ healthy this month
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 grid gap-3 sm:grid-cols-[1.6fr_1fr]">
                                <div className="overflow-hidden rounded-lg border">
                                    <div className="border-b p-3">
                                        <p className="text-[10px] font-semibold">
                                            Recent invoices
                                        </p>
                                        <p className="mt-1 text-[8px] text-muted-foreground">
                                            Latest activity across your invoices
                                        </p>
                                    </div>
                                    {[
                                        'INV-1042',
                                        'INV-1041',
                                        'INV-1040',
                                        'INV-1039',
                                    ].map((invoice, index) => (
                                        <div
                                            key={invoice}
                                            className="grid grid-cols-[1fr_1.3fr_.8fr] border-b px-3 py-2.5 text-[8px] last:border-0 sm:text-[9px]"
                                        >
                                            <span className="font-medium">
                                                {invoice}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {
                                                    [
                                                        'Zenith Logistics',
                                                        'Sahara Retail',
                                                        'GreenField Agro',
                                                        'Coastal Foods',
                                                    ][index]
                                                }
                                            </span>
                                            <span className="text-right font-medium">
                                                {
                                                    [
                                                        '₦1.01M',
                                                        '₦618K',
                                                        '₦486K',
                                                        '₦91K',
                                                    ][index]
                                                }
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="hidden rounded-lg border sm:block">
                                    <div className="border-b p-3 text-[10px] font-semibold">
                                        Quick actions
                                    </div>
                                    {[
                                        'Create invoice',
                                        'Add customer',
                                        'Add product',
                                        'Adjust stock',
                                    ].map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-center gap-2 border-b px-3 py-2.5 text-[9px] last:border-0"
                                        >
                                            <span className="size-5 rounded border bg-muted/30" />
                                            {item}
                                            <ChevronRight className="ml-auto size-2.5 text-muted-foreground" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SectionIntro({
    eyebrow,
    title,
    copy,
}: {
    eyebrow: string;
    title: string;
    copy: string;
}) {
    return (
        <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                {eyebrow}
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                {title}
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
                {copy}
            </p>
        </div>
    );
}
function Value({
    icon: Icon,
    title,
    copy,
}: {
    icon: typeof FileText;
    title: string;
    copy: string;
}) {
    return (
        <div className="bg-card p-6 sm:p-8">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
            </span>
            <h3 className="mt-5 font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {copy}
            </p>
        </div>
    );
}
function Module({
    icon: Icon,
    title,
    copy,
}: {
    icon: typeof FileText;
    title: string;
    copy: string;
}) {
    return (
        <div className="rounded-xl border bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,.025)]">
            <Icon className="size-5 text-primary" />
            <h3 className="mt-5 font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {copy}
            </p>
        </div>
    );
}
function CheckLine({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 text-sm">
            <span className="flex size-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Check className="size-3.5" />
            </span>
            {text}
        </div>
    );
}
function WorkflowCard() {
    const steps = [
        [
            '01',
            'Organize records',
            'Add customers, products, pricing and tax settings.',
        ],
        [
            '02',
            'Track stock',
            'Follow warehouse balances, movements and adjustments.',
        ],
        [
            '03',
            'Record the sale',
            'Connect the customer, items and final invoice record.',
        ],
        [
            '04',
            'Review performance',
            'See revenue, units sold and the activity driving operations.',
        ],
    ];

    return (
        <div className="rounded-2xl border bg-card p-3 shadow-[0_16px_50px_rgba(15,23,42,.08)]">
            <div className="flex items-center gap-3 border-b p-4">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                    <FilePlus2 className="size-4 text-primary" />
                </span>
                <div>
                    <p className="text-sm font-semibold">
                        Connected business workflow
                    </p>
                    <p className="text-xs text-muted-foreground">
                        From organized records to operational visibility
                    </p>
                </div>
                <BadgeCheck className="ml-auto size-5 text-emerald-600" />
            </div>
            <div className="p-2">
                {steps.map(([number, title, copy], index) => (
                    <div key={number} className="relative flex gap-4 p-3">
                        {index < steps.length - 1 && (
                            <span className="absolute top-10 bottom-[-12px] left-[26px] w-px bg-border" />
                        )}
                        <span className="z-10 flex size-7 shrink-0 items-center justify-center rounded-full border bg-background text-[10px] font-semibold text-muted-foreground">
                            {number}
                        </span>
                        <div>
                            <p className="text-sm font-medium">{title}</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                {copy}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
