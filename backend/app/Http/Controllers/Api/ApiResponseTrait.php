<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Throwable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

trait ApiResponseTrait
{
    /**
     * Успешный JSON ответ
     *
     * @param mixed $data
     * @param string|null $message
     * @param int $httpCode
     * @return JsonResponse
     */
    public function successResponse(
        mixed $data = null,
        ?string $message = null,
        int $httpCode = Response::HTTP_OK
    ): JsonResponse {
        $response = [
            'success' => true,
            'data' => $data,
        ];

        if ($message) {
            $response['message'] = $message;
        }

        return response()->json($response, $httpCode);
    }

    /**
     * Ответ с ошибкой
     *
     * @param Throwable $exception
     * @param string|null $customMessage
     * @param int $httpCode
     * @return JsonResponse
     */
    public function errorResponse(
        Throwable $exception,
        ?string $customMessage = null,
        int $httpCode = null
    ): JsonResponse {
        $httpCode = $httpCode ?? $this->getExceptionHttpCode($exception);

        $response = [
            'success' => false,
            'error' => $customMessage ?? $exception->getMessage(),
            'data' => null,
        ];

        // Добавляем детальную информацию в development среде
        if (config('app.debug')) {
            $response['debug'] = [
                'exception' => get_class($exception),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTrace(),
            ];
        }

        return response()->json($response, $httpCode);
    }

    /**
     * Универсальный метод для успеха или ошибки
     *
     * @param mixed $data Данные или исключение
     * @param bool $isSuccess Флаг успеха
     * @param string|null $errorMessage Сообщение об ошибке (если isSuccess = false)
     * @param int $httpCode HTTP код
     * @return JsonResponse
     */
    public function apiResponse(
        mixed $data = null,
        bool $isSuccess = true,
        ?string $errorMessage = null,
        int $httpCode = null
    ): JsonResponse {
        if (!$isSuccess && $data instanceof Throwable) {
            return $this->errorResponse($data, $errorMessage, $httpCode);
        }

        if ($isSuccess) {
            return $this->successResponse($data, $errorMessage, $httpCode ?? Response::HTTP_OK);
        }

        // Ручная ошибка без исключения
        $response = [
            'success' => false,
            'error' => $errorMessage ?? 'An error occurred',
            'data' => null,
        ];

        return response()->json($response, $httpCode ?? Response::HTTP_BAD_REQUEST);
    }

    /**
     * Получить HTTP код для исключения
     *
     * @param Throwable $exception
     * @return int
     */
    protected function getExceptionHttpCode(Throwable $exception): int
    {
        return match (true) {
            method_exists($exception, 'getStatusCode') => $exception->getStatusCode(),
            method_exists($exception, 'getCode') && $exception->getCode() >= 400 && $exception->getCode() < 600 => $exception->getCode(),
            $exception instanceof \Illuminate\Validation\ValidationException => Response::HTTP_UNPROCESSABLE_ENTITY,
            $exception instanceof \Illuminate\Auth\AuthenticationException => Response::HTTP_UNAUTHORIZED,
            $exception instanceof \Illuminate\Auth\Access\AuthorizationException => Response::HTTP_FORBIDDEN,
            $exception instanceof \Illuminate\Database\Eloquent\ModelNotFoundException => Response::HTTP_NOT_FOUND,
            $exception instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException => Response::HTTP_NOT_FOUND,
            $exception instanceof \Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException => Response::HTTP_METHOD_NOT_ALLOWED,
            default => Response::HTTP_INTERNAL_SERVER_ERROR,
        };
    }

    /**
     * Успешное создание ресурса
     *
     * @param mixed $data
     * @param string $message
     * @return JsonResponse
     */
    public function createdResponse(mixed $data = null, string $message = 'Resource created successfully'): JsonResponse
    {
        return $this->successResponse($data, $message, Response::HTTP_CREATED);
    }

    /**
     * Успешное обновление ресурса
     *
     * @param mixed $data
     * @param string $message
     * @return JsonResponse
     */
    public function updatedResponse(mixed $data = null, string $message = 'Resource updated successfully'): JsonResponse
    {
        return $this->successResponse($data, $message, Response::HTTP_OK);
    }

    /**
     * Успешное удаление ресурса
     *
     * @param string $message
     * @return JsonResponse
     */
    public function deletedResponse(string $message = 'Resource deleted successfully'): JsonResponse
    {
        return $this->successResponse(null, $message, Response::HTTP_OK);
    }

    /**
     * Ответ для коллекции с пагинацией
     *
     * @param LengthAwarePaginator $paginator
     * @param string|null $message
     * @return JsonResponse
     */
    public function paginatedResponse(LengthAwarePaginator $paginator, ?string $message = null): JsonResponse
    {
        $data = [
            'data' => $paginator->items(),
            'pagination' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        ];

        return $this->successResponse($data, $message);
    }

    /**
     * Ответ без контента (No Content)
     *
     * @return JsonResponse
     */
    public function noContentResponse(): JsonResponse
    {
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
