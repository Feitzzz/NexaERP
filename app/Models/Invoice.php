<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'user_id',
    'customer_id',
    'sequence_number',
    'invoice_number',
    'invoice_kind',
    'status',
    'payment_status',
    'issue_date',
    'issue_time',
    'due_date',
    'tax_point_date',
    'currency_code',
    'tax_currency_code',
    'subtotal',
    'discount_total',
    'tax_exclusive_total',
    'tax_total',
    'tax_inclusive_total',
    'payable_amount',
    'notes',
    'issued_at',
])]
class Invoice extends Model
{
    public const KIND_B2B = 'B2B';

    public const KIND_B2C = 'B2C';

    public const KIND_B2G = 'B2G';

    public const STATUS_DRAFT = 'DRAFT';

    public const STATUS_ISSUED = 'ISSUED';

    public const PAYMENT_PENDING = 'PENDING';

    public const PAYMENT_PARTIAL = 'PARTIAL';

    public const PAYMENT_PAID = 'PAID';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'due_date' => 'date',
            'tax_point_date' => 'date',
            'issued_at' => 'datetime',
            'subtotal' => 'decimal:4',
            'discount_total' => 'decimal:4',
            'tax_exclusive_total' => 'decimal:4',
            'tax_total' => 'decimal:4',
            'tax_inclusive_total' => 'decimal:4',
            'payable_amount' => 'decimal:4',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * @return HasMany<InvoiceItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * @return HasMany<InvoicePartySnapshot, $this>
     */
    public function partySnapshots(): HasMany
    {
        return $this->hasMany(InvoicePartySnapshot::class);
    }

    /**
     * @return HasOne<InvoicePartySnapshot, $this>
     */
    public function supplierSnapshot(): HasOne
    {
        return $this->hasOne(InvoicePartySnapshot::class)->where('party_type', InvoicePartySnapshot::TYPE_SUPPLIER);
    }

    /**
     * @return HasOne<InvoicePartySnapshot, $this>
     */
    public function customerSnapshot(): HasOne
    {
        return $this->hasOne(InvoicePartySnapshot::class)->where('party_type', InvoicePartySnapshot::TYPE_CUSTOMER);
    }

    public function isDraft(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public function isIssued(): bool
    {
        return $this->status === self::STATUS_ISSUED;
    }
}
