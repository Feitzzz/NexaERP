import { Head } from '@inertiajs/react';
import BusinessForm from '@/components/business/business-form';
import Heading from '@/components/heading';

export default function Edit({ business }) {
    return (
        <>
            <Head title="Edit Business" />

            <div className="mx-auto max-w-5xl space-y-6 p-4">
                <Heading
                    title="Edit Business"
                    description="Update your company profile and address."
                />

                <div className="rounded-lg border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    <BusinessForm business={business} />
                </div>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        {
            title: 'Business',
            href: '/business',
        },
        {
            title: 'Edit',
            href: '/business/edit',
        },
    ],
};
