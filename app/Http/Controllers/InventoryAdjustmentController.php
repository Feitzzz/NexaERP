<?php

namespace App\Http\Controllers;

use App\Http\Requests\PostInventoryAdjustmentRequest;
use App\Http\Requests\StoreInventoryAdjustmentRequest;
use App\Http\Requests\UpdateInventoryAdjustmentRequest;
use App\Models\InventoryAdjustment;
use App\Models\Product;
use App\Models\User;
use App\Services\Inventory\InventoryAdjustmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryAdjustmentController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', InventoryAdjustment::class);

        return Inertia::render('inventory-adjustments/index', [
            'adjustments' => $request->user()->inventoryAdjustments()
                ->with('warehouse')->latest()->paginate(25),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', InventoryAdjustment::class);

        return Inertia::render('inventory-adjustments/create', $this->options($request));
    }

    public function store(StoreInventoryAdjustmentRequest $request, InventoryAdjustmentService $service): RedirectResponse
    {
        $this->authorize('create', InventoryAdjustment::class);

        /** @var User $user */
        $user = $request->user();
        $adjustment = $service->store($user, $request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Stock adjustment created.']);

        return redirect()->route('inventory-adjustments.show', $adjustment);
    }

    public function show(Request $request, InventoryAdjustment $inventoryAdjustment): Response
    {
        $this->authorize('view', $inventoryAdjustment);

        $adjustment = $inventoryAdjustment->load(['warehouse', 'lines.product']);
        $lineIds = $adjustment->lines->pluck('id');

        return Inertia::render('inventory-adjustments/show', [
            'adjustment' => $adjustment,
            'movements' => $request->user()->stockMovements()
                ->where('reference_type', 'App\\Models\\InventoryAdjustmentLine')
                ->whereIn('reference_id', $lineIds)->latest('occurred_at')->get(),
        ]);
    }

    public function edit(Request $request, InventoryAdjustment $inventoryAdjustment): Response
    {
        $this->authorize('update', $inventoryAdjustment);

        $adjustment = $inventoryAdjustment->load('lines');

        return Inertia::render('inventory-adjustments/edit', [
            'adjustment' => $adjustment,
            ...$this->options($request),
        ]);
    }

    public function update(
        UpdateInventoryAdjustmentRequest $request,
        InventoryAdjustment $inventoryAdjustment,
        InventoryAdjustmentService $service
    ): RedirectResponse {
        $this->authorize('update', $inventoryAdjustment);

        /** @var User $user */
        $user = $request->user();
        $adjustment = $service->update($user, $inventoryAdjustment, $request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Stock adjustment updated.']);

        return redirect()->route('inventory-adjustments.show', $adjustment);
    }

    public function destroy(Request $request, InventoryAdjustment $inventoryAdjustment, InventoryAdjustmentService $service): RedirectResponse
    {
        $this->authorize('delete', $inventoryAdjustment);

        /** @var User $user */
        $user = $request->user();
        $service->delete($user, $inventoryAdjustment);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Stock adjustment deleted.']);

        return redirect()->route('inventory-adjustments.index');
    }

    public function post(
        PostInventoryAdjustmentRequest $request,
        InventoryAdjustment $inventoryAdjustment,
        InventoryAdjustmentService $service
    ): RedirectResponse {
        $this->authorize('post', $inventoryAdjustment);

        /** @var User $user */
        $user = $request->user();
        $adjustment = $service->post($user, $inventoryAdjustment);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Stock adjustment posted.']);

        return redirect()->route('inventory-adjustments.show', $adjustment);
    }

    /** @return array<string, mixed> */
    private function options(Request $request): array
    {
        return [
            'warehouses' => $request->user()->warehouses()->where('is_active', true)
                ->orderByDesc('is_default')->orderBy('name')->get(['id', 'code', 'name', 'is_default']),
            'products' => $request->user()->products()->where('item_type', Product::TYPE_PRODUCT)
                ->where('track_inventory', true)->where('is_active', true)
                ->orderBy('name')->get(['id', 'sku', 'name']),
            'reasons' => InventoryAdjustment::REASONS,
        ];
    }
}
