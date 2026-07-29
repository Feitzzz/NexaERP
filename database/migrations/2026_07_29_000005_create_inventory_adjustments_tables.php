<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('warehouse_id')->constrained()->restrictOnDelete();
            $table->string('adjustment_number');
            $table->string('status', 20)->default('DRAFT');
            $table->string('reason', 40);
            $table->text('notes')->nullable();
            $table->timestamp('posted_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'adjustment_number']);
            $table->index(['user_id', 'status']);
        });

        Schema::create('inventory_adjustment_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_adjustment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->decimal('quantity_delta', 19, 4);
            $table->decimal('unit_cost', 19, 4)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index('product_id');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE inventory_adjustments ADD CONSTRAINT inventory_adjustments_status_check CHECK (status IN ('DRAFT', 'POSTED'))");
            DB::statement('ALTER TABLE inventory_adjustment_lines ADD CONSTRAINT adjustment_quantity_nonzero CHECK (quantity_delta <> 0)');
            DB::statement('ALTER TABLE inventory_adjustment_lines ADD CONSTRAINT adjustment_unit_cost_nonnegative CHECK (unit_cost IS NULL OR unit_cost >= 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_adjustment_lines');
        Schema::dropIfExists('inventory_adjustments');
    }
};
