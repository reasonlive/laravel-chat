import {type FC, useState, useEffect } from 'react';
import {Layout, message as notifier} from 'antd';
import { useAuth } from '../hooks/useAuth';
import { chatService } from '../services/chatService';
import {ChatRoom, ChatMessage, CreateRoomData, SendMessageData, User} from '../types';
import { RoomList } from '../components/chat/RoomList';
import { MessageList } from '../components/chat/MessageList';
import { MessageInput } from '../components/chat/MessageInput';
import { RoomModal } from '../components/chat/RoomModal';
import { ParticipantsModal } from '../components/chat/ParticipantsModal';
import EchoService from "../services/EchoService";

const { Content } = Layout;
export const ChatPage: FC = () => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [roomsLoading, setRoomsLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [roomModalVisible, setRoomModalVisible] = useState(false);
    const [participantsModalVisible, setParticipantsModalVisible] = useState(false);

    useEffect(() => {
        loadRooms();
    }, []);

    useEffect(() => {
        if (selectedRoom) {
            loadRoomMessages(selectedRoom.id);

            const channel = selectedRoom.is_private
                ? 'chat.room.private.' + selectedRoom.id
                : 'chat.room.' + selectedRoom.id;

            new EchoService(channel, 'MessageSent')
                .setDataHandler((data: {sender: User, message: ChatMessage}) => {
                    const newMessage = {...data.message, user: data.sender};

                    setMessages(prev => [...prev, newMessage]);

                    // Update rooms list with last message
                    setRooms(prev => prev.map(room =>
                        room.id === selectedRoom.id
                            ? { ...room, last_message: newMessage }
                            : room
                    ));
                })
                .listen();

            new EchoService(channel, 'MessageUpdated')
                .setDataHandler((data: {message: ChatMessage}) => {
                    setMessages(prev => prev.map(msg =>
                        msg.id === data.message.id ? data.message : msg
                    ));
                })
                .listen();
        }
    }, [selectedRoom]);

    const loadRooms = async () => {
        try {
            const roomsData = await chatService.getRooms();
            setRooms(roomsData);
        } catch (error) {
            notifier.error('Failed to load rooms');
        } finally {
            setRoomsLoading(false);
        }
    };

    const loadRoomMessages = async (roomId: number) => {
        setMessagesLoading(true);
        try {
            const messagesData = await chatService.getRoomMessages(roomId);
            setMessages(messagesData);
        } catch (error) {
            notifier.error('Failed to load messages');
        } finally {
            setMessagesLoading(false);
        }
    };

    const handleCreateRoom = async (data: CreateRoomData) => {
        try {
            const newRoom = await chatService.createRoom(data);
            setRooms(prev => [newRoom, ...prev]);
            setRoomModalVisible(false);
            notifier.success('Room created successfully');
        } catch (error) {
            notifier.error('Failed to create room');
        }
    };

    const handleSendMessage = async (content?: string | null, file?: File) => {
        if (!selectedRoom || (!content && !file)) return;

        try {
            const messageData: SendMessageData = {
                message: content || file?.name as string,
                message_type: file ? 'file' : 'text',
                attachment: file,
            };

            await chatService.sendMessage(selectedRoom.id, messageData);
        } catch (error) {
            notifier.error('Failed to send message');
        }
    };

    const handleEditMessage = async (messageId: number, text: string) => {
        try {
            await chatService.updateMessage(messageId, text);
            notifier.success('Message updated');
        } catch (error) {
            notifier.error('Failed to update message');
        }
    };

    const handleDeleteMessage = async (messageId: number) => {
        try {
            await chatService.deleteMessage(messageId);
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
            notifier.success('Message deleted');
        } catch (error) {
            notifier.error('Failed to delete message');
        }
    };

    const handleAddReaction = async (messageId: number, reaction: string) => {
        try {
            const updatedMessage = await chatService.addReaction(messageId, reaction);
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? updatedMessage : msg
            ));
        } catch (error) {
            notifier.error('Failed to add reaction');
        }
    };

    const handleRemoveReaction = async (messageId: number, reactionId: number) => {
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
            notifier.error('Failed to remove reaction');
        }
    };

    // Download message attachment
    const handleDownloadAttachment = async (messageId: number) => {
        try {
            const blob = await chatService.downloadAttachment(messageId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attachment_${messageId}`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            notifier.error('Failed to download attachment');
        }
    };

    if (!user) return null;


    return (
        <Layout style={{ height: '90vh', display: 'flex', alignItems: 'stretch', flexDirection: 'row', overflow: 'auto' }}>
            <RoomList
                rooms={rooms}
                selectedRoom={selectedRoom}
                onRoomSelect={setSelectedRoom}
                onCreateRoom={() => setRoomModalVisible(true)}
                loading={roomsLoading}
            />

            <Content style={{ display: 'flex', flexDirection: 'column' }}>
                {selectedRoom ? (
                    <>
                        <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
                            <h3>{selectedRoom.name}</h3>
                            <p>{selectedRoom.description}</p>
                        </div>

                        <MessageList
                            messages={messages}
                            currentUserId={user.id}
                            onEditMessage={handleEditMessage}
                            onDeleteMessage={handleDeleteMessage}
                            onAddReaction={handleAddReaction}
                            onRemoveReaction={handleRemoveReaction}
                            onDownloadAttachment={handleDownloadAttachment}
                            loading={messagesLoading}
                        />

                        <MessageInput onSendMessage={handleSendMessage} />
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p>Select a room to start chatting</p>
                    </div>
                )}
            </Content>

            <RoomModal
                visible={roomModalVisible}
                onCancel={() => setRoomModalVisible(false)}
                onOk={handleCreateRoom}
            />

            <ParticipantsModal
                visible={participantsModalVisible}
                room={selectedRoom}
                onCancel={() => setParticipantsModalVisible(false)}
            />
        </Layout>
    );
};
