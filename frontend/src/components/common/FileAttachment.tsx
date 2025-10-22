import React from 'react';
import { FileTextOutlined } from '@ant-design/icons';
import { Card, Tooltip } from 'antd';

interface FileAttachmentProps {
    filename: string;
    filesize: string;
    className?: string;
    style?: React.CSSProperties;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
       filename,
       filesize,
       className = '',
       style
   }) => {
    // Функция для форматирования размера файла
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Функция для обрезки длинного имени файла
    const truncateFileName = (name: string, maxLength: number = 30): string => {
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength - 3) + '...';
    };

    return (
        <Card
            size="small"
            className={className}
            styles={{
                body: {
                    padding: '8px 12px',
                    width: '100%',
                    ...style
                }
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    minWidth: 0
                }}>
                    <FileTextOutlined style={{
                        color: '#1890ff',
                        fontSize: '18px',
                        marginRight: '8px'
                    }} />
                    <div style={{
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden'
                    }}>
                        <Tooltip title={filename}>
                            <div style={{
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {truncateFileName(filename)}
                            </div>
                        </Tooltip>
                        <div style={{
                            color: '#666',
                            fontSize: '12px'
                        }}>
                            {formatFileSize(parseInt(filesize))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default FileAttachment;
