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
        $this->authorize('viewAny', Category::class);

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
        $this->authorize('create', Category::class);

        return Inertia::render('categories/create');
    }

    public function store(StoreCategoryRequest $request, CategoryService $categoryService): RedirectResponse
    {
        $this->authorize('create', Category::class);

        /** @var User $user */
        $user = $request->user();
        $categoryService->store($user, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category created.']);

        return redirect()->route('categories.index');
    }

    public function edit(Category $category): Response
    {
        $this->authorize('update', $category);

        return Inertia::render('categories/edit', [
            'category' => $category,
        ]);
    }

    public function update(UpdateCategoryRequest $request, Category $category, CategoryService $categoryService): RedirectResponse
    {
        $this->authorize('update', $category);

        /** @var User $user */
        $user = $request->user();
        $categoryService->update($user, $category, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category updated.']);

        return redirect()->route('categories.index');
    }

    public function destroy(Request $request, Category $category, CategoryService $categoryService): RedirectResponse
    {
        $this->authorize('delete', $category);

        /** @var User $user */
        $user = $request->user();
        $categoryService->delete($user, $category);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category deleted.']);

        return redirect()->route('categories.index');
    }

    public function status(Request $request, Category $category, CategoryService $categoryService): RedirectResponse
    {
        $this->authorize('changeStatus', $category);

        /** @var User $user */
        $user = $request->user();
        $category = $categoryService->toggleStatus($user, $category);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $category->is_active ? 'Category activated.' : 'Category deactivated.',
        ]);

        return back();
    }
}
