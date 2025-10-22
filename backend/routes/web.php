<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');

// Sanctum CSRF cookie for SPA
Route::get('/sanctum/csrf-cookie', function (Request $request) {
    $csrfToken = csrf_token();

    $cookie = cookie(
        'XSRF-TOKEN',
        $csrfToken,
        60 * 24 * 7, // 7 дней
        '/',
        null,
        false,
        true,
        false,
        'lax'
    );

    return response()->json([
        'message' => 'CSRF cookie set successfully',
        'csrf_token' => $csrfToken,
        'timestamp' => now()->toISOString(),
    ])->withCookie($cookie);
});

/*Route::post('/broadcasting/auth', function (Request $request) {
    if (!auth()->check()) {
        return response()->json(['error' => 'Unauthenticated'], 401);
    }

    // Проверяем CSRF токен для WebSocket аутентификации
    if (!$request->hasHeader('X-CSRF-TOKEN')) {

        return response()->json(['error' => 'CSRF token missing'], 403);
    }

    return response()->json(['auth' => auth()->user()->getRememberToken()]);
});*/
