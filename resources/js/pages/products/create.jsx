import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import ProductForm from '@/components/product/product-form';

export default function Create({ categories, units, taxCategories }) {
    return (
        <>
            <Head title="Create Product" />

            <div className="mx-auto max-w-5xl space-y-6 p-4">
                <Heading
                    title="Create Product"
                    description="Add a product or service to the catalog."
                />

                <div className="rounded-lg border border-sidebar-border/70 p-6 dark:border-sidebar-border">
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
