import {type FC, type ReactNode, useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
    MessageOutlined,
    UserOutlined,
    LogoutOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Header } from './Header';

const { Sider, Content } = Layout;

interface MainLayoutProps {
    children: ReactNode;
}

export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const menuItems = [
        {
            key: '/chat',
            icon: <MessageOutlined />,
            label: 'Chat',
        },
        {
            key: '/users',
            icon: <UserOutlined />,
            label: 'Users',
        },
    ];

    const bottomMenuItems = [
        {
            key: 'profile',
            icon: <SettingOutlined />,
            label: 'Profile',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: async () => {
                await logout();
                navigate('/login');
            },
        },
    ];

    const handleMenuClick = ({ key }: { key: string }) => {
        if (key === 'profile') {
            // Handle profile modal
            return;
        }
        if (key === 'logout') {
            return;
        }
        navigate(key);
    };

    if (!user) return null;

    return (
        <Layout style={{display: 'flex', flexDirection: 'column'}}>
            <Header />
            <Layout style={{display: 'flex', flexDirection: 'row'}}>
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                    style={{
                        background: colorBgContainer
                    }}
                >
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        onClick={handleMenuClick}
                    />

                    <Menu
                        mode="inline"
                        items={bottomMenuItems}
                        onClick={handleMenuClick}
                        style={{ marginTop: 'auto' }}
                    />
                </Sider>

                <Content
                    style={{
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG
                    }}
                >
                    {children}
                </Content>
            </Layout>

        </Layout>
    );
};
