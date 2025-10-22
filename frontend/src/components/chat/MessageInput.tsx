import {type FC, useState } from 'react';
import { Input, Button, Upload, Space, message } from 'antd';
import { SendOutlined, PaperClipOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { TextArea } = Input;

interface MessageInputProps {
    onSendMessage: (content: string, file?: File) => void;
    disabled?: boolean;
}

export const MessageInput: FC<MessageInputProps> = ({ onSendMessage, disabled = false }) => {
    const [content, setContent] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!content.trim() && !file) return;

        setSending(true);
        try {
            await onSendMessage(content, file || undefined);
            setContent('');
            setFile(null);
        } catch (error) {
            message.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const uploadProps: UploadProps = {
        name: 'attachment',
        method: "POST",
        beforeUpload: (file) => {
            setFile(file);
            return false; // Prevent automatic upload
        },
        showUploadList: false,
        multiple: false,
    };

    const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

    return (
        <div style={{ padding: 16, borderTop: '1px solid #f0f0f0' }}>
            {/* File Preview */}
            {file && (
                <div style={{ marginBottom: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
                    <Space>
                        <PaperClipOutlined />
                        <span>{file.name}</span>
                        <Button type="link" size="small" onClick={() => setFile(null)}>
                            Remove
                        </Button>
                    </Space>
                </div>
            )}

            {/* Quick Reactions */}
            <div style={{ marginBottom: 8, display: 'flex', gap: 4 }}>
                {commonReactions.map(reaction => (
                    <Button
                        key={reaction}
                        type="text"
                        size="small"
                        onClick={() => onSendMessage(reaction)}
                        style={{ fontSize: 16 }}
                    >
                        {reaction}
                    </Button>
                ))}
            </div>

            {/* Input Area */}
            <Space.Compact style={{ width: '100%' }}>
                <Upload {...uploadProps}>
                    <Button icon={<PaperClipOutlined />} disabled={disabled} />
                </Upload>

                <TextArea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    disabled={disabled}
                />

                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    loading={sending}
                    disabled={disabled || (!content.trim() && !file)}
                >
                    Send
                </Button>
            </Space.Compact>
        </div>
    );
};
