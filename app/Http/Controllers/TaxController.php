<?php

namespace App\Http\Controllers;

use App\Models\TaxCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class TaxController extends Controller
{
    public function index(Request $request): Response
    {
        $date = now()->toDateString();

        $taxCategories = TaxCategory::query()
            ->with(['taxRates' => function ($query) use ($date): void {
                $query->whereDate('effective_from', '<=', $date)
                    ->where(function ($query) use ($date): void {
                        $query->whereNull('effective_to')
                            ->orWhereDate('effective_to', '>=', $date);
                    })
                    ->orderByDesc('effective_from');
            }])
            ->orderBy('name')
            ->get();

        $taxCategoryData = [];

        foreach ($taxCategories as $taxCategory) {
            $currentRate = $taxCategory->taxRates->first();

            $taxCategoryData[] = [
                'id' => $taxCategory->id,
                'code' => $taxCategory->code,
                'name' => $taxCategory->name,
                'treatment' => $taxCategory->treatment,
                'is_active' => $taxCategory->is_active,
                'current_rate' => $currentRate?->rate,
                'effective_from' => $currentRate === null
                    ? null
                    : Carbon::parse($currentRate->effective_from)->toDateString(),
            ];
        }

        return Inertia::render('taxes/index', [
            'taxCategories' => $taxCategoryData,
        ]);
    }
}
