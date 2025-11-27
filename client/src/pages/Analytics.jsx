import React, { useEffect, useState } from 'react';
import { Typography, Card, Row, Col, Statistic, Table, Spin } from 'antd';
import { DollarOutlined, ShoppingCartOutlined, ShopOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({ totalSales: 0, totalQty: 0, transactionCount: 0 });
    const [salesItems, setSalesItems] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [todayRes, itemsRes] = await Promise.all([
                axios.get('/api/sales/today'),
                axios.get('/api/sales/items')
            ]);

            // Process Summary Data
            const todayData = todayRes.data;
            const totalSales = todayData.reduce((sum, item) => sum + (item.NetTotal || 0), 0);
            const totalQty = todayData.reduce((sum, item) => sum + (item.Qty || 0), 0);
            const transactionCount = todayData.length;

            setSummary({ totalSales, totalQty, transactionCount });
            setSalesItems(itemsRes.data);
        } catch (error) {
            console.error('Error fetching analytics data:', error);
        } finally {
            setLoading(false);
        }
    };

    const salesColumns = [
        { title: 'Bill No', dataIndex: 'BILLNO', key: 'BILLNO' },
        { title: 'Time', dataIndex: 'Timestamp', key: 'Timestamp', render: (text) => new Date(text).toLocaleTimeString() },
        { title: 'Product ID', dataIndex: 'ProductID', key: 'ProductID' },
        { title: 'Qty', dataIndex: 'QuantitySold', key: 'QuantitySold' },
        { title: 'Rate', dataIndex: 'SellingRate', key: 'SellingRate', render: (val) => val?.toFixed(2) },
        { title: 'Amount', dataIndex: 'ItemAmount', key: 'ItemAmount', render: (val) => val?.toFixed(2) },
        { title: 'Profit', dataIndex: 'Profit', key: 'Profit', render: (val) => <span style={{ color: val >= 0 ? 'green' : 'red' }}>{val?.toFixed(2)}</span> },
    ];

    return (
        <div>
            <Title level={2}>Analytics Dashboard</Title>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>
            ) : (
                <>
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="Today's Total Sales"
                                    value={summary.totalSales}
                                    precision={2}
                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<DollarOutlined />}
                                    suffix="INR"
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="Transactions"
                                    value={summary.transactionCount}
                                    prefix={<ShoppingCartOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="Items Sold"
                                    value={summary.totalQty}
                                    prefix={<ShopOutlined />}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Card title="Today's Sales Details">
                        <Table dataSource={salesItems} columns={salesColumns} rowKey={(record) => `${record.BILLNO}-${record.ProductID}`} />
                    </Card>
                </>
            )}
        </div>
    );
};

export default Analytics;
