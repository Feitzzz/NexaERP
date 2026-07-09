<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UnitSeeder extends Seeder
{
    /**
     * Seed the common local ERP units.
     */
    public function run(): void
    {
        $units = [
            ['code' => 'EA', 'name' => 'Each'],
            ['code' => 'KGM', 'name' => 'Kilogram'],
            ['code' => 'LTR', 'name' => 'Litre'],
        ];

        foreach ($units as $unit) {
            DB::table('units')->updateOrInsert(
                ['code' => $unit['code']],
                [
                    'name' => $unit['name'],
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            );
        }
    }
}
