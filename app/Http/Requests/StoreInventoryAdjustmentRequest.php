<?php

namespace App\Http\Requests;

use App\Models\InventoryAdjustment;
use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInventoryAdjustmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'warehouse_id' => [
                'required', 'integer',
                Rule::exists('warehouses', 'id')->where('user_id', $this->user()?->id)->where('is_active', true),
            ],
            'reason' => ['required', Rule::in(InventoryAdjustment::REASONS)],
            'notes' => ['nullable', 'string'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.product_id' => [
                'required', 'integer',
                Rule::exists('products', 'id')->where('user_id', $this->user()?->id)
                    ->where('item_type', Product::TYPE_PRODUCT)->where('track_inventory', true),
            ],
            'lines.*.quantity_delta' => ['required', 'numeric', 'not_in:0,0.0,0.00,0.000,0.0000'],
            'lines.*.unit_cost' => ['nullable', 'numeric', 'min:0'],
            'lines.*.notes' => ['nullable', 'string'],
        ];
    }
}
