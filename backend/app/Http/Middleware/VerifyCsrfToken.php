<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // Исключения для API если нужно
        // 'api/*',
        'broadcasting/auth',
    ];

    /**
     * Add the CSRF token to the response cookies.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Illuminate\Http\Response  $response
     */
    protected function addCookieToResponse($request, $response)
    {
        $config = config('session');

        $response->headers->setCookie(
            new \Symfony\Component\HttpFoundation\Cookie(
                'XSRF-TOKEN',
                $request->session()->token(),
                time() + 60 * $config['lifetime'],
                $config['path'],
                $config['domain'],
                $config['secure'],
                false,
                false,
                $config['same_site'] ?? null
            )
        );

        return $response;
    }
}
