<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->foreignId('warehouse_id')->nullable()->after('customer_id')
                ->constrained()->restrictOnDelete();
            $table->timestamp('stock_posted_at')->nullable()->after('issued_at');
            $table->index(['user_id', 'warehouse_id']);
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'warehouse_id']);
            $table->dropConstrainedForeignId('warehouse_id');
            $table->dropColumn('stock_posted_at');
        });
    }
};
