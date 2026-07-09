<?php

use App\Http\Controllers\BusinessController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('business', [BusinessController::class, 'show'])->name('business.show');
    Route::get('business/edit', [BusinessController::class, 'edit'])->name('business.edit');
    Route::put('business', [BusinessController::class, 'update'])->name('business.update');

    Route::resource('customers', CustomerController::class);
    Route::patch('categories/{category}/status', [CategoryController::class, 'status'])->name('categories.status');
    Route::resource('categories', CategoryController::class)->except('show');
    Route::patch('products/{product}/status', [ProductController::class, 'status'])->name('products.status');
    Route::resource('products', ProductController::class)->except('show');
});

require __DIR__.'/settings.php';
