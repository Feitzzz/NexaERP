<?php

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function customerPayload(array $overrides = []): array
{
    return [
        'name' => 'Acme Stores',
        'customer_type' => 'business',
        'email' => 'buyer@acme.test',
        'phone' => '08012345678',
        'tin' => 'TIN-12345',
        'business_description' => 'Retail customer.',
        'street' => '12 Marina Road',
        'city' => 'Lagos',
        'lga' => 'Lagos Island',
        'state' => 'Lagos',
        'postal_code' => '100001',
        'country' => 'Nigeria',
        'is_active' => true,
        ...$overrides,
    ];
}

test('authenticated user can create a customer', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('customers.store'), customerPayload());

    $customer = Customer::query()->first();

    $response->assertRedirect(route('customers.show', $customer));

    expect($customer)->not->toBeNull()
        ->and($customer->user_id)->toBe($user->id)
        ->and($customer->customer_code)->toBe('CUS-000001')
        ->and($customer->name)->toBe('Acme Stores')
        ->and($customer->email)->toBe('buyer@acme.test')
        ->and($customer->is_active)->toBeTrue();
});

test('customer codes are sequential', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('customers.store'), customerPayload([
        'email' => 'first@example.test',
    ]));

    $this->actingAs($user)->post(route('customers.store'), customerPayload([
        'email' => 'second@example.test',
        'phone' => '08000000002',
    ]));

    expect(Customer::query()->orderBy('id')->pluck('customer_code')->all())
        ->toBe(['CUS-000001', 'CUS-000002']);
});

test('authenticated user can update their customer', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->for($user)->create([
        'name' => 'Old Customer',
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->put(route('customers.update', $customer), customerPayload([
        'name' => 'Updated Customer',
        'customer_type' => 'government',
        'email' => null,
        'phone' => '08111111111',
        'city' => 'Abuja',
        'is_active' => false,
    ]));

    $response->assertRedirect(route('customers.show', $customer));

    $customer->refresh();

    expect($customer->name)->toBe('Updated Customer')
        ->and($customer->customer_type)->toBe('government')
        ->and($customer->email)->toBeNull()
        ->and($customer->phone)->toBe('08111111111')
        ->and($customer->city)->toBe('Abuja')
        ->and($customer->is_active)->toBeFalse();
});

test('authenticated user can delete their customer', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->for($user)->create();

    $this->actingAs($user)
        ->delete(route('customers.destroy', $customer))
        ->assertRedirect(route('customers.index'));

    $this->assertDatabaseMissing('customers', [
        'id' => $customer->id,
    ]);
});

test('customers can be searched', function () {
    $user = User::factory()->create();

    Customer::factory()->for($user)->create([
        'customer_code' => 'CUS-000010',
        'name' => 'Nexa Retail',
        'email' => 'retail@nexa.test',
        'phone' => '08099999999',
        'tin' => 'TIN-NEXA',
    ]);
    Customer::factory()->for($user)->create([
        'name' => 'Unrelated Customer',
        'email' => 'other@example.test',
        'phone' => '07011111111',
        'tin' => 'TIN-OTHER',
    ]);

    $response = $this->actingAs($user)->get(route('customers.index', [
        'search' => 'NEXA',
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('customers/index')
            ->where('customers.data.0.name', 'Nexa Retail')
            ->has('customers.data', 1)
        );
});

test('customers are paginated', function () {
    $user = User::factory()->create();

    Customer::factory()->count(26)->for($user)->create();

    $response = $this->actingAs($user)->get(route('customers.index'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('customers/index')
            ->has('customers.data', 25)
            ->where('customers.per_page', 25)
            ->where('customers.total', 26)
        );
});

test('customer validation requires mandatory fields', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('customers.create'))
        ->post(route('customers.store'), [])
        ->assertRedirect(route('customers.create'))
        ->assertSessionHasErrors([
            'name',
            'customer_type',
            'phone',
            'street',
            'city',
            'state',
            'country',
        ]);
});

test('guest users cannot access customer management', function () {
    $customer = Customer::factory()->create();

    $this->get(route('customers.index'))->assertRedirect(route('login'));
    $this->get(route('customers.create'))->assertRedirect(route('login'));
    $this->post(route('customers.store'), customerPayload())->assertRedirect(route('login'));
    $this->get(route('customers.show', $customer))->assertRedirect(route('login'));
    $this->get(route('customers.edit', $customer))->assertRedirect(route('login'));
    $this->put(route('customers.update', $customer), customerPayload())->assertRedirect(route('login'));
    $this->delete(route('customers.destroy', $customer))->assertRedirect(route('login'));
});

test('users cannot manage customers owned by another user', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $customer = Customer::factory()->for($owner)->create();

    $this->actingAs($otherUser)->get(route('customers.show', $customer))->assertNotFound();
    $this->actingAs($otherUser)->get(route('customers.edit', $customer))->assertNotFound();
    $this->actingAs($otherUser)->put(route('customers.update', $customer), customerPayload())->assertNotFound();
    $this->actingAs($otherUser)->delete(route('customers.destroy', $customer))->assertNotFound();
});

test('customer index only includes customers owned by authenticated user', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    Customer::factory()->for($user)->create([
        'name' => 'Owned Customer',
    ]);
    Customer::factory()->for($otherUser)->create([
        'name' => 'Other Customer',
    ]);

    $response = $this->actingAs($user)->get(route('customers.index'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('customers/index')
            ->has('customers.data', 1)
            ->where('customers.data.0.name', 'Owned Customer')
        );
});
