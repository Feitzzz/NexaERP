import { Head } from '@inertiajs/react';
import BusinessForm from '@/components/business/business-form';
import Heading from '@/components/heading';

export default function Edit({ business }) {
    return (
        <>
            <Head title="Edit Business" />

            <div className="nexa-page max-w-5xl">
                <Heading
                    title="Edit Business"
                    description="Update your company profile and address."
                />

                <div className="nexa-card p-6 md:p-8">
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
