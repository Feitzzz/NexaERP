import { Head } from '@inertiajs/react';
import CustomerForm from '@/components/customer/customer-form';
import Heading from '@/components/heading';

export default function Create() {
    return (
        <>
            <Head title="Create Customer" />

            <div className="mx-auto max-w-5xl space-y-6 p-4">
                <Heading
                    title="Create Customer"
                    description="Add a customer profile and address."
                />

                <div className="rounded-lg border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    <CustomerForm />
                </div>
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        {
            title: 'Customers',
            href: '/customers',
        },
        {
            title: 'Create',
            href: '/customers/create',
        },
    ],
};
