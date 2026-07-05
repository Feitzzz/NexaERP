<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Fortify\Features;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('new users can register with business profile details', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Nexa Trading Ltd',
        'email' => 'business@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'tin' => 'TIN-12345',
        'phone' => '08012345678',
        'business_description' => 'Wholesale and retail operations.',
        'street' => '12 Marina Road',
        'city' => 'Lagos',
        'lga' => 'Lagos Island',
        'state' => 'Lagos',
        'postal_code' => '100001',
        'country' => 'Nigeria',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $this->assertDatabaseHas('users', [
        'name' => 'Nexa Trading Ltd',
        'email' => 'business@example.com',
        'tin' => 'TIN-12345',
        'phone' => '08012345678',
        'business_description' => 'Wholesale and retail operations.',
    ]);

    $this->assertDatabaseHas('addresses', [
        'street' => '12 Marina Road',
        'city' => 'Lagos',
        'lga' => 'Lagos Island',
        'state' => 'Lagos',
        'postal_code' => '100001',
        'country' => 'Nigeria',
    ]);
});
