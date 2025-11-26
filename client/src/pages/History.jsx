import React, { useEffect, useState } from 'react';
import { Typography, Table, Tag, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const columns = [
        {
            title: 'Date',
            dataIndex: 'soldTime',
            key: 'soldTime',
            render: (text) => new Date(text).toLocaleDateString(),
            sorter: (a, b) => new Date(a.soldTime) - new Date(b.soldTime),
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
            title: 'Sold Time',
            dataIndex: 'soldTime',
            key: 'soldTimeTime',
            render: (text) => new Date(text).toLocaleTimeString(),
        },
        {
            title: 'Synced Time',
            dataIndex: 'syncedTime',
            key: 'syncedTime',
            render: (text) => new Date(text).toLocaleTimeString(),
        },
        {
            title: 'Status',
            key: 'status',
            render: () => <Tag color="green">Synced</Tag>,
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Sync History</Title>
                <Button icon={<ReloadOutlined />} onClick={fetchHistory}>Refresh</Button>
            </div>
            <Table
                columns={columns}
                dataSource={history}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default History;
