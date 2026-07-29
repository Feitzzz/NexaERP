<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWarehouseRequest;
use App\Http\Requests\UpdateWarehouseRequest;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Warehouse::class);

        return Inertia::render('warehouses/index', [
            'warehouses' => $request->user()->warehouses()->latest()->paginate(25),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Warehouse::class);

        return Inertia::render('warehouses/create');
    }

    public function store(StoreWarehouseRequest $request): RedirectResponse
    {
        $this->authorize('create', Warehouse::class);

        /** @var User $user */
        $user = $request->user();
        DB::transaction(function () use ($user, $request): void {
            User::query()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            $data = $request->validated();
            $makeDefault = ($data['is_default'] ?? false) || ! $user->warehouses()->exists();
            if ($makeDefault) {
                $user->warehouses()->update(['is_default' => false]);
            }
            $user->warehouses()->create([...$data, 'is_default' => $makeDefault]);
        });
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Warehouse created.']);

        return redirect()->route('warehouses.index');
    }

    public function edit(Warehouse $warehouse): Response
    {
        $this->authorize('update', $warehouse);

        return Inertia::render('warehouses/edit', ['warehouse' => $warehouse]);
    }

    public function update(UpdateWarehouseRequest $request, Warehouse $warehouse): RedirectResponse
    {
        $this->authorize('update', $warehouse);

        DB::transaction(function () use ($request, $warehouse): void {
            User::query()->whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $data = $request->validated();
            if ($data['is_default'] ?? false) {
                $request->user()->warehouses()->whereKeyNot($warehouse->id)->update(['is_default' => false]);
            }
            $warehouse->update($data);
        });
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Warehouse updated.']);

        return redirect()->route('warehouses.index');
    }

    public function destroy(Warehouse $warehouse): RedirectResponse
    {
        $this->authorize('delete', $warehouse);

        if ($warehouse->inventoryBalances()->exists() || $warehouse->stockMovements()->exists()
            || $warehouse->inventoryAdjustments()->exists() || $warehouse->invoices()->exists()) {
            throw ValidationException::withMessages(['warehouse' => 'This warehouse has operational history and cannot be deleted. Deactivate it instead.']);
        }
        $warehouse->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Warehouse deleted.']);

        return redirect()->route('warehouses.index');
    }

    public function default(Request $request, Warehouse $warehouse): RedirectResponse
    {
        $this->authorize('makeDefault', $warehouse);

        DB::transaction(function () use ($request, $warehouse): void {
            User::query()->whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $request->user()->warehouses()->update(['is_default' => false]);
            $warehouse->update(['is_default' => true]);
        });
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Default warehouse updated.']);

        return back();
    }

    public function status(Warehouse $warehouse): RedirectResponse
    {
        $this->authorize('changeStatus', $warehouse);

        $warehouse->update(['is_active' => ! $warehouse->is_active]);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Warehouse status updated.']);

        return back();
    }
}
