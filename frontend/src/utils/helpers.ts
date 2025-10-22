import { ChatMessage, User } from '../types';

export const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString();
    }
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const getUserInitials = (user: User): string => {
    return user.name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

export const isImageFile = (fileType: string): boolean => {
    return fileType.startsWith('image/');
};

export const getFileIcon = (fileType: string): string => {
    if (isImageFile(fileType)) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('text')) return '📃';
    return '📎';
};

export const groupMessagesByDate = (messages: ChatMessage[]): Record<string, ChatMessage[]> => {
    return messages.reduce((groups, message) => {
        const date = new Date(message.created_at).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {} as Record<string, ChatMessage[]>);
};

export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

export const validateFile = (file: File, maxSize: number, allowedTypes: string[]): string | null => {
    if (file.size > maxSize) {
        return `File size must be less than ${formatFileSize(maxSize)}`;
    }

    if (!allowedTypes.includes(file.type)) {
        return 'File type not allowed';
    }

    return null;
};

export const generateRoomInviteLink = (roomId: number, token: string): string => {
    return `${window.location.origin}/invite/${roomId}?token=${token}`;
};
