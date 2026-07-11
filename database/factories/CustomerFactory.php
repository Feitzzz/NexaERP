<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
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
            'customer_code' => 'CUS-'.fake()->unique()->numerify('######'),
            'customer_type' => fake()->randomElement(['individual', 'business', 'government']),
            'name' => fake()->name(),
            'email' => fake()->optional()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'tin' => fake()->optional()->numerify('TIN-#####'),
            'business_description' => fake()->optional()->sentence(),
            'street' => fake()->streetAddress(),
            'city' => fake()->city(),
            'lga' => fake()->optional()->city(),
            'state' => fake()->city(),
            'postal_code' => fake()->optional()->postcode(),
            'country' => 'Nigeria',
            'is_active' => true,
        ];
    }
}
