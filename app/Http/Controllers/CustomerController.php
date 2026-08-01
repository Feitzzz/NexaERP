<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\User;
use App\Services\CustomerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Customer::class);

        /** @var User $user */
        $user = $request->user();
        $search = $request->string('search')->toString();

        $customers = $user->customers()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('customer_code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('tin', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'summary' => [
                'total' => $user->customers()->count(),
                'active' => $user->customers()->where('is_active', true)->count(),
                'businesses' => $user->customers()->where('customer_type', 'business')->count(),
                'outstanding' => (float) $user->invoices()->where('status', Invoice::STATUS_ISSUED)
                    ->where('payment_status', '!=', Invoice::PAYMENT_PAID)->sum('payable_amount'),
            ],
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Customer::class);

        return Inertia::render('customers/create');
    }

    public function store(StoreCustomerRequest $request, CustomerService $customerService): RedirectResponse
    {
        $this->authorize('create', Customer::class);

        /** @var User $user */
        $user = $request->user();
        $customer = $customerService->store($user, $request->validated());

        return redirect()->route('customers.show', $customer)->with('status', 'Customer created.');
    }

    public function show(Customer $customer): Response
    {
        $this->authorize('view', $customer);

        $recentInvoices = $customer->invoices()->latest()->limit(8)->get([
            'id', 'customer_id', 'invoice_number', 'issue_date', 'status', 'payment_status', 'payable_amount', 'currency_code',
        ]);

        return Inertia::render('customers/show', [
            'customer' => $customer,
            'summary' => [
                'invoice_count' => $customer->invoices()->count(),
                'total_invoiced' => (float) $customer->invoices()->where('status', Invoice::STATUS_ISSUED)->sum('payable_amount'),
                'outstanding' => (float) $customer->invoices()->where('status', Invoice::STATUS_ISSUED)
                    ->where('payment_status', '!=', Invoice::PAYMENT_PAID)->sum('payable_amount'),
            ],
            'recentInvoices' => $recentInvoices,
        ]);
    }

    public function edit(Customer $customer): Response
    {
        $this->authorize('update', $customer);

        return Inertia::render('customers/edit', [
            'customer' => $customer,
        ]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer, CustomerService $customerService): RedirectResponse
    {
        $this->authorize('update', $customer);

        /** @var User $user */
        $user = $request->user();
        $customerService->update($user, $customer, $request->validated());

        return redirect()->route('customers.show', $customer)->with('status', 'Customer updated.');
    }

    public function destroy(Request $request, Customer $customer, CustomerService $customerService): RedirectResponse
    {
        $this->authorize('delete', $customer);

        /** @var User $user */
        $user = $request->user();
        $customerService->delete($user, $customer);

        return redirect()->route('customers.index')->with('status', 'Customer deleted.');
    }
}
