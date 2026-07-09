import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import ProductForm from '@/components/product/product-form';

export default function Edit({ product, categories, units }) {
    return (
        <>
            <Head title="Edit Product" />

            <div className="mx-auto max-w-5xl space-y-6 p-4">
                <Heading
                    title="Edit Product"
                    description="Update product or service details."
                />

                <div className="rounded-lg border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    <ProductForm
                        product={product}
                        categories={categories}
                        units={units}
                    />
                </div>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: '/products',
        },
        {
            title: 'Edit',
            href: '#',
        },
    ],
};
