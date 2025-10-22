export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    online_status: 'online' | 'offline' | 'away';
    last_seen?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ChatRoom {
    id: number;
    name: string;
    description?: string;
    creator_id: number;
    is_private: boolean;
    participants_count?: number;
    messages_count?: number;
    last_message?: ChatMessage;
    created_at: string;
    updated_at: string;
}

export interface ChatMessage {
    id: number;
    room_id: number;
    user_id: number;
    message: string;
    message_type: 'text' | 'image' | 'file';
    attachment?: string;
    attachment_name?: string | undefined;
    attachment_size?: string | undefined;
    user: User;
    reactions: MessageReaction[];
    created_at: string;
    updated_at: string;
}

export interface ChatRoomMessages {
    messages: ChatMessage[];
    room: ChatRoom;
}

export interface MessageReaction {
    id: number;
    message_id: number;
    user_id: number;
    reaction: string;
    user: User;
    created_at: string;
}

export interface Participant {
    id: number;
    user_id: number;
    room_id: number;
    role: 'admin' | 'member' | 'owner';
    user: User;
    joined_at: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface CreateRoomData {
    name: string;
    description?: string;
    is_private: boolean;
    participants: number[];
}

export interface SendMessageData {
    message: string;
    message_type: 'text' | 'image' | 'file';
    attachment?: File;
}
