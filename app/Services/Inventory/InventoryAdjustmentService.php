<?php

namespace App\Services\Inventory;

use App\Models\InventoryAdjustment;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryAdjustmentService
{
    public function __construct(private readonly InventoryService $inventoryService) {}

    /** @param array<string, mixed> $data */
    public function store(User $user, array $data): InventoryAdjustment
    {
        return DB::transaction(function () use ($user, $data): InventoryAdjustment {
            User::query()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            $warehouse = $this->warehouse($user, (int) $data['warehouse_id']);
            $next = (int) $user->inventoryAdjustments()->max('id') + 1;
            $adjustment = InventoryAdjustment::create([
                'user_id' => $user->id,
                'warehouse_id' => $warehouse->id,
                'adjustment_number' => 'ADJ-'.str_pad((string) $next, 6, '0', STR_PAD_LEFT),
                'status' => InventoryAdjustment::DRAFT,
                'reason' => $data['reason'],
                'notes' => $data['notes'] ?? null,
            ]);
            $this->replaceLines($user, $adjustment, $data['lines']);

            return $adjustment->load(['warehouse', 'lines.product']);
        });
    }

    /** @param array<string, mixed> $data */
    public function update(User $user, InventoryAdjustment $adjustment, array $data): InventoryAdjustment
    {
        return DB::transaction(function () use ($user, $adjustment, $data): InventoryAdjustment {
            $adjustment = $this->locked($user, $adjustment);
            $this->ensureDraft($adjustment);
            $warehouse = $this->warehouse($user, (int) $data['warehouse_id']);
            $adjustment->update([
                'warehouse_id' => $warehouse->id,
                'reason' => $data['reason'],
                'notes' => $data['notes'] ?? null,
            ]);
            $adjustment->lines()->delete();
            $this->replaceLines($user, $adjustment, $data['lines']);

            return $adjustment->refresh()->load(['warehouse', 'lines.product']);
        });
    }

    public function delete(User $user, InventoryAdjustment $adjustment): void
    {
        DB::transaction(function () use ($user, $adjustment): void {
            $adjustment = $this->locked($user, $adjustment);
            $this->ensureDraft($adjustment);
            $adjustment->delete();
        });
    }

    public function post(User $user, InventoryAdjustment $adjustment): InventoryAdjustment
    {
        return DB::transaction(function () use ($user, $adjustment): InventoryAdjustment {
            $adjustment = $this->locked($user, $adjustment);
            $this->ensureDraft($adjustment);
            $adjustment->load(['warehouse', 'lines.product']);

            if (! $adjustment->warehouse->is_active) {
                throw ValidationException::withMessages(['warehouse_id' => 'Inactive warehouses cannot be used for stock posting.']);
            }

            foreach ($adjustment->lines as $line) {
                $delta = (string) $line->quantity_delta;
                if (bccomp($delta, '0', 4) > 0) {
                    $movementType = $adjustment->reason === 'OPENING_STOCK'
                        ? StockMovement::OPENING_BALANCE : StockMovement::ADJUSTMENT_IN;
                    $this->inventoryService->increase(
                        $user, $adjustment->warehouse, $line->product, $delta,
                        $movementType, $line, $line->unit_cost === null ? null : (string) $line->unit_cost, $line->notes
                    );
                } else {
                    $this->inventoryService->decrease(
                        $user, $adjustment->warehouse, $line->product, ltrim($delta, '-'),
                        StockMovement::ADJUSTMENT_OUT, $line, $line->unit_cost === null ? null : (string) $line->unit_cost, $line->notes
                    );
                }
            }

            $adjustment->update(['status' => InventoryAdjustment::POSTED, 'posted_at' => now()]);

            return $adjustment->refresh()->load(['warehouse', 'lines.product']);
        });
    }

    /** @param array<int, array<string, mixed>> $lines */
    private function replaceLines(User $user, InventoryAdjustment $adjustment, array $lines): void
    {
        foreach (array_values($lines) as $index => $line) {
            $product = $user->products()->whereKey($line['product_id'])
                ->where('item_type', Product::TYPE_PRODUCT)->where('track_inventory', true)->first();
            if ($product === null) {
                throw ValidationException::withMessages([
                    "lines.{$index}.product_id" => 'Only your inventory-tracked products may be adjusted.',
                ]);
            }
            $adjustment->lines()->create([
                'product_id' => $product->id,
                'quantity_delta' => $line['quantity_delta'],
                'unit_cost' => $line['unit_cost'] ?? null,
                'notes' => $line['notes'] ?? null,
            ]);
        }
    }

    private function warehouse(User $user, int $id): Warehouse
    {
        return $user->warehouses()->whereKey($id)->where('is_active', true)->firstOrFail();
    }

    private function locked(User $user, InventoryAdjustment $adjustment): InventoryAdjustment
    {
        return $user->inventoryAdjustments()->whereKey($adjustment->id)->lockForUpdate()->firstOrFail();
    }

    private function ensureDraft(InventoryAdjustment $adjustment): void
    {
        if (! $adjustment->isDraft()) {
            throw ValidationException::withMessages(['adjustment' => 'Posted adjustments are immutable.']);
        }
    }
}
