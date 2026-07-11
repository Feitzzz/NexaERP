<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\User;
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
        /** @var User $user */
        $user = $request->user();
        $search = $request->string('search')->toString();
        $status = $request->string('status')->toString();
        $paymentStatus = $request->string('payment_status')->toString();
        $customerId = $request->string('customer_id')->toString();
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
            ->when($customerId !== '', fn ($query) => $query->where('customer_id', $customerId))
            ->when($issueDateFrom !== '', fn ($query) => $query->whereDate('issue_date', '>=', $issueDateFrom))
            ->when($issueDateTo !== '', fn ($query) => $query->whereDate('issue_date', '<=', $issueDateTo))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('invoices/index', [
            'invoices' => $invoices,
            'customers' => $this->customerOptions($user),
            'filters' => [
                'search' => $search,
                'status' => $status,
                'payment_status' => $paymentStatus,
                'customer_id' => $customerId,
                'issue_date_from' => $issueDateFrom,
                'issue_date_to' => $issueDateTo,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        return Inertia::render('invoices/create', [
            'customers' => $this->customerOptions($user),
            'products' => $this->productOptions($user),
            'today' => now()->toDateString(),
        ]);
    }

    public function store(StoreInvoiceRequest $request, InvoiceService $invoiceService): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $invoice = $invoiceService->store($user, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Invoice created.']);

        return redirect()->route('invoices.show', $invoice);
    }

    public function show(Request $request, int $invoice): Response
    {
        $invoice = $this->invoiceForUser($request, $invoice, [
            'customer',
            'items',
            'supplierSnapshot',
            'customerSnapshot',
        ]);

        return Inertia::render('invoices/show', [
            'invoice' => $invoice,
        ]);
    }

    public function edit(Request $request, int $invoice): Response
    {
        /** @var User $user */
        $user = $request->user();
        $invoice = $this->invoiceForUser($request, $invoice, ['items']);

        abort_if($invoice->isIssued(), 403, 'Issued invoices cannot be edited.');

        return Inertia::render('invoices/edit', [
            'invoice' => $invoice,
            'customers' => $this->customerOptions($user),
            'products' => $this->productOptions($user),
        ]);
    }

    public function update(UpdateInvoiceRequest $request, int $invoice, InvoiceService $invoiceService): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $invoice = $invoiceService->update($user, $this->invoiceForUser($request, $invoice), $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Invoice updated.']);

        return redirect()->route('invoices.show', $invoice);
    }

    public function destroy(Request $request, int $invoice, InvoiceService $invoiceService): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $invoiceService->delete($user, $this->invoiceForUser($request, $invoice));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Invoice deleted.']);

        return redirect()->route('invoices.index');
    }

    public function issue(Request $request, int $invoice, InvoiceService $invoiceService): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $invoice = $invoiceService->issue($user, $this->invoiceForUser($request, $invoice));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Invoice issued.']);

        return redirect()->route('invoices.show', $invoice);
    }

    public function paymentStatus(Request $request, int $invoice): RedirectResponse
    {
        $data = $request->validate([
            'payment_status' => ['required', Rule::in([
                Invoice::PAYMENT_PENDING,
                Invoice::PAYMENT_PARTIAL,
                Invoice::PAYMENT_PAID,
            ])],
        ]);

        $invoice = $this->invoiceForUser($request, $invoice);

        if (! $invoice->isIssued()) {
            throw ValidationException::withMessages([
                'payment_status' => 'Only issued invoices can have their payment status updated.',
            ]);
        }

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
     * @param  list<string>  $relations
     */
    private function invoiceForUser(Request $request, int $invoice, array $relations = []): Invoice
    {
        /** @var User $user */
        $user = $request->user();

        return $user->invoices()->with($relations)->findOrFail($invoice);
    }

    /**
     * @return list<array{id: int, name: string, customer_code: string, tin: string|null}>
     */
    private function customerOptions(User $user): array
    {
        $customers = $user->customers()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'customer_code', 'tin']);

        $options = [];

        foreach ($customers as $customer) {
            $options[] = [
                'id' => (int) $customer->id,
                'name' => (string) $customer->name,
                'customer_code' => (string) $customer->customer_code,
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
            ->with(['unit', 'taxCategory'])
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
            ];
        }

        return $options;
    }
}
