<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Models\Unit;
use App\Models\User;
use App\Services\ProductService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $search = $request->string('search')->toString();
        $categoryId = $request->string('category_id')->toString();
        $itemType = $request->string('item_type')->toString();
        $status = $request->string('status')->toString();

        $products = $user->products()
            ->with(['category', 'unit'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($categoryId !== '', fn ($query) => $query->where('category_id', $categoryId))
            ->when($itemType !== '', fn ($query) => $query->where('item_type', $itemType))
            ->when($status === 'active', fn ($query) => $query->where('is_active', true))
            ->when($status === 'inactive', fn ($query) => $query->where('is_active', false))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('products/index', [
            'products' => $products,
            'categories' => $this->categoryOptions($user),
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
                'item_type' => $itemType,
                'status' => $status,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        return Inertia::render('products/create', [
            'categories' => $this->categoryOptions($user),
            'units' => $this->unitOptions(),
        ]);
    }

    public function store(StoreProductRequest $request, ProductService $productService): RedirectResponse
    {
        $productService->store($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product created.']);

        return redirect()->route('products.index');
    }

    public function edit(Request $request, int $product): Response
    {
        /** @var User $user */
        $user = $request->user();

        return Inertia::render('products/edit', [
            'product' => $this->productForUser($request, $product),
            'categories' => $this->categoryOptions($user),
            'units' => $this->unitOptions(),
        ]);
    }

    public function update(UpdateProductRequest $request, int $product, ProductService $productService): RedirectResponse
    {
        $productService->update($this->productForUser($request, $product), $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product updated.']);

        return redirect()->route('products.index');
    }

    public function destroy(Request $request, int $product, ProductService $productService): RedirectResponse
    {
        $productService->delete($this->productForUser($request, $product));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product deleted.']);

        return redirect()->route('products.index');
    }

    public function status(Request $request, int $product, ProductService $productService): RedirectResponse
    {
        $product = $productService->toggleStatus($this->productForUser($request, $product));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $product->is_active ? 'Product activated.' : 'Product deactivated.',
        ]);

        return back();
    }

    private function productForUser(Request $request, int $product): Product
    {
        /** @var User $user */
        $user = $request->user();

        return $user->products()->with(['category', 'unit'])->findOrFail($product);
    }

    /**
     * @return list<array{id: int, name: string}>
     */
    private function categoryOptions(User $user): array
    {
        $categories = $user->categories()
            ->orderBy('name')
            ->get(['id', 'name']);

        $options = [];

        foreach ($categories as $category) {
            $options[] = [
                'id' => $category->id,
                'name' => $category->name,
            ];
        }

        return $options;
    }

    /**
     * @return list<array{id: int, code: string, name: string}>
     */
    private function unitOptions(): array
    {
        $units = Unit::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        $options = [];

        foreach ($units as $unit) {
            $options[] = [
                'id' => $unit->id,
                'code' => $unit->code,
                'name' => $unit->name,
            ];
        }

        return $options;
    }
}
