<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Models\TaxCategory;
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
        $this->authorize('viewAny', Product::class);

        /** @var User $user */
        $user = $request->user();
        $search = $request->string('search')->toString();
        $categoryId = $request->string('category_id')->toString();
        $taxCategoryId = $request->string('tax_category_id')->toString();
        $itemType = $request->string('item_type')->toString();
        $status = $request->string('status')->toString();

        $products = $user->products()
            ->with(['category', 'unit', 'taxCategory'])
            ->withSum('inventoryBalances as quantity_on_hand', 'quantity_on_hand')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($categoryId !== '', fn ($query) => $query->where('category_id', $categoryId))
            ->when($taxCategoryId !== '', function ($query) use ($taxCategoryId): void {
                if ($taxCategoryId === 'unclassified') {
                    $query->whereNull('tax_category_id');

                    return;
                }

                $query->where('tax_category_id', $taxCategoryId);
            })
            ->when($itemType !== '', fn ($query) => $query->where('item_type', $itemType))
            ->when($status === 'active', fn ($query) => $query->where('is_active', true))
            ->when($status === 'inactive', fn ($query) => $query->where('is_active', false))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        $trackedProducts = $user->products()->where('track_inventory', true)
            ->withSum('inventoryBalances as quantity_on_hand', 'quantity_on_hand')->get();

        return Inertia::render('products/index', [
            'products' => $products,
            'summary' => [
                'total' => $user->products()->count(),
                'active' => $user->products()->where('is_active', true)->count(),
                'services' => $user->products()->where('item_type', Product::TYPE_SERVICE)->count(),
                'low_stock' => $trackedProducts->filter(fn ($product) => $product->reorder_level !== null
                    && (float) ($product->quantity_on_hand ?? 0) <= (float) $product->reorder_level)->count(),
            ],
            'categories' => $this->categoryOptions($user),
            'taxCategories' => $this->taxCategoryOptions(),
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
                'tax_category_id' => $taxCategoryId,
                'item_type' => $itemType,
                'status' => $status,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Product::class);

        /** @var User $user */
        $user = $request->user();

        return Inertia::render('products/create', [
            'categories' => $this->categoryOptions($user),
            'units' => $this->unitOptions(),
            'taxCategories' => $this->taxCategoryOptions(),
        ]);
    }

    public function store(StoreProductRequest $request, ProductService $productService): RedirectResponse
    {
        $this->authorize('create', Product::class);

        /** @var User $user */
        $user = $request->user();
        $productService->store($user, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product created.']);

        return redirect()->route('products.index');
    }

    public function edit(Request $request, Product $product): Response
    {
        $this->authorize('update', $product);

        /** @var User $user */
        $user = $request->user();

        return Inertia::render('products/edit', [
            'product' => $product->load(['category', 'unit', 'taxCategory']),
            'categories' => $this->categoryOptions($user),
            'units' => $this->unitOptions(),
            'taxCategories' => $this->taxCategoryOptions(),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product, ProductService $productService): RedirectResponse
    {
        $this->authorize('update', $product);

        /** @var User $user */
        $user = $request->user();
        $productService->update($user, $product, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product updated.']);

        return redirect()->route('products.index');
    }

    public function destroy(Request $request, Product $product, ProductService $productService): RedirectResponse
    {
        $this->authorize('delete', $product);

        /** @var User $user */
        $user = $request->user();
        $productService->delete($user, $product);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product deleted.']);

        return redirect()->route('products.index');
    }

    public function status(Request $request, Product $product, ProductService $productService): RedirectResponse
    {
        $this->authorize('changeStatus', $product);

        /** @var User $user */
        $user = $request->user();
        $product = $productService->toggleStatus($user, $product);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $product->is_active ? 'Product activated.' : 'Product deactivated.',
        ]);

        return back();
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

    /**
     * @return list<array{id: int, code: string, name: string, treatment: string}>
     */
    private function taxCategoryOptions(): array
    {
        $taxCategories = TaxCategory::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'treatment']);

        $options = [];

        foreach ($taxCategories as $taxCategory) {
            $options[] = [
                'id' => $taxCategory->id,
                'code' => $taxCategory->code,
                'name' => $taxCategory->name,
                'treatment' => $taxCategory->treatment,
            ];
        }

        return $options;
    }
}
