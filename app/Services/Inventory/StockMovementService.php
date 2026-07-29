<?php

namespace App\Services\Inventory;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Model;

class StockMovementService
{
    /**
     * @param  numeric-string  $quantity
     * @param  numeric-string  $before
     * @param  numeric-string  $after
     * @param  numeric-string|null  $unitCost
     */
    public function record(
        User $user,
        Warehouse $warehouse,
        Product $product,
        string $movementType,
        string $direction,
        string $quantity,
        string $before,
        string $after,
        ?Model $reference = null,
        ?string $unitCost = null,
        ?string $notes = null,
    ): StockMovement {
        $totalCost = $unitCost === null ? null : bcmul($quantity, $unitCost, 4);

        return StockMovement::create([
            'user_id' => $user->id,
            'warehouse_id' => $warehouse->id,
            'product_id' => $product->id,
            'movement_type' => $movementType,
            'direction' => $direction,
            'quantity' => $quantity,
            'balance_before' => $before,
            'balance_after' => $after,
            'unit_cost' => $unitCost,
            'total_cost' => $totalCost,
            'reference_type' => $reference?->getMorphClass(),
            'reference_id' => $reference?->getKey(),
            'notes' => $notes,
            'occurred_at' => now(),
        ]);
    }
}
