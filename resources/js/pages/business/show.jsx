import { Head, Link } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';

export default function Show({ business }) {
    const address = business.address;

    return (
        <>
            <Head title="Business Profile" />

            <div className="mx-auto max-w-5xl space-y-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title={business.name}
                        description="Business profile and registered address"
                    />

                    <Button asChild>
                        <Link href="/business/edit">
                            <Pencil />
                            Edit
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <section className="rounded-lg border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <h2 className="mb-4 text-base font-semibold">
                            Business Details
                        </h2>
                        <Description
                            label="Business Name"
                            value={business.name}
                        />
                        <Description label="TIN" value={business.tin} />
                        <Description label="Email" value={business.email} />
                        <Description label="Phone" value={business.phone} />
                        <Description
                            label="Business Description"
                            value={business.business_description}
                        />
                        <Description
                            label="Currency"
                            value={business.currency}
                        />
                    </section>

                    <section className="rounded-lg border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <h2 className="mb-4 text-base font-semibold">
                            Address
                        </h2>
                        <Description label="Street" value={address?.street} />
                        <Description label="City" value={address?.city} />
                        <Description label="LGA" value={address?.lga} />
                        <Description label="State" value={address?.state} />
                        <Description
                            label="Postal Code"
                            value={address?.postal_code}
                        />
                        <Description label="Country" value={address?.country} />
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

Show.layout = {
    breadcrumbs: [
        {
            title: 'Business',
            href: '/business',
        },
    ],
};
