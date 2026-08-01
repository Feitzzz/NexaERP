import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import ProductForm from '@/components/product/product-form';

export default function Edit({ product, categories, units, taxCategories }) {
    return (
        <>
            <Head title="Edit Product" />

            <div className="nexa-page max-w-5xl">
                <Heading
                    title="Edit Product"
                    description="Update product or service details."
                />

                <div className="nexa-card p-6 md:p-8">
                    <ProductForm
                        product={product}
                        categories={categories}
                        units={units}
                        taxCategories={taxCategories}
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
