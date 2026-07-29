<?php

namespace App\Policies;

use App\Models\InventoryAdjustment;
use App\Models\User;

class InventoryAdjustmentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, InventoryAdjustment $inventoryAdjustment): bool
    {
        return $this->owns($user, $inventoryAdjustment);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, InventoryAdjustment $inventoryAdjustment): bool
    {
        return $this->owns($user, $inventoryAdjustment) && $inventoryAdjustment->isDraft();
    }

    public function delete(User $user, InventoryAdjustment $inventoryAdjustment): bool
    {
        return $this->owns($user, $inventoryAdjustment) && $inventoryAdjustment->isDraft();
    }

    public function post(User $user, InventoryAdjustment $inventoryAdjustment): bool
    {
        return $this->owns($user, $inventoryAdjustment) && $inventoryAdjustment->isDraft();
    }

    private function owns(User $user, InventoryAdjustment $inventoryAdjustment): bool
    {
        return $inventoryAdjustment->user_id === $user->id;
    }
}
