import { type FC, useState } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

export const RegisterForm: FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: { name: string; email: string; password: string; password_confirmation: string }) => {
        setLoading(true);
        try {
            await register(values.name, values.email, values.password);
            navigate('/chat');
        } catch (error) {
            // Error handled by interceptor
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card style={{ maxWidth: 400, margin: '50px auto', padding: 20 }}>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <Title level={2}>Create Account</Title>
                <Text type="secondary">Sign up to get started</Text>
            </div>

            <Form
                name="register"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
            >
                <Form.Item
                    label="Full Name"
                    name="name"
                    rules={[{ required: true, message: 'Please input your name!' }]}
                >
                    <Input prefix={<UserOutlined />} placeholder="Enter your full name" size="large" />
                </Form.Item>

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

                <Form.Item
                    label="Confirm Password"
                    name="password_confirmation"
                    dependencies={['password']}
                    rules={[
                        { required: true, message: 'Please confirm your password!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('The two passwords do not match!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Confirm your password"
                        size="large"
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block size="large">
                        Sign Up
                    </Button>
                </Form.Item>

                <div style={{ textAlign: 'center' }}>
                    <Text type="secondary">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </Text>
                </div>
            </Form>
        </Card>
    );
};
