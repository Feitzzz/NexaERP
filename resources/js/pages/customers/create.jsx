import { Head } from '@inertiajs/react';
import CustomerForm from '@/components/customer/customer-form';
import Heading from '@/components/heading';

export default function Create() {
    return (
        <>
            <Head title="Create Customer" />

            <div className="nexa-page max-w-5xl">
                <Heading
                    title="Create Customer"
                    description="Add a customer profile and address."
                />

                <div className="nexa-card p-6 md:p-8">
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
