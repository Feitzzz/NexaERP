<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateBusinessRequest;
use App\Models\User;
use App\Services\BusinessService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BusinessController extends Controller
{
    public function show(): Response
    {
        /** @var User $business */
        $business = auth()->user();

        return Inertia::render('business/show', [
            'business' => $business->load('address'),
        ]);
    }

    public function edit(): Response
    {
        /** @var User $business */
        $business = auth()->user();

        return Inertia::render('business/edit', [
            'business' => $business->load('address'),
        ]);
    }

    public function update(UpdateBusinessRequest $request, BusinessService $businessService): RedirectResponse
    {
        /** @var User $business */
        $business = $request->user();

        $businessService->updateBusiness($business, $request->validated());

        return redirect()->route('business.show')->with('status', 'Business profile updated.');
    }
}
