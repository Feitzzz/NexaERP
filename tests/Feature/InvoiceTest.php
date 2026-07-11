<?php

use App\Models\Address;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceSequence;
use App\Models\Product;
use App\Models\TaxCategory;
use App\Models\TaxRate;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function invoiceSetup(array $overrides = []): array
{
    $address = Address::factory()->create([
        'street' => '1 Broad Street',
        'city' => 'Lagos',
        'state' => 'Lagos',
        'country' => 'Nigeria',
    ]);
    $user = User::factory()->create([
        'name' => 'Acme Limited',
        'phone' => '08030000000',
        'tin' => 'SUPPLIER-TIN',
        'business_description' => 'Technology supplier',
        'address_id' => $address->id,
    ]);
    $customer = Customer::factory()->for($user)->create([
        'name' => 'Beta Stores',
        'tin' => 'CUSTOMER-TIN',
    ]);
    $category = Category::factory()->for($user)->create();
    $unit = Unit::factory()->create(['code' => 'PCS', 'name' => 'Pieces']);
    $taxCategory = TaxCategory::factory()->create([
        'code' => TaxCategory::CODE_STANDARD,
        'name' => 'Standard VAT',
        'treatment' => TaxCategory::TREATMENT_TAXABLE,
    ]);
    TaxRate::factory()->for($taxCategory)->create([
        'rate' => '7.5000',
        'effective_from' => '2020-02-01',
        'effective_to' => null,
    ]);
    $product = Product::factory()
        ->for($user)
        ->for($category)
        ->for($unit)
        ->for($taxCategory)
        ->create([
            'sku' => 'PRD-000001',
            'name' => 'POS Terminal',
            'selling_price' => '100.0000',
        ]);

    return [
        'user' => $user,
        'customer' => $customer,
        'product' => $product,
        'taxCategory' => $taxCategory,
        ...$overrides,
    ];
}

function invoicePayload(Customer $customer, Product $product, array $overrides = []): array
{
    return [
        'customer_id' => $customer->id,
        'invoice_kind' => Invoice::KIND_B2C,
        'issue_date' => '2026-07-09',
        'due_date' => '2026-07-16',
        'tax_point_date' => '2026-07-09',
        'currency_code' => 'NGN',
        'tax_currency_code' => 'NGN',
        'notes' => 'Thanks',
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => '2',
                'unit_price' => '100',
                'discount_rate' => '10',
            ],
        ],
        ...$overrides,
    ];
}

function createInvoiceFor(User $user, Customer $customer, Product $product, array $overrides = []): Invoice
{
    test()->actingAs($user)
        ->post(route('invoices.store'), invoicePayload($customer, $product, $overrides))
        ->assertRedirect();

    return Invoice::query()->latest('id')->firstOrFail();
}

test('authenticated business can list only its invoices', function () {
    $own = invoiceSetup();
    $other = invoiceSetup();
    createInvoiceFor($own['user'], $own['customer'], $own['product']);
    createInvoiceFor($other['user'], $other['customer'], $other['product']);

    $this->actingAs($own['user'])
        ->get(route('invoices.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('invoices/index')
            ->has('invoices.data', 1)
            ->where('invoices.data.0.invoice_number', 'INV-000001')
            ->where('invoices.data.0.customer.name', 'Beta Stores')
        );
});

test('business cannot access another business invoice', function () {
    $owner = invoiceSetup();
    $intruder = User::factory()->create();
    $invoice = createInvoiceFor($owner['user'], $owner['customer'], $owner['product']);

    $this->actingAs($intruder)->get(route('invoices.show', $invoice))->assertNotFound();
    $this->actingAs($intruder)->get(route('invoices.edit', $invoice))->assertNotFound();
    $this->actingAs($intruder)->delete(route('invoices.destroy', $invoice))->assertNotFound();
    $this->actingAs($intruder)->patch(route('invoices.issue', $invoice))->assertNotFound();
});

test('business cannot invoice another business customer or product', function () {
    $owner = invoiceSetup();
    $other = invoiceSetup();

    $this->actingAs($owner['user'])
        ->post(route('invoices.store'), invoicePayload($other['customer'], $owner['product']))
        ->assertSessionHasErrors('customer_id');

    $this->actingAs($owner['user'])
        ->post(route('invoices.store'), invoicePayload($owner['customer'], $other['product']))
        ->assertSessionHasErrors('items.0.product_id');
});

test('invoice numbers are per business and rollback with failed creation', function () {
    $first = invoiceSetup();
    $second = invoiceSetup();
    $unratedTaxCategory = TaxCategory::factory()->create();
    $unratedProduct = Product::factory()
        ->for($first['user'])
        ->for(Category::factory()->for($first['user'])->create())
        ->for(Unit::factory()->create())
        ->for($unratedTaxCategory)
        ->create();

    $this->actingAs($first['user'])
        ->post(route('invoices.store'), invoicePayload($first['customer'], $unratedProduct))
        ->assertSessionHasErrors('items.0.product_id');

    expect(InvoiceSequence::query()->where('user_id', $first['user']->id)->exists())->toBeFalse();

    $invoiceOne = createInvoiceFor($first['user'], $first['customer'], $first['product']);
    $invoiceTwo = createInvoiceFor($first['user'], $first['customer'], $first['product']);
    $otherInvoice = createInvoiceFor($second['user'], $second['customer'], $second['product']);

    expect($invoiceOne->invoice_number)->toBe('INV-000001')
        ->and($invoiceTwo->invoice_number)->toBe('INV-000002')
        ->and($otherInvoice->invoice_number)->toBe('INV-000001');
});

test('valid invoice calculates authoritative item values and totals', function () {
    $setup = invoiceSetup();

    $this->actingAs($setup['user'])
        ->post(route('invoices.store'), invoicePayload($setup['customer'], $setup['product'], [
            'subtotal' => '999999',
            'items' => [
                [
                    'product_id' => $setup['product']->id,
                    'quantity' => '2',
                    'unit_price' => '100',
                    'discount_rate' => '10',
                    'line_total' => '1',
                ],
            ],
        ]))
        ->assertRedirect();

    $invoice = Invoice::query()->with('items')->firstOrFail();
    $item = $invoice->items->first();

    expect($invoice->subtotal)->toBe('200.0000')
        ->and($invoice->discount_total)->toBe('20.0000')
        ->and($invoice->tax_exclusive_total)->toBe('180.0000')
        ->and($invoice->tax_total)->toBe('13.5000')
        ->and($invoice->tax_inclusive_total)->toBe('193.5000')
        ->and($invoice->payable_amount)->toBe('193.5000')
        ->and($item->product_sku)->toBe('PRD-000001')
        ->and($item->item_name)->toBe('POS Terminal')
        ->and($item->unit_code)->toBe('PCS')
        ->and($item->tax_category_code)->toBe(TaxCategory::CODE_STANDARD)
        ->and($item->tax_treatment)->toBe(TaxCategory::TREATMENT_TAXABLE)
        ->and($item->tax_rate)->toBe('7.5000');
});

test('draft invoices can be edited and deleted', function () {
    $setup = invoiceSetup();
    $invoice = createInvoiceFor($setup['user'], $setup['customer'], $setup['product']);

    $this->actingAs($setup['user'])
        ->put(route('invoices.update', $invoice), invoicePayload($setup['customer'], $setup['product'], [
            'notes' => 'Updated',
            'items' => [
                [
                    'product_id' => $setup['product']->id,
                    'quantity' => '1',
                    'unit_price' => '50',
                    'discount_rate' => '0',
                ],
            ],
        ]))
        ->assertRedirect(route('invoices.show', $invoice));

    expect($invoice->refresh()->notes)->toBe('Updated')
        ->and($invoice->items()->count())->toBe(1)
        ->and($invoice->payable_amount)->toBe('53.7500');

    $this->actingAs($setup['user'])
        ->delete(route('invoices.destroy', $invoice))
        ->assertRedirect(route('invoices.index'));

    $this->assertDatabaseMissing('invoices', ['id' => $invoice->id]);
});

test('issuing invoice creates snapshots and makes invoice immutable', function () {
    $setup = invoiceSetup();
    $invoice = createInvoiceFor($setup['user'], $setup['customer'], $setup['product']);

    $this->actingAs($setup['user'])
        ->patch(route('invoices.issue', $invoice))
        ->assertRedirect(route('invoices.show', $invoice));

    $invoice->refresh()->load(['supplierSnapshot', 'customerSnapshot']);

    expect($invoice->status)->toBe(Invoice::STATUS_ISSUED)
        ->and($invoice->issued_at)->not->toBeNull()
        ->and($invoice->supplierSnapshot->name)->toBe('Acme Limited')
        ->and($invoice->customerSnapshot->name)->toBe('Beta Stores')
        ->and($invoice->partySnapshots()->count())->toBe(2);

    $setup['customer']->update(['name' => 'Changed Customer']);
    $setup['product']->update(['name' => 'Changed Product', 'selling_price' => '999.0000']);

    expect($invoice->customerSnapshot->refresh()->name)->toBe('Beta Stores')
        ->and($invoice->items()->first()->item_name)->toBe('POS Terminal');

    $this->actingAs($setup['user'])
        ->put(route('invoices.update', $invoice), invoicePayload($setup['customer'], $setup['product']))
        ->assertSessionHasErrors('invoice');

    $this->actingAs($setup['user'])
        ->delete(route('invoices.destroy', $invoice))
        ->assertSessionHasErrors('invoice');

    $this->actingAs($setup['user'])
        ->patch(route('invoices.issue', $invoice))
        ->assertSessionHasErrors('invoice');

    expect($invoice->partySnapshots()->count())->toBe(2);
});

test('B2B invoices require customer tin', function () {
    $setup = invoiceSetup();
    $setup['customer']->update(['tin' => null]);

    $this->actingAs($setup['user'])
        ->post(route('invoices.store'), invoicePayload($setup['customer'], $setup['product'], [
            'invoice_kind' => Invoice::KIND_B2B,
        ]))
        ->assertSessionHasErrors('customer_id');
});

test('invoice validation rejects invalid line inputs and unclassified products', function () {
    $setup = invoiceSetup();
    $unclassifiedProduct = Product::factory()
        ->for($setup['user'])
        ->for(Category::factory()->for($setup['user'])->create())
        ->for(Unit::factory()->create())
        ->create(['tax_category_id' => null]);

    $this->actingAs($setup['user'])
        ->post(route('invoices.store'), invoicePayload($setup['customer'], $setup['product'], [
            'due_date' => '2026-07-01',
            'items' => [
                [
                    'product_id' => $setup['product']->id,
                    'quantity' => '0',
                    'unit_price' => '-1',
                    'discount_rate' => '101',
                ],
            ],
        ]))
        ->assertSessionHasErrors([
            'due_date',
            'items.0.quantity',
            'items.0.unit_price',
            'items.0.discount_rate',
        ]);

    $this->actingAs($setup['user'])
        ->post(route('invoices.store'), invoicePayload($setup['customer'], $unclassifiedProduct))
        ->assertSessionHasErrors('items.0.product_id');
});

test('customer and product referenced by invoices cannot be deleted', function () {
    $setup = invoiceSetup();
    createInvoiceFor($setup['user'], $setup['customer'], $setup['product']);

    $this->actingAs($setup['user'])
        ->delete(route('customers.destroy', $setup['customer']))
        ->assertSessionHasErrors('customer');

    $this->actingAs($setup['user'])
        ->delete(route('products.destroy', $setup['product']))
        ->assertSessionHasErrors('product');
});

test('zero tax treatments preserve their treatment on invoice items', function (string $code, string $treatment) {
    $setup = invoiceSetup();
    $taxCategory = TaxCategory::factory()->create([
        'code' => $code,
        'name' => $code,
        'treatment' => $treatment,
    ]);
    TaxRate::factory()->for($taxCategory)->create(['rate' => '0.0000']);
    $setup['product']->update(['tax_category_id' => $taxCategory->id]);

    $invoice = createInvoiceFor($setup['user'], $setup['customer'], $setup['product']);
    $item = $invoice->items()->firstOrFail();

    expect($item->tax_amount)->toBe('0.0000')
        ->and($item->tax_treatment)->toBe($treatment)
        ->and($item->tax_category_code)->toBe($code);
})->with([
    [TaxCategory::CODE_ZERO_RATED, TaxCategory::TREATMENT_ZERO_RATED],
    [TaxCategory::CODE_EXEMPT, TaxCategory::TREATMENT_EXEMPT],
    [TaxCategory::CODE_OUT_OF_SCOPE, TaxCategory::TREATMENT_OUT_OF_SCOPE],
]);
