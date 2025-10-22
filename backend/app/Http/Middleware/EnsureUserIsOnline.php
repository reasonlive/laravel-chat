<?php

namespace App\Http\Middleware;

use App\Events\UserStatusUpdated;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsOnline
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && !$user->is_online) {
            $user->update([
                'is_online' => true,
                'last_seen_at' => now(),
            ]);

            broadcast(new UserStatusUpdated($user))->toOthers();
        }

        return $next($request);
    }
}
