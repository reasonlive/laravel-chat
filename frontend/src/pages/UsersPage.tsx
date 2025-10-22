import {type FC, useState, useEffect } from 'react';
import { Layout, List, Card, Input, Typography, Tag, Button, Space, message } from 'antd';
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { User } from '../types';
import { userService } from '../services/userService';
import { chatService } from '../services/chatService';
import { UserAvatar } from '../components/common/UserAvatar';
import { useAuth } from '../hooks/useAuth';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

export const UsersPage: FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const { user: currentUser } = useAuth();
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const usersData = await userService.getUsers();
            // Filter out current user
            const filtered = usersData.filter(u => u.id !== currentUser?.id);
            setUsers(filtered);
            setFilteredUsers(filtered);
        } catch (error) {
            message.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (value: string) => {
        if (!value.trim()) {
            setFilteredUsers(users);
            return;
        }

        setSearchLoading(true);
        try {
            const searchResults = await userService.searchUsers(value);
            setFilteredUsers(searchResults.filter(u => u.id !== currentUser?.id));
        } catch (error) {
            message.error('Failed to search users');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleCreatePrivateChat = async (user: User) => {
        if (!currentUser) return;

        try {
            // Check if private room already exists
            const rooms = await chatService.getRooms();
            const existingRoom = rooms.find(room =>
                    room.is_private &&
                    room.participants_count === 2
                // You might need additional logic to check if this user is in the room
            );

            if (existingRoom) {
                message.info(`Private chat with ${user.name} already exists`);
                return;
            }

            const newRoom = await chatService.createRoom({
                name: `${currentUser.name} & ${user.name}`,
                is_private: true,
                participants: [currentUser.id, user.id]
            });

            // Add the user as participant
            await chatService.addParticipant(newRoom.id, user.id);

            message.success(`Private chat created with ${user.name}`);
            // You might want to redirect to the new room
        } catch (error) {
            message.error('Failed to create private chat');
        }
    };

    const getStatusColor = (status: User['online_status']) => {
        switch (status) {
            case 'online': return 'green';
            case 'away': return 'orange';
            case 'offline': return 'default';
            default: return 'default';
        }
    };

    return (
        <Layout>
            <Content>
                <Card>
                    <div style={{ marginBottom: 24 }}>
                        <Title level={2}>Users</Title>
                        <Search
                            placeholder="Search users by name or email..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            onSearch={handleSearch}
                            onChange={(e) => {
                                if (!e.target.value) {
                                    setFilteredUsers(users);
                                }
                            }}
                            loading={searchLoading}
                        />
                    </div>

                    <List
                        loading={loading}
                        dataSource={filteredUsers}
                        renderItem={(user) => (
                            <List.Item
                                actions={[
                                    <Button
                                        type="primary"
                                        icon={<UserAddOutlined />}
                                        onClick={() => handleCreatePrivateChat(user)}
                                    >
                                        Message
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<UserAvatar user={user} size="large" showStatus />}
                                    title={
                                        <Space>
                                            {user.name}
                                            <Tag color={getStatusColor(user.online_status)}>
                                                {user.online_status}
                                            </Tag>
                                        </Space>
                                    }
                                    description={user.email}
                                />
                                <div>
                                    <Text type="secondary">
                                        Last seen: {user.last_seen ? new Date(user.last_seen).toLocaleDateString() : 'Never'}
                                    </Text>
                                </div>
                            </List.Item>
                        )}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} of ${total} users`,
                        }}
                    />
                </Card>
            </Content>
        </Layout>
    );
};
