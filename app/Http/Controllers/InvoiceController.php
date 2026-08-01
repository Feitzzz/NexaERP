<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Models\InventoryBalance;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Invoice\InvoiceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Invoice::class);

        /** @var User $user */
        $user = $request->user();
        $search = $request->string('search')->toString();
        $status = $request->string('status')->toString();
        $paymentStatus = $request->string('payment_status')->toString();
        $issueDateFrom = $request->string('issue_date_from')->toString();
        $issueDateTo = $request->string('issue_date_to')->toString();

        $invoices = $user->invoices()
            ->with('customer')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('invoice_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', fn ($query) => $query->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->when($paymentStatus !== '', fn ($query) => $query->where('payment_status', $paymentStatus))
            ->when($issueDateFrom !== '', fn ($query) => $query->whereDate('issue_date', '>=', $issueDateFrom))
            ->when($issueDateTo !== '', fn ($query) => $query->whereDate('issue_date', '<=', $issueDateTo))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('invoices/index', [
            'invoices' => $invoices,
            'summary' => [
                'total' => $user->invoices()->count(),
                'drafts' => $user->invoices()->where('status', Invoice::STATUS_DRAFT)->count(),
                'issued' => $user->invoices()->where('status', Invoice::STATUS_ISSUED)->count(),
                'outstanding' => (float) $user->invoices()->where('status', Invoice::STATUS_ISSUED)
                    ->where('payment_status', '!=', Invoice::PAYMENT_PAID)->sum('payable_amount'),
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
                'payment_status' => $paymentStatus,
                'issue_date_from' => $issueDateFrom,
                'issue_date_to' => $issueDateTo,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Invoice::class);

        /** @var User $user */
        $user = $request->user();

        return Inertia::render('invoices/create', [
            'customers' => $this->customerOptions($user),
            'products' => $this->productOptions($user),
            'warehouses' => $this->warehouseOptions($user),
            'today' => now()->toDateString(),
        ]);
    }

    public function store(StoreInvoiceRequest $request, InvoiceService $invoiceService): RedirectResponse
    {
        $this->authorize('create', Invoice::class);

        /** @var User $user */
        $user = $request->user();
        $invoice = $invoiceService->store($user, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Invoice created.']);

        return redirect()->route('invoices.show', $invoice);
    }

    public function show(Invoice $invoice): Response
    {
        $this->authorize('view', $invoice);

        $invoice->load([
            'customer',
            'items',
            'supplierSnapshot',
            'customerSnapshot',
            'warehouse',
            'items.product',
        ]);
        $invoice->setAttribute('has_inventory_impact', $invoice->items->contains(
            fn ($item) => $item->item_type === Product::TYPE_PRODUCT && $item->product?->track_inventory
        ));

        return Inertia::render('invoices/show', [
            'invoice' => $invoice,
        ]);
    }

    public function edit(Request $request, Invoice $invoice): Response
    {
        $this->authorize('update', $invoice);

        /** @var User $user */
        $user = $request->user();
        $invoice->load('items');

        return Inertia::render('invoices/edit', [
            'invoice' => $invoice,
            'customers' => $this->customerOptions($user),
            'products' => $this->productOptions($user),
            'warehouses' => $this->warehouseOptions($user),
        ]);
    }

    public function update(UpdateInvoiceRequest $request, Invoice $invoice, InvoiceService $invoiceService): RedirectResponse
    {
        $this->authorize('update', $invoice);

        /** @var User $user */
        $user = $request->user();
        $invoice = $invoiceService->update($user, $invoice, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Invoice updated.']);

        return redirect()->route('invoices.show', $invoice);
    }

    public function destroy(Request $request, Invoice $invoice, InvoiceService $invoiceService): RedirectResponse
    {
        $this->authorize('delete', $invoice);

        /** @var User $user */
        $user = $request->user();
        $invoiceService->delete($user, $invoice);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Invoice deleted.']);

        return redirect()->route('invoices.index');
    }

    public function issue(Request $request, Invoice $invoice, InvoiceService $invoiceService): RedirectResponse
    {
        $this->authorize('issue', $invoice);

        /** @var User $user */
        $user = $request->user();
        $invoice = $invoiceService->issue($user, $invoice);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Invoice issued.']);

        return redirect()->route('invoices.show', $invoice);
    }

    public function paymentStatus(Request $request, Invoice $invoice): RedirectResponse
    {
        $this->authorize('updatePaymentStatus', $invoice);

        $data = $request->validate([
            'payment_status' => ['required', Rule::in([
                Invoice::PAYMENT_PENDING,
                Invoice::PAYMENT_PARTIAL,
                Invoice::PAYMENT_PAID,
            ])],
        ]);

        $currentRank = $this->paymentStatusRank($invoice->payment_status);
        $nextRank = $this->paymentStatusRank($data['payment_status']);

        if ($nextRank < $currentRank) {
            throw ValidationException::withMessages([
                'payment_status' => 'Payment status cannot move backward.',
            ]);
        }

        $invoice->update([
            'payment_status' => $data['payment_status'],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Payment status updated.']);

        return redirect()->route('invoices.show', $invoice);
    }

    private function paymentStatusRank(string $paymentStatus): int
    {
        return [
            Invoice::PAYMENT_PENDING => 0,
            Invoice::PAYMENT_PARTIAL => 1,
            Invoice::PAYMENT_PAID => 2,
        ][$paymentStatus];
    }

    /**
     * @return list<array{id: int, name: string, customer_code: string, customer_type: string, tin: string|null}>
     */
    private function customerOptions(User $user): array
    {
        $customers = $user->customers()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'customer_code', 'customer_type', 'tin']);

        $options = [];

        foreach ($customers as $customer) {
            $options[] = [
                'id' => (int) $customer->id,
                'name' => (string) $customer->name,
                'customer_code' => (string) $customer->customer_code,
                'customer_type' => (string) $customer->customer_type,
                'tin' => $customer->tin === null ? null : (string) $customer->tin,
            ];
        }

        return $options;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function productOptions(User $user): array
    {
        $products = Product::query()
            ->with(['unit', 'taxCategory', 'inventoryBalances'])
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->whereNotNull('tax_category_id')
            ->orderBy('name')
            ->get();

        $options = [];

        foreach ($products as $product) {
            $options[] = [
                'id' => $product->id,
                'sku' => $product->sku,
                'name' => $product->name,
                'item_type' => $product->item_type,
                'selling_price' => (string) $product->selling_price,
                'unit_code' => $product->unit->code,
                'unit_name' => $product->unit->name,
                'tax_category_name' => $product->taxCategory?->name,
                'tax_category_code' => $product->taxCategory?->code,
                'tax_treatment' => $product->taxCategory?->treatment,
                'track_inventory' => $product->track_inventory,
                'warehouse_quantities' => $product->inventoryBalances
                    ->mapWithKeys(fn (InventoryBalance $balance) => [
                        (string) $balance->warehouse_id => (string) $balance->quantity_on_hand,
                    ]),
            ];
        }

        return $options;
    }

    /** @return list<array{id: int, code: string, name: string, is_default: bool}> */
    private function warehouseOptions(User $user): array
    {
        return array_values($user->warehouses()->where('is_active', true)
            ->orderByDesc('is_default')->orderBy('name')
            ->get(['id', 'code', 'name', 'is_default'])
            ->map(fn (Warehouse $warehouse): array => [
                'id' => (int) $warehouse->id,
                'code' => (string) $warehouse->code,
                'name' => (string) $warehouse->name,
                'is_default' => (bool) $warehouse->is_default,
            ])->all());
    }
}
