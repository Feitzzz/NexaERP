<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'invoice_id',
    'product_id',
    'tax_category_id',
    'line_number',
    'product_sku',
    'item_name',
    'item_description',
    'item_type',
    'unit_code',
    'unit_name',
    'quantity',
    'unit_price',
    'discount_rate',
    'discount_amount',
    'gross_line_amount',
    'taxable_amount',
    'tax_category_code',
    'tax_category_name',
    'tax_treatment',
    'tax_rate',
    'tax_amount',
    'line_total',
])]
class InvoiceItem extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:4',
            'unit_price' => 'decimal:4',
            'discount_rate' => 'decimal:4',
            'discount_amount' => 'decimal:4',
            'gross_line_amount' => 'decimal:4',
            'taxable_amount' => 'decimal:4',
            'tax_rate' => 'decimal:4',
            'tax_amount' => 'decimal:4',
            'line_total' => 'decimal:4',
        ];
    }

    /**
     * @return BelongsTo<Invoice, $this>
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return BelongsTo<TaxCategory, $this>
     */
    public function taxCategory(): BelongsTo
    {
        return $this->belongsTo(TaxCategory::class);
    }
}
