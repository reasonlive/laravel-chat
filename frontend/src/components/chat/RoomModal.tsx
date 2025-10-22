import {type FC, useState} from 'react';
import { Modal, Form, Input, Switch, Typography } from 'antd';
import { CreateRoomData } from '../../types';
import {useAuth} from "../../hooks/useAuth";

//const { Option } = Select;
const { Text } = Typography;

interface RoomModalProps {
    visible: boolean;
    onCancel: () => void;
    onOk: (data: CreateRoomData) => void;
    initialData?: CreateRoomData;
}

export const RoomModal: FC<RoomModalProps> = ({
    visible,
    onCancel,
    onOk,
    initialData
    }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const {user} = useAuth();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await onOk(values);
            form.resetFields();
        } catch (error) {
            // Validation failed
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={initialData ? "Edit Room" : "Create New Room"}
            open={visible}
            onCancel={handleCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText={initialData ? "Update Room" : "Create Room"}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={initialData || { type: 'group', is_private: false }}
            >
                <Form.Item
                    label="Room Name"
                    name="name"
                    rules={[{ required: true, message: 'Please input room name!' }]}
                >
                    <Input placeholder="Enter room name" />
                </Form.Item>

                <Form.Item
                    label="Description"
                    name="description"
                >
                    <Input.TextArea placeholder="Enter room description (optional)" rows={3} />
                </Form.Item>

                <Form.Item
                    label="Privacy"
                    name="is_private"
                    valuePropName="checked"
                >
                    <Switch
                        checkedChildren="Private"
                        unCheckedChildren="Public"
                    />
                </Form.Item>

                <Form.Item noStyle name="participants" initialValue={[user?.id]}>

                </Form.Item>

                <Text type="secondary">
                    Private rooms are only accessible to invited participants
                </Text>
            </Form>
        </Modal>
    );
};
