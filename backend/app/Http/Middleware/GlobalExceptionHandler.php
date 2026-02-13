<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Symfony\Component\ErrorHandler\Error\FatalError;
use Throwable;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;
use Symfony\Component\HttpFoundation\Response;

class GlobalExceptionHandler
{
    public function handle(Request $request, Closure $next)
    {
        try {
            return $next($request);
        } catch (Throwable $e) {
            return $this->handleException($e, $request);
        }
    }

    protected function handleException(Throwable $e, Request $request): JsonResponse
    {
        // Логирование ошибки
        $this->logError($e, $request);

        // Обработка специфических исключений
        return match (true) {
            $e instanceof ValidationException => $this->handleValidationException($e),
            $e instanceof AuthenticationException => $this->handleAuthenticationException($e),
            $e instanceof AuthorizationException => $this->handleAuthorizationException($e),
            $e instanceof ModelNotFoundException => $this->handleModelNotFoundException($e),
            $e instanceof NotFoundHttpException => $this->handleNotFoundHttpException($e),
            $e instanceof MethodNotAllowedHttpException => $this->handleMethodNotAllowedException($e),
            $e instanceof TooManyRequestsHttpException => $this->handleTooManyRequestsException($e),
            $e instanceof QueryException => $this->handleQueryException($e),
            default => $this->handleGenericException($e),
        };
    }

    protected function handleValidationException(ValidationException $e): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors(),
            'code' => 'VALIDATION_ERROR'
        ], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    protected function handleAuthenticationException(AuthenticationException $e): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Unauthenticated',
            'code' => 'UNAUTHENTICATED'
        ], Response::HTTP_UNAUTHORIZED);
    }

    protected function handleAuthorizationException(AuthorizationException $e): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'This action is unauthorized',
            'code' => 'UNAUTHORIZED'
        ], Response::HTTP_FORBIDDEN);
    }

    protected function handleModelNotFoundException(ModelNotFoundException $e): JsonResponse
    {
        $model = class_basename($e->getModel());

        return response()->json([
            'success' => false,
            'message' => "$model not found",
            'code' => 'RESOURCE_NOT_FOUND'
        ], Response::HTTP_NOT_FOUND);
    }

    protected function handleNotFoundHttpException(NotFoundHttpException $e): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Endpoint not found',
            'code' => 'ENDPOINT_NOT_FOUND'
        ], Response::HTTP_NOT_FOUND);
    }

    protected function handleMethodNotAllowedException(MethodNotAllowedHttpException $e): JsonResponse
    {
        error_log('hellowrlld');
        return response()->json([
            'success' => false,
            'message' => 'Method not allowed for this endpoint',
            'allowed_methods' => $e->getHeaders()['Allow'] ?? [],
            'code' => 'METHOD_NOT_ALLOWED'
        ], Response::HTTP_METHOD_NOT_ALLOWED);
    }

    protected function handleTooManyRequestsException(TooManyRequestsHttpException $e): JsonResponse
    {
        $retryAfter = $e->getHeaders()['Retry-After'] ?? null;

        $response = [
            'success' => false,
            'message' => 'Too many requests',
            'code' => 'RATE_LIMIT_EXCEEDED'
        ];

        if ($retryAfter) {
            $response['retry_after'] = $retryAfter;
        }

        return response()->json($response, Response::HTTP_TOO_MANY_REQUESTS);
    }

    protected function handleQueryException(QueryException $e): JsonResponse
    {
        $errorCode = $e->getCode();

        // Обработка различных SQL ошибок
        switch ($errorCode) {
            case 23000: // Integrity constraint violation
                return response()->json([
                    'success' => false,
                    'message' => 'Database integrity constraint violation',
                    'code' => 'DATABASE_INTEGRITY_ERROR'
                ], Response::HTTP_CONFLICT);

            case 'HY000': // General database error
            default:
                return response()->json([
                    'success' => false,
                    'message' => 'Database error occurred',
                    'code' => 'DATABASE_ERROR'
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    protected function handleGenericException(Throwable $e): JsonResponse
    {
        $statusCode = method_exists($e, 'getStatusCode')
            ? $e->getStatusCode()
            : Response::HTTP_INTERNAL_SERVER_ERROR;

        $response = [
            'success' => false,
            'message' => 'Internal server error',
            'code' => 'INTERNAL_ERROR'
        ];

        // В development среде добавляем детальную информацию об ошибке
        if (app()->environment('local', 'development')) {
            $response['debug'] = [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTrace(),
            ];
        }

        return response()->json($response, $statusCode);
    }

    protected function logError(Throwable $e, Request $request): void
    {
        $context = [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => auth()->id(),
            'exception_type' => get_class($e),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ];

        // Разные уровни логирования для разных типов ошибок
        $logLevel = match (true) {
            $e instanceof ValidationException => 'info',
            $e instanceof AuthenticationException => 'notice',
            $e instanceof AuthorizationException => 'warning',
            $e instanceof ModelNotFoundException => 'info',
            $e instanceof NotFoundHttpException => 'info',
            default => 'error',
        };

        Log::$logLevel("Exception: {$e->getMessage()}", $context);
    }
}
