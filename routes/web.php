<?php

use App\Http\Controllers\BusinessController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('business', [BusinessController::class, 'show'])->name('business.show');
    Route::get('business/edit', [BusinessController::class, 'edit'])->name('business.edit');
    Route::put('business', [BusinessController::class, 'update'])->name('business.update');
});

require __DIR__.'/settings.php';
