import { Head, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props;
    const metrics = [
        { label: 'Total customers', value: '0' },
        { label: 'Total products', value: '0' },
        { label: 'Total invoices', value: '0' },
        { label: 'Revenue', value: '0' },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Business
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold">
                        {auth.user.name}
                    </h1>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {metrics.map((metric) => (
                        <div
                            key={metric.label}
                            className="rounded-lg border border-sidebar-border/70 p-5 dark:border-sidebar-border"
                        >
                            <p className="text-sm text-muted-foreground">
                                {metric.label}
                            </p>
                            <p className="mt-3 text-3xl font-semibold">
                                {metric.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
