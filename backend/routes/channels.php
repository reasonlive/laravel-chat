<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.room.{roomId}', function (User $user, int $roomId) {
    return true;
    //return $user->chatRooms()->where('room_id', $roomId)->exists();
});

Broadcast::channel('chat.room.private.{roomId}', function (User $user, int $roomId) {
    return $user->chatRooms()->where('room_id', $roomId)->exists();
});

Broadcast::channel('chat.users', function (User $user) {
    return $user !== null;
});
