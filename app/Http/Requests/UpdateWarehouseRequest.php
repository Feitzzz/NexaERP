<?php

namespace App\Http\Requests;

use App\Models\Warehouse;
use Illuminate\Validation\Rule;

class UpdateWarehouseRequest extends StoreWarehouseRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        $warehouse = $this->route('warehouse');
        $id = $warehouse instanceof Warehouse ? $warehouse->getKey() : $warehouse;

        return [
            'code' => ['required', 'string', 'max:30', Rule::unique('warehouses')->where('user_id', $this->user()?->id)->ignore($id)],
            'name' => ['required', 'string', 'max:100', Rule::unique('warehouses')->where('user_id', $this->user()?->id)->ignore($id)],
            'description' => ['nullable', 'string'],
            'is_default' => ['boolean'],
            'is_active' => ['boolean'],
        ];
    }
}
