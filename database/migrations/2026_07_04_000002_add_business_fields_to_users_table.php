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
        Schema::table('users', function (Blueprint $table) {
            $table->string('tin')->nullable()->after('email');
            $table->string('business_id')->nullable()->after('tin');
            $table->string('phone')->nullable()->after('business_id');
            $table->text('business_description')->nullable()->after('phone');
            $table->foreignId('address_id')->nullable()->after('business_description')->constrained()->nullOnDelete();
            $table->string('logo')->nullable()->after('address_id');
            $table->string('currency')->default('NGN')->after('logo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['address_id']);
            $table->dropColumn([
                'tin',
                'business_id',
                'phone',
                'business_description',
                'address_id',
                'logo',
                'currency',
            ]);
        });
    }
};
