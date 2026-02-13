<?php

namespace App\Models;

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'room_id',
        'user_id',
        'message',
        'attachment',
        'attachment_name',
        'attachment_size',
        'reactions',
        'is_edited',
    ];

    protected function casts(): array
    {
        return [
            'reactions' => 'array',
            'is_edited' => 'boolean',
        ];
    }

    public function chatRoom(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function addReaction(string $reaction, int $userId): void
    {
        $reactions = $this->reactions ?? [];

        if (!isset($reactions[$reaction])) {
            $reactions[$reaction] = [];
        }

        if (!in_array($userId, $reactions[$reaction])) {
            $reactions[$reaction][] = $userId;
        }

        $this->reactions = $reactions;
        $this->save();
    }

    public function removeReaction(string $reaction, int $userId): void
    {
        $reactions = $this->reactions ?? [];

        if (isset($reactions[$reaction])) {
            $reactions[$reaction] = array_diff($reactions[$reaction], [$userId]);

            if (empty($reactions[$reaction])) {
                unset($reactions[$reaction]);
            }
        }

        $this->reactions = $reactions;
        $this->save();
    }
}
