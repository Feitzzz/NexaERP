<?php

namespace Database\Factories;

use App\Models\TaxCategory;
use App\Models\TaxRate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TaxRate>
 */
class TaxRateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tax_category_id' => TaxCategory::factory(),
            'rate' => '7.5000',
            'effective_from' => '2020-02-01',
            'effective_to' => null,
        ];
    }
}
