<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

/**
 * @method static \Illuminate\Database\Eloquent\Builder|Room withStats()*
 */
class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'is_private',
        'creator_id',
    ];

    protected function casts(): array
    {
        return [
            'is_private' => 'boolean',
        ];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'participants')
            ->withPivot(['role', 'joined_at', 'last_read_at'])
            ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    /**
     * @param Builder $query
     * @return Builder
     */
    public function scopeWithStats(Builder $query): Builder
    {
        return $query->select([
            'rooms.id',
            'rooms.name',
            'rooms.description',
            'rooms.creator_id',
            'rooms.is_private',
            'rooms.created_at',
            'rooms.updated_at',
            DB::raw('COUNT(DISTINCT messages.id) as messages_count'),
            DB::raw('COUNT(DISTINCT participants.user_id) as participants_count'),
        ])
            ->leftJoin('messages', 'rooms.id', '=', 'messages.room_id')
            ->leftJoin('participants', 'rooms.id', '=', 'participants.room_id')
            ->groupBy('rooms.id')
            ->orderBy('rooms.updated_at', 'desc');
    }
}
