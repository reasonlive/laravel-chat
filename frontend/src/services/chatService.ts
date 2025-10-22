import { apiService } from './api';
import {
    ChatRoom,
    ChatMessage,
    Participant,
    CreateRoomData,
    SendMessageData,
    ApiResponse,
    ChatRoomMessages
} from '../types';

class ChatService {
    // Rooms
    public async getRooms(): Promise<ChatRoom[]> {
        const response = await apiService.getClient().get<ApiResponse<ChatRoom[]>>('/rooms');
        return response.data.data;
    }

    public async getRoom(roomId: number): Promise<ChatRoom> {
        const response = await apiService.getClient().get<ApiResponse<ChatRoom>>(`/rooms/${roomId}`);
        return response.data.data;
    }

    public async createRoom(roomData: CreateRoomData): Promise<ChatRoom> {
        const response = await apiService.getClient().post<ApiResponse<ChatRoom>>('/rooms', roomData);
        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.error);
    }

    public async updateRoom(roomId: number, roomData: Partial<CreateRoomData>): Promise<ChatRoom> {
        const response = await apiService.getClient().put<ApiResponse<ChatRoom>>(`/rooms/${roomId}`, roomData);
        return response.data.data;
    }

    public async deleteRoom(roomId: number): Promise<void> {
        await apiService.getClient().delete(`/rooms/${roomId}`);
    }

    // Messages
    public async getRoomMessages(roomId: number): Promise<ChatMessage[]> {
        const response = await apiService.getClient().get<ApiResponse<ChatRoomMessages>>(`/rooms/${roomId}/messages`);
        if (response.data.success) {
            return response.data.data.messages;
        }

        throw new Error(response.data.error);
    }

    public async sendMessage(roomId: number, messageData: SendMessageData): Promise<ChatMessage> {
        const response = await apiService.getClient().post<ApiResponse<ChatMessage>>(
            `/rooms/${roomId}/messages`,
            messageData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.error);
    }

    public async updateMessage(messageId: number, message: string): Promise<ChatMessage> {
        const response = await apiService.getClient().put<ApiResponse<ChatMessage>>(`/messages/${messageId}`, {
            message,
        });
        return response.data.data;
    }

    public async deleteMessage(messageId: number): Promise<void> {
        await apiService.getClient().delete(`/messages/${messageId}`);
    }

    public async downloadAttachment(messageId: number): Promise<Blob> {
        const response = await apiService.getClient().get(`/messages/${messageId}/download`, {
            responseType: 'blob',
        });
        return response.data;
    }

    // Reactions
    public async addReaction(messageId: number, reaction: string): Promise<ChatMessage> {
        const response = await apiService.getClient().post<ApiResponse<ChatMessage>>(`/messages/${messageId}/reactions`, {
            reaction,
        });
        return response.data.data;
    }

    public async removeReaction(messageId: number, reactionId: number): Promise<void> {
        await apiService.getClient().delete(`/messages/${messageId}/reactions`, {
            data: { reaction_id: reactionId },
        });
    }

    // Participants
    public async addParticipant(roomId: number, userId: number): Promise<Participant> {
        const response = await apiService.getClient().post<ApiResponse<Participant>>(`/rooms/${roomId}/participants`, {
            user_id: userId,
        });

        return response.data.data;
    }

    public async removeParticipant(roomId: number, participantId: number): Promise<void> {
        await apiService.getClient().delete(`/rooms/${roomId}/participants/${participantId}`);
    }
}

export const chatService = new ChatService();
