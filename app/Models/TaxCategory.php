<?php

namespace App\Models;

use Database\Factories\TaxCategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'code',
    'name',
    'treatment',
    'description',
    'is_active',
])]
class TaxCategory extends Model
{
    /** @use HasFactory<TaxCategoryFactory> */
    use HasFactory;

    public const CODE_STANDARD = 'STANDARD';

    public const CODE_ZERO_RATED = 'ZERO_RATED';

    public const CODE_EXEMPT = 'EXEMPT';

    public const CODE_OUT_OF_SCOPE = 'OUT_OF_SCOPE';

    public const TREATMENT_TAXABLE = 'TAXABLE';

    public const TREATMENT_ZERO_RATED = 'ZERO_RATED';

    public const TREATMENT_EXEMPT = 'EXEMPT';

    public const TREATMENT_OUT_OF_SCOPE = 'OUT_OF_SCOPE';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<TaxRate, $this>
     */
    public function taxRates(): HasMany
    {
        return $this->hasMany(TaxRate::class);
    }

    /**
     * @return HasMany<Product, $this>
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * @return HasMany<InvoiceItem, $this>
     */
    public function invoiceItems(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }
}
