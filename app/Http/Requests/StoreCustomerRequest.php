<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerRequest extends FormRequest
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
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'customer_type' => ['required', Rule::in(['individual', 'business', 'government'])],
            'email' => ['nullable', 'email'],
            'phone' => ['required'],
            'tin' => ['nullable', 'required_if:customer_type,business'],
            'business_description' => ['prohibited'],
            'street' => ['required'],
            'city' => ['required'],
            'lga' => ['nullable'],
            'state' => ['required'],
            'postal_code' => ['nullable'],
            'country' => ['required'],
            'is_active' => ['boolean'],
        ];
    }
}
