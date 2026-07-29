<?php

namespace App\Services;

use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProductService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function store(array $data): Product
    {
        return DB::transaction(function () use ($data): Product {
            /** @var User $user */
            $user = auth()->user();

            $product = Product::create([
                ...$this->productData($data),
                'user_id' => $user->id,
                'sku' => null,
            ]);

            $product->update([
                'sku' => $this->skuFor($product),
            ]);

            return $product->refresh();
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Product $product, array $data): Product
    {
        $product->update($this->productData($data));

        return $product->refresh();
    }

    public function toggleStatus(Product $product): Product
    {
        $product->update([
            'is_active' => ! $product->is_active,
        ]);

        return $product->refresh();
    }

    public function delete(Product $product): bool
    {
        if ($product->invoiceItems()->exists()
            || $product->inventoryBalances()->exists()
            || $product->stockMovements()->exists()
            || $product->inventoryAdjustmentLines()->exists()) {
            throw ValidationException::withMessages([
                'product' => 'This product cannot be deleted because it is referenced by one or more invoices. Deactivate it instead.',
            ]);
        }

        return (bool) $product->delete();
    }

    private function skuFor(Product $product): string
    {
        $prefix = $product->item_type === Product::TYPE_SERVICE ? 'SRV' : 'PRD';

        return $prefix.'-'.str_pad((string) $product->id, 6, '0', STR_PAD_LEFT);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function productData(array $data): array
    {
        return [
            'category_id' => $data['category_id'],
            'unit_id' => $data['unit_id'],
            'tax_category_id' => $data['tax_category_id'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'item_type' => $data['item_type'],
            'selling_price' => $data['selling_price'],
            'cost_price' => $data['cost_price'] ?? null,
            'track_inventory' => $data['item_type'] === Product::TYPE_PRODUCT
                ? ($data['track_inventory'] ?? false)
                : false,
            'reorder_level' => $data['item_type'] === Product::TYPE_PRODUCT && ($data['track_inventory'] ?? false)
                ? ($data['reorder_level'] ?? null)
                : null,
            'is_active' => $data['is_active'] ?? true,
        ];
    }
}
