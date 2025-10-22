import {type FC} from 'react';
import { Layout, Typography } from 'antd';
import { RegisterForm } from '../components/auth/RegisterForm';

const { Content } = Layout;
const { Title } = Typography;

export const RegisterPage: FC = () => {
    return (
        <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Content style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
            }}>
                <div style={{
                    textAlign: 'center',
                    marginBottom: 40,
                    color: 'white',
                }}>
                    <Title level={1} style={{ color: 'white', marginBottom: 8 }}>
                        Join ChatApp
                    </Title>
                    <Title level={4} style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'normal' }}>
                        Create your account to get started
                    </Title>
                </div>

                <RegisterForm />
            </Content>
        </Layout>
    );
};
