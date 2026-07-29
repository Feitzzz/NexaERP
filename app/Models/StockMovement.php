<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable([
    'user_id', 'warehouse_id', 'product_id', 'movement_type', 'direction',
    'quantity', 'balance_before', 'balance_after', 'unit_cost', 'total_cost',
    'reference_type', 'reference_id', 'notes', 'occurred_at',
])]
class StockMovement extends Model
{
    public const OPENING_BALANCE = 'OPENING_BALANCE';

    public const ADJUSTMENT_IN = 'ADJUSTMENT_IN';

    public const ADJUSTMENT_OUT = 'ADJUSTMENT_OUT';

    public const SALE_ISSUE = 'SALE_ISSUE';

    public const IN = 'IN';

    public const OUT = 'OUT';

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:4', 'balance_before' => 'decimal:4',
            'balance_after' => 'decimal:4', 'unit_cost' => 'decimal:4',
            'total_cost' => 'decimal:4', 'occurred_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Warehouse, $this> */
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return MorphTo<Model, $this> */
    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
