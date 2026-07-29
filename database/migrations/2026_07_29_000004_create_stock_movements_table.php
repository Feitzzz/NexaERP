<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('warehouse_id')->constrained()->restrictOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->string('movement_type', 30);
            $table->string('direction', 3);
            $table->decimal('quantity', 19, 4);
            $table->decimal('balance_before', 19, 4);
            $table->decimal('balance_after', 19, 4);
            $table->decimal('unit_cost', 19, 4)->nullable();
            $table->decimal('total_cost', 19, 4)->nullable();
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();
            $table->index(['user_id', 'occurred_at']);
            $table->index(['warehouse_id', 'product_id', 'occurred_at']);
            $table->index(['reference_type', 'reference_id']);
            $table->unique(
                ['movement_type', 'reference_type', 'reference_id'],
                'stock_movements_reference_unique'
            );
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_direction_check CHECK (direction IN ('IN', 'OUT'))");
            DB::statement('ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_quantity_positive CHECK (quantity > 0)');
            DB::statement('ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_balances_nonnegative CHECK (balance_before >= 0 AND balance_after >= 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
