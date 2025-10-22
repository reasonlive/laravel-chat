import {type FC, useState } from 'react';
import { Card, Typography, Dropdown, Button, Space, Input } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { ChatMessage } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { formatDistanceToNow } from 'date-fns';
import FileAttachment from "../common/FileAttachment";

const { Text, Paragraph } = Typography;

interface MessageItemProps {
    message: ChatMessage;
    isOwn: boolean;
    onEdit: (messageId: number, content: string) => void;
    onDelete: (messageId: number) => void;
    onAddReaction: (messageId: number, reaction: string) => void;
    onRemoveReaction: (messageId: number, reactionId: number) => void;
    onDownloadAttachment: (messageId: number) => void;
}

export const MessageItem: FC<MessageItemProps> = ({
    message,
    isOwn,
    onEdit,
    onDelete,
    onAddReaction,
    onRemoveReaction,
    onDownloadAttachment,
    }) => {
    const [editing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.message);

    const handleEdit = () => {
        if (editContent.trim() && editContent !== message.message) {
            onEdit(message.id, editContent);
        }
        setEditing(false);
    };

    const handleCancelEdit = () => {
        setEditContent(message.message);
        setEditing(false);
    };

    const menuItems = [];

    if (message.attachment) {
        menuItems.push({
            key: 'download',
            icon: <DownloadOutlined />,
            label: 'Download',
            onClick: () => onDownloadAttachment(message.id),
        });
    }

    if (isOwn) {
        menuItems.push({
            key: 'edit',
                icon: <EditOutlined />,
            label: 'Edit',
            onClick: () => setEditing(true),
        });
        menuItems.push({
            key: 'delete',
                icon: <DeleteOutlined />,
            label: 'Delete',
            onClick: () => onDelete(message.id),
            danger: true,
        });
    }

    /*let reactions: Record<string, typeof message.reactions>;
    if (message.reactions && message.reactions.length) {
        reactions = message.reactions?.reduce((acc, reaction) => {
            if (!acc[reaction.reaction]) {
                acc[reaction.reaction] = [];
            }
            acc[reaction.reaction].push(reaction);
            return acc;
        }, {} as Record<string, typeof message.reactions>);
    }*/


    return (
        <div style={{
            display: 'flex',
            marginBottom: 16,
            justifyContent: isOwn ? 'flex-end' : 'flex-start',
        }}>
            <div style={{
                maxWidth: '70%',
                display: 'flex',
                flexDirection: isOwn ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                gap: 8,
            }}>
                <UserAvatar user={message.user} size="default" />

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Text strong>{message.user.name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </Text>
                    </div>

                    <Card
                        size="small"
                        style={{
                            backgroundColor: isOwn ? '#1890ff' : '#f5f5f5',
                            border: 'none',
                        }}
                        styles={{
                            body: {
                                padding: '8px 12px',
                                color: isOwn ? 'white' : 'inherit',
                            }
                        }}
                    >
                        {editing ? (
                            <div>
                                <Input.TextArea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    autoSize
                                    onPressEnter={(e) => {
                                        e.preventDefault();
                                        handleEdit();
                                    }}
                                />
                                <Space style={{ marginTop: 8 }}>
                                    <Button size="small" type="primary" onClick={handleEdit}>
                                        Save
                                    </Button>
                                    <Button size="small" onClick={handleCancelEdit}>
                                        Cancel
                                    </Button>
                                </Space>
                            </div>
                        ) : (
                            <div>
                                <Paragraph style={{ margin: 0, color: isOwn ? 'white' : 'inherit' }}>
                                    {message.message}
                                </Paragraph>
                            </div>
                        )}

                        {message.attachment_size && message.attachment_name && (
                            <div>
                                <Space direction="vertical" style={{ width: '100%' }} size="small">
                                    <FileAttachment
                                        filename={message.attachment_name}
                                        filesize={message.attachment_size}
                                    />
                                </Space>
                            </div>
                        )}

                        {/* Reactions WORK IN PROGRESS */}
                        {/*{Object.keys(reactions).length > 0 && (
                            <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {Object.entries(reactions).map(([reaction, reactionList]) => (
                                    <Tooltip
                                        key={reaction}
                                        title={reactionList.map(r => r.user.name).join(', ')}
                                    >
                                        <Button
                                            size="small"
                                            type="text"
                                            style={{
                                                fontSize: 12,
                                                padding: '0 4px',
                                                height: 'auto',
                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                            }}
                                            onClick={() => {
                                                const userReaction = reactionList.find(r => r.user_id === message.user_id);
                                                if (userReaction) {
                                                    onRemoveReaction(message.id, userReaction.id);
                                                } else {
                                                    onAddReaction(message.id, reaction);
                                                }
                                            }}
                                        >
                                            {reaction} {reactionList.length}
                                        </Button>
                                    </Tooltip>
                                ))}
                            </div>
                        )}*/}
                    </Card>

                    {/* Reaction Picker */}
                    {/*{!editing && (
                        <Button
                            type="text"
                            size="small"
                            icon={<SmileOutlined />}
                            style={{ marginTop: 4 }}
                            onClick={() => onAddReaction(message.id, '👍')}
                        >
                            Add Reaction
                        </Button>
                    )}*/}
                </div>

                {!editing && (
                    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                        <Button type="text" icon={<MoreOutlined />} size="small" />
                    </Dropdown>
                )}
            </div>
        </div>
    );
};
