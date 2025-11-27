import React, { useEffect, useState } from 'react';
import { Typography, Card, Button, Badge, Space, message, Empty, Spin, Segmented, Table, Tag } from 'antd';
import { CopyOutlined, CheckOutlined, SyncOutlined, AppstoreOutlined, BarsOutlined, StopOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const Dashboard = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table'); // 'card' or 'table' - default to table
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

    const handleNotOnline = async (id) => {
        try {
            await axios.post(`/api/alerts/${id}/not-online`);
            messageApi.success('Product marked as Not Online');
            fetchAlerts(); // Refresh list
        } catch (error) {
            messageApi.error('Failed to mark as not online');
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
                <Space>
                    <Segmented
                        options={[
                            { value: 'card', icon: <AppstoreOutlined /> },
                            { value: 'table', icon: <BarsOutlined /> },
                        ]}
                        value={viewMode}
                        onChange={setViewMode}
                    />
                    <Button icon={<SyncOutlined />} onClick={fetchAlerts}>Refresh</Button>
                </Space>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 50 }}>
                    <Spin size="large" />
                </div>
            ) : viewMode === 'table' ? (
                <Table
                    dataSource={alerts}
                    rowKey="id"
                    columns={[
                        {
                            title: 'Bill No',
                            dataIndex: 'billNo',
                            key: 'billNo',
                            render: (text) => <Text>{text}</Text>,
                        },
                        {
                            title: 'SKU / Product ID',
                            dataIndex: 'sku',
                            key: 'sku',
                            render: (text) => (
                                <Space>
                                    <Text strong>{text}</Text>
                                    <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => handleCopy(text)} />
                                </Space>
                            ),
                        },
                        {
                            title: 'Qty',
                            dataIndex: 'qty',
                            key: 'qty',
                            render: (text) => <Text>{text}</Text>,
                        },
                        {
                            title: 'Actions',
                            key: 'action',
                            render: (_, record) => (
                                <Space>
                                    <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handleDone(record.id)}>
                                        Done
                                    </Button>
                                    <Button danger size="small" icon={<StopOutlined />} onClick={() => handleNotOnline(record.id)}>
                                        Not Online
                                    </Button>
                                </Space>
                            ),
                        },
                    ]}
                />
            ) : (
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {alerts.map((alert) => {
                        const status = getBadgeStatus(alert.soldTime);
                        return (
                            <Badge.Ribbon key={alert.id} text={status.text} color={status.color}>
                                <Card hoverable>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <Title level={4} style={{ margin: 0 }}>{alert.sku}</Title>
                                            <Text type="secondary">Bill No: {alert.billNo}</Text>
                                            <br />
                                            <Text type="secondary">Qty: {alert.qty}</Text>
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
                                            <Button
                                                danger
                                                icon={<StopOutlined />}
                                                onClick={() => handleNotOnline(alert.id)}
                                            >
                                                Not Online
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
