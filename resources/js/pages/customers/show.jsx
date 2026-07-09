import { Head, Link } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Show({ customer }) {
    return (
        <>
            <Head title={customer.name} />

            <div className="mx-auto max-w-5xl space-y-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title={customer.name}
                        description={`${customer.customer_code} customer profile`}
                    />

                    <Button asChild>
                        <Link href={`/customers/${customer.id}/edit`}>
                            <Pencil />
                            Edit
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <section className="rounded-lg border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="text-base font-semibold">
                                Customer Details
                            </h2>
                            <Badge
                                variant={
                                    customer.is_active ? 'default' : 'secondary'
                                }
                            >
                                {customer.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <Description
                            label="Customer Code"
                            value={customer.customer_code}
                        />
                        <Description
                            label="Customer Type"
                            value={formatType(customer.customer_type)}
                        />
                        <Description label="TIN" value={customer.tin} />
                        <Description label="Email" value={customer.email} />
                        <Description label="Phone" value={customer.phone} />
                        <Description
                            label="Business Description"
                            value={customer.business_description}
                        />
                    </section>

                    <section className="rounded-lg border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <h2 className="mb-4 text-base font-semibold">
                            Address
                        </h2>
                        <Description label="Street" value={customer.street} />
                        <Description label="City" value={customer.city} />
                        <Description label="LGA" value={customer.lga} />
                        <Description label="State" value={customer.state} />
                        <Description
                            label="Postal Code"
                            value={customer.postal_code}
                        />
                        <Description label="Country" value={customer.country} />
                    </section>
                </div>
            </div>
        </>
    );
}

function Description({ label, value }) {
    return (
        <div className="border-t border-sidebar-border/70 py-3 first:border-t-0 first:pt-0 dark:border-sidebar-border">
            <dt className="text-sm font-medium text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-1 text-sm">{value || 'Not provided'}</dd>
        </div>
    );
}

function formatType(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
}

Show.layout = {
    breadcrumbs: [
        {
            title: 'Customers',
            href: '/customers',
        },
        {
            title: 'Show',
            href: '#',
        },
    ],
};
