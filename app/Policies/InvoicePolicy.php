<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Invoice $invoice): bool
    {
        return $this->owns($user, $invoice);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Invoice $invoice): bool
    {
        return $this->owns($user, $invoice) && $invoice->isDraft();
    }

    public function delete(User $user, Invoice $invoice): bool
    {
        return $this->owns($user, $invoice) && $invoice->isDraft();
    }

    public function issue(User $user, Invoice $invoice): bool
    {
        return $this->owns($user, $invoice) && $invoice->isDraft();
    }

    public function updatePaymentStatus(User $user, Invoice $invoice): bool
    {
        return $this->owns($user, $invoice) && $invoice->isIssued();
    }

    private function owns(User $user, Invoice $invoice): bool
    {
        return $invoice->user_id === $user->id;
    }
}
