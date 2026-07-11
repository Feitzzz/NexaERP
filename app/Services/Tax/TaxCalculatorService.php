<?php

namespace App\Services\Tax;

use App\Models\TaxCategory;
use Carbon\CarbonInterface;
use DomainException;

class TaxCalculatorService
{
    public function __construct(private readonly TaxRateResolver $taxRateResolver) {}

    /**
     * @param  numeric-string  $quantity
     * @param  numeric-string  $unitPrice
     * @param  numeric-string  $discountAmount
     * @return array{
     *     gross_line_amount: string,
     *     taxable_amount: string,
     *     tax_rate: string,
     *     tax_amount: string,
     *     tax_inclusive_amount: string,
     *     tax_category_code: string,
     *     tax_treatment: string
     * }
     */
    public function calculate(
        string $quantity,
        string $unitPrice,
        string $discountAmount,
        TaxCategory $taxCategory,
        CarbonInterface|string $transactionDate,
    ): array {
        $rate = $this->taxRateResolver->resolve($taxCategory, $transactionDate);
        $rateValue = $this->decimal($rate->rate);

        $grossLineAmount = bcmul($quantity, $unitPrice, 6);
        $taxableAmount = bcsub($grossLineAmount, $discountAmount, 6);

        if (bccomp($taxableAmount, '0', 6) === -1) {
            $taxableAmount = '0';
        }

        $taxAmount = '0';

        if ($taxCategory->treatment === TaxCategory::TREATMENT_TAXABLE) {
            $taxAmount = bcdiv(bcmul($taxableAmount, $rateValue, 6), '100', 6);
        }

        $taxInclusiveAmount = bcadd($taxableAmount, $taxAmount, 6);

        return [
            'gross_line_amount' => $this->roundMoney($grossLineAmount),
            'taxable_amount' => $this->roundMoney($taxableAmount),
            'tax_rate' => $rateValue,
            'tax_amount' => $this->roundMoney($taxAmount),
            'tax_inclusive_amount' => $this->roundMoney($taxInclusiveAmount),
            'tax_category_code' => $taxCategory->code,
            'tax_treatment' => $taxCategory->treatment,
        ];
    }

    /**
     * @return numeric-string
     */
    private function decimal(mixed $value): string
    {
        if (! is_numeric($value)) {
            throw new DomainException('Tax calculation inputs must be numeric.');
        }

        return (string) $value;
    }

    /**
     * @param  numeric-string  $value
     * @return numeric-string
     */
    private function roundMoney(string $value): string
    {
        $rounded = bcdiv(bcadd($value, '0.005', 6), '1', 2);

        return number_format((float) $rounded, 2, '.', '');
    }
}
