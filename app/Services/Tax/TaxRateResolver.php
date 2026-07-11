<?php

namespace App\Services\Tax;

use App\Models\TaxCategory;
use App\Models\TaxRate;
use Carbon\CarbonInterface;
use DomainException;
use Illuminate\Support\Carbon;

class TaxRateResolver
{
    public function resolve(TaxCategory $taxCategory, CarbonInterface|string $transactionDate): TaxRate
    {
        $date = $transactionDate instanceof CarbonInterface
            ? $transactionDate->toDateString()
            : Carbon::parse($transactionDate)->toDateString();

        $rates = $taxCategory->taxRates()
            ->whereDate('effective_from', '<=', $date)
            ->where(function ($query) use ($date): void {
                $query->whereNull('effective_to')
                    ->orWhereDate('effective_to', '>=', $date);
            })
            ->orderByDesc('effective_from')
            ->get();

        if ($rates->isEmpty()) {
            throw new DomainException("No tax rate is configured for {$taxCategory->code} on {$date}.");
        }

        if ($rates->count() > 1) {
            throw new DomainException("Multiple tax rates match {$taxCategory->code} on {$date}.");
        }

        return $rates->firstOrFail();
    }
}
