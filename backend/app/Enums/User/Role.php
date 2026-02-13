<?php

namespace App\Enums\User;

enum Role: string
{
    case OWNER = 'owner';
    case ADMIN = 'admin';
    case MEMBER = 'member';

    public static function names(): array
    {
        return array_column(self::cases(), 'name');
    }
}
