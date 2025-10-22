<?php

namespace App\Http\Controllers\Api;

use App\Enums\User\Role;
use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ChatRoomController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $rooms = Room::withStats()->get();
        return $this->successResponse($rooms);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_private' => ['boolean'],
            'participants' => ['required', 'array', 'min:1'],
            'participants.*' => ['exists:users,id'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $room = Room::create([
                'name' => $request->name,
                'description' => $request->description,
                'is_private' => $request->is_private ?? false,
                'creator_id' => $request->user()->id,
            ]);

            // Add creator as owner
            Participant::create([
                'room_id' => $room->id,
                'user_id' => $request->user()->id,
                'role' => Role::OWNER
            ]);

            // Add other participants
            foreach ($request->participants as $participantId) {
                if ($participantId != $request->user()->id) {
                    Participant::create([
                        'room_id' => $room->id,
                        'user_id' => $participantId,
                        'role' => Role::MEMBER
                    ]);
                }
            }

            DB::commit();

            $room->load(['creator', 'participants.user']);

            return $this->createdResponse($room);
        } catch (\Throwable $e) {
            DB::rollBack();
            error_log($e->getMessage());
            return $this->errorResponse($e);
        }
    }

    public function show(Request $request, Room $room): JsonResponse
    {
        $user = $request->user();

        // Check if user is participant
        if (!$room->participants()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'Access denied'
            ], 403);
        }

        $room->load(['creator', 'participants.user']);

        // Update last read time
        $room->participants()
            ->where('user_id', $user->id)
            ->update(['last_read_at' => now()]);

        return $this->successResponse($room);
    }

    public function addParticipant(Request $request, Room $room): JsonResponse
    {
        $user = $request->user();

        // Check if user has permission to add participants
        $participant = $room->participants()->where('user_id', $user->id)->first();
        if (!in_array($participant->role, ['owner', 'admin', 'member'])) {
            return response()->json([
                'message' => 'You do not have permission to add participants'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => ['required', 'exists:users,id', Rule::notIn($room->participants()->pluck('user_id'))],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        Participant::create([
            'room_id' => $room->id,
            'user_id' => $request->user_id,
            'role' => 'member',
        ]);

        $room->load('participants.user');

        return $this->createdResponse($room, 'Participant added');
    }

    public function removeParticipant(Request $request, Room $room, User $participant): JsonResponse
    {
        $user = $request->user();

        // Check if user has permission to remove participants
        $userParticipant = $room->participants()->where('user_id', $user->id)->first();
        if (!in_array($userParticipant->role, ['owner', 'admin'])) {
            return response()->json([
                'message' => 'You do not have permission to remove participants'
            ], 403);
        }

        // Prevent removing owner
        $targetParticipant = $room->participants()->where('user_id', $participant->id)->first();
        if ($targetParticipant->role === 'owner') {
            return response()->json([
                'message' => 'Cannot remove room owner'
            ], 403);
        }

        $targetParticipant->delete();

        return $this->deletedResponse('Participant removed successfully');
    }
}
