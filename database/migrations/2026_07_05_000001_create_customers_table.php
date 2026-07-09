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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('customer_code')->unique();
            $table->string('customer_type');
            $table->string('name')->index();
            $table->string('email')->nullable()->index();
            $table->string('phone')->index();
            $table->string('tin')->nullable();
            $table->text('business_description')->nullable();
            $table->string('street');
            $table->string('city');
            $table->string('lga')->nullable();
            $table->string('state');
            $table->string('postal_code')->nullable();
            $table->string('country');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('customer_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
