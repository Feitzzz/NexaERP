import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, ArrowRightLeft, Boxes, CircleDollarSign, History, PackageSearch, Search, SlidersHorizontal, Warehouse, X } from 'lucide-react';
import { useState } from 'react';
import { DataPanel, EmptyTable, PageHeader, Pagination, StatCard, StatusPill } from '@/components/page-primitives';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Index({ balances, warehouses, filters, summary }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [warehouse, setWarehouse] = useState(filters.warehouseId || 'all');
    const [lowStock, setLowStock] = useState(filters.lowStock ?? false);
    const hasFilters = Boolean(filters.search || filters.warehouseId || filters.lowStock);
    const submit = (event) => { event.preventDefault(); router.get('/inventory', { search, warehouse_id: warehouse === 'all' ? '' : warehouse, low_stock: lowStock ? 1 : 0 }, { preserveState: true, replace: true }); };
    const clear = () => { setSearch(''); setWarehouse('all'); setLowStock(false); router.get('/inventory'); };

    return <><Head title="Inventory" /><div className="nexa-page">
        <PageHeader title="Inventory" description="Monitor warehouse stock, reorder exposure and inventory value."><Button variant="outline" asChild><Link href="/inventory/movements"><ArrowRightLeft />Stock movements</Link></Button><Button asChild><Link href="/inventory-adjustments/create"><SlidersHorizontal />Adjust stock</Link></Button></PageHeader>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Tracked products" value={summary.tracked_products.toLocaleString()} detail="Inventory-enabled items" icon={PackageSearch} /><StatCard label="Quantity on hand" value={Number(summary.quantity_on_hand).toLocaleString()} detail="Across all warehouses" icon={Boxes} /><StatCard label="Stock value" value={money(summary.stock_value)} detail="Based on recorded cost" icon={CircleDollarSign} /><StatCard label="Low stock" value={summary.low_stock.toLocaleString()} detail={summary.low_stock ? 'Requires attention' : 'All levels are healthy'} icon={AlertTriangle} tone={summary.low_stock ? 'warning' : 'success'} /></div>

        <form onSubmit={submit} className="nexa-card flex flex-col gap-3 p-3 lg:flex-row lg:items-center"><div className="relative max-w-xl flex-1"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search product or SKU…" value={search} onChange={(event) => setSearch(event.target.value)} /></div><Select value={warehouse} onValueChange={setWarehouse}><SelectTrigger className="lg:w-56"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All warehouses</SelectItem>{warehouses.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.code} · {item.name}</SelectItem>)}</SelectContent></Select><label className="flex h-9 items-center gap-2 rounded-lg border px-3 text-sm"><Checkbox checked={lowStock} onCheckedChange={(value) => setLowStock(value === true)} />Low stock only</label>{hasFilters && <Button type="button" variant="ghost" onClick={clear}><X />Clear</Button>}<Button variant="outline">Apply filters</Button></form>

        <DataPanel title="Inventory balances" description="Current quantities by product and warehouse" count={balances.total}><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><Th>Product</Th><Th>Warehouse</Th><Th>On hand</Th><Th>Reorder level</Th><Th>Stock status</Th><Th>Last updated</Th><Th className="text-right">Actions</Th></tr></thead><tbody>
            {!balances.data.length && <EmptyTable colSpan={7} icon={PackageSearch} title={hasFilters ? 'No matching inventory' : 'No inventory balances yet'} description={hasFilters ? 'Adjust the warehouse, stock or search filters.' : 'Use an opening-stock adjustment to introduce inventory.'} href={!hasFilters ? '/inventory-adjustments/create' : undefined} action="Create stock adjustment" />}
            {balances.data.flatMap((product) => { const productBalances = product.inventory_balances.length ? product.inventory_balances : [null]; const status = stockStatus(product); return productBalances.map((balance) => <tr key={balance?.id ?? `product-${product.id}`} className="border-t"><Td><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-lg bg-muted/60"><Boxes className="size-4 text-muted-foreground" /></span><span><span className="block font-medium text-foreground">{product.name}</span><span className="mt-0.5 block text-xs text-muted-foreground">{product.sku}</span></span></div></Td><Td>{balance ? <span className="inline-flex items-center gap-1.5"><Warehouse className="size-3.5 text-muted-foreground" />{balance.warehouse.name}</span> : <span className="text-muted-foreground">No stock introduced</span>}</Td><Td><span className="font-semibold">{Number(balance?.quantity_on_hand ?? 0).toLocaleString()}</span> <span className="text-xs text-muted-foreground">{product.unit.code}</span></Td><Td className="text-muted-foreground">{product.reorder_level ?? '—'}</Td><Td><StatusPill status={status} /></Td><Td className="text-xs text-muted-foreground">{balance ? dateTime(balance.updated_at) : '—'}</Td><Td><div className="flex justify-end"><Button size="sm" variant="ghost" asChild><Link href={`/inventory/products/${product.id}`}><History />History</Link></Button></div></Td></tr>); })}
        </tbody></table></div></DataPanel>
        <Pagination links={balances.links} from={balances.from} to={balances.to} total={balances.total} />
    </div></>;
}

function stockStatus(product) { const quantity = Number(product.total_quantity_on_hand ?? 0); if (quantity <= 0) return 'Out of stock'; if (product.reorder_level !== null && quantity <= Number(product.reorder_level)) return 'Low stock'; return 'In stock'; }
function Th({ children, className = '' }) { return <th className={`px-5 py-3 font-medium whitespace-nowrap ${className}`}>{children}</th>; }
function Td({ children, className = '' }) { return <td className={`px-5 py-3.5 align-middle ${className}`}>{children}</td>; }
function dateTime(value) { return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
function money(value) { return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(Number(value)); }
