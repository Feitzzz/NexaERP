<?php

use App\Models\Address;
use App\Models\Category;
use App\Models\Customer;
use App\Models\InventoryAdjustment;
use App\Models\InventoryBalance;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\TaxCategory;
use App\Models\TaxRate;
use App\Models\Unit;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function inventoryOperationsSetup(): array
{
    $address = Address::factory()->create();
    $user = User::factory()->create(['phone' => '08030000000', 'address_id' => $address->id]);
    $category = Category::factory()->for($user)->create();
    $unit = Unit::factory()->create();
    $taxCategory = TaxCategory::factory()->create();
    TaxRate::factory()->for($taxCategory)->create(['rate' => '7.5000', 'effective_from' => '2020-01-01']);
    $product = Product::factory()->tracked()->for($user)->for($category)->for($unit)->for($taxCategory)->create();
    $service = Product::factory()->service()->for($user)->for($category)->for($unit)->for($taxCategory)->create();
    $warehouse = Warehouse::create([
        'user_id' => $user->id, 'code' => 'MAIN', 'name' => 'Main Warehouse',
        'is_default' => true, 'is_active' => true,
    ]);

    return compact('user', 'category', 'unit', 'taxCategory', 'product', 'service', 'warehouse');
}

function adjustmentPayload(array $setup, string $delta = '10', array $overrides = []): array
{
    return [
        'warehouse_id' => $setup['warehouse']->id,
        'reason' => 'OPENING_STOCK',
        'notes' => 'Opening count',
        'lines' => [[
            'product_id' => $setup['product']->id,
            'quantity_delta' => $delta,
            'unit_cost' => '25',
            'notes' => 'Counted',
        ]],
        ...$overrides,
    ];
}

function createAdjustment(array $setup, string $delta = '10'): InventoryAdjustment
{
    test()->actingAs($setup['user'])->post(route('inventory-adjustments.store'), adjustmentPayload($setup, $delta))->assertRedirect();

    return InventoryAdjustment::query()->latest('id')->firstOrFail();
}

test('warehouses are unique per business and isolated', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $this->actingAs($user)->post(route('warehouses.store'), [
        'code' => 'main', 'name' => 'Main Warehouse', 'is_active' => true,
    ])->assertRedirect(route('warehouses.index'));

    $this->actingAs($user)->post(route('warehouses.store'), [
        'code' => 'MAIN', 'name' => 'Other Name', 'is_active' => true,
    ])->assertSessionHasErrors('code');

    $this->actingAs($other)->post(route('warehouses.store'), [
        'code' => 'MAIN', 'name' => 'Main Warehouse', 'is_active' => true,
    ])->assertRedirect();

    $warehouse = $user->warehouses()->firstOrFail();
    $this->actingAs($other)->get(route('warehouses.edit', $warehouse))->assertNotFound();
});

test('only one warehouse is default', function () {
    $setup = inventoryOperationsSetup();
    $second = Warehouse::create([
        'user_id' => $setup['user']->id, 'code' => 'SECOND', 'name' => 'Second',
        'is_default' => false, 'is_active' => true,
    ]);

    $this->actingAs($setup['user'])->patch(route('warehouses.default', $second))->assertRedirect();

    expect($setup['warehouse']->refresh()->is_default)->toBeFalse()
        ->and($second->refresh()->is_default)->toBeTrue();
});

test('products may track stock but services may not', function () {
    $setup = inventoryOperationsSetup();

    $this->actingAs($setup['user'])->put(route('products.update', $setup['service']), [
        'name' => $setup['service']->name,
        'category_id' => $setup['category']->id,
        'unit_id' => $setup['unit']->id,
        'tax_category_id' => $setup['taxCategory']->id,
        'item_type' => Product::TYPE_SERVICE,
        'selling_price' => '10',
        'track_inventory' => true,
        'reorder_level' => '2',
        'is_active' => true,
    ])->assertSessionHasErrors('track_inventory');

    expect($setup['product']->track_inventory)->toBeTrue()
        ->and($setup['service']->refresh()->track_inventory)->toBeFalse();
});

test('posting opening stock creates balance and immutable movement', function () {
    $setup = inventoryOperationsSetup();
    $adjustment = createAdjustment($setup);

    expect(InventoryBalance::query()->count())->toBe(0);
    $this->actingAs($setup['user'])->post(route('inventory-adjustments.post', $adjustment))->assertRedirect();

    $movement = StockMovement::query()->firstOrFail();
    expect($adjustment->refresh()->status)->toBe(InventoryAdjustment::POSTED)
        ->and($adjustment->posted_at)->not->toBeNull()
        ->and(InventoryBalance::query()->value('quantity_on_hand'))->toBe('10.0000')
        ->and($movement->movement_type)->toBe(StockMovement::OPENING_BALANCE)
        ->and($movement->direction)->toBe(StockMovement::IN)
        ->and($movement->balance_before)->toBe('0.0000')
        ->and($movement->balance_after)->toBe('10.0000')
        ->and($movement->reference_type)->toBe('App\\Models\\InventoryAdjustmentLine');
});

test('negative adjustments reduce stock and cannot make it negative', function () {
    $setup = inventoryOperationsSetup();
    $opening = createAdjustment($setup, '10');
    $this->actingAs($setup['user'])->post(route('inventory-adjustments.post', $opening));

    $decrease = createAdjustment($setup, '-4');
    $this->actingAs($setup['user'])->post(route('inventory-adjustments.post', $decrease))->assertRedirect();
    expect(InventoryBalance::query()->value('quantity_on_hand'))->toBe('6.0000');

    $invalid = createAdjustment($setup, '-7');
    $this->actingAs($setup['user'])->post(route('inventory-adjustments.post', $invalid))->assertSessionHasErrors('stock');
    expect(InventoryBalance::query()->value('quantity_on_hand'))->toBe('6.0000')
        ->and($invalid->refresh()->status)->toBe(InventoryAdjustment::DRAFT)
        ->and(StockMovement::query()->count())->toBe(2);
});

test('posted adjustments cannot be changed deleted or posted twice', function () {
    $setup = inventoryOperationsSetup();
    $adjustment = createAdjustment($setup);
    $this->actingAs($setup['user'])->post(route('inventory-adjustments.post', $adjustment));

    $this->actingAs($setup['user'])->put(route('inventory-adjustments.update', $adjustment), adjustmentPayload($setup, '20'))
        ->assertForbidden();
    $this->actingAs($setup['user'])->delete(route('inventory-adjustments.destroy', $adjustment))
        ->assertForbidden();
    $this->actingAs($setup['user'])->post(route('inventory-adjustments.post', $adjustment))
        ->assertForbidden();

    expect(StockMovement::query()->count())->toBe(1);
});

test('adjustments exclude services non tracked products and other businesses', function () {
    $setup = inventoryOperationsSetup();
    $nonTracked = Product::factory()->for($setup['user'])->for($setup['category'])
        ->for($setup['unit'])->for($setup['taxCategory'])->create();
    $other = inventoryOperationsSetup();

    foreach ([$setup['service'], $nonTracked, $other['product']] as $product) {
        $this->actingAs($setup['user'])->post(route('inventory-adjustments.store'), adjustmentPayload($setup, '1', [
            'lines' => [['product_id' => $product->id, 'quantity_delta' => '1']],
        ]))->assertSessionHasErrors('lines.0.product_id');
    }
});

test('inactive warehouse cannot post stock', function () {
    $setup = inventoryOperationsSetup();
    $adjustment = createAdjustment($setup);
    $setup['warehouse']->update(['is_active' => false]);

    $this->actingAs($setup['user'])->post(route('inventory-adjustments.post', $adjustment))
        ->assertSessionHasErrors('warehouse_id');
    expect(InventoryBalance::query()->count())->toBe(0);
});

test('inventory pages are ownership scoped and movements are read only', function () {
    $setup = inventoryOperationsSetup();
    $other = inventoryOperationsSetup();
    $opening = createAdjustment($other);
    $this->actingAs($other['user'])->post(route('inventory-adjustments.post', $opening));

    $this->actingAs($setup['user'])->get(route('inventory.index'))
        ->assertInertia(fn (Assert $page) => $page->component('inventory/index')
            ->has('balances.data', 1)
            ->where('balances.data.0.id', $setup['product']->id));
    $this->actingAs($setup['user'])->get(route('inventory.products.show', $other['product']))->assertNotFound();
    $this->actingAs($setup['user'])->get(route('inventory.movements'))
        ->assertInertia(fn (Assert $page) => $page->component('inventory/movements')->has('movements.data', 0));

    expect(route('inventory.movements'))->not->toBeEmpty();
});

test('issued tracked-product invoice reduces stock exactly once', function () {
    $setup = inventoryOperationsSetup();
    $customer = Customer::factory()->for($setup['user'])->create();
    $opening = createAdjustment($setup, '10');
    $this->actingAs($setup['user'])->post(route('inventory-adjustments.post', $opening));

    $this->actingAs($setup['user'])->post(route('invoices.store'), [
        'customer_id' => $customer->id,
        'warehouse_id' => $setup['warehouse']->id,
        'invoice_kind' => Invoice::KIND_B2C,
        'issue_date' => '2026-07-29', 'due_date' => '2026-07-29', 'tax_point_date' => '2026-07-29',
        'items' => [['product_id' => $setup['product']->id, 'quantity' => '3', 'unit_price' => '10']],
    ])->assertRedirect();
    $invoice = Invoice::query()->firstOrFail();

    expect(InventoryBalance::query()->value('quantity_on_hand'))->toBe('10.0000');
    $this->actingAs($setup['user'])->post(route('invoices.issue', $invoice))->assertRedirect();
    expect(InventoryBalance::query()->value('quantity_on_hand'))->toBe('7.0000')
        ->and($invoice->refresh()->stock_posted_at)->not->toBeNull()
        ->and(StockMovement::query()->where('movement_type', StockMovement::SALE_ISSUE)->count())->toBe(1);

    $this->actingAs($setup['user'])->post(route('invoices.issue', $invoice))->assertForbidden();
    expect(InventoryBalance::query()->value('quantity_on_hand'))->toBe('7.0000');
});

test('invoice stock failure is atomic and leaves invoice draft', function () {
    $setup = inventoryOperationsSetup();
    $customer = Customer::factory()->for($setup['user'])->create();
    $this->actingAs($setup['user'])->post(route('invoices.store'), [
        'customer_id' => $customer->id,
        'warehouse_id' => $setup['warehouse']->id,
        'invoice_kind' => Invoice::KIND_B2C,
        'issue_date' => '2026-07-29', 'due_date' => '2026-07-29', 'tax_point_date' => '2026-07-29',
        'items' => [['product_id' => $setup['product']->id, 'quantity' => '1', 'unit_price' => '10']],
    ]);
    $invoice = Invoice::query()->firstOrFail();

    $this->actingAs($setup['user'])->post(route('invoices.issue', $invoice))->assertSessionHasErrors('stock');
    expect($invoice->refresh()->status)->toBe(Invoice::STATUS_DRAFT)
        ->and($invoice->partySnapshots()->count())->toBe(0)
        ->and(StockMovement::query()->count())->toBe(0);
});

test('tracked invoice requires warehouse while service invoice has no stock impact', function () {
    $setup = inventoryOperationsSetup();
    $customer = Customer::factory()->for($setup['user'])->create();
    $base = [
        'customer_id' => $customer->id, 'invoice_kind' => Invoice::KIND_B2C,
        'issue_date' => '2026-07-29', 'due_date' => '2026-07-29', 'tax_point_date' => '2026-07-29',
    ];
    $this->actingAs($setup['user'])->post(route('invoices.store'), [
        ...$base, 'items' => [['product_id' => $setup['product']->id, 'quantity' => '1', 'unit_price' => '10']],
    ]);
    $trackedInvoice = Invoice::query()->latest('id')->firstOrFail();
    $this->actingAs($setup['user'])->post(route('invoices.issue', $trackedInvoice))
        ->assertSessionHasErrors('warehouse_id');

    $this->actingAs($setup['user'])->post(route('invoices.store'), [
        ...$base, 'items' => [['product_id' => $setup['service']->id, 'quantity' => '1', 'unit_price' => '10']],
    ]);
    $serviceInvoice = Invoice::query()->latest('id')->firstOrFail();
    $this->actingAs($setup['user'])->post(route('invoices.issue', $serviceInvoice))->assertRedirect();
    expect($serviceInvoice->refresh()->status)->toBe(Invoice::STATUS_ISSUED)
        ->and($serviceInvoice->stock_posted_at)->toBeNull()
        ->and(StockMovement::query()->count())->toBe(0);
});

test('sales summary contains issued invoices only and is business scoped', function () {
    $setup = inventoryOperationsSetup();
    $customer = Customer::factory()->for($setup['user'])->create();
    Invoice::create([
        'user_id' => $setup['user']->id, 'customer_id' => $customer->id,
        'sequence_number' => 1, 'invoice_number' => 'INV-1', 'invoice_kind' => 'B2C',
        'status' => Invoice::STATUS_ISSUED, 'payment_status' => 'PENDING',
        'issue_date' => '2026-07-29', 'issue_time' => '10:00:00', 'due_date' => '2026-07-29',
        'tax_point_date' => '2026-07-29', 'payable_amount' => '100', 'issued_at' => now(),
    ]);
    Invoice::create([
        'user_id' => $setup['user']->id, 'customer_id' => $customer->id,
        'sequence_number' => 2, 'invoice_number' => 'INV-2', 'invoice_kind' => 'B2C',
        'status' => Invoice::STATUS_DRAFT, 'payment_status' => 'PENDING',
        'issue_date' => '2026-07-29', 'issue_time' => '10:00:00', 'due_date' => '2026-07-29',
        'tax_point_date' => '2026-07-29', 'payable_amount' => '900',
    ]);

    $this->actingAs($setup['user'])->get(route('sales.index'))
        ->assertInertia(fn (Assert $page) => $page->component('sales/index')
            ->where('summary.issued_invoices', 1)
            ->where('summary.total_sales', '100.0000'));
});
