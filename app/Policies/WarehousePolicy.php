<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Warehouse;

class WarehousePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Warehouse $warehouse): bool
    {
        return $this->owns($user, $warehouse);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Warehouse $warehouse): bool
    {
        return $this->owns($user, $warehouse);
    }

    public function delete(User $user, Warehouse $warehouse): bool
    {
        return $this->owns($user, $warehouse);
    }

    public function changeStatus(User $user, Warehouse $warehouse): bool
    {
        return $this->owns($user, $warehouse);
    }

    public function makeDefault(User $user, Warehouse $warehouse): bool
    {
        return $this->owns($user, $warehouse);
    }

    private function owns(User $user, Warehouse $warehouse): bool
    {
        return $warehouse->user_id === $user->id;
    }
}
