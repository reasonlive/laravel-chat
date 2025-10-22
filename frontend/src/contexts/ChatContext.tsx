import {type FC, type ReactNode, createContext, useContext, useReducer, useEffect } from 'react';
import {ChatRoom, ChatMessage, User, MessageReaction, SendMessageData} from '../types';
import { chatService } from '../services/chatService';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { message } from 'antd';

interface ChatState {
    rooms: ChatRoom[];
    currentRoom: ChatRoom | null;
    messages: ChatMessage[];
    users: User[];
    loading: boolean;
    messagesLoading: boolean;
}

type ChatAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_MESSAGES_LOADING'; payload: boolean }
    | { type: 'SET_ROOMS'; payload: ChatRoom[] }
    | { type: 'ADD_ROOM'; payload: ChatRoom }
    | { type: 'UPDATE_ROOM'; payload: ChatRoom }
    | { type: 'DELETE_ROOM'; payload: number }
    | { type: 'SET_CURRENT_ROOM'; payload: ChatRoom | null }
    | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
    | { type: 'ADD_MESSAGE'; payload: ChatMessage }
    | { type: 'UPDATE_MESSAGE'; payload: ChatMessage }
    | { type: 'DELETE_MESSAGE'; payload: number }
    | { type: 'ADD_REACTION'; payload: { messageId: number; reaction: MessageReaction } }
    | { type: 'REMOVE_REACTION'; payload: { messageId: number; reactionId: number } }
    | { type: 'SET_USERS'; payload: User[] }
    | { type: 'UPDATE_USER_STATUS'; payload: User };

const initialState: ChatState = {
    rooms: [],
    currentRoom: null,
    messages: [],
    users: [],
    loading: false,
    messagesLoading: false,
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_MESSAGES_LOADING':
            return { ...state, messagesLoading: action.payload };
        case 'SET_ROOMS':
            return { ...state, rooms: action.payload };
        case 'ADD_ROOM':
            return { ...state, rooms: [action.payload, ...state.rooms] };
        case 'UPDATE_ROOM':
            return {
                ...state,
                rooms: state.rooms.map(room =>
                    room.id === action.payload.id ? action.payload : room
                ),
            };
        case 'DELETE_ROOM':
            return {
                ...state,
                rooms: state.rooms.filter(room => room.id !== action.payload),
                currentRoom: state.currentRoom?.id === action.payload ? null : state.currentRoom,
            };
        case 'SET_CURRENT_ROOM':
            return { ...state, currentRoom: action.payload };
        case 'SET_MESSAGES':
            return { ...state, messages: action.payload };
        case 'ADD_MESSAGE':
            return { ...state, messages: [...state.messages, action.payload] };
        case 'UPDATE_MESSAGE':
            return {
                ...state,
                messages: state.messages.map(msg =>
                    msg.id === action.payload.id ? action.payload : msg
                ),
            };
        case 'DELETE_MESSAGE':
            return {
                ...state,
                messages: state.messages.filter(msg => msg.id !== action.payload),
            };
        case 'ADD_REACTION':
            return {
                ...state,
                messages: state.messages.map(msg =>
                    msg.id === action.payload.messageId
                        ? {
                            ...msg,
                            reactions: [...msg.reactions, action.payload.reaction],
                        }
                        : msg
                ),
            };
        case 'REMOVE_REACTION':
            return {
                ...state,
                messages: state.messages.map(msg =>
                    msg.id === action.payload.messageId
                        ? {
                            ...msg,
                            reactions: msg.reactions.filter(r => r.id !== action.payload.reactionId),
                        }
                        : msg
                ),
            };
        case 'SET_USERS':
            return { ...state, users: action.payload };
        case 'UPDATE_USER_STATUS':
            return {
                ...state,
                users: state.users.map(user =>
                    user.id === action.payload.id ? action.payload : user
                ),
                messages: state.messages.map(msg =>
                    msg.user_id === action.payload.id
                        ? { ...msg, user: action.payload }
                        : msg
                ),
            };
        default:
            return state;
    }
};

interface ChatContextType {
    state: ChatState;
    loadRooms: () => Promise<void>;
    loadRoomMessages: (roomId: number) => Promise<void>;
    createRoom: (roomData: any) => Promise<void>;
    updateRoom: (roomId: number, roomData: any) => Promise<void>;
    deleteRoom: (roomId: number) => Promise<void>;
    setCurrentRoom: (room: ChatRoom | null) => void;
    sendMessage: (content: string, file?: File) => Promise<void>;
    editMessage: (messageId: number, content: string) => Promise<void>;
    deleteMessage: (messageId: number) => Promise<void>;
    addReaction: (messageId: number, reaction: string) => Promise<void>;
    removeReaction: (messageId: number, reactionId: number) => Promise<void>;
    loadUsers: () => Promise<void>;
    searchUsers: (query: string) => Promise<User[]>;
    addParticipant: (roomId: number, userId: number) => Promise<void>;
    removeParticipant: (roomId: number, participantId: number) => Promise<void>;
    downloadAttachment: (messageId: number) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(chatReducer, initialState);
    const { user } = useAuth();

    const loadRooms = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const rooms = await chatService.getRooms();
            dispatch({ type: 'SET_ROOMS', payload: rooms });
        } catch (error) {
            message.error('Failed to load rooms');
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const loadRoomMessages = async (roomId: number) => {
        dispatch({ type: 'SET_MESSAGES_LOADING', payload: true });
        try {
            const messages = await chatService.getRoomMessages(roomId);
            dispatch({ type: 'SET_MESSAGES', payload: messages });
        } catch (error) {
            message.error('Failed to load messages');
        } finally {
            dispatch({ type: 'SET_MESSAGES_LOADING', payload: false });
        }
    };

    const createRoom = async (roomData: any) => {
        try {
            const newRoom = await chatService.createRoom(roomData);
            dispatch({ type: 'ADD_ROOM', payload: newRoom });
            message.success('Room created successfully');
        } catch (error) {
            message.error('Failed to create room');
            throw error;
        }
    };

    const updateRoom = async (roomId: number, roomData: any) => {
        try {
            const updatedRoom = await chatService.updateRoom(roomId, roomData);
            dispatch({ type: 'UPDATE_ROOM', payload: updatedRoom });
            if (state.currentRoom?.id === roomId) {
                dispatch({ type: 'SET_CURRENT_ROOM', payload: updatedRoom });
            }
            message.success('Room updated successfully');
        } catch (error) {
            message.error('Failed to update room');
            throw error;
        }
    };

    const deleteRoom = async (roomId: number) => {
        try {
            await chatService.deleteRoom(roomId);
            dispatch({ type: 'DELETE_ROOM', payload: roomId });
            message.success('Room deleted successfully');
        } catch (error) {
            message.error('Failed to delete room');
            throw error;
        }
    };

    const setCurrentRoom = (room: ChatRoom | null) => {
        dispatch({ type: 'SET_CURRENT_ROOM', payload: room });
        if (!room) {
            dispatch({ type: 'SET_MESSAGES', payload: [] });
        }
    };

    const sendMessage = async (content: string, file?: File) => {
        if (!state.currentRoom || !user) return;

        try {
            const messageData: SendMessageData = {
                message: content,
                message_type: file ? 'file' : 'text',
                attachment: file,
            };

            const newMessage = await chatService.sendMessage(state.currentRoom.id, messageData);
            dispatch({ type: 'ADD_MESSAGE', payload: newMessage });

            // Update last message in rooms list
            const updatedRoom = { ...state.currentRoom, last_message: newMessage };
            dispatch({ type: 'UPDATE_ROOM', payload: updatedRoom });
        } catch (error) {
            message.error('Failed to send message');
            throw error;
        }
    };

    const editMessage = async (messageId: number, content: string) => {
        try {
            const updatedMessage = await chatService.updateMessage(messageId, content);
            dispatch({ type: 'UPDATE_MESSAGE', payload: updatedMessage });
            message.success('Message updated');
        } catch (error) {
            message.error('Failed to update message');
            throw error;
        }
    };

    const deleteMessage = async (messageId: number) => {
        try {
            await chatService.deleteMessage(messageId);
            dispatch({ type: 'DELETE_MESSAGE', payload: messageId });
            message.success('Message deleted');
        } catch (error) {
            message.error('Failed to delete message');
            throw error;
        }
    };

    const addReaction = async (messageId: number, reaction: string) => {
        try {
            const updatedMessage = await chatService.addReaction(messageId, reaction);
            const newReaction = updatedMessage.reactions.find(r =>
                r.reaction === reaction && r.user_id === user?.id
            );
            if (newReaction) {
                dispatch({
                    type: 'ADD_REACTION',
                    payload: { messageId, reaction: newReaction },
                });
            }
        } catch (error) {
            message.error('Failed to add reaction');
            throw error;
        }
    };

    const removeReaction = async (messageId: number, reactionId: number) => {
        try {
            await chatService.removeReaction(messageId, reactionId);
            dispatch({
                type: 'REMOVE_REACTION',
                payload: { messageId, reactionId },
            });
        } catch (error) {
            message.error('Failed to remove reaction');
            throw error;
        }
    };

    const loadUsers = async () => {
        try {
            const users = await userService.getUsers();
            dispatch({ type: 'SET_USERS', payload: users });
        } catch (error) {
            message.error('Failed to load users');
        }
    };

    const searchUsers = async (query: string): Promise<User[]> => {
        try {
            return await userService.searchUsers(query);
        } catch (error) {
            message.error('Failed to search users');
            return [];
        }
    };

    const addParticipant = async (roomId: number, userId: number) => {
        try {
            await chatService.addParticipant(roomId, userId);
            message.success('User added to room');
        } catch (error) {
            message.error('Failed to add user to room');
            throw error;
        }
    };

    const removeParticipant = async (roomId: number, participantId: number) => {
        try {
            await chatService.removeParticipant(roomId, participantId);
            message.success('User removed from room');
        } catch (error) {
            message.error('Failed to remove user from room');
            throw error;
        }
    };

    const downloadAttachment = async (messageId: number) => {
        try {
            const blob = await chatService.downloadAttachment(messageId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attachment_${messageId}`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            message.error('Failed to download attachment');
            throw error;
        }
    };

    // Load rooms on component mount
    useEffect(() => {
        if (user) {
            //loadRooms();
            //loadUsers();
        }
    }, [user]);

    const value: ChatContextType = {
        state,
        loadRooms,
        loadRoomMessages,
        createRoom,
        updateRoom,
        deleteRoom,
        setCurrentRoom,
        sendMessage,
        editMessage,
        deleteMessage,
        addReaction,
        removeReaction,
        loadUsers,
        searchUsers,
        addParticipant,
        removeParticipant,
        downloadAttachment,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
