import {type FC, useState } from 'react';
import { Layout, Dropdown, Space, Avatar, Typography } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { ProfileModal } from '../auth/ProfileModal';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export const Header: FC = () => {
    const { user, logout } = useAuth();
    const [profileModalVisible, setProfileModalVisible] = useState(false);

    const handleMenuClick = ({ key }: { key: string }) => {
        switch (key) {
            case 'profile':
                setProfileModalVisible(true);
                break;
            case 'logout':
                logout();
                break;
        }
    };

    const items = [
        {
            key: 'profile',
            icon: <SettingOutlined />,
            label: 'Edit Profile',
        },
        {
            type: 'divider' as const,
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            danger: true,
        },
    ];

    return (
        <>
            <AntHeader style={{
                width: '100%',
                padding: '0 16px',
                background: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            }}>
                <div>
                    <Text strong style={{ fontSize: 16 }}>
                        Chat Application
                    </Text>
                </div>

                <Dropdown
                    menu={{
                        items,
                        onClick: handleMenuClick,
                    }}
                    trigger={['click']}
                >
                    <Space style={{ cursor: 'pointer' }}>
                        <Avatar icon={<UserOutlined />} src={user?.avatar} />
                        <Text>{user?.name}</Text>
                    </Space>
                </Dropdown>
            </AntHeader>

            <ProfileModal
                visible={profileModalVisible}
                onCancel={() => setProfileModalVisible(false)}
            />
        </>
    );
};
