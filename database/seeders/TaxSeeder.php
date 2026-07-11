<?php

namespace Database\Seeders;

use App\Models\TaxCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TaxSeeder extends Seeder
{
    /**
     * Seed the system tax reference data.
     */
    public function run(): void
    {
        $categories = [
            [
                'code' => TaxCategory::CODE_STANDARD,
                'name' => 'Standard VAT',
                'treatment' => TaxCategory::TREATMENT_TAXABLE,
                'rate' => '7.5000',
            ],
            [
                'code' => TaxCategory::CODE_ZERO_RATED,
                'name' => 'Zero-Rated',
                'treatment' => TaxCategory::TREATMENT_ZERO_RATED,
                'rate' => '0.0000',
            ],
            [
                'code' => TaxCategory::CODE_EXEMPT,
                'name' => 'Tax Exempt',
                'treatment' => TaxCategory::TREATMENT_EXEMPT,
                'rate' => '0.0000',
            ],
            [
                'code' => TaxCategory::CODE_OUT_OF_SCOPE,
                'name' => 'Out of Scope',
                'treatment' => TaxCategory::TREATMENT_OUT_OF_SCOPE,
                'rate' => '0.0000',
            ],
        ];

        foreach ($categories as $category) {
            DB::table('tax_categories')->updateOrInsert(
                ['code' => $category['code']],
                [
                    'name' => $category['name'],
                    'treatment' => $category['treatment'],
                    'is_active' => true,
                    'updated_at' => now(),
                    'created_at' => now(),
                ],
            );

            $taxCategoryId = DB::table('tax_categories')
                ->where('code', $category['code'])
                ->value('id');

            DB::table('tax_rates')->updateOrInsert(
                [
                    'tax_category_id' => $taxCategoryId,
                    'effective_from' => '2020-02-01',
                ],
                [
                    'rate' => $category['rate'],
                    'effective_to' => null,
                    'updated_at' => now(),
                    'created_at' => now(),
                ],
            );
        }
    }
}
