<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Events\MessageReactionUpdated;
use App\Events\MessageUpdated;
use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ChatMessageController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request, Room $room): JsonResponse
    {
        $user = $request->user();

        $messages = Message::with(['user'])
            ->where('room_id', $room->id)
            ->orderBy('created_at')
            ->get();

        // Update last read time
        $room->participants()
            ->where('user_id', $user->id)
            ->update(['last_read_at' => now()]);

        return $this->successResponse([
            'messages' => $messages,
            'room' => $room->load('participants.user')
        ]);
    }

    public function store(Request $request, Room $room): JsonResponse
    {
        try {
            $user = $request->user();

            $validator = Validator::make($request->all(), [
                'message' => ['string', 'required', 'max:2000'],
                'attachment' => ['file', 'nullable', 'max:10240'], // 10MB
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'errors' => $validator->errors()
                ], 422);
            }

            $attachmentPath = null;
            $attachmentName = null;
            $attachmentSize = null;

            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $fileName = Str::random(20) . '.' . $file->getClientOriginalExtension();
                $attachmentPath = $file->storeAs('attachments', $fileName, 'public');
                $attachmentName = $file->getClientOriginalName();
                $attachmentSize = $file->getSize();
            }

            $message = Message::create([
                'room_id' => $room->id,
                'user_id' => $user->id,
                'message' => $request->message ?? '',
                'attachment' => $attachmentPath,
                'attachment_name' => $attachmentName,
                'attachment_size' => $attachmentSize,
                'reactions' => []
            ]);

            // Broadcast event
            MessageSent::dispatch($message, $user);

            // Update room updated_at
            $room->touch();

            // TODO: make resources
            return $this->createdResponse(array_merge($message->toArray(), ['user' => [
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar,
                'email' => $user->email,
                'online_status' => $user->is_online ? 'online' : 'offline',
            ]]), 'Message sent');

        } catch (\Throwable $e) {
            error_log($e->getMessage());
            return $this->errorResponse($e);
        }
    }

    public function update(Request $request, Message $message): JsonResponse
    {
        $user = $request->user();

        // Check if user owns the message
        if ($message->user_id !== $user->id) {
            return response()->json([
                'message' => 'You can only edit your own messages'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'message' => ['required', 'string', 'max:2000'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $message->update([
            'message' => $request->message,
            'is_edited' => true,
        ]);

        // Broadcast update
        MessageUpdated::dispatch($message, $user);

        return $this->updatedResponse($message, 'Message updated');
    }

    public function destroy(Request $request, Message $message): JsonResponse
    {
        $user = $request->user();

        if ($message->user_id !== $user->id) {
            return response()->json([
                'message' => 'You do not have permission to delete this message'
            ], 403);
        }

        $message->delete();

        return $this->deletedResponse('Message deleted');
    }

    public function addReaction(Request $request, Message $message): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reaction' => ['required', 'string', 'max:10'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $message->addReaction($request->reaction, $request->user()->id);

        MessageReactionUpdated::dispatch($message);

        return response()->json([
            'message' => $message->fresh(),
            'status' => 'Reaction added successfully'
        ]);
    }

    public function removeReaction(Request $request, Message $message): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reaction' => ['required', 'string', 'max:10'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $message->removeReaction($request->reaction, $request->user()->id);

        MessageReactionUpdated::dispatch($message);

        return response()->json([
            'message' => $message->fresh(),
            'status' => 'Reaction removed successfully'
        ]);
    }

    public function downloadAttachment(Message $message)
    {
        if (!$message->attachment) {
            return response()->json([
                'message' => 'No attachment found'
            ], 404);
        }

        $user = auth()->user();

        if (!Storage::disk('public')->exists($message->attachment)) {
            return response()->json([
                'message' => 'File not found'
            ], 404);
        }

        $filePath = Storage::disk('public')->path($message->attachment);

        return response()->download($filePath, $message->attachment_name);
    }
}
