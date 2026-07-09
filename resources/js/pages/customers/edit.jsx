import { Head } from '@inertiajs/react';
import CustomerForm from '@/components/customer/customer-form';
import Heading from '@/components/heading';

export default function Edit({ customer }) {
    return (
        <>
            <Head title="Edit Customer" />

            <div className="mx-auto max-w-5xl space-y-6 p-4">
                <Heading
                    title="Edit Customer"
                    description="Update customer details and address."
                />

                <div className="rounded-lg border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    <CustomerForm customer={customer} />
                </div>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        {
            title: 'Customers',
            href: '/customers',
        },
        {
            title: 'Edit',
            href: '#',
        },
    ],
};
