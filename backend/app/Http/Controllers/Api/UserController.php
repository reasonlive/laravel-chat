<?php

namespace App\Http\Controllers\Api;

use App\Events\UserStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $users = User::where('id', '!=', $request->user()->id)
            ->select(['id', 'name', 'email', 'avatar', 'is_online', 'last_seen_at'])
            ->orderBy('name')
            ->get();

        return $this->successResponse($users);
    }

    public function search(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'query' => ['required', 'string', 'min:2', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $users = User::where('id', '!=', $request->user()->id)
            ->where(function ($query) use ($request) {
                $query->where('name', 'like', "%{$request->query}%")
                    ->orWhere('email', 'like', "%{$request->query}%");
            })
            ->select(['id', 'name', 'email', 'avatar', 'is_online', 'last_seen_at'])
            ->limit(10)
            ->get();

        return $this->successResponse($users);
    }

    public function updateOnlineStatus(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->update([
            'is_online' => $request->is_online,
            'last_seen_at' => $request->is_online ? now() : $user->last_seen_at,
        ]);

        broadcast(new UserStatusUpdated($user));

        return $this->updatedResponse($user, 'Status updated successfully');
    }
}
