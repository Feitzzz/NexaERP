<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CustomerService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function store(User $user, array $data): Customer
    {
        return DB::transaction(function () use ($user, $data): Customer {
            return Customer::create([
                ...$this->customerData($data),
                'user_id' => $user->id,
                'customer_code' => $this->nextCustomerCode(),
            ]);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(User $user, Customer $customer, array $data): Customer
    {
        return DB::transaction(function () use ($user, $customer, $data): Customer {
            $customer = $this->owned($user, $customer);
            $customer->update($this->customerData($data));

            return $customer->refresh();
        });
    }

    public function delete(User $user, Customer $customer): bool
    {
        return DB::transaction(function () use ($user, $customer): bool {
            $customer = $this->owned($user, $customer);

            if ($customer->invoices()->exists()) {
                throw ValidationException::withMessages([
                    'customer' => 'This customer cannot be deleted because it is referenced by one or more invoices.',
                ]);
            }

            return (bool) $customer->delete();
        });
    }

    private function owned(User $user, Customer $customer): Customer
    {
        return $user->customers()->whereKey($customer->id)->firstOrFail();
    }

    private function nextCustomerCode(): string
    {
        $lastCode = Customer::query()
            ->lockForUpdate()
            ->latest('id')
            ->value('customer_code');

        $nextNumber = $lastCode ? ((int) str_replace('CUS-', '', $lastCode)) + 1 : 1;

        return 'CUS-'.str_pad((string) $nextNumber, 6, '0', STR_PAD_LEFT);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function customerData(array $data): array
    {
        return [
            'customer_type' => $data['customer_type'],
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'],
            'tin' => $data['tin'] ?? null,
            'business_description' => $data['business_description'] ?? null,
            'street' => $data['street'],
            'city' => $data['city'],
            'lga' => $data['lga'] ?? null,
            'state' => $data['state'],
            'postal_code' => $data['postal_code'] ?? null,
            'country' => $data['country'],
            'is_active' => $data['is_active'] ?? true,
        ];
    }
}
