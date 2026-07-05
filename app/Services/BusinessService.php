<?php

namespace App\Services;

use App\Models\Address;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class BusinessService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function updateBusiness(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data): User {
            $user->update([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'tin' => $data['tin'] ?? null,
                'business_description' => $data['business_description'] ?? null,
            ]);

            $this->updateAddress($user, $data);

            return $user->refresh()->load('address');
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateAddress(User $user, array $data): Address
    {
        return DB::transaction(function () use ($user, $data): Address {
            $addressData = [
                'street' => $data['street'],
                'city' => $data['city'],
                'lga' => $data['lga'] ?? null,
                'state' => $data['state'],
                'postal_code' => $data['postal_code'] ?? null,
                'country' => $data['country'],
            ];

            $address = $user->address;

            if ($address === null) {
                $address = Address::create($addressData);
                $user->forceFill(['address_id' => $address->id])->save();

                return $address;
            }

            $address->update($addressData);

            return $address;
        });
    }
}
