import { Head } from '@inertiajs/react';
import CustomerForm from '@/components/customer/customer-form';
import Heading from '@/components/heading';

export default function Edit({ customer }) {
    return (
        <>
            <Head title="Edit Customer" />

            <div className="nexa-page max-w-5xl">
                <Heading
                    title="Edit Customer"
                    description="Update customer details and address."
                />

                <div className="nexa-card p-6 md:p-8">
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
