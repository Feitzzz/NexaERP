<?php

use App\Models\Category;
use App\Models\Customer;
use App\Models\InventoryAdjustment;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\TaxCategory;
use App\Models\Unit;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function tenantAuthorizationRecords(User $user, string $suffix): array
{
    $category = Category::factory()->for($user)->create(['name' => "Category {$suffix}"]);
    $unit = Unit::factory()->create();
    $taxCategory = TaxCategory::factory()->create();
    $product = Product::factory()
        ->for($user)
        ->for($category)
        ->for($unit)
        ->for($taxCategory)
        ->create(['name' => "Product {$suffix}"]);
    $customer = Customer::factory()->for($user)->create(['name' => "Customer {$suffix}"]);
    $warehouse = Warehouse::create([
        'user_id' => $user->id,
        'code' => "WH-{$suffix}",
        'name' => "Warehouse {$suffix}",
        'is_default' => true,
        'is_active' => true,
    ]);
    $invoice = Invoice::create([
        'user_id' => $user->id,
        'customer_id' => $customer->id,
        'warehouse_id' => $warehouse->id,
        'sequence_number' => 1,
        'invoice_number' => "INV-{$suffix}",
        'invoice_kind' => Invoice::KIND_B2C,
        'status' => Invoice::STATUS_DRAFT,
        'payment_status' => Invoice::PAYMENT_PENDING,
        'issue_date' => '2026-07-29',
        'issue_time' => '10:00:00',
        'due_date' => '2026-07-29',
        'tax_point_date' => '2026-07-29',
    ]);
    $adjustment = InventoryAdjustment::create([
        'user_id' => $user->id,
        'warehouse_id' => $warehouse->id,
        'adjustment_number' => "ADJ-{$suffix}",
        'status' => InventoryAdjustment::DRAFT,
        'reason' => 'MANUAL_ADJUSTMENT',
    ]);

    return compact('category', 'product', 'customer', 'warehouse', 'invoice', 'adjustment');
}

test('owners can resolve and view each tenant resource', function () {
    $user = User::factory()->create();
    $records = tenantAuthorizationRecords($user, 'OWNER');

    $this->actingAs($user)->get(route('customers.show', $records['customer']))->assertOk();
    $this->actingAs($user)->get(route('categories.edit', $records['category']))->assertOk();
    $this->actingAs($user)->get(route('products.edit', $records['product']))->assertOk();
    $this->actingAs($user)->get(route('invoices.show', $records['invoice']))->assertOk();
    $this->actingAs($user)->get(route('warehouses.edit', $records['warehouse']))->assertOk();
    $this->actingAs($user)->get(route('inventory-adjustments.show', $records['adjustment']))->assertOk();
});

test('tenant policies grant every standard and custom ability only to owners', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $records = tenantAuthorizationRecords($owner, 'POLICY');

    $abilities = [
        'customer' => ['view', 'update', 'delete'],
        'category' => ['view', 'update', 'delete', 'changeStatus'],
        'product' => ['view', 'update', 'delete', 'changeStatus'],
        'invoice' => ['view', 'update', 'delete', 'issue'],
        'warehouse' => ['view', 'update', 'delete', 'changeStatus', 'makeDefault'],
        'adjustment' => ['view', 'update', 'delete', 'post'],
    ];

    foreach ($abilities as $resource => $resourceAbilities) {
        foreach ($resourceAbilities as $ability) {
            expect(Gate::forUser($owner)->allows($ability, $records[$resource]))->toBeTrue()
                ->and(Gate::forUser($other)->allows($ability, $records[$resource]))->toBeFalse();
        }
    }

    foreach ([
        Customer::class,
        Category::class,
        Product::class,
        Invoice::class,
        Warehouse::class,
        InventoryAdjustment::class,
    ] as $modelClass) {
        expect(Gate::forUser($owner)->allows('viewAny', $modelClass))->toBeTrue()
            ->and(Gate::forUser($owner)->allows('create', $modelClass))->toBeTrue();
    }
});

test('tenant binding conceals foreign resources from view update and delete actions', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $records = tenantAuthorizationRecords($owner, 'FOREIGN');

    $routes = [
        ['customers.show', 'customers.update', 'customers.destroy', $records['customer']],
        ['categories.edit', 'categories.update', 'categories.destroy', $records['category']],
        ['products.edit', 'products.update', 'products.destroy', $records['product']],
        ['invoices.show', 'invoices.update', 'invoices.destroy', $records['invoice']],
        ['warehouses.edit', 'warehouses.update', 'warehouses.destroy', $records['warehouse']],
        ['inventory-adjustments.show', 'inventory-adjustments.update', 'inventory-adjustments.destroy', $records['adjustment']],
    ];

    foreach ($routes as [$view, $update, $delete, $model]) {
        $this->actingAs($other)->get(route($view, $model))->assertNotFound();
        $this->actingAs($other)->put(route($update, $model))->assertNotFound();
        $this->actingAs($other)->delete(route($delete, $model))->assertNotFound();
    }
});

test('tenant binding conceals foreign resources from every custom action', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $records = tenantAuthorizationRecords($owner, 'CUSTOM');

    $this->actingAs($other)->patch(route('categories.status', $records['category']))->assertNotFound();
    $this->actingAs($other)->patch(route('products.status', $records['product']))->assertNotFound();
    $this->actingAs($other)->patch(route('warehouses.status', $records['warehouse']))->assertNotFound();
    $this->actingAs($other)->patch(route('warehouses.default', $records['warehouse']))->assertNotFound();
    $this->actingAs($other)->post(route('invoices.issue', $records['invoice']))->assertNotFound();
    $this->actingAs($other)->patch(route('invoices.payment-status', $records['invoice']), [
        'payment_status' => Invoice::PAYMENT_PAID,
    ])->assertNotFound();
    $this->actingAs($other)->post(route('inventory-adjustments.post', $records['adjustment']))->assertNotFound();
});

test('every tenant resource index is isolated to the authenticated user', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $owned = tenantAuthorizationRecords($user, 'OWNED');
    tenantAuthorizationRecords($other, 'OTHER');

    $this->actingAs($user)->get(route('customers.index'))
        ->assertInertia(fn (Assert $page) => $page->has('customers.data', 1)
            ->where('customers.data.0.id', $owned['customer']->id));
    $this->actingAs($user)->get(route('categories.index'))
        ->assertInertia(fn (Assert $page) => $page->has('categories.data', 1)
            ->where('categories.data.0.id', $owned['category']->id));
    $this->actingAs($user)->get(route('products.index'))
        ->assertInertia(fn (Assert $page) => $page->has('products.data', 1)
            ->where('products.data.0.id', $owned['product']->id));
    $this->actingAs($user)->get(route('invoices.index'))
        ->assertInertia(fn (Assert $page) => $page->has('invoices.data', 1)
            ->where('invoices.data.0.id', $owned['invoice']->id));
    $this->actingAs($user)->get(route('warehouses.index'))
        ->assertInertia(fn (Assert $page) => $page->has('warehouses.data', 1)
            ->where('warehouses.data.0.id', $owned['warehouse']->id));
    $this->actingAs($user)->get(route('inventory-adjustments.index'))
        ->assertInertia(fn (Assert $page) => $page->has('adjustments.data', 1)
            ->where('adjustments.data.0.id', $owned['adjustment']->id));
});

test('tenant-scoped validation rejects foreign association ids', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    tenantAuthorizationRecords($user, 'VALID');
    $foreign = tenantAuthorizationRecords($other, 'INVALID');

    $this->actingAs($user)->post(route('products.store'), [
        'name' => 'Invalid product',
        'category_id' => $foreign['category']->id,
        'unit_id' => Unit::factory()->create()->id,
        'tax_category_id' => TaxCategory::factory()->create()->id,
        'item_type' => Product::TYPE_PRODUCT,
        'selling_price' => '10',
    ])->assertSessionHasErrors('category_id');

    $this->actingAs($user)->post(route('invoices.store'), [
        'customer_id' => $foreign['customer']->id,
        'warehouse_id' => $foreign['warehouse']->id,
        'invoice_kind' => Invoice::KIND_B2C,
        'issue_date' => '2026-07-29',
        'due_date' => '2026-07-29',
        'tax_point_date' => '2026-07-29',
        'items' => [[
            'product_id' => $foreign['product']->id,
            'quantity' => '1',
            'unit_price' => '10',
        ]],
    ])->assertSessionHasErrors(['customer_id', 'warehouse_id', 'items.0.product_id']);

    $this->actingAs($user)->post(route('inventory-adjustments.store'), [
        'warehouse_id' => $foreign['warehouse']->id,
        'reason' => 'MANUAL_ADJUSTMENT',
        'lines' => [[
            'product_id' => $foreign['product']->id,
            'quantity_delta' => '1',
        ]],
    ])->assertSessionHasErrors(['warehouse_id', 'lines.0.product_id']);
});

test('warehouse owners can change warehouse status', function () {
    $user = User::factory()->create();
    $records = tenantAuthorizationRecords($user, 'STATUS');

    $this->actingAs($user)
        ->patch(route('warehouses.status', $records['warehouse']))
        ->assertRedirect();

    expect($records['warehouse']->refresh()->is_active)->toBeFalse();
});

dataset('guest tenant routes', [
    'customers' => ['customers.index'],
    'categories' => ['categories.index'],
    'products' => ['products.index'],
    'invoices' => ['invoices.index'],
    'warehouses' => ['warehouses.index'],
    'inventory adjustments' => ['inventory-adjustments.index'],
    'inventory balances' => ['inventory.index'],
    'stock movements' => ['inventory.movements'],
]);

test('guests are rejected from tenant resources', function (string $routeName) {
    $this->get(route($routeName))->assertRedirect(route('login'));
})->with('guest tenant routes');
