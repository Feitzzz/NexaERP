<?php

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard reports real tenant scoped business metrics', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $customer = Customer::factory()->for($user)->create();
    Customer::factory()->for($other)->create();
    Product::factory()->for($user)->create();

    Invoice::query()->create([
        'user_id' => $user->id,
        'customer_id' => $customer->id,
        'sequence_number' => 1,
        'invoice_number' => 'INV-000001',
        'invoice_kind' => Invoice::KIND_B2B,
        'status' => Invoice::STATUS_ISSUED,
        'payment_status' => Invoice::PAYMENT_PENDING,
        'issue_date' => now()->toDateString(),
        'issue_time' => '09:00:00',
        'due_date' => now()->addWeek()->toDateString(),
        'tax_point_date' => now()->toDateString(),
        'currency_code' => 'NGN',
        'tax_currency_code' => 'NGN',
        'payable_amount' => '125000.0000',
        'subtotal' => '125000.0000',
        'discount_total' => 0,
        'tax_exclusive_total' => '125000.0000',
        'tax_total' => 0,
        'tax_inclusive_total' => '125000.0000',
        'issued_at' => now(),
    ]);

    $this->actingAs($user)->get(route('dashboard'))->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->where('metrics.revenue', 125000)
        ->where('metrics.outstanding', 125000)
        ->where('metrics.invoices_issued', 1)
        ->where('metrics.customers', 1)
        ->where('metrics.products', 1)
        ->has('recentInvoices', 1)
    );
});
