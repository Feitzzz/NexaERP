<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

#[Fillable(['inventory_adjustment_id', 'product_id', 'quantity_delta', 'unit_cost', 'notes'])]
class InventoryAdjustmentLine extends Model
{
    protected function casts(): array
    {
        return ['quantity_delta' => 'decimal:4', 'unit_cost' => 'decimal:4'];
    }

    /** @return BelongsTo<InventoryAdjustment, $this> */
    public function adjustment(): BelongsTo
    {
        return $this->belongsTo(InventoryAdjustment::class, 'inventory_adjustment_id');
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return MorphMany<StockMovement, $this> */
    public function stockMovements(): MorphMany
    {
        return $this->morphMany(StockMovement::class, 'reference');
    }
}
