<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
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

        return Inertia::render('customers/show', [
            'customer' => $customer,
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
