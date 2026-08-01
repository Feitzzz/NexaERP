import { Head } from '@inertiajs/react';
import CategoryForm from '@/components/category/category-form';
import Heading from '@/components/heading';

export default function Create() {
    return (
        <>
            <Head title="Create Category" />

            <div className="nexa-page max-w-3xl">
                <Heading
                    title="Create Category"
                    description="Add a catalog category."
                />

                <div className="rounded-lg border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    <CategoryForm />
                </div>
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: '/categories',
        },
        {
            title: 'Create',
            href: '/categories/create',
        },
    ],
};
