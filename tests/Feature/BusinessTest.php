<?php

use App\Models\Address;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('authenticated user can view business profile', function () {
    $address = Address::factory()->create([
        'street' => '12 Marina Road',
        'city' => 'Lagos',
        'state' => 'Lagos',
        'country' => 'Nigeria',
    ]);

    $user = User::factory()->create([
        'name' => 'Nexa Trading Ltd',
        'address_id' => $address->id,
    ]);

    $response = $this->actingAs($user)->get(route('business.show'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('business/show')
            ->where('business.name', 'Nexa Trading Ltd')
            ->where('business.address.street', '12 Marina Road')
        );
});

test('authenticated user can update business information', function () {
    $user = User::factory()->create([
        'name' => 'Old Business',
        'email' => 'old@example.com',
    ]);

    $response = $this->actingAs($user)->put(route('business.update'), [
        'name' => 'Nexa Trading Ltd',
        'email' => 'hello@nexa.test',
        'phone' => '08012345678',
        'tin' => 'TIN-12345',
        'business_description' => 'Wholesale and retail operations.',
        'street' => '12 Marina Road',
        'city' => 'Lagos',
        'lga' => 'Lagos Island',
        'state' => 'Lagos',
        'postal_code' => '100001',
        'country' => 'Nigeria',
    ]);

    $response->assertRedirect(route('business.show'));

    $user->refresh()->load('address');

    expect($user->name)->toBe('Nexa Trading Ltd')
        ->and($user->email)->toBe('hello@nexa.test')
        ->and($user->phone)->toBe('08012345678')
        ->and($user->tin)->toBe('TIN-12345')
        ->and($user->business_description)->toBe('Wholesale and retail operations.')
        ->and($user->address->street)->toBe('12 Marina Road')
        ->and($user->address->lga)->toBe('Lagos Island')
        ->and($user->address->postal_code)->toBe('100001');
});

test('address is created if missing', function () {
    $user = User::factory()->create([
        'address_id' => null,
    ]);

    $this->actingAs($user)->put(route('business.update'), [
        'name' => 'Nexa Trading Ltd',
        'email' => 'hello@nexa.test',
        'phone' => '08012345678',
        'street' => '12 Marina Road',
        'city' => 'Lagos',
        'state' => 'Lagos',
        'country' => 'Nigeria',
    ])->assertRedirect(route('business.show'));

    $user->refresh();

    expect($user->address_id)->not->toBeNull();

    $this->assertDatabaseHas('addresses', [
        'id' => $user->address_id,
        'street' => '12 Marina Road',
        'city' => 'Lagos',
        'state' => 'Lagos',
        'country' => 'Nigeria',
    ]);
});

test('guest users are redirected to login', function () {
    $this->get(route('business.show'))->assertRedirect(route('login'));
    $this->get(route('business.edit'))->assertRedirect(route('login'));
    $this->put(route('business.update'))->assertRedirect(route('login'));
});
