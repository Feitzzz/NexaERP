<?php

namespace App\Services\Sales;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class SalesSummaryService
{
    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function summary(User $user, array $filters): array
    {
        $invoices = $this->issuedInvoices($user, $filters);
        $total = (string) (clone $invoices)->sum('payable_amount');
        $count = (clone $invoices)->count();
        $invoiceIds = (clone $invoices)->select('invoices.id');

        $byCustomer = (clone $invoices)->join('customers', 'customers.id', '=', 'invoices.customer_id')
            ->selectRaw('customers.id, customers.name, SUM(invoices.payable_amount) as total_sales, COUNT(invoices.id) as invoice_count')
            ->groupBy('customers.id', 'customers.name')->orderByDesc('total_sales')->limit(10)->get();

        $byProduct = $user->products()->join('invoice_items', 'invoice_items.product_id', '=', 'products.id')
            ->whereIn('invoice_items.invoice_id', $invoiceIds)
            ->selectRaw('products.id, products.name, products.sku, products.item_type, SUM(invoice_items.quantity) as quantity, SUM(invoice_items.line_total) as total_sales')
            ->groupBy('products.id', 'products.name', 'products.sku', 'products.item_type')
            ->orderByDesc('quantity')->limit(10)->get();

        return [
            'total_sales' => $total,
            'issued_invoices' => $count,
            'average_invoice_value' => $count === 0 ? '0' : bcdiv($total, (string) $count, 4),
            'units_sold' => (string) InvoiceItem::query()->whereIn('invoice_id', (clone $invoiceIds))->sum('quantity'),
            'by_customer' => $byCustomer,
            'by_product' => $byProduct,
            'recent_invoices' => (clone $invoices)->with('customer')->latest('issued_at')->limit(10)->get(),
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Invoice>
     */
    private function issuedInvoices(User $user, array $filters): Builder
    {
        return Invoice::query()->where('invoices.user_id', $user->id)->where('invoices.status', Invoice::STATUS_ISSUED)
            ->when($filters['date_from'] ?? null, fn ($query, $date) => $query->whereDate('invoices.issue_date', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($query, $date) => $query->whereDate('invoices.issue_date', '<=', $date))
            ->when($filters['customer_id'] ?? null, fn ($query, $id) => $query->where('invoices.customer_id', $id))
            ->when($filters['product_id'] ?? null, fn ($query, $id) => $query->whereHas('items', fn ($query) => $query->where('product_id', $id)));
    }
}
