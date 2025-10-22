import { type FC, useState } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

export const LoginForm: FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            await login(values.email, values.password);
            navigate('/chat');
        } catch (error) {
            // Error handled by interceptor
            console.log(error)
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card style={{ maxWidth: 400, margin: '50px auto', padding: 20 }}>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <Title level={2}>Welcome Back</Title>
                <Text type="secondary">Sign in to your account</Text>
            </div>

            <Form
                name="login"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
            >
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: 'Please enter a valid email!' },
                    ]}
                >
                    <Input prefix={<MailOutlined />} placeholder="Enter your email" size="large" />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Enter your password"
                        size="large"
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block size="large">
                        Sign In
                    </Button>
                </Form.Item>

                <div style={{ textAlign: 'center' }}>
                    <Text type="secondary">
                        Don't have an account? <Link to="/register">Sign up</Link>
                    </Text>
                </div>
            </Form>
        </Card>
    );
};
