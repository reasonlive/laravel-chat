import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <>
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#1890ff',
                },
            }}
        >
            <AuthProvider>
                    <App />
            </AuthProvider>
        </ConfigProvider>
    </>
);
