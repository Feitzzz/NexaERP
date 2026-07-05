<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBusinessRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email'],
            'phone' => ['required'],
            'street' => ['required'],
            'city' => ['required'],
            'state' => ['required'],
            'country' => ['required'],
            'tin' => ['nullable'],
            'business_description' => ['nullable'],
            'lga' => ['nullable'],
            'postal_code' => ['nullable'],
        ];
    }
}
