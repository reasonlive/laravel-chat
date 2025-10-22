import {type FC} from 'react';
import { Avatar, Badge, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { User } from '../../types';

interface UserAvatarProps {
    user: User;
    size?: 'small' | 'default' | 'large';
    showStatus?: boolean;
    showName?: boolean;
}

export const UserAvatar: FC<UserAvatarProps> = ({
      user,
      size = 'default',
      showStatus = true,
      showName = false,
    }) => {
    const getStatusColor = (status: User['online_status']) => {
        switch (status) {
            case 'online': return '#52c41a';
            case 'away': return '#faad14';
            case 'offline': return '#d9d9d9';
            default: return '#d9d9d9';
        }
    };

    const avatarSize = {
        small: 24,
        default: 32,
        large: 40,
    }[size];

    const statusSize = {
        small: 8,
        default: 10,
        large: 12,
    }[size];

    const avatar = (
        <Avatar
            size={avatarSize}
            icon={<UserOutlined />}
            src={user.avatar}
            style={{ backgroundColor: user.avatar ? 'transparent' : undefined }}
        />
    );

    const statusBadge = showStatus ? (
        <Badge
            color={getStatusColor(user.online_status)}
            offset={[-2, 2]}
            style={{
                width: statusSize,
                height: statusSize,
                boxShadow: '0 0 0 2px #fff',
            }}
        >
            {avatar}
        </Badge>
    ) : avatar;

    const content = (
        <Tooltip title={`${user.name} (${user.online_status})`}>
            {statusBadge}
        </Tooltip>
    );

    if (showName) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {content}
                <span>{user.name}</span>
            </div>
        );
    }

    return content;
};
