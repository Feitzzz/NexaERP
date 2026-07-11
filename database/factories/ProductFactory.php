<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\TaxCategory;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
            'unit_id' => Unit::factory(),
            'tax_category_id' => TaxCategory::factory(),
            'sku' => 'PRD-'.fake()->unique()->numerify('######'),
            'name' => fake()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'item_type' => Product::TYPE_PRODUCT,
            'selling_price' => fake()->randomFloat(4, 1, 1000),
            'cost_price' => fake()->optional()->randomFloat(4, 1, 500),
            'is_active' => true,
        ];
    }

    public function service(): static
    {
        return $this->state(fn (): array => [
            'item_type' => Product::TYPE_SERVICE,
            'sku' => 'SRV-'.fake()->unique()->numerify('######'),
        ]);
    }
}
