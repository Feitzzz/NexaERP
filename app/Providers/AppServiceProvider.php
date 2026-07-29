<?php

namespace App\Providers;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureTenantRouteBindings();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Resolve tenant-owned route parameters only through the authenticated user.
     */
    protected function configureTenantRouteBindings(): void
    {
        $bindings = [
            'customer' => 'customers',
            'category' => 'categories',
            'product' => 'products',
            'invoice' => 'invoices',
            'warehouse' => 'warehouses',
            'inventoryAdjustment' => 'inventoryAdjustments',
        ];

        foreach ($bindings as $parameter => $relation) {
            Route::bind($parameter, function (string $value) use ($relation): Model {
                $user = request()->user();
                abort_unless($user instanceof User, 404);

                $query = $user->{$relation}();

                return $query
                    ->where($query->getRelated()->getRouteKeyName(), $value)
                    ->firstOrFail();
            });
        }
    }
}
