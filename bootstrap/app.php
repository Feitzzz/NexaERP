<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            ThrottleRequests::class.':web',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->respond(function (Response $response, Throwable $exception, Request $request): Response {
            $status = $response->getStatusCode();

            if ($request->expectsJson() && $status >= 500) {
                return response()->json([
                    'message' => 'Something went wrong. Please try again later.',
                ], $status);
            }

            if ($status < 400 || (! $request->header('X-Inertia') && ! $request->acceptsHtml())) {
                return $response;
            }

            if (! $request->header('X-Inertia') && (! $request->isMethodSafe() || $status === 429)) {
                return $response;
            }

            $messages = [
                403 => 'You do not have permission to perform this action.',
                404 => 'The requested page or record could not be found.',
                419 => 'Your session expired. Please refresh the page and try again.',
                429 => 'Too many requests. Please wait a moment and try again.',
                503 => 'The service is temporarily unavailable. Please try again shortly.',
            ];
            $message = $messages[$status] ?? 'Something went wrong. Please try again later.';

            if (! $request->isMethodSafe() || in_array($status, [419, 429], true)) {
                Inertia::flash('toast', ['type' => 'error', 'message' => $message]);

                $redirect = back();
                foreach (['Retry-After', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'] as $header) {
                    if ($response->headers->has($header)) {
                        $redirect->headers->set($header, (string) $response->headers->get($header));
                    }
                }

                return $redirect;
            }

            return Inertia::render('errors/error', [
                'status' => $status,
                'message' => $message,
            ])->toResponse($request)->setStatusCode($status);
        });
    })->create();
