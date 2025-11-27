import React, { useEffect, useState } from 'react';
import { Typography, Table, Tag, Button, Tabs } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('synced');

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/history');
            setHistory(response.data);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    // Filter history based on status
    const syncedHistory = history.filter(item => item.status === 'synced');
    const notOnlineHistory = history.filter(item => item.status === 'not-online');

    const columns = [
        {
            title: 'Date',
            dataIndex: 'soldTime',
            key: 'soldTime',
            render: (text) => new Date(text).toLocaleDateString(),
            sorter: (a, b) => new Date(a.soldTime) - new Date(b.soldTime),
        },
        {
            title: 'Bill No',
            dataIndex: 'billNo',
            key: 'billNo',
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
        },
        {
            title: 'Product Name',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: 'Qty',
            dataIndex: 'qty',
            key: 'qty',
        },
        {
            title: 'Sold Time',
            dataIndex: 'soldTime',
            key: 'soldTimeTime',
            render: (text) => new Date(text).toLocaleTimeString(),
        },
        {
            title: 'Processed Time',
            dataIndex: 'syncedTime',
            key: 'syncedTime',
            render: (text) => text ? new Date(text).toLocaleTimeString() : '-',
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            render: (status) => (
                status === 'synced'
                    ? <Tag color="green">Synced</Tag>
                    : <Tag color="orange">Not Online</Tag>
            ),
        },
    ];

    const tabItems = [
        {
            key: 'synced',
            label: `Synced (${syncedHistory.length})`,
            children: (
                <Table
                    columns={columns}
                    dataSource={syncedHistory}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            ),
        },
        {
            key: 'not-online',
            label: `Not Online Products (${notOnlineHistory.length})`,
            children: (
                <Table
                    columns={columns}
                    dataSource={notOnlineHistory}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>History</Title>
                <Button icon={<ReloadOutlined />} onClick={fetchHistory}>Refresh</Button>
            </div>
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
            />
        </div>
    );
};

export default History;
