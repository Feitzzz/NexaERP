<?php

namespace App\Policies;

use App\Models\InventoryBalance;
use App\Models\User;

class InventoryBalancePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, InventoryBalance $inventoryBalance): bool
    {
        return $inventoryBalance->user_id === $user->id;
    }
}
