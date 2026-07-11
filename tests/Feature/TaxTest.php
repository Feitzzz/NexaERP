<?php

use App\Models\TaxCategory;
use App\Models\TaxRate;
use App\Models\User;
use App\Services\Tax\TaxCalculatorService;
use App\Services\Tax\TaxRateResolver;
use Database\Seeders\TaxSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('tax seed data contains local ERP classifications and rates', function () {
    $this->seed(TaxSeeder::class);
    $this->seed(TaxSeeder::class);

    expect(TaxCategory::query()->count())->toBe(4)
        ->and(TaxRate::query()->count())->toBe(4);

    $this->assertDatabaseHas('tax_categories', [
        'code' => TaxCategory::CODE_STANDARD,
        'name' => 'Standard VAT',
        'treatment' => TaxCategory::TREATMENT_TAXABLE,
    ]);

    $this->assertDatabaseHas('tax_rates', [
        'rate' => '7.5000',
        'effective_from' => '2020-02-01',
        'effective_to' => null,
    ]);
});

test('tax rate resolver returns the applicable rate for a date', function () {
    $taxCategory = TaxCategory::factory()->create();
    $oldRate = TaxRate::factory()->for($taxCategory)->create([
        'rate' => '5.0000',
        'effective_from' => '2020-02-01',
        'effective_to' => '2024-12-31',
    ]);
    $newRate = TaxRate::factory()->for($taxCategory)->create([
        'rate' => '7.5000',
        'effective_from' => '2025-01-01',
        'effective_to' => null,
    ]);

    $resolver = new TaxRateResolver;

    expect($resolver->resolve($taxCategory, '2024-06-01')->is($oldRate))->toBeTrue()
        ->and($resolver->resolve($taxCategory, '2026-07-09')->is($newRate))->toBeTrue();
});

test('tax rates cannot overlap for the same category', function () {
    $taxCategory = TaxCategory::factory()->create();
    TaxRate::factory()->for($taxCategory)->create([
        'effective_from' => '2025-01-01',
        'effective_to' => '2026-12-31',
    ]);

    TaxRate::factory()->for($taxCategory)->create([
        'effective_from' => '2026-06-01',
        'effective_to' => null,
    ]);
})->throws(DomainException::class, 'overlapping effective periods');

test('tax calculator calculates standard VAT line totals', function () {
    $taxCategory = TaxCategory::factory()->create([
        'code' => TaxCategory::CODE_STANDARD,
        'treatment' => TaxCategory::TREATMENT_TAXABLE,
    ]);
    TaxRate::factory()->for($taxCategory)->create(['rate' => '7.5000']);

    $result = app(TaxCalculatorService::class)->calculate(
        quantity: '2',
        unitPrice: '100000',
        discountAmount: '10000',
        taxCategory: $taxCategory,
        transactionDate: '2026-07-09',
    );

    expect($result)->toMatchArray([
        'gross_line_amount' => '200000.00',
        'taxable_amount' => '190000.00',
        'tax_rate' => '7.5000',
        'tax_amount' => '14250.00',
        'tax_inclusive_amount' => '204250.00',
        'tax_category_code' => TaxCategory::CODE_STANDARD,
        'tax_treatment' => TaxCategory::TREATMENT_TAXABLE,
    ]);
});

test('tax calculator preserves zero tax treatments', function (string $treatment) {
    $taxCategory = TaxCategory::factory()->create([
        'treatment' => $treatment,
    ]);
    TaxRate::factory()->for($taxCategory)->create(['rate' => '0.0000']);

    $result = app(TaxCalculatorService::class)->calculate(
        quantity: '2',
        unitPrice: '100000',
        discountAmount: '0',
        taxCategory: $taxCategory,
        transactionDate: '2026-07-09',
    );

    expect($result['tax_amount'])->toBe('0.00')
        ->and($result['tax_treatment'])->toBe($treatment);
})->with([
    TaxCategory::TREATMENT_ZERO_RATED,
    TaxCategory::TREATMENT_EXEMPT,
    TaxCategory::TREATMENT_OUT_OF_SCOPE,
]);

test('authenticated user can view read only tax overview', function () {
    $user = User::factory()->create();
    $this->seed(TaxSeeder::class);

    $response = $this->actingAs($user)->get(route('taxes.index'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('taxes/index')
        ->has('taxCategories', 4)
    );
});
