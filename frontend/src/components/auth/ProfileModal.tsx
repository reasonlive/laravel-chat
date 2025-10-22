import {type FC, useEffect, useState } from 'react';
import { Modal, Form, Input, Avatar, message } from 'antd';
import { UserOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { User } from '../../types';

interface ProfileModalProps {
    visible: boolean;
    onCancel: () => void;
}

export const ProfileModal: FC<ProfileModalProps> = ({ visible, onCancel }) => {
    const { user, updateProfile } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && visible) {
            form.setFieldsValue({
                name: user.name,
                email: user.email,
            });
        }
    }, [user, visible, form]);

    const handleSubmit = async (values: Partial<User>) => {
        setLoading(true);
        try {
            await updateProfile(values);
            message.success('Profile updated successfully');
            onCancel();
        } catch (error) {
            message.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Edit Profile"
            open={visible}
            onCancel={onCancel}
            onOk={() => form.submit()}
            confirmLoading={loading}
            okText="Save Changes"
        >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <Avatar size={64} icon={<UserOutlined />} src={user?.avatar} />
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    label="Full Name"
                    name="name"
                    rules={[{ required: true, message: 'Please input your name!' }]}
                >
                    <Input prefix={<UserOutlined />} placeholder="Enter your name" />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: 'Please enter a valid email!' },
                    ]}
                >
                    <Input prefix={<MailOutlined />} placeholder="Enter your email" />
                </Form.Item>
            </Form>
        </Modal>
    );
};
