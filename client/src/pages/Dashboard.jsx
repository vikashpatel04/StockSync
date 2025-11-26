import React, { useEffect, useState } from 'react';
import { Typography, Card, Button, Badge, Space, message, Empty, Spin } from 'antd';
import { CopyOutlined, CheckOutlined, SyncOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const Dashboard = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();

    const fetchAlerts = async () => {
        try {
            const response = await axios.get('/api/alerts');
            setAlerts(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching alerts:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const handleCopy = (sku) => {
        navigator.clipboard.writeText(sku);
        messageApi.success('SKU copied to clipboard!');
    };

    const handleDone = async (id) => {
        try {
            await axios.post(`/api/alerts/${id}/dismiss`);
            messageApi.success('Alert marked as done');
            fetchAlerts(); // Refresh list
        } catch (error) {
            messageApi.error('Failed to mark as done');
        }
    };

    const getBadgeStatus = (soldTime) => {
        const hours = (new Date() - new Date(soldTime)) / 36e5;
        if (hours < 1) return { color: 'red', text: 'Critical (< 1h)' };
        if (hours < 4) return { color: 'gold', text: 'Standard (1-4h)' };
        return { color: 'default', text: 'Aging (> 4h)' };
    };

    return (
        <div>
            {contextHolder}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Alert Center</Title>
                <Button icon={<SyncOutlined />} onClick={fetchAlerts}>Refresh</Button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 50 }}>
                    <Spin size="large" />
                </div>
            ) : alerts.length === 0 ? (
                <Empty description="No pending alerts. Great job!" />
            ) : (
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {alerts.map((alert) => {
                        const status = getBadgeStatus(alert.soldTime);
                        return (
                            <Badge.Ribbon key={alert.id} text={status.text} color={status.color}>
                                <Card hoverable>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <Title level={4} style={{ margin: 0 }}>{alert.productName}</Title>
                                            <Text type="secondary">SKU: </Text>
                                            <Text strong copyable={{ text: alert.sku, onCopy: () => messageApi.success('Copied!') }}>
                                                {alert.sku}
                                            </Text>
                                            <br />
                                            <Text type="secondary">Sold: {new Date(alert.soldTime).toLocaleString()}</Text>
                                        </div>
                                        <Space>
                                            <Button
                                                icon={<CopyOutlined />}
                                                onClick={() => handleCopy(alert.sku)}
                                            >
                                                Copy SKU
                                            </Button>
                                            <Button
                                                type="primary"
                                                icon={<CheckOutlined />}
                                                onClick={() => handleDone(alert.id)}
                                            >
                                                Done
                                            </Button>
                                        </Space>
                                    </div>
                                </Card>
                            </Badge.Ribbon>
                        );
                    })}
                </Space>
            )}
        </div>
    );
};

export default Dashboard;
