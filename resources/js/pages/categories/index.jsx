import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Power, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Index({ categories, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const errors = usePage().props.errors ?? {};

    function submit(event) {
        event.preventDefault();

        router.get(
            '/categories',
            { search },
            {
                preserveState: true,
                replace: true,
            },
        );
    }

    function destroy(category) {
        if (confirm(`Delete ${category.name}?`)) {
            router.delete(`/categories/${category.id}`, {
                preserveScroll: true,
            });
        }
    }

    function toggleStatus(category) {
        router.patch(
            `/categories/${category.id}/status`,
            {},
            {
                preserveScroll: true,
            },
        );
    }

    return (
        <>
            <Head title="Categories" />

            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Categories"
                        description="Manage product and service categories."
                    />

                    <Button asChild>
                        <Link href="/categories/create">
                            <Plus />
                            New Category
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="flex max-w-lg gap-2">
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search categories"
                    />
                    <Button type="submit" variant="outline">
                        <Search />
                        Search
                    </Button>
                </form>

                <InputError message={errors.category} />

                <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/40 text-xs text-muted-foreground uppercase">
                                <tr>
                                    <Th>Name</Th>
                                    <Th>Description</Th>
                                    <Th>Products</Th>
                                    <Th>Status</Th>
                                    <Th>Actions</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-4 py-8 text-center text-muted-foreground"
                                        >
                                            No categories found.
                                        </td>
                                    </tr>
                                )}

                                {categories.data.map((category) => (
                                    <tr
                                        key={category.id}
                                        className="border-b last:border-b-0"
                                    >
                                        <Td className="font-medium">
                                            {category.name}
                                        </Td>
                                        <Td>
                                            {category.description ||
                                                'Not provided'}
                                        </Td>
                                        <Td>{category.products_count}</Td>
                                        <Td>
                                            <Badge
                                                variant={
                                                    category.is_active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {category.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/categories/${category.id}/edit`}
                                                        aria-label="Edit category"
                                                    >
                                                        <Pencil />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        toggleStatus(category)
                                                    }
                                                    aria-label={
                                                        category.is_active
                                                            ? 'Deactivate category'
                                                            : 'Activate category'
                                                    }
                                                >
                                                    <Power />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        destroy(category)
                                                    }
                                                    aria-label="Delete category"
                                                >
                                                    <Trash2 />
                                                </Button>
                                            </div>
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Pagination links={categories.links} />
            </div>
        </>
    );
}

function Pagination({ links }) {
    return (
        <div className="flex flex-wrap gap-2">
            {links.map((link, index) => (
                <Button
                    key={`${link.label}-${index}`}
                    variant={link.active ? 'default' : 'outline'}
                    size="sm"
                    disabled={!link.url}
                    asChild={Boolean(link.url)}
                >
                    {link.url ? (
                        <Link
                            href={link.url}
                            preserveScroll
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    )}
                </Button>
            ))}
        </div>
    );
}

function Th({ children }) {
    return (
        <th className="px-4 py-3 font-medium whitespace-nowrap">{children}</th>
    );
}

function Td({ children, className = '' }) {
    return (
        <td className={`px-4 py-3 whitespace-nowrap ${className}`}>
            {children}
        </td>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: '/categories',
        },
    ],
};
