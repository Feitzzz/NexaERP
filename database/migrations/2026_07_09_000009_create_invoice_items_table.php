<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->foreignId('tax_category_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('line_number');
            $table->string('product_sku')->nullable();
            $table->string('item_name', 150);
            $table->text('item_description')->nullable();
            $table->string('item_type', 20);
            $table->string('unit_code');
            $table->string('unit_name');
            $table->decimal('quantity', 19, 4);
            $table->decimal('unit_price', 19, 4);
            $table->decimal('discount_rate', 8, 4)->default(0);
            $table->decimal('discount_amount', 19, 4)->default(0);
            $table->decimal('gross_line_amount', 19, 4)->default(0);
            $table->decimal('taxable_amount', 19, 4)->default(0);
            $table->string('tax_category_code');
            $table->string('tax_category_name');
            $table->string('tax_treatment');
            $table->decimal('tax_rate', 8, 4)->default(0);
            $table->decimal('tax_amount', 19, 4)->default(0);
            $table->decimal('line_total', 19, 4)->default(0);
            $table->timestamps();

            $table->unique(['invoice_id', 'line_number']);
            $table->index('product_id');
            $table->index('tax_category_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
