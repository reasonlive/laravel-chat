import {type FC, useState, useEffect } from 'react';
import { Modal, List, Button, Tag, Input, Space, message } from 'antd';
import { SearchOutlined, UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons';
import { ChatRoom, User, Participant } from '../../types';
import { userService } from '../../services/userService';
import { chatService } from '../../services/chatService';
import { UserAvatar } from '../common/UserAvatar';

interface ParticipantsModalProps {
    visible: boolean;
    room: ChatRoom | null;
    onCancel: () => void;
}

export const ParticipantsModal: FC<ParticipantsModalProps> = ({ visible, room, onCancel }) => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    //const [searchLoading, setSearchLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && room) {
            loadParticipants();
        }
    }, [visible, room]);

    const loadParticipants = async () => {
        // Note: You might need to add an endpoint to get room participants
        // For now, we'll simulate this
        setLoading(true);
        try {
            // This would be an actual API call
            // const participantsData = await chatService.getRoomParticipants(room.id);
            // setParticipants(participantsData);
        } catch (error) {
            message.error('Failed to load participants');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const users = await userService.searchUsers(query);
            // Filter out users who are already participants
            const filteredUsers = users.filter(user =>
                !participants.some(p => p.user_id === user.id)
            );
            setSearchResults(filteredUsers);
        } catch (error) {
            message.error('Failed to search users');
        }
    };

    const handleAddParticipant = async (user: User) => {
        if (!room) return;

        try {
            const participant = await chatService.addParticipant(room.id, user.id);
            setParticipants(prev => [...prev, participant]);
            setSearchResults(prev => prev.filter(u => u.id !== user.id));
            message.success(`Added ${user.name} to the room`);
        } catch (error) {
            message.error('Failed to add participant');
        }
    };

    const handleRemoveParticipant = async (participant: Participant) => {
        if (!room) return;

        try {
            await chatService.removeParticipant(room.id, participant.id);
            setParticipants(prev => prev.filter(p => p.id !== participant.id));
            message.success(`Removed ${participant.user.name} from the room`);
        } catch (error) {
            message.error('Failed to remove participant');
        }
    };

    return (
        <Modal
            title={`Room Participants - ${room?.name}`}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={600}
        >
            {/* Add Participants Section */}
            <div style={{ marginBottom: 24 }}>
                <Input
                    placeholder="Search users to add..."
                    prefix={<SearchOutlined />}
                    onChange={(e) => handleSearch(e.target.value)}
                    allowClear
                />

                {searchResults.length > 0 && (
                    <List
                        size="small"
                        dataSource={searchResults}
                        renderItem={(user) => (
                            <List.Item
                                actions={[
                                    <Button
                                        type="link"
                                        icon={<UserAddOutlined />}
                                        onClick={() => handleAddParticipant(user)}
                                    >
                                        Add
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<UserAvatar user={user} size="small" />}
                                    title={user.name}
                                    description={user.email}
                                />
                            </List.Item>
                        )}
                        style={{ marginTop: 8 }}
                    />
                )}
            </div>

            {/* Participants List */}
            <List
                loading={loading}
                dataSource={participants}
                renderItem={(participant) => (
                    <List.Item
                        actions={[
                            <Button
                                type="link"
                                danger
                                icon={<UserDeleteOutlined />}
                                onClick={() => handleRemoveParticipant(participant)}
                            >
                                Remove
                            </Button>
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<UserAvatar user={participant.user} />}
                            title={
                                <Space>
                                    {participant.user.name}
                                    {participant.role === 'admin' && <Tag color="blue">Admin</Tag>}
                                    <Tag color={participant.user.online_status === 'online' ? 'green' : 'default'}>
                                        {participant.user.online_status}
                                    </Tag>
                                </Space>
                            }
                            description={`Joined ${new Date(participant.joined_at).toLocaleDateString()}`}
                        />
                    </List.Item>
                )}
            />
        </Modal>
    );
};
