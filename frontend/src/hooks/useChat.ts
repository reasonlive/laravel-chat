import { useState, useEffect, useCallback } from 'react';
import {ChatRoom, ChatMessage, SendMessageData} from '../types';
import { chatService } from '../services/chatService';
import { useAuth } from './useAuth';

export const useChat = () => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);

    // Load all rooms
    const loadRooms = useCallback(async () => {
        setLoading(true);
        try {
            const roomsData = await chatService.getRooms();
            setRooms(roomsData);
        } catch (error) {
            console.error('Failed to load rooms:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Select a room and load its messages
    const selectRoom = useCallback(async (room: ChatRoom | null) => {
        setCurrentRoom(room);
        if (room) {
            setLoading(true);
            try {
                const messagesData = await chatService.getRoomMessages(room.id);
                setMessages(messagesData);
            } catch (error) {
                console.error('Failed to load messages:', error);
            } finally {
                setLoading(false);
            }
        } else {
            setMessages([]);
        }
    }, []);

    // Send a message
    const sendMessage = useCallback(async (content: string, file?: File) => {
        if (!currentRoom || !content.trim()) return;

        try {
            const messageData: SendMessageData = {
                message: content,
                message_type: file ? 'file' : 'text',
                attachment: file,
            };

            const newMessage = await chatService.sendMessage(currentRoom.id, messageData);
            setMessages(prev => [...prev, newMessage]);

            // Update rooms list with last message
            setRooms(prev => prev.map(room =>
                room.id === currentRoom.id
                    ? { ...room, last_message: newMessage }
                    : room
            ));
        } catch (error) {
            throw error;
        }
    }, [currentRoom]);

    // Update a message
    const updateMessage = useCallback(async (messageId: number, content: string) => {
        try {
            const updatedMessage = await chatService.updateMessage(messageId, content);
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? updatedMessage : msg
            ));
        } catch (error) {
            throw error;
        }
    }, []);

    // Delete a message
    const deleteMessage = useCallback(async (messageId: number) => {
        try {
            await chatService.deleteMessage(messageId);
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
        } catch (error) {
            throw error;
        }
    }, []);

    // Add reaction to message
    const addReaction = useCallback(async (messageId: number, reaction: string) => {
        try {
            const updatedMessage = await chatService.addReaction(messageId, reaction);
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? updatedMessage : msg
            ));
        } catch (error) {
            throw error;
        }
    }, []);

    // Remove reaction from message
    const removeReaction = useCallback(async (messageId: number, reactionId: number) => {
        try {
            await chatService.removeReaction(messageId, reactionId);
            setMessages(prev => prev.map(msg =>
                msg.id === messageId
                    ? {
                        ...msg,
                        reactions: msg.reactions.filter(r => r.id !== reactionId),
                    }
                    : msg
            ));
        } catch (error) {
            throw error;
        }
    }, []);

    // Create new room
    const createRoom = useCallback(async (roomData: any) => {
        try {
            const newRoom = await chatService.createRoom(roomData);
            setRooms(prev => [newRoom, ...prev]);
            return newRoom;
        } catch (error) {
            throw error;
        }
    }, []);

    // Delete room
    const deleteRoom = useCallback(async (roomId: number) => {
        try {
            await chatService.deleteRoom(roomId);
            setRooms(prev => prev.filter(room => room.id !== roomId));
            if (currentRoom?.id === roomId) {
                setCurrentRoom(null);
                setMessages([]);
            }
        } catch (error) {
            throw error;
        }
    }, [currentRoom]);

    useEffect(() => {
        if (user) {
            loadRooms();
        }
    }, [user, loadRooms]);

    return {
        rooms,
        currentRoom,
        messages,
        loading,
        loadRooms,
        selectRoom,
        sendMessage,
        updateMessage,
        deleteMessage,
        addReaction,
        removeReaction,
        createRoom,
        deleteRoom,
    };
};
