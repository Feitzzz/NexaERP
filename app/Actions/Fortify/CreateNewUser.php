<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Address;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'tin' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'business_description' => ['nullable', 'string'],
            'street' => ['nullable', 'required_with:city,lga,state,postal_code,country', 'string', 'max:255'],
            'city' => ['nullable', 'required_with:street,lga,state,postal_code,country', 'string', 'max:255'],
            'lga' => ['nullable', 'string', 'max:255'],
            'state' => ['nullable', 'required_with:street,city,lga,postal_code,country', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:255'],
            'country' => ['nullable', 'required_with:street,city,lga,state,postal_code', 'string', 'max:255'],
        ])->validate();

        return DB::transaction(function () use ($input): User {
            $address = $this->createAddress($input);

            return User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
                'tin' => $this->optionalValue($input, 'tin'),
                'phone' => $this->optionalValue($input, 'phone'),
                'business_description' => $this->optionalValue($input, 'business_description'),
                'address_id' => $address?->id,
            ]);
        });
    }

    /**
     * @param  array<string, string>  $input
     */
    private function createAddress(array $input): ?Address
    {
        if (! $this->hasCompleteAddress($input)) {
            return null;
        }

        return Address::create([
            'street' => $input['street'],
            'city' => $input['city'],
            'lga' => $this->optionalValue($input, 'lga'),
            'state' => $input['state'],
            'postal_code' => $this->optionalValue($input, 'postal_code'),
            'country' => $input['country'],
        ]);
    }

    /**
     * @param  array<string, string>  $input
     */
    private function hasCompleteAddress(array $input): bool
    {
        return $this->optionalValue($input, 'street') !== null
            && $this->optionalValue($input, 'city') !== null
            && $this->optionalValue($input, 'state') !== null
            && $this->optionalValue($input, 'country') !== null;
    }

    /**
     * @param  array<string, string>  $input
     */
    private function optionalValue(array $input, string $key): ?string
    {
        $value = trim($input[$key] ?? '');

        return $value === '' ? null : $value;
    }
}
