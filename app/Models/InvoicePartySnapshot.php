<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'invoice_id',
    'party_type',
    'name',
    'tin',
    'incorporation_number',
    'email',
    'phone',
    'business_description',
    'street',
    'city',
    'state',
    'postal_code',
    'country_code',
])]
class InvoicePartySnapshot extends Model
{
    public const TYPE_SUPPLIER = 'SUPPLIER';

    public const TYPE_CUSTOMER = 'CUSTOMER';

    /**
     * @return BelongsTo<Invoice, $this>
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
