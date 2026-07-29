<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();
        $warehouseId = $request->string('warehouse_id')->toString();
        $lowStock = $request->boolean('low_stock');

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
        ]);
    }

    public function product(Request $request, int $product): Response
    {
        $product = $request->user()->products()->whereKey($product)
            ->with(['unit', 'inventoryBalances.warehouse'])->firstOrFail();

        return Inertia::render('inventory/product-show', [
            'product' => $product,
            'totalQuantity' => (string) $product->inventoryBalances->sum('quantity_on_hand'),
            'movements' => $request->user()->stockMovements()->where('product_id', $product->id)
                ->with('warehouse')->latest('occurred_at')->paginate(25),
        ]);
    }

    public function movements(Request $request): Response
    {
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
