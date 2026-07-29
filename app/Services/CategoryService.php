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
    public function store(User $user, array $data): Category
    {
        return Category::create([
            ...$this->categoryData($data),
            'user_id' => $user->id,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(User $user, Category $category, array $data): Category
    {
        $category = $this->owned($user, $category);
        $category->update($this->categoryData($data));

        return $category->refresh();
    }

    public function toggleStatus(User $user, Category $category): Category
    {
        $category = $this->owned($user, $category);
        $category->update([
            'is_active' => ! $category->is_active,
        ]);

        return $category->refresh();
    }

    /**
     * @throws ValidationException
     */
    public function delete(User $user, Category $category): bool
    {
        return DB::transaction(function () use ($user, $category): bool {
            $category = $this->owned($user, $category);

            if ($category->products()->exists()) {
                throw ValidationException::withMessages([
                    'category' => 'This category cannot be deleted because it contains products.',
                ]);
            }

            return (bool) $category->delete();
        });
    }

    private function owned(User $user, Category $category): Category
    {
        return $user->categories()->whereKey($category->id)->firstOrFail();
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
