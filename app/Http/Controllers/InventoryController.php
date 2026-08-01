<?php

namespace App\Http\Controllers;

use App\Models\InventoryBalance;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Product::class);
        $this->authorize('viewAny', InventoryBalance::class);

        $search = $request->string('search')->toString();
        $warehouseId = $request->string('warehouse_id')->toString();
        $lowStock = $request->boolean('low_stock');

        $inventoryProducts = $request->user()->products()
            ->where('track_inventory', true)
            ->withSum('inventoryBalances as total_quantity_on_hand', 'quantity_on_hand')
            ->get();

        $balances = $request->user()->products()
            ->with([
                'unit',
                'inventoryBalances' => fn ($query) => $query->with('warehouse')
                    ->when($warehouseId !== '', fn ($query) => $query->where('warehouse_id', $warehouseId)),
            ])
            ->withSum('inventoryBalances as total_quantity_on_hand', 'quantity_on_hand')
            ->where('track_inventory', true)
            ->when($search !== '', fn ($query) => $query->where(
                fn ($query) => $query->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
            ))
            ->when($warehouseId !== '', fn ($query) => $query->whereHas(
                'inventoryBalances',
                fn ($query) => $query->where('warehouse_id', $warehouseId)
            ))
            ->when($lowStock, fn ($query) => $query->whereNotNull('reorder_level')
                ->whereRaw('(SELECT COALESCE(SUM(ib.quantity_on_hand), 0) FROM inventory_balances ib WHERE ib.product_id = products.id) <= products.reorder_level'))
            ->latest('products.updated_at')->paginate(25)->withQueryString();

        return Inertia::render('inventory/index', [
            'balances' => $balances,
            'warehouses' => $request->user()->warehouses()->orderBy('name')->get(['id', 'code', 'name']),
            'filters' => compact('search', 'warehouseId', 'lowStock'),
            'summary' => [
                'tracked_products' => $inventoryProducts->count(),
                'quantity_on_hand' => (float) $inventoryProducts->sum(fn ($product) => (float) ($product->total_quantity_on_hand ?? 0)),
                'stock_value' => (float) $inventoryProducts->sum(fn ($product) => (float) ($product->total_quantity_on_hand ?? 0) * (float) ($product->cost_price ?? 0)),
                'low_stock' => $inventoryProducts->filter(fn ($product) => $product->reorder_level !== null
                    && (float) ($product->total_quantity_on_hand ?? 0) <= (float) $product->reorder_level)->count(),
            ],
        ]);
    }

    public function product(Request $request, Product $product): Response
    {
        $this->authorize('view', $product);
        $this->authorize('viewAny', InventoryBalance::class);
        $this->authorize('viewAny', StockMovement::class);
        $product->load(['unit', 'inventoryBalances.warehouse']);

        return Inertia::render('inventory/product-show', [
            'product' => $product,
            'totalQuantity' => (string) $product->inventoryBalances->sum('quantity_on_hand'),
            'movements' => $request->user()->stockMovements()->where('product_id', $product->id)
                ->with('warehouse')->latest('occurred_at')->paginate(25),
        ]);
    }

    public function movements(Request $request): Response
    {
        $this->authorize('viewAny', StockMovement::class);

        $productId = $request->string('product_id')->toString();
        $warehouseId = $request->string('warehouse_id')->toString();
        $movementType = $request->string('movement_type')->toString();
        $dateFrom = $request->string('date_from')->toString();
        $dateTo = $request->string('date_to')->toString();

        $movements = $request->user()->stockMovements()->with(['product', 'warehouse'])
            ->when($productId !== '', fn ($query) => $query->where('product_id', $productId))
            ->when($warehouseId !== '', fn ($query) => $query->where('warehouse_id', $warehouseId))
            ->when($movementType !== '', fn ($query) => $query->where('movement_type', $movementType))
            ->when($dateFrom !== '', fn ($query) => $query->whereDate('occurred_at', '>=', $dateFrom))
            ->when($dateTo !== '', fn ($query) => $query->whereDate('occurred_at', '<=', $dateTo))
            ->latest('occurred_at')->paginate(50)->withQueryString();

        return Inertia::render('inventory/movements', [
            'movements' => $movements,
            'products' => $request->user()->products()->where('track_inventory', true)->orderBy('name')->get(['id', 'sku', 'name']),
            'warehouses' => $request->user()->warehouses()->orderBy('name')->get(['id', 'code', 'name']),
            'filters' => compact('productId', 'warehouseId', 'movementType', 'dateFrom', 'dateTo'),
        ]);
    }
}
