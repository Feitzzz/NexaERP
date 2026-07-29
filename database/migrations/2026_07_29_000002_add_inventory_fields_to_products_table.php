<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('track_inventory')->default(false)->after('cost_price');
            $table->decimal('reorder_level', 19, 4)->nullable()->after('track_inventory');
            $table->index(['user_id', 'track_inventory']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE products ADD CONSTRAINT products_inventory_rules CHECK (reorder_level IS NULL OR reorder_level >= 0)');
            DB::statement("ALTER TABLE products ADD CONSTRAINT services_cannot_track_inventory CHECK (item_type <> 'SERVICE' OR track_inventory = false)");
        }
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'track_inventory']);
            $table->dropColumn(['track_inventory', 'reorder_level']);
        });
    }
};
