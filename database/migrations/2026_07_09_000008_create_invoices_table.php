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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->restrictOnDelete();
            $table->unsignedBigInteger('sequence_number');
            $table->string('invoice_number');
            $table->string('invoice_kind', 10);
            $table->string('status', 20)->default('DRAFT');
            $table->string('payment_status', 20)->default('PENDING');
            $table->date('issue_date');
            $table->time('issue_time');
            $table->date('due_date');
            $table->date('tax_point_date');
            $table->char('currency_code', 3)->default('NGN');
            $table->char('tax_currency_code', 3)->default('NGN');
            $table->decimal('subtotal', 19, 4)->default(0);
            $table->decimal('discount_total', 19, 4)->default(0);
            $table->decimal('tax_exclusive_total', 19, 4)->default(0);
            $table->decimal('tax_total', 19, 4)->default(0);
            $table->decimal('tax_inclusive_total', 19, 4)->default(0);
            $table->decimal('payable_amount', 19, 4)->default(0);
            $table->text('notes')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'invoice_number']);
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'payment_status']);
            $table->index(['user_id', 'issue_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
