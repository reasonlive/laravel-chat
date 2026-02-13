<?php

namespace App\Http\Controllers\Api;

use App\Events\UserStatusUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    use ApiResponseTrait;

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->validated());
        $token = $user->createToken('chat-app')->plainTextToken;

        return $this->createdResponse(['user' => $user, 'token' => $token]);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (Auth::attempt([
            'email' => $request->validated('email'),
            'password' => $request->validated('password')
        ])) {
            broadcast(new UserStatusUpdated($request->user(), true));

            return $this->successResponse([
                'user' => $request->user(),
                'token' => $request->user()->createToken('chat-app')->plainTextToken,
            ]);
        }

        return response()->json([
            'message' => 'Invalid credentials'
        ], 401);
    }

    public function logout(Request $request): JsonResponse
    {
        if ($request->user()) {
            broadcast(new UserStatusUpdated($request->user(), false));
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user();
        return $this->successResponse($user->load('chatRooms'));
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        User::update($request->validated());

        return $this->updatedResponse(
            $request->user()->fresh(),
            'Profile updated successfully'
        );
    }
}
