<?php

namespace App\Services\Inventory;

use App\Models\InventoryBalance;
use App\Models\Product;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryService
{
    public function __construct(private readonly StockMovementService $stockMovementService) {}

    public function available(Warehouse $warehouse, Product $product): string
    {
        return (string) (InventoryBalance::query()
            ->where('warehouse_id', $warehouse->id)
            ->where('product_id', $product->id)
            ->value('quantity_on_hand') ?? '0');
    }

    /**
     * @param  numeric-string  $quantity
     * @param  numeric-string|null  $unitCost
     */
    public function increase(
        User $user,
        Warehouse $warehouse,
        Product $product,
        string $quantity,
        string $movementType,
        Model $reference,
        ?string $unitCost = null,
        ?string $notes = null,
    ): InventoryBalance {
        return $this->mutate($user, $warehouse, $product, $quantity, $movementType, $reference, $unitCost, $notes);
    }

    /**
     * @param  numeric-string  $quantity
     * @param  numeric-string|null  $unitCost
     */
    public function decrease(
        User $user,
        Warehouse $warehouse,
        Product $product,
        string $quantity,
        string $movementType,
        Model $reference,
        ?string $unitCost = null,
        ?string $notes = null,
    ): InventoryBalance {
        return $this->mutate($user, $warehouse, $product, bcmul($quantity, '-1', 4), $movementType, $reference, $unitCost, $notes);
    }

    /**
     * @param  numeric-string  $delta
     * @param  numeric-string|null  $unitCost
     */
    private function mutate(
        User $user,
        Warehouse $warehouse,
        Product $product,
        string $delta,
        string $movementType,
        Model $reference,
        ?string $unitCost,
        ?string $notes,
    ): InventoryBalance {
        if ($warehouse->user_id !== $user->id || ! $warehouse->is_active) {
            throw ValidationException::withMessages(['warehouse_id' => 'The selected warehouse is invalid or inactive.']);
        }

        if ($product->user_id !== $user->id || $product->item_type !== Product::TYPE_PRODUCT || ! $product->track_inventory) {
            throw ValidationException::withMessages(['product_id' => 'Only inventory-tracked products can change stock.']);
        }

        if (bccomp($delta, '0', 4) === 0) {
            throw ValidationException::withMessages(['quantity' => 'Stock quantity cannot be zero.']);
        }

        return DB::transaction(function () use ($user, $warehouse, $product, $delta, $movementType, $reference, $unitCost, $notes): InventoryBalance {
            InventoryBalance::query()->insertOrIgnore([[
                'user_id' => $user->id,
                'warehouse_id' => $warehouse->id,
                'product_id' => $product->id,
                'quantity_on_hand' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]]);

            $balance = InventoryBalance::query()
                ->where('warehouse_id', $warehouse->id)
                ->where('product_id', $product->id)
                ->lockForUpdate()
                ->firstOrFail();

            $before = $this->numericString($balance->quantity_on_hand);
            $after = bcadd($before, $delta, 4);

            if (bccomp($after, '0', 4) < 0) {
                throw ValidationException::withMessages([
                    'stock' => "Insufficient stock for {$product->name}. Available: {$before}.",
                ]);
            }

            $balance->update(['quantity_on_hand' => $after]);
            $quantity = $this->numericString(ltrim($delta, '-'));
            $direction = bccomp($delta, '0', 4) > 0 ? 'IN' : 'OUT';

            $this->stockMovementService->record(
                $user, $warehouse, $product, $movementType, $direction,
                $quantity, $before, $after, $reference, $unitCost, $notes
            );

            return $balance->refresh();
        });
    }

    /** @return numeric-string */
    private function numericString(mixed $value): string
    {
        if (! is_numeric($value)) {
            throw ValidationException::withMessages(['quantity' => 'Stock quantities must be numeric.']);
        }

        return (string) $value;
    }
}
