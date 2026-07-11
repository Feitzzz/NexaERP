<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\TaxCategory;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function productPayload(Category $category, Unit $unit, array $overrides = []): array
{
    return [
        'name' => 'POS Terminal',
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'tax_category_id' => TaxCategory::factory()->create()->id,
        'item_type' => Product::TYPE_PRODUCT,
        'selling_price' => '250000.0000',
        'cost_price' => '200000.0000',
        'description' => 'Point of sale terminal.',
        'is_active' => true,
        ...$overrides,
    ];
}

test('authenticated business can create a product', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();
    $unit = Unit::factory()->create();

    $this->actingAs($user)
        ->post(route('products.store'), productPayload($category, $unit))
        ->assertRedirect(route('products.index'));

    $this->assertDatabaseHas('products', [
        'user_id' => $user->id,
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'tax_category_id' => TaxCategory::query()->first()->id,
        'name' => 'POS Terminal',
        'item_type' => Product::TYPE_PRODUCT,
    ]);
});

test('product requires an active tax category', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();
    $unit = Unit::factory()->create();
    $inactiveTaxCategory = TaxCategory::factory()->create(['is_active' => false]);

    $this->actingAs($user)
        ->post(route('products.store'), productPayload($category, $unit, [
            'tax_category_id' => $inactiveTaxCategory->id,
        ]))
        ->assertSessionHasErrors('tax_category_id');

    expect(Product::query()->count())->toBe(0);
});

test('product receives automatic SKU', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();
    $unit = Unit::factory()->create();

    $this->actingAs($user)->post(route('products.store'), productPayload($category, $unit));

    expect(Product::query()->first()->sku)->not->toBeNull();
});

test('PRODUCT gets a PRD SKU prefix', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();
    $unit = Unit::factory()->create();

    $this->actingAs($user)->post(route('products.store'), productPayload($category, $unit));

    expect(Product::query()->first()->sku)->toBe('PRD-000001');
});

test('SERVICE gets an SRV SKU prefix', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();
    $unit = Unit::factory()->create();

    $this->actingAs($user)->post(route('products.store'), productPayload($category, $unit, [
        'item_type' => Product::TYPE_SERVICE,
    ]));

    expect(Product::query()->first()->sku)->toBe('SRV-000001');
});

test('SKU generation produces expected zero padding', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();
    $unit = Unit::factory()->create();
    Product::factory()->count(24)->for($user)->for($category)->for($unit)->create();

    $this->actingAs($user)->post(route('products.store'), productPayload($category, $unit));

    expect(Product::query()->latest('id')->first()->sku)->toBe('PRD-000025');
});

test('business cannot assign another business category', function () {
    $owner = User::factory()->create();
    $user = User::factory()->create();
    $category = Category::factory()->for($owner)->create();
    $unit = Unit::factory()->create();

    $this->actingAs($user)
        ->post(route('products.store'), productPayload($category, $unit))
        ->assertSessionHasErrors('category_id');

    expect(Product::query()->count())->toBe(0);
});

test('business cannot view another business product', function () {
    $owner = User::factory()->create();
    $user = User::factory()->create();
    $category = Category::factory()->for($owner)->create();
    $unit = Unit::factory()->create();
    $product = Product::factory()->for($owner)->for($category)->for($unit)->create();

    $this->actingAs($user)
        ->get(route('products.edit', $product))
        ->assertNotFound();
});

test('business cannot update another business product', function () {
    $owner = User::factory()->create();
    $user = User::factory()->create();
    $ownerCategory = Category::factory()->for($owner)->create();
    $userCategory = Category::factory()->for($user)->create();
    $unit = Unit::factory()->create();
    $product = Product::factory()->for($owner)->for($ownerCategory)->for($unit)->create(['name' => 'Owned']);

    $this->actingAs($user)
        ->put(route('products.update', $product), productPayload($userCategory, $unit, ['name' => 'Changed']))
        ->assertNotFound();

    expect($product->refresh()->name)->toBe('Owned');
});

test('business cannot delete another business product', function () {
    $owner = User::factory()->create();
    $user = User::factory()->create();
    $category = Category::factory()->for($owner)->create();
    $unit = Unit::factory()->create();
    $product = Product::factory()->for($owner)->for($category)->for($unit)->create();

    $this->actingAs($user)
        ->delete(route('products.destroy', $product))
        ->assertNotFound();

    $this->assertDatabaseHas('products', ['id' => $product->id]);
});

test('product can be activated and deactivated', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();
    $unit = Unit::factory()->create();
    $product = Product::factory()->for($user)->for($category)->for($unit)->create(['is_active' => true]);

    $this->actingAs($user)
        ->patch(route('products.status', $product))
        ->assertRedirect();

    expect($product->refresh()->is_active)->toBeFalse();

    $this->actingAs($user)
        ->patch(route('products.status', $product))
        ->assertRedirect();

    expect($product->refresh()->is_active)->toBeTrue();
});

test('product search works by name', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();
    $unit = Unit::factory()->create();
    Product::factory()->for($user)->for($category)->for($unit)->create(['name' => 'Thermal Printer']);
    Product::factory()->for($user)->for($category)->for($unit)->create(['name' => 'Barcode Scanner']);

    $response = $this->actingAs($user)->get(route('products.index', [
        'search' => 'Thermal',
    ]));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('products/index')
        ->where('products.data.0.name', 'Thermal Printer')
        ->has('products.data', 1)
    );
});

test('product search works by SKU', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();
    $unit = Unit::factory()->create();
    Product::factory()->for($user)->for($category)->for($unit)->create(['sku' => 'PRD-SEARCH']);
    Product::factory()->for($user)->for($category)->for($unit)->create(['sku' => 'PRD-OTHER']);

    $response = $this->actingAs($user)->get(route('products.index', [
        'search' => 'SEARCH',
    ]));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('products/index')
        ->where('products.data.0.sku', 'PRD-SEARCH')
        ->has('products.data', 1)
    );
});

test('category filter works', function () {
    $user = User::factory()->create();
    $unit = Unit::factory()->create();
    $matchingCategory = Category::factory()->for($user)->create(['name' => 'Hardware']);
    $otherCategory = Category::factory()->for($user)->create(['name' => 'Services']);
    Product::factory()->for($user)->for($matchingCategory)->for($unit)->create(['name' => 'Router']);
    Product::factory()->for($user)->for($otherCategory)->for($unit)->create(['name' => 'Install']);

    $response = $this->actingAs($user)->get(route('products.index', [
        'category_id' => $matchingCategory->id,
    ]));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('products/index')
        ->where('products.data.0.name', 'Router')
        ->has('products.data', 1)
    );
});

test('tax category filter includes classified and unclassified products', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();
    $unit = Unit::factory()->create();
    $taxCategory = TaxCategory::factory()->create(['name' => 'Standard VAT']);
    Product::factory()->for($user)->for($category)->for($unit)->for($taxCategory)->create(['name' => 'Classified']);
    Product::factory()->for($user)->for($category)->for($unit)->create([
        'name' => 'Unclassified',
        'tax_category_id' => null,
    ]);

    $classified = $this->actingAs($user)->get(route('products.index', [
        'tax_category_id' => $taxCategory->id,
    ]));

    $classified->assertInertia(fn (Assert $page) => $page
        ->component('products/index')
        ->where('products.data.0.name', 'Classified')
        ->has('products.data', 1)
    );

    $unclassified = $this->actingAs($user)->get(route('products.index', [
        'tax_category_id' => 'unclassified',
    ]));

    $unclassified->assertInertia(fn (Assert $page) => $page
        ->component('products/index')
        ->where('products.data.0.name', 'Unclassified')
        ->has('products.data', 1)
    );
});

test('item type filter works', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();
    $unit = Unit::factory()->create();
    Product::factory()->for($user)->for($category)->for($unit)->create(['name' => 'Router', 'item_type' => Product::TYPE_PRODUCT]);
    Product::factory()->service()->for($user)->for($category)->for($unit)->create(['name' => 'Install', 'item_type' => Product::TYPE_SERVICE]);

    $response = $this->actingAs($user)->get(route('products.index', [
        'item_type' => Product::TYPE_SERVICE,
    ]));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('products/index')
        ->where('products.data.0.name', 'Install')
        ->has('products.data', 1)
    );
});

test('status filter works', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();
    $unit = Unit::factory()->create();
    Product::factory()->for($user)->for($category)->for($unit)->create(['name' => 'Active Product', 'is_active' => true]);
    Product::factory()->for($user)->for($category)->for($unit)->create(['name' => 'Inactive Product', 'is_active' => false]);

    $response = $this->actingAs($user)->get(route('products.index', [
        'status' => 'inactive',
    ]));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('products/index')
        ->where('products.data.0.name', 'Inactive Product')
        ->has('products.data', 1)
    );
});

test('negative selling prices are rejected', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();
    $unit = Unit::factory()->create();

    $this->actingAs($user)
        ->post(route('products.store'), productPayload($category, $unit, [
            'selling_price' => '-1',
        ]))
        ->assertSessionHasErrors('selling_price');
});

test('negative cost prices are rejected', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();
    $unit = Unit::factory()->create();

    $this->actingAs($user)
        ->post(route('products.store'), productPayload($category, $unit, [
            'cost_price' => '-1',
        ]))
        ->assertSessionHasErrors('cost_price');
});
