<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'warehouse_id', 'adjustment_number', 'status', 'reason', 'notes', 'posted_at'])]
class InventoryAdjustment extends Model
{
    public const DRAFT = 'DRAFT';

    public const POSTED = 'POSTED';

    public const REASONS = ['OPENING_STOCK', 'DAMAGED_STOCK', 'STOCK_COUNT_CORRECTION', 'MANUAL_ADJUSTMENT'];

    protected function casts(): array
    {
        return ['posted_at' => 'datetime'];
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

    /** @return HasMany<InventoryAdjustmentLine, $this> */
    public function lines(): HasMany
    {
        return $this->hasMany(InventoryAdjustmentLine::class);
    }

    public function isDraft(): bool
    {
        return $this->status === self::DRAFT;
    }
}
