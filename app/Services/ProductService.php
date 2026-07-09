<?php

namespace App\Services;

use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

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
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'item_type' => $data['item_type'],
            'selling_price' => $data['selling_price'],
            'cost_price' => $data['cost_price'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ];
    }
}
