import { Head } from '@inertiajs/react';
import CategoryForm from '@/components/category/category-form';
import Heading from '@/components/heading';

export default function Edit({ category }) {
    return (
        <>
            <Head title="Edit Category" />

            <div className="mx-auto max-w-3xl space-y-6 p-4">
                <Heading
                    title="Edit Category"
                    description="Update catalog category details."
                />

                <div className="rounded-lg border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    <CategoryForm category={category} />
                </div>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: '/categories',
        },
        {
            title: 'Edit',
            href: '#',
        },
    ],
};
