<?php

namespace App\Http\Controllers;

use App\Services\Sales\SalesSummaryService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SalesController extends Controller
{
    public function index(Request $request, SalesSummaryService $service): Response
    {
        $filters = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'customer_id' => [
                'nullable',
                'integer',
                Rule::exists('customers', 'id')->where('user_id', $request->user()?->id),
            ],
            'product_id' => [
                'nullable',
                'integer',
                Rule::exists('products', 'id')->where('user_id', $request->user()?->id),
            ],
        ]);
        $user = $request->user();

        return Inertia::render('sales/index', [
            'summary' => $service->summary($user, $filters),
            'filters' => $filters,
            'customers' => $user->customers()->orderBy('name')->get(['id', 'name']),
            'products' => $user->products()->orderBy('name')->get(['id', 'sku', 'name', 'item_type']),
        ]);
    }
}
