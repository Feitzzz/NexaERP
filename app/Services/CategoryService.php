<?php

namespace App\Services;

use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CategoryService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function store(array $data): Category
    {
        /** @var User $user */
        $user = auth()->user();

        return Category::create([
            ...$this->categoryData($data),
            'user_id' => $user->id,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Category $category, array $data): Category
    {
        $category->update($this->categoryData($data));

        return $category->refresh();
    }

    public function toggleStatus(Category $category): Category
    {
        $category->update([
            'is_active' => ! $category->is_active,
        ]);

        return $category->refresh();
    }

    /**
     * @throws ValidationException
     */
    public function delete(Category $category): bool
    {
        return DB::transaction(function () use ($category): bool {
            if ($category->products()->exists()) {
                throw ValidationException::withMessages([
                    'category' => 'This category cannot be deleted because it contains products.',
                ]);
            }

            return (bool) $category->delete();
        });
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function categoryData(array $data): array
    {
        return [
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ];
    }
}
