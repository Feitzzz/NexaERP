<?php

namespace App\Providers;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
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
        $this->configureRateLimiting();
        $this->configureTenantRouteBindings();
    }

    /**
     * Apply a user-aware application limit, falling back to the client IP for guests.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('web', function (Request $request): Limit {
            $limit = $request->isMethodSafe()
                ? (int) config('app.rate_limits.read_per_minute', 120)
                : (int) config('app.rate_limits.write_per_minute', 60);

            $key = $request->user()
                ? 'user:'.$request->user()->getAuthIdentifier()
                : 'ip:'.$request->ip();

            return Limit::perMinute($limit)->by($key);
        });
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
