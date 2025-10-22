export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    THEME: 'theme',
};

export const MESSAGE_TYPES = {
    TEXT: 'text',
    IMAGE: 'image',
    FILE: 'file',
} as const;

export const ROOM_TYPES = {
    PRIVATE: 'private',
    GROUP: 'group',
} as const;

export const USER_STATUS = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    AWAY: 'away',
} as const;

export const REACTION_TYPES = [
    '👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '👀', '✨'
];

export const FILE_UPLOAD_CONFIG = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
    ],
};

export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MESSAGES_PER_PAGE: 50,
    ROOMS_PER_PAGE: 20,
    USERS_PER_PAGE: 50,
};
