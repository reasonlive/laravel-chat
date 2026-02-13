<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return !!$this->user();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'avatar' => ['sometimes', 'image', 'max:2048'],
            'password' => ['sometimes', 'string', 'min:8'],
        ];
    }

    protected function passedValidation(): void
    {
        $data = $this->safe();

        if ($data->has('avatar')) {
            $path = $this->file('avatar')->store('avatars', 'public');
            $this->replace(['avatar' => $path]);
        }

        if ($data->has('password')) {
            $this->replace(['password' => Hash::make($data['password'])]);
        }
    }
}
