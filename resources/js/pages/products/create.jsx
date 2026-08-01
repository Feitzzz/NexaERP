import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import ProductForm from '@/components/product/product-form';

export default function Create({ categories, units, taxCategories }) {
    return (
        <>
            <Head title="Create Product" />

            <div className="nexa-page max-w-5xl">
                <Heading
                    title="Create Product"
                    description="Add a product or service to the catalog."
                />

                <div className="nexa-card p-6 md:p-8">
                    <ProductForm
                        categories={categories}
                        units={units}
                        taxCategories={taxCategories}
                    />
                </div>
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: '/products',
        },
        {
            title: 'Create',
            href: '/products/create',
        },
    ],
};
