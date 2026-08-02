import { Link } from '@inertiajs/react';
import { Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PageHeader({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h1 className="text-[28px] font-semibold tracking-[-0.03em]">
                    {title}
                </h1>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
            </div>
            {children && (
                <div className="flex shrink-0 flex-wrap gap-2">{children}</div>
            )}
        </div>
    );
}

export function StatCard({
    label,
    value,
    detail,
    icon: Icon,
    tone = 'default',
}: {
    label: string;
    value: ReactNode;
    detail?: string;
    icon: LucideIcon;
    tone?: 'default' | 'warning' | 'success';
}) {
    return (
        <div className="nexa-card p-5">
            <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                    {label}
                </p>
                <span
                    className={cn(
                        'flex size-9 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground',
                        tone === 'warning' &&
                            'bg-amber-50 text-amber-600 dark:bg-amber-950/50',
                        tone === 'success' &&
                            'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50',
                    )}
                >
                    <Icon className="size-4" />
                </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                {value}
            </p>
            {detail && (
                <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
            )}
        </div>
    );
}

export function DataPanel({
    title,
    description,
    count,
    children,
}: {
    title: string;
    description?: string;
    count?: number;
    children: ReactNode;
}) {
    return (
        <section className="nexa-card">
            <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="font-semibold">{title}</h2>
                        {typeof count === 'number' && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                {count.toLocaleString()}
                            </span>
                        )}
                    </div>
                    {description && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {children}
        </section>
    );
}

export function EmptyTable({
    colSpan,
    title,
    description,
    href,
    action,
    icon: Icon = Inbox,
}: {
    colSpan: number;
    title: string;
    description: string;
    href?: string;
    action?: string;
    icon?: LucideIcon;
}) {
    return (
        <tr>
            <td colSpan={colSpan}>
                <div className="flex min-h-60 flex-col items-center justify-center px-6 py-10 text-center">
                    <span className="flex size-11 items-center justify-center rounded-xl border bg-muted/25">
                        <Icon className="size-5 text-muted-foreground" />
                    </span>
                    <p className="mt-4 text-sm font-semibold">{title}</p>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                        {description}
                    </p>
                    {href && action && (
                        <Button size="sm" className="mt-4" asChild>
                            <Link href={href}>{action}</Link>
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );
}

export function StatusPill({ status }: { status: string }) {
    const value = status.toUpperCase();
    const success = ['ACTIVE', 'PAID', 'POSTED', 'IN STOCK'].includes(value);
    const info = ['ISSUED', 'PARTIAL'].includes(value);
    const danger = ['CANCELLED', 'OUT OF STOCK'].includes(value);
    const warning = ['PENDING', 'LOW STOCK'].includes(value);

    return (
        <Badge
            variant="outline"
            className={cn(
                'gap-1.5 border-border bg-muted/40 text-muted-foreground',
                success &&
                    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400',
                info &&
                    'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-400',
                danger &&
                    'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400',
                warning &&
                    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400',
            )}
        >
            <span className="size-1.5 rounded-full bg-current" />
            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </Badge>
    );
}

export function Pagination({
    links,
    from,
    to,
    total,
}: {
    links: Array<{ label: string; url: string | null; active: boolean }>;
    from?: number;
    to?: number;
    total?: number;
}) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {typeof total === 'number' && (
                <p className="text-xs text-muted-foreground">
                    Showing {from ?? 0}–{to ?? 0} of {total.toLocaleString()}
                </p>
            )}
            <div className="flex flex-wrap gap-1.5 sm:ml-auto">
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
        </div>
    );
}
