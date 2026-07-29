<?php

use App\Http\Controllers\BusinessController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\InventoryAdjustmentController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\TaxController;
use App\Http\Controllers\WarehouseController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('business', [BusinessController::class, 'show'])->name('business.show');
    Route::get('business/edit', [BusinessController::class, 'edit'])->name('business.edit');
    Route::put('business', [BusinessController::class, 'update'])->name('business.update');

    Route::resource('customers', CustomerController::class);
    Route::match(['post', 'patch'], 'invoices/{invoice}/issue', [InvoiceController::class, 'issue'])->name('invoices.issue');
    Route::patch('invoices/{invoice}/payment-status', [InvoiceController::class, 'paymentStatus'])->name('invoices.payment-status');
    Route::resource('invoices', InvoiceController::class);
    Route::patch('categories/{category}/status', [CategoryController::class, 'status'])->name('categories.status');
    Route::resource('categories', CategoryController::class)->except('show');
    Route::patch('products/{product}/status', [ProductController::class, 'status'])->name('products.status');
    Route::resource('products', ProductController::class)->except('show');
    Route::get('taxes', [TaxController::class, 'index'])->name('taxes.index');
    Route::patch('warehouses/{warehouse}/default', [WarehouseController::class, 'default'])->name('warehouses.default');
    Route::patch('warehouses/{warehouse}/status', [WarehouseController::class, 'status'])->name('warehouses.status');
    Route::resource('warehouses', WarehouseController::class)->except('show');
    Route::get('inventory/movements', [InventoryController::class, 'movements'])->name('inventory.movements');
    Route::get('inventory/products/{product}', [InventoryController::class, 'product'])->name('inventory.products.show');
    Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::post('inventory-adjustments/{inventoryAdjustment}/post', [InventoryAdjustmentController::class, 'post'])
        ->name('inventory-adjustments.post');
    Route::resource('inventory-adjustments', InventoryAdjustmentController::class);
    Route::get('sales', [SalesController::class, 'index'])->name('sales.index');
});

require __DIR__.'/settings.php';
