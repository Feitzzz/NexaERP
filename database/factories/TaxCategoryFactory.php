<?php

namespace Database\Factories;

use App\Models\TaxCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TaxCategory>
 */
class TaxCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->bothify('TAX_????'),
            'name' => fake()->words(2, true),
            'treatment' => TaxCategory::TREATMENT_TAXABLE,
            'description' => fake()->optional()->sentence(),
            'is_active' => true,
        ];
    }
}
