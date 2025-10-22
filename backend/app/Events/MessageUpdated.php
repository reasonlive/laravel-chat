<?php

namespace App\Events;

use App\Models\Message;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageUpdated implements ShouldBroadcastNow, ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Message $message,
        public User $user
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            new Channel("chat.room.{$this->message->room_id}"),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'message' => array_merge(
                $this->message->toArray(),
                ['user' => $this->user->toArray()]
            )
        ];
    }
}
