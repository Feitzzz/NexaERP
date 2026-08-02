import {
    ArrowLeft,
    BadgeCheck,
    FileText,
    PackageCheck,
    ShieldCheck,
} from 'lucide-react';
import { Brand, ThemeToggle } from '@/components/brand';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const wide = title?.toLowerCase().startsWith('create');

    return (
        <div className="min-h-svh bg-background lg:grid lg:grid-cols-[minmax(360px,0.8fr)_minmax(560px,1.2fr)]">
            <aside className="relative hidden min-h-svh overflow-hidden bg-[#0b1739] p-10 text-white lg:flex lg:flex-col xl:p-14">
                <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:48px_48px] opacity-[0.07]" />
                <div className="relative z-10">
                    <Brand inverse />
                </div>
                <div className="relative z-10 my-auto max-w-md py-16">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
                        <BadgeCheck className="size-3.5" />
                        Built for Nigerian businesses
                    </span>
                    <h2 className="mt-6 text-4xl leading-[1.08] font-semibold tracking-[-0.04em]">
                        Run your business with clarity.
                    </h2>
                    <p className="mt-4 max-w-sm text-[15px] leading-7 text-blue-100/75">
                        Invoices, customers, inventory, taxes and
                        sales—connected in one dependable workspace.
                    </p>
                    <div className="mt-10 space-y-5">
                        <Benefit
                            icon={FileText}
                            title="Compliance work underway"
                            copy="NRS compliance capabilities are currently in development."
                        />
                        <Benefit
                            icon={PackageCheck}
                            title="Inventory you can trust"
                            copy="Track stock, movements and reorder levels."
                        />
                        <Benefit
                            icon={ShieldCheck}
                            title="Your records stay isolated"
                            copy="Tenant-scoped data and secure account access."
                        />
                    </div>
                </div>
                <p className="relative z-10 text-xs text-blue-100/50">
                    © {new Date().getFullYear()} NexaERP · Business operations,
                    simplified.
                </p>
            </aside>

            <main className="relative flex min-h-svh flex-col">
                <header className="flex h-16 items-center justify-between border-b px-5 sm:px-8 lg:justify-end">
                    <Brand className="lg:hidden" />
                    <div className="flex items-center gap-2">
                        <a
                            href={home().url}
                            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground sm:flex"
                        >
                            <ArrowLeft className="size-4" />
                            Back to home
                        </a>
                        <ThemeToggle />
                    </div>
                </header>
                <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:py-14">
                    <div
                        className={cn(
                            'w-full',
                            wide ? 'max-w-2xl' : 'max-w-[420px]',
                        )}
                    >
                        <div className="mb-7">
                            <h1 className="text-2xl font-semibold tracking-[-0.03em]">
                                {title}
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {description}
                            </p>
                        </div>
                        <div
                            className={cn(
                                'rounded-xl border bg-card shadow-[0_1px_3px_rgba(15,23,42,.04)]',
                                wide ? 'p-5 sm:p-7' : 'p-5 sm:p-7',
                            )}
                        >
                            {children}
                        </div>
                        <p className="mt-6 text-center text-xs text-muted-foreground">
                            By continuing, you agree to use NexaERP responsibly
                            for your business records.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

function Benefit({
    icon: Icon,
    title,
    copy,
}: {
    icon: typeof FileText;
    title: string;
    copy: string;
}) {
    return (
        <div className="flex gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10">
                <Icon className="size-4 text-blue-200" />
            </span>
            <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-0.5 text-xs leading-5 text-blue-100/60">
                    {copy}
                </p>
            </div>
        </div>
    );
}
