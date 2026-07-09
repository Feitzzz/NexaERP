<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function categoryPayload(array $overrides = []): array
{
    return [
        'name' => 'Retail Goods',
        'description' => 'Items sold to retail customers.',
        'is_active' => true,
        ...$overrides,
    ];
}

test('authenticated business can create a category', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('categories.store'), categoryPayload())
        ->assertRedirect(route('categories.index'));

    $this->assertDatabaseHas('categories', [
        'user_id' => $user->id,
        'name' => 'Retail Goods',
        'is_active' => true,
    ]);
});

test('category names are unique per business', function () {
    $user = User::factory()->create();
    Category::factory()->for($user)->create(['name' => 'Retail Goods']);

    $this->actingAs($user)
        ->post(route('categories.store'), categoryPayload())
        ->assertSessionHasErrors('name');
});

test('different businesses may use the same category name', function () {
    $owner = User::factory()->create();
    $user = User::factory()->create();
    Category::factory()->for($owner)->create(['name' => 'Retail Goods']);

    $this->actingAs($user)
        ->post(route('categories.store'), categoryPayload())
        ->assertRedirect(route('categories.index'));

    expect(Category::query()->where('name', 'Retail Goods')->count())->toBe(2);
});

test('business cannot view another business category', function () {
    $owner = User::factory()->create();
    $user = User::factory()->create();
    $category = Category::factory()->for($owner)->create();

    $this->actingAs($user)
        ->get(route('categories.edit', $category))
        ->assertNotFound();
});

test('business cannot update another business category', function () {
    $owner = User::factory()->create();
    $user = User::factory()->create();
    $category = Category::factory()->for($owner)->create(['name' => 'Owned']);

    $this->actingAs($user)
        ->put(route('categories.update', $category), categoryPayload(['name' => 'Changed']))
        ->assertNotFound();

    expect($category->refresh()->name)->toBe('Owned');
});

test('business cannot delete another business category', function () {
    $owner = User::factory()->create();
    $user = User::factory()->create();
    $category = Category::factory()->for($owner)->create();

    $this->actingAs($user)
        ->delete(route('categories.destroy', $category))
        ->assertNotFound();

    $this->assertDatabaseHas('categories', ['id' => $category->id]);
});

test('category with products cannot be deleted', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();
    $unit = Unit::factory()->create();
    Product::factory()->for($user)->for($category)->for($unit)->create();

    $this->actingAs($user)
        ->delete(route('categories.destroy', $category))
        ->assertSessionHasErrors('category');

    $this->assertDatabaseHas('categories', ['id' => $category->id]);
});

test('empty category can be deleted', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();

    $this->actingAs($user)
        ->delete(route('categories.destroy', $category))
        ->assertRedirect(route('categories.index'));

    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

test('category can be activated and deactivated', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create(['is_active' => true]);

    $this->actingAs($user)
        ->patch(route('categories.status', $category))
        ->assertRedirect();

    expect($category->refresh()->is_active)->toBeFalse();

    $this->actingAs($user)
        ->patch(route('categories.status', $category))
        ->assertRedirect();

    expect($category->refresh()->is_active)->toBeTrue();
});

test('category search returns the correct categories', function () {
    $user = User::factory()->create();
    Category::factory()->for($user)->create(['name' => 'Electronics']);
    Category::factory()->for($user)->create(['name' => 'Office Supplies']);

    $response = $this->actingAs($user)->get(route('categories.index', [
        'search' => 'Elect',
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('categories/index')
            ->where('categories.data.0.name', 'Electronics')
            ->has('categories.data', 1)
        );
});
