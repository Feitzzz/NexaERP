<?php

namespace App\Services\Invoice;

use App\Models\InvoiceSequence;
use App\Models\User;

class InvoiceNumberGenerator
{
    /**
     * @return array{sequence_number: int, invoice_number: string}
     */
    public function nextFor(User $user): array
    {
        InvoiceSequence::query()->firstOrCreate([
            'user_id' => $user->id,
        ], [
            'last_number' => 0,
        ]);

        /** @var InvoiceSequence $sequence */
        $sequence = InvoiceSequence::query()
            ->where('user_id', $user->id)
            ->lockForUpdate()
            ->firstOrFail();

        $nextNumber = $sequence->last_number + 1;

        $sequence->update([
            'last_number' => $nextNumber,
        ]);

        return [
            'sequence_number' => $nextNumber,
            'invoice_number' => 'INV-'.str_pad((string) $nextNumber, 6, '0', STR_PAD_LEFT),
        ];
    }
}
