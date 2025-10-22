import {type FC} from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingSpinnerProps {
    size?: 'small' | 'default' | 'large';
    tip?: string;
    fullScreen?: boolean;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({
      size = 'default',
      tip,
      fullScreen = false,
    }) => {
    const spinner = (
        <Spin
            size={size}
            tip={tip}
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
        />
    );

    if (fullScreen) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}>
                {spinner}
            </div>
        );
    }

    return spinner;
};
