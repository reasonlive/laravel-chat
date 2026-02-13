<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatMessageController;
use App\Http\Controllers\Api\ChatRoomController;
use App\Http\Controllers\Api\UserController;
use App\Http\Middleware\EnsureUserIsOnline;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Protected routes with Sanctum
Route::middleware(['auth:sanctum', EnsureUserIsOnline::class])->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);
        Route::put('profile', [AuthController::class, 'updateProfile']);
        Route::post('refresh-token', [AuthController::class, 'refreshToken']);

        Route::get('/csrf-token', function (Request $request) {
            $csrfToken = csrf_token();

            $cookie = cookie(
                'XSRF-TOKEN',
                $csrfToken,
                60 * 24 * 7,
                '/',
                null,
                false,
                true,
                false,
                'lax'
            );

            return response()->json([
                'csrf_token' => $csrfToken,
                'user_id' => $request->user()->id,
                'expires_in' => 60 * 24 * 7,
            ])->withCookie($cookie);
        });
    });

    // Users
    Route::get('users', [UserController::class, 'index']);
    Route::get('users/search', [UserController::class, 'search']);
    Route::post('users/status', [UserController::class, 'updateOnlineStatus']);

    // Chat Rooms
    Route::apiResource('rooms', ChatRoomController::class);
    Route::post('rooms/{room}/participants', [ChatRoomController::class, 'addParticipant']);
    Route::delete('rooms/{room}/participants/{participant}', [ChatRoomController::class, 'removeParticipant']);

    // Chat Messages
    Route::get('rooms/{room}/messages', [ChatMessageController::class, 'index']);
    Route::post('rooms/{room}/messages', [ChatMessageController::class, 'store']);
    Route::patch('messages/{message}', [ChatMessageController::class, 'update']);
    Route::delete('messages/{message}', [ChatMessageController::class, 'destroy']);
    Route::post('messages/{message}/reactions', [ChatMessageController::class, 'addReaction']);
    Route::delete('messages/{message}/reactions', [ChatMessageController::class, 'removeReaction']);
    Route::get('messages/{message}/download', [ChatMessageController::class, 'downloadAttachment']);
});
