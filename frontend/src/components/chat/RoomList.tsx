import {type FC} from 'react';
import { List, Avatar, Button, Typography, Tag, Space } from 'antd';
import { PlusOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons';
import { ChatRoom } from '../../types';

const { Text } = Typography;

interface RoomListProps {
    rooms: ChatRoom[];
    selectedRoom: ChatRoom | null;
    onRoomSelect: (room: ChatRoom) => void;
    onCreateRoom: () => void;
    loading?: boolean;
}

export const RoomList: FC<RoomListProps> = ({
    rooms,
    selectedRoom,
    onRoomSelect,
    onCreateRoom,
    loading = false,
    }) => {

    return (
        <div style={{ minWidth: 300, borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
                <Button type="primary" icon={<PlusOutlined />} block onClick={onCreateRoom}>
                    New Room
                </Button>
            </div>

            <List
                loading={loading}
                dataSource={rooms}
                renderItem={(room) => (
                    <List.Item
                        onClick={() => onRoomSelect(room)}
                        style={{
                            cursor: 'pointer',
                            padding: '12px 16px',
                            backgroundColor: selectedRoom?.id === room.id ? '#e6f7ff' : 'transparent',
                            borderBottom: '1px solid #f0f0f0',
                        }}
                    >
                        <List.Item.Meta
                            avatar={
                                <Avatar
                                    icon={<MessageOutlined />}
                                    style={{
                                        backgroundColor: room.is_private ? '#87d068' : '#1890ff',
                                    }}
                                />
                            }
                            title={
                                <Space>
                                    <Text strong>{room.name}</Text>
                                    {room.is_private && <Tag color="blue">Private</Tag>}
                                </Space>
                            }
                            description={
                                <Space direction="vertical" size={0}>
                                    <Text type="secondary" ellipsis>
                                        {room.messages_count ? 'Messages: ' + room.messages_count : 'No messages yet'}
                                    </Text>
                                    <Space>
                                        <UserOutlined style={{ fontSize: 12 }} />
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {room.participants_count} participants
                                        </Text>
                                    </Space>
                                </Space>
                            }
                        />
                    </List.Item>
                )}
                style={{ flex: 1, overflow: 'auto' }}
            />
        </div>
    );
};
