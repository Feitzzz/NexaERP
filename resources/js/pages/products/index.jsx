import { Head, Link, router } from '@inertiajs/react';
import { Boxes, CircleCheck, Package, Pencil, Plus, Power, Search, Trash2, Wrench, X } from 'lucide-react';
import { useState } from 'react';
import { DataPanel, EmptyTable, PageHeader, Pagination, StatCard, StatusPill } from '@/components/page-primitives';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Index({ products, categories, taxCategories, filters, summary }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [categoryId, setCategoryId] = useState(filters.category_id ? String(filters.category_id) : 'all');
    const [taxCategoryId, setTaxCategoryId] = useState(filters.tax_category_id ? String(filters.tax_category_id) : 'all');
    const [itemType, setItemType] = useState(filters.item_type || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const hasFilters = Boolean(filters.search || filters.category_id || filters.tax_category_id || filters.item_type || filters.status);
    const submit = (event) => { event.preventDefault(); router.get('/products', { search, category_id: categoryId === 'all' ? '' : categoryId, tax_category_id: taxCategoryId === 'all' ? '' : taxCategoryId, item_type: itemType === 'all' ? '' : itemType, status: status === 'all' ? '' : status }, { preserveState: true, replace: true }); };
    const clear = () => { setSearch(''); setCategoryId('all'); setTaxCategoryId('all'); setItemType('all'); setStatus('all'); router.get('/products'); };
    const destroy = (product) => confirm(`Delete ${product.name}?`) && router.delete(`/products/${product.id}`, { preserveScroll: true });
    const toggleStatus = (product) => router.patch(`/products/${product.id}/status`, {}, { preserveScroll: true });

    return <><Head title="Products" /><div className="nexa-page">
        <PageHeader title="Products" description="Manage the products and services available to customers."><Button asChild><Link href="/products/create"><Plus />New product</Link></Button></PageHeader>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Catalogue items" value={summary.total.toLocaleString()} detail="Products and services" icon={Boxes} /><StatCard label="Active items" value={summary.active.toLocaleString()} detail="Available for invoicing" icon={CircleCheck} tone="success" /><StatCard label="Services" value={summary.services.toLocaleString()} detail="Non-inventory items" icon={Wrench} /><StatCard label="Low stock" value={summary.low_stock.toLocaleString()} detail={summary.low_stock ? 'Needs attention' : 'Stock levels are healthy'} icon={Package} tone={summary.low_stock ? 'warning' : 'default'} /></div>

        <form onSubmit={submit} className="nexa-card grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_repeat(4,minmax(130px,1fr))_auto]">
            <div className="relative"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or SKU…" /></div>
            <Choice value={categoryId} set={setCategoryId} all="All categories" options={categories} />
            <Select value={itemType} onValueChange={setItemType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All types</SelectItem><SelectItem value="PRODUCT">Products</SelectItem><SelectItem value="SERVICE">Services</SelectItem></SelectContent></Select>
            <Choice value={taxCategoryId} set={setTaxCategoryId} all="All tax categories" options={taxCategories} extra={<SelectItem value="unclassified">Unclassified</SelectItem>} />
            <Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
            <div className="flex gap-1"><Button type="submit" variant="outline">Filter</Button>{hasFilters && <Button type="button" size="icon" variant="ghost" onClick={clear} aria-label="Clear filters"><X /></Button>}</div>
        </form>

        <DataPanel title="Product catalogue" description="Pricing, tax and inventory configuration" count={products.total}><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><Th>Item</Th><Th>Category</Th><Th>Type</Th><Th>Tax</Th><Th>Price</Th><Th>Inventory</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr></thead><tbody>
            {!products.data.length && <EmptyTable colSpan={8} icon={Boxes} title={hasFilters ? 'No matching items' : 'Your catalogue is empty'} description={hasFilters ? 'Adjust the filters to find a different product or service.' : 'Add the first product or service your business sells.'} href={!hasFilters ? '/products/create' : undefined} action="Add product" />}
            {products.data.map((product) => { const low = product.track_inventory && product.reorder_level !== null && Number(product.quantity_on_hand ?? 0) <= Number(product.reorder_level); return <tr key={product.id} className="border-t"><Td><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-lg bg-muted/60"><Package className="size-4 text-muted-foreground" /></span><span><span className="block font-medium text-foreground">{product.name}</span><span className="mt-0.5 block text-xs text-muted-foreground">{product.sku}</span></span></div></Td><Td className="text-muted-foreground">{product.category.name}</Td><Td><span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">{title(product.item_type)}</span></Td><Td><span className="block text-xs font-medium">{product.tax_category?.name ?? 'Unclassified'}</span></Td><Td><span className="font-medium">{money(product.selling_price)}</span><span className="mt-0.5 block text-xs text-muted-foreground">per {product.unit.code}</span></Td><Td>{product.track_inventory ? <><span className={`block font-medium ${low ? 'text-amber-600' : ''}`}>{Number(product.quantity_on_hand ?? 0).toLocaleString()} {product.unit.code}</span><span className="mt-0.5 block text-xs text-muted-foreground">{low ? `Reorder at ${product.reorder_level}` : 'Tracked'}</span></> : <span className="text-xs text-muted-foreground">Not tracked</span>}</Td><Td><StatusPill status={product.is_active ? 'Active' : 'Inactive'} /></Td><Td><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" asChild><Link href={`/products/${product.id}/edit`} aria-label="Edit product"><Pencil /></Link></Button><Button variant="ghost" size="icon" onClick={() => toggleStatus(product)} aria-label="Toggle product status"><Power /></Button><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => destroy(product)} aria-label="Delete product"><Trash2 /></Button></div></Td></tr>; })}
        </tbody></table></div></DataPanel>
        <Pagination links={products.links} from={products.from} to={products.to} total={products.total} />
    </div></>;
}

function Choice({ value, set, all, options, extra = null }) { return <Select value={value} onValueChange={set}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{all}</SelectItem>{options.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}{extra}</SelectContent></Select>; }
function Th({ children, className = '' }) { return <th className={`px-5 py-3 font-medium whitespace-nowrap ${className}`}>{children}</th>; }
function Td({ children, className = '' }) { return <td className={`px-5 py-3.5 align-middle ${className}`}>{children}</td>; }
function title(value) { return value.charAt(0) + value.slice(1).toLowerCase(); }
function money(value) { return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(Number(value)); }
Index.layout = { breadcrumbs: [{ title: 'Products', href: '/products' }] };
