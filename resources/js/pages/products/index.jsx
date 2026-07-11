import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Power, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function Index({
    products,
    categories,
    taxCategories,
    filters,
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [categoryId, setCategoryId] = useState(
        filters.category_id ? String(filters.category_id) : 'all',
    );
    const [taxCategoryId, setTaxCategoryId] = useState(
        filters.tax_category_id ? String(filters.tax_category_id) : 'all',
    );
    const [itemType, setItemType] = useState(filters.item_type || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    function submit(event) {
        event.preventDefault();

        router.get(
            '/products',
            {
                search,
                category_id: categoryId === 'all' ? '' : categoryId,
                tax_category_id: taxCategoryId === 'all' ? '' : taxCategoryId,
                item_type: itemType === 'all' ? '' : itemType,
                status: status === 'all' ? '' : status,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    }

    function destroy(product) {
        if (confirm(`Delete ${product.name}?`)) {
            router.delete(`/products/${product.id}`, {
                preserveScroll: true,
            });
        }
    }

    function toggleStatus(product) {
        router.patch(
            `/products/${product.id}/status`,
            {},
            {
                preserveScroll: true,
            },
        );
    }

    return (
        <>
            <Head title="Products" />

            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Products"
                        description="Manage products and services."
                    />

                    <Button asChild>
                        <Link href="/products/create">
                            <Plus />
                            New Product
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="grid gap-3 lg:grid-cols-6">
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search name or SKU"
                    />

                    <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={String(category.id)}
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={itemType} onValueChange={setItemType}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="PRODUCT">Product</SelectItem>
                            <SelectItem value="SERVICE">Service</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={taxCategoryId}
                        onValueChange={setTaxCategoryId}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                All Tax Categories
                            </SelectItem>
                            {taxCategories.map((taxCategory) => (
                                <SelectItem
                                    key={taxCategory.id}
                                    value={String(taxCategory.id)}
                                >
                                    {taxCategory.name}
                                </SelectItem>
                            ))}
                            <SelectItem value="unclassified">
                                Unclassified
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button type="submit" variant="outline">
                        <Search />
                        Search
                    </Button>
                </form>

                <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/40 text-xs text-muted-foreground uppercase">
                                <tr>
                                    <Th>SKU</Th>
                                    <Th>Name</Th>
                                    <Th>Category</Th>
                                    <Th>Type</Th>
                                    <Th>Tax Category</Th>
                                    <Th>Unit</Th>
                                    <Th>Selling Price</Th>
                                    <Th>Status</Th>
                                    <Th>Actions</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="px-4 py-8 text-center text-muted-foreground"
                                        >
                                            No products found.
                                        </td>
                                    </tr>
                                )}

                                {products.data.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="border-b last:border-b-0"
                                    >
                                        <Td className="font-medium">
                                            {product.sku}
                                        </Td>
                                        <Td>{product.name}</Td>
                                        <Td>{product.category.name}</Td>
                                        <Td>{formatType(product.item_type)}</Td>
                                        <Td>
                                            {product.tax_category?.name ??
                                                'Unclassified'}
                                        </Td>
                                        <Td>{product.unit.code}</Td>
                                        <Td>
                                            {formatMoney(product.selling_price)}
                                        </Td>
                                        <Td>
                                            <Badge
                                                variant={
                                                    product.is_active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {product.is_active
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
                                                        href={`/products/${product.id}/edit`}
                                                        aria-label="Edit product"
                                                    >
                                                        <Pencil />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        toggleStatus(product)
                                                    }
                                                    aria-label={
                                                        product.is_active
                                                            ? 'Deactivate product'
                                                            : 'Activate product'
                                                    }
                                                >
                                                    <Power />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        destroy(product)
                                                    }
                                                    aria-label="Delete product"
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

                <Pagination links={products.links} />
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

function formatType(type) {
    return type.charAt(0) + type.slice(1).toLowerCase();
}

function formatMoney(value) {
    return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    });
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: '/products',
        },
    ],
};
