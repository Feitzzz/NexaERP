<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    RateLimiter::clear('ip:127.0.0.1');

    Route::middleware('web')->get('/testing/server-error', function () {
        throw new RuntimeException('Sensitive database connection details');
    });

    Route::middleware('web')->post('/testing/server-error', function () {
        throw new RuntimeException('Sensitive database connection details');
    });
});

afterEach(function () {
    RateLimiter::clear('ip:127.0.0.1');
});

test('web requests are rate limited by client', function () {
    config()->set('app.rate_limits.read_per_minute', 2);

    $this->get('/')->assertOk();
    $this->get('/')->assertOk();
    $this->get('/')->assertTooManyRequests();
});

test('inertia page exceptions render a safe error page', function () {
    $version = app(HandleInertiaRequests::class)->version(Request::create('/testing/server-error'));

    $this->withHeaders([
        'X-Inertia' => 'true',
        'X-Inertia-Version' => $version,
    ])
        ->get('/testing/server-error')
        ->assertStatus(500)
        ->assertHeader('X-Inertia', 'true')
        ->assertJsonPath('component', 'errors/error')
        ->assertJsonPath('props.status', 500)
        ->assertJsonPath('props.message', 'Something went wrong. Please try again later.')
        ->assertDontSee('Sensitive database connection details');
});

test('initial html page exceptions render a safe error page', function () {
    $this->get('/testing/server-error')
        ->assertStatus(500)
        ->assertInertia(fn ($page) => $page
            ->component('errors/error')
            ->where('status', 500)
            ->where('message', 'Something went wrong. Please try again later.')
        )
        ->assertDontSee('Sensitive database connection details');
});

test('failed inertia mutations redirect without exposing exception details', function () {
    $this->withHeaders([
        'X-Inertia' => 'true',
        'Referer' => url('/dashboard'),
    ])->post('/testing/server-error')
        ->assertRedirect('/dashboard')
        ->assertDontSee('Sensitive database connection details');
});

test('json exceptions never expose stack traces', function () {
    $this->postJson('/testing/server-error')
        ->assertStatus(500)
        ->assertExactJson([
            'message' => 'Something went wrong. Please try again later.',
        ]);
});
