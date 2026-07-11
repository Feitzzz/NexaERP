<?php

namespace App\Models;

use Database\Factories\TaxRateFactory;
use DomainException;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

#[Fillable([
    'tax_category_id',
    'rate',
    'effective_from',
    'effective_to',
])]
class TaxRate extends Model
{
    /** @use HasFactory<TaxRateFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rate' => 'decimal:4',
            'effective_from' => 'date',
            'effective_to' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (TaxRate $taxRate): void {
            $taxRate->ensureEffectiveDatesAreValid();
            $taxRate->ensureRatePeriodDoesNotOverlap();
        });
    }

    /**
     * @return BelongsTo<TaxCategory, $this>
     */
    public function taxCategory(): BelongsTo
    {
        return $this->belongsTo(TaxCategory::class);
    }

    private function ensureEffectiveDatesAreValid(): void
    {
        $effectiveFrom = Carbon::parse($this->effective_from);
        $effectiveTo = $this->effective_to === null ? null : Carbon::parse($this->effective_to);

        if ($effectiveTo !== null && $effectiveTo->lt($effectiveFrom)) {
            throw new DomainException('The tax rate end date cannot be before the start date.');
        }
    }

    private function ensureRatePeriodDoesNotOverlap(): void
    {
        $effectiveFrom = Carbon::parse($this->effective_from)->toDateString();
        $effectiveTo = $this->effective_to === null
            ? null
            : Carbon::parse($this->effective_to)->toDateString();

        $overlapExists = self::query()
            ->where('tax_category_id', $this->tax_category_id)
            ->when($this->exists, fn ($query) => $query->whereKeyNot($this->getKey()))
            ->where('effective_from', '<=', $effectiveTo ?? '9999-12-31')
            ->where(function ($query) use ($effectiveFrom): void {
                $query->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', $effectiveFrom);
            })
            ->exists();

        if ($overlapExists) {
            throw new DomainException('Tax rates for the same category cannot have overlapping effective periods.');
        }
    }
}
