import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';

export default function Index({ taxCategories }) {
    return (
        <>
            <Head title="Taxes" />

            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <Heading
                    title="Taxes"
                    description="Review tax classifications and current rates."
                />

                <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/40 text-xs text-muted-foreground uppercase">
                                <tr>
                                    <Th>Code</Th>
                                    <Th>Tax Category</Th>
                                    <Th>Treatment</Th>
                                    <Th>Current Rate</Th>
                                    <Th>Effective From</Th>
                                    <Th>Status</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {taxCategories.map((taxCategory) => (
                                    <tr
                                        key={taxCategory.id}
                                        className="border-b last:border-b-0"
                                    >
                                        <Td className="font-medium">
                                            {taxCategory.code}
                                        </Td>
                                        <Td>{taxCategory.name}</Td>
                                        <Td>
                                            {formatTreatment(
                                                taxCategory.treatment,
                                            )}
                                        </Td>
                                        <Td>
                                            {formatRate(
                                                taxCategory.current_rate,
                                            )}
                                        </Td>
                                        <Td>
                                            {taxCategory.effective_from ?? '-'}
                                        </Td>
                                        <Td>
                                            <Badge
                                                variant={
                                                    taxCategory.is_active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {taxCategory.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </Badge>
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

function Th({ children }) {
    return (
        <th className="px-4 py-3 font-medium whitespace-nowrap">{children}</th>
    );
}

function Td({ children, className = '' }) {
    return (
        <td className={`px-4 py-3 whitespace-nowrap ${className}`}>
            {children}
        </td>
    );
}

function formatTreatment(treatment) {
    return treatment
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatRate(rate) {
    if (rate === null || rate === undefined) {
        return '-';
    }

    return `${Number(rate).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
    })}%`;
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Taxes',
            href: '/taxes',
        },
    ],
};
