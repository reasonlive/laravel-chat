import {type FC, useEffect, useRef } from 'react';
import { List, Empty } from 'antd';
import {ChatMessage} from '../../types';
import { MessageItem } from './MessageItem';

interface MessageListProps {
    messages: ChatMessage[];
    currentUserId: number;
    onEditMessage: (messageId: number, content: string) => void;
    onDeleteMessage: (messageId: number) => void;
    onAddReaction: (messageId: number, reaction: string) => void;
    onRemoveReaction: (messageId: number, reactionId: number) => void;
    onDownloadAttachment: (messageId: number) => void;
    loading?: boolean;
}

export const MessageList: FC<MessageListProps> = ({
    messages,
    currentUserId,
    onEditMessage,
    onDeleteMessage,
    onAddReaction,
    onRemoveReaction,
    onDownloadAttachment,
    loading = false,
    }) => {
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);

    if (loading) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty description="Loading messages..." />
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty description="No messages yet" />
            </div>
        );
    }

    return (
        <div ref={listRef} style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            <List
                dataSource={messages}
                renderItem={(message) => (
                    <MessageItem
                        message={message}
                        isOwn={message.user_id === currentUserId}
                        onEdit={onEditMessage}
                        onDelete={onDeleteMessage}
                        onAddReaction={onAddReaction}
                        onRemoveReaction={onRemoveReaction}
                        onDownloadAttachment={onDownloadAttachment}
                    />
                )}
            />
        </div>
    );
};
