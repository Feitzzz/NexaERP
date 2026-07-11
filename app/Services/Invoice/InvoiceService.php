<?php

namespace App\Services\Invoice;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoicePartySnapshot;
use App\Models\Product;
use App\Models\User;
use App\Services\Tax\TaxCalculatorService;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InvoiceService
{
    public function __construct(
        private readonly InvoiceNumberGenerator $invoiceNumberGenerator,
        private readonly TaxCalculatorService $taxCalculatorService,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function store(User $user, array $data): Invoice
    {
        return DB::transaction(function () use ($user, $data): Invoice {
            $customer = $this->customerForUser($user, (int) $data['customer_id']);
            $this->validateInvoiceKindRequirements($customer, (string) $data['invoice_kind']);
            $number = $this->invoiceNumberGenerator->nextFor($user);

            $invoice = Invoice::create([
                'user_id' => $user->id,
                'customer_id' => $customer->id,
                'sequence_number' => $number['sequence_number'],
                'invoice_number' => $number['invoice_number'],
                'invoice_kind' => $data['invoice_kind'],
                'status' => Invoice::STATUS_DRAFT,
                'payment_status' => Invoice::PAYMENT_PENDING,
                'issue_date' => $data['issue_date'],
                'issue_time' => now()->format('H:i:s'),
                'due_date' => $data['due_date'],
                'tax_point_date' => $data['tax_point_date'],
                'currency_code' => $data['currency_code'] ?? 'NGN',
                'tax_currency_code' => $data['tax_currency_code'] ?? 'NGN',
                'notes' => $data['notes'] ?? null,
            ]);

            $this->replaceItems($user, $invoice, $data['items']);
            $this->updateTotals($invoice);

            return $invoice->refresh()->load(['customer', 'items']);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(User $user, Invoice $invoice, array $data): Invoice
    {
        return DB::transaction(function () use ($user, $invoice, $data): Invoice {
            $invoice = $this->lockedInvoiceForUser($user, $invoice);
            $this->ensureDraft($invoice, 'Issued invoices cannot be edited.');

            $customer = $this->customerForUser($user, (int) $data['customer_id']);
            $this->validateInvoiceKindRequirements($customer, (string) $data['invoice_kind']);

            $invoice->update([
                'customer_id' => $customer->id,
                'invoice_kind' => $data['invoice_kind'],
                'issue_date' => $data['issue_date'],
                'due_date' => $data['due_date'],
                'tax_point_date' => $data['tax_point_date'],
                'currency_code' => $data['currency_code'] ?? 'NGN',
                'tax_currency_code' => $data['tax_currency_code'] ?? 'NGN',
                'notes' => $data['notes'] ?? null,
            ]);

            $invoice->items()->delete();
            $this->replaceItems($user, $invoice, $data['items']);
            $this->updateTotals($invoice);

            return $invoice->refresh()->load(['customer', 'items']);
        });
    }

    public function delete(User $user, Invoice $invoice): void
    {
        DB::transaction(function () use ($user, $invoice): void {
            $invoice = $this->lockedInvoiceForUser($user, $invoice);
            $this->ensureDraft($invoice, 'Issued invoices cannot be deleted.');

            $invoice->delete();
        });
    }

    public function issue(User $user, Invoice $invoice): Invoice
    {
        return DB::transaction(function () use ($user, $invoice): Invoice {
            $invoice = $this->lockedInvoiceForUser($user, $invoice);
            $this->ensureDraft($invoice, 'This invoice has already been issued.');

            $invoice->load(['items', 'customer', 'user.address']);

            if ($invoice->items->isEmpty()) {
                throw ValidationException::withMessages([
                    'items' => 'An invoice must have at least one item before it can be issued.',
                ]);
            }

            $this->validateSupplierProfile($user->load('address'));
            $this->validateInvoiceKindRequirements($invoice->customer, $invoice->invoice_kind);

            $this->createSupplierSnapshot($invoice, $user);
            $this->createCustomerSnapshot($invoice, $invoice->customer);

            $invoice->update([
                'status' => Invoice::STATUS_ISSUED,
                'issued_at' => now(),
            ]);

            return $invoice->refresh()->load(['customer', 'items', 'supplierSnapshot', 'customerSnapshot']);
        });
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    private function replaceItems(User $user, Invoice $invoice, array $items): void
    {
        foreach (array_values($items) as $index => $item) {
            $product = Product::query()
                ->with(['unit', 'taxCategory'])
                ->where('user_id', $user->id)
                ->whereKey($item['product_id'])
                ->first();

            if ($product === null) {
                throw ValidationException::withMessages([
                    "items.{$index}.product_id" => 'The selected product is invalid.',
                ]);
            }

            if (! $product->is_active) {
                throw ValidationException::withMessages([
                    "items.{$index}.product_id" => 'Only active products and services can be invoiced.',
                ]);
            }

            if ($product->taxCategory === null) {
                throw ValidationException::withMessages([
                    "items.{$index}.product_id" => 'Classify this product for tax before adding it to an invoice.',
                ]);
            }

            $quantity = $this->numericString($item['quantity']);
            $unitPrice = $this->numericString($item['unit_price']);
            $discountRate = $this->numericString($item['discount_rate'] ?? 0);
            $grossLineAmount = bcmul($quantity, $unitPrice, 6);
            $discountAmount = bcdiv(bcmul($grossLineAmount, $discountRate, 6), '100', 6);

            try {
                $tax = $this->taxCalculatorService->calculate(
                    quantity: $quantity,
                    unitPrice: $unitPrice,
                    discountAmount: $discountAmount,
                    taxCategory: $product->taxCategory,
                    transactionDate: $invoice->tax_point_date,
                );
            } catch (DomainException $exception) {
                throw ValidationException::withMessages([
                    "items.{$index}.product_id" => $exception->getMessage(),
                ]);
            }

            $invoice->items()->create([
                'product_id' => $product->id,
                'tax_category_id' => $product->taxCategory->id,
                'line_number' => $index + 1,
                'product_sku' => $product->sku,
                'item_name' => $product->name,
                'item_description' => $product->description,
                'item_type' => $product->item_type,
                'unit_code' => $product->unit->code,
                'unit_name' => $product->unit->name,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'discount_rate' => $discountRate,
                'discount_amount' => $this->roundMoney($discountAmount),
                'gross_line_amount' => $tax['gross_line_amount'],
                'taxable_amount' => $tax['taxable_amount'],
                'tax_category_code' => $tax['tax_category_code'],
                'tax_category_name' => $product->taxCategory->name,
                'tax_treatment' => $tax['tax_treatment'],
                'tax_rate' => $tax['tax_rate'],
                'tax_amount' => $tax['tax_amount'],
                'line_total' => $tax['tax_inclusive_amount'],
            ]);
        }
    }

    private function updateTotals(Invoice $invoice): void
    {
        $items = $invoice->items()->get();

        $subtotal = '0';
        $discountTotal = '0';
        $taxExclusiveTotal = '0';
        $taxTotal = '0';

        foreach ($items as $item) {
            $subtotal = bcadd($subtotal, $this->numericString($item->gross_line_amount), 6);
            $discountTotal = bcadd($discountTotal, $this->numericString($item->discount_amount), 6);
            $taxExclusiveTotal = bcadd($taxExclusiveTotal, $this->numericString($item->taxable_amount), 6);
            $taxTotal = bcadd($taxTotal, $this->numericString($item->tax_amount), 6);
        }

        $taxInclusiveTotal = bcadd($taxExclusiveTotal, $taxTotal, 6);

        $invoice->update([
            'subtotal' => $this->roundMoney($subtotal),
            'discount_total' => $this->roundMoney($discountTotal),
            'tax_exclusive_total' => $this->roundMoney($taxExclusiveTotal),
            'tax_total' => $this->roundMoney($taxTotal),
            'tax_inclusive_total' => $this->roundMoney($taxInclusiveTotal),
            'payable_amount' => $this->roundMoney($taxInclusiveTotal),
        ]);
    }

    private function customerForUser(User $user, int $customerId): Customer
    {
        $customer = $user->customers()->whereKey($customerId)->first();

        if ($customer === null) {
            throw ValidationException::withMessages([
                'customer_id' => 'The selected customer is invalid.',
            ]);
        }

        if (! $customer->is_active) {
            throw ValidationException::withMessages([
                'customer_id' => 'Only active customers can be invoiced.',
            ]);
        }

        return $customer;
    }

    private function lockedInvoiceForUser(User $user, Invoice $invoice): Invoice
    {
        return $user->invoices()
            ->whereKey($invoice->id)
            ->lockForUpdate()
            ->firstOrFail();
    }

    private function ensureDraft(Invoice $invoice, string $message): void
    {
        if (! $invoice->isDraft()) {
            throw ValidationException::withMessages([
                'invoice' => $message,
            ]);
        }
    }

    private function validateInvoiceKindRequirements(Customer $customer, string $invoiceKind): void
    {
        if ($invoiceKind === Invoice::KIND_B2B && blank($customer->tin)) {
            throw ValidationException::withMessages([
                'customer_id' => 'B2B invoices require a customer TIN.',
            ]);
        }
    }

    private function validateSupplierProfile(User $user): void
    {
        $missing = [];

        foreach (['name', 'email', 'phone'] as $field) {
            if (blank($user->{$field})) {
                $missing[] = $field;
            }
        }

        if ($user->address === null) {
            $missing[] = 'address';
        }

        if ($missing !== []) {
            throw ValidationException::withMessages([
                'invoice' => 'Complete your business profile before issuing invoices.',
            ]);
        }
    }

    private function createSupplierSnapshot(Invoice $invoice, User $user): void
    {
        $address = $user->address;

        $invoice->partySnapshots()->updateOrCreate([
            'party_type' => InvoicePartySnapshot::TYPE_SUPPLIER,
        ], [
            'name' => $user->name,
            'tin' => $user->tin,
            'incorporation_number' => $user->business_id,
            'email' => $user->email,
            'phone' => $user->phone,
            'business_description' => $user->business_description,
            'street' => $address?->street,
            'city' => $address?->city,
            'state' => $address?->state,
            'postal_code' => $address?->postal_code,
            'country_code' => $address?->country,
        ]);
    }

    private function createCustomerSnapshot(Invoice $invoice, Customer $customer): void
    {
        $invoice->partySnapshots()->updateOrCreate([
            'party_type' => InvoicePartySnapshot::TYPE_CUSTOMER,
        ], [
            'name' => $customer->name,
            'tin' => $customer->tin,
            'incorporation_number' => null,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'business_description' => $customer->business_description,
            'street' => $customer->street,
            'city' => $customer->city,
            'state' => $customer->state,
            'postal_code' => $customer->postal_code,
            'country_code' => $customer->country,
        ]);
    }

    /**
     * @return numeric-string
     */
    private function numericString(mixed $value): string
    {
        if (! is_numeric($value)) {
            throw new DomainException('Invoice calculation inputs must be numeric.');
        }

        return (string) $value;
    }

    /**
     * @param  numeric-string  $value
     * @return numeric-string
     */
    private function roundMoney(string $value): string
    {
        $rounded = bcdiv(bcadd($value, '0.005', 6), '1', 2);

        return number_format((float) $rounded, 2, '.', '');
    }
}
