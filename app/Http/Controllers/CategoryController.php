<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Models\User;
use App\Services\CategoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $search = $request->string('search')->toString();

        $categories = $user->categories()
            ->withCount('products')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('categories/index', [
            'categories' => $categories,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('categories/create');
    }

    public function store(StoreCategoryRequest $request, CategoryService $categoryService): RedirectResponse
    {
        $categoryService->store($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category created.']);

        return redirect()->route('categories.index');
    }

    public function edit(Request $request, int $category): Response
    {
        return Inertia::render('categories/edit', [
            'category' => $this->categoryForUser($request, $category),
        ]);
    }

    public function update(UpdateCategoryRequest $request, int $category, CategoryService $categoryService): RedirectResponse
    {
        $categoryService->update($this->categoryForUser($request, $category), $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category updated.']);

        return redirect()->route('categories.index');
    }

    public function destroy(Request $request, int $category, CategoryService $categoryService): RedirectResponse
    {
        $categoryService->delete($this->categoryForUser($request, $category));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category deleted.']);

        return redirect()->route('categories.index');
    }

    public function status(Request $request, int $category, CategoryService $categoryService): RedirectResponse
    {
        $category = $categoryService->toggleStatus($this->categoryForUser($request, $category));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $category->is_active ? 'Category activated.' : 'Category deactivated.',
        ]);

        return back();
    }

    private function categoryForUser(Request $request, int $category): Category
    {
        /** @var User $user */
        $user = $request->user();

        return $user->categories()->findOrFail($category);
    }
}
