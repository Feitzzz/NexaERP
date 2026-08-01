<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $issuedInvoices = $user->invoices()->where('status', Invoice::STATUS_ISSUED);
        $revenue = (clone $issuedInvoices)->sum('payable_amount');
        $outstandingQuery = (clone $issuedInvoices)->where('payment_status', '!=', Invoice::PAYMENT_PAID);

        $products = $user->products()
            ->where('track_inventory', true)
            ->with('unit')
            ->withSum('inventoryBalances as total_quantity_on_hand', 'quantity_on_hand')
            ->get();
        $lowStock = $products->filter(fn (Product $product) => $product->reorder_level !== null
            && (float) ($product->total_quantity_on_hand ?? 0) <= (float) $product->reorder_level)->values();

        $recentInvoices = $user->invoices()->with('customer:id,name')->latest('updated_at')->limit(5)->get([
            'id', 'customer_id', 'invoice_number', 'issue_date', 'status', 'payment_status',
            'payable_amount', 'currency_code', 'updated_at',
        ]);

        $activity = collect()
            ->merge($user->invoices()->with('customer:id,name')->latest()->limit(3)->get()->map(fn (Invoice $invoice) => [
                'id' => 'invoice-'.$invoice->id, 'type' => 'invoice',
                'title' => "Invoice {$invoice->invoice_number} ".strtolower($invoice->status),
                'detail' => $invoice->customer?->name, 'occurred_at' => $invoice->updated_at,
            ]))
            ->merge($user->customers()->latest()->limit(2)->get()->map(fn ($customer) => [
                'id' => 'customer-'.$customer->id, 'type' => 'customer', 'title' => 'Customer added',
                'detail' => $customer->name, 'occurred_at' => $customer->created_at,
            ]))
            ->merge($user->products()->latest()->limit(2)->get()->map(fn ($product) => [
                'id' => 'product-'.$product->id, 'type' => 'product', 'title' => 'Product created',
                'detail' => $product->name, 'occurred_at' => $product->created_at,
            ]))
            ->sortByDesc('occurred_at')->take(5)->values()->map(fn (array $item) => [
                ...$item, 'occurred_at' => $item['occurred_at']?->toISOString(),
            ]);

        return Inertia::render('dashboard', [
            'business' => ['name' => $user->name, 'email' => $user->email],
            'metrics' => [
                'revenue' => (float) $revenue,
                'invoices_issued' => (clone $issuedInvoices)->count(),
                'outstanding' => (float) (clone $outstandingQuery)->sum('payable_amount'),
                'outstanding_customers' => (clone $outstandingQuery)->distinct()->count('customer_id'),
                'customers' => $user->customers()->count(),
                'active_customers' => $user->customers()->where('is_active', true)->count(),
                'products' => $user->products()->count(),
                'active_products' => $user->products()->where('is_active', true)->count(),
                'low_stock' => $lowStock->count(),
            ],
            'recentInvoices' => $recentInvoices,
            'lowStockItems' => $lowStock->take(5)->map(fn (Product $product) => [
                'id' => $product->id, 'name' => $product->name, 'sku' => $product->sku,
                'quantity' => (float) ($product->total_quantity_on_hand ?? 0),
                'reorder_level' => (float) $product->reorder_level, 'unit' => $product->unit?->code,
            ]),
            'activity' => $activity,
        ]);
    }
}
