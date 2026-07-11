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
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('tax_category_id')
                ->nullable()
                ->after('unit_id')
                ->constrained()
                ->restrictOnDelete();

            $table->index('tax_category_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['tax_category_id']);
            $table->dropIndex(['tax_category_id']);
            $table->dropColumn('tax_category_id');
        });
    }
};
