import React, { useState, useEffect } from 'react';
import { Typography, Form, Input, Button, Steps, Select, Switch, InputNumber, message, Divider, Card } from 'antd';
import { DatabaseOutlined, TableOutlined, SettingOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

const Settings = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [tables, setTables] = useState([]);
    const [columns, setColumns] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/api/settings');
            const { dbConfig, mockMode } = response.data;
            form.setFieldsValue({
                ...dbConfig,
                mockMode,
                pollingInterval: 5 // Default or fetch if available
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const handleTestConnection = async () => {
        setLoading(true);
        try {
            const values = form.getFieldsValue(['user', 'password', 'server', 'database', 'options']);
            await axios.post('/api/db/test', values);
            messageApi.success('Connection successful!');
            fetchTables(); // Pre-fetch tables if successful
            return true;
        } catch (error) {
            messageApi.error('Connection failed: ' + (error.response?.data?.error || error.message));
            return false;
        } finally {
            setLoading(false);
        }
    };

    const fetchTables = async () => {
        try {
            const response = await axios.get('/api/db/tables');
            setTables(response.data);
        } catch (error) {
            console.error('Error fetching tables:', error);
        }
    };

    const handleTableChange = async (table) => {
        try {
            const response = await axios.get(`/api/db/columns/${table}`);
            setColumns(response.data);
        } catch (error) {
            console.error('Error fetching columns:', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const values = form.getFieldsValue();
            // Construct dbConfig object from flat form values
            const dbConfig = {
                user: values.user,
                password: values.password,
                server: values.server,
                database: values.database,
                options: { encrypt: true, trustServerCertificate: true } // Default options
            };

            await axios.post('/api/settings', {
                dbConfig,
                mockMode: values.mockMode,
                pollingInterval: values.pollingInterval
            });
            messageApi.success('Settings saved successfully!');
        } catch (error) {
            messageApi.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const next = async () => {
        if (currentStep === 0) {
            // Validate connection before moving
            const success = await handleTestConnection();
            if (success) setCurrentStep(currentStep + 1);
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

    const steps = [
        {
            title: 'Connection',
            icon: <DatabaseOutlined />,
            content: (
                <div style={{ maxWidth: 600, margin: '0 auto' }}>
                    <Form.Item name="server" label="Server Address" rules={[{ required: true }]}>
                        <Input placeholder="localhost or IP" />
                    </Form.Item>
                    <Form.Item name="database" label="Database Name" rules={[{ required: true }]}>
                        <Input placeholder="BNEEDS_POS" />
                    </Form.Item>
                    <Form.Item name="user" label="Username" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Button type="dashed" onClick={handleTestConnection} loading={loading} block>
                        Test Connection
                    </Button>
                </div>
            ),
        },
        {
            title: 'Mapping',
            icon: <TableOutlined />,
            content: (
                <div style={{ maxWidth: 600, margin: '0 auto' }}>
                    <Form.Item name="targetTable" label="Sales Table" rules={[{ required: true }]}>
                        <Select placeholder="Select table" onChange={handleTableChange}>
                            {tables.map(t => <Option key={t} value={t}>{t}</Option>)}
                        </Select>
                    </Form.Item>
                    <Divider>Column Mapping</Divider>
                    <Form.Item name="colSku" label="Barcode/SKU Column">
                        <Select placeholder="Select column">
                            {columns.map(c => <Option key={c} value={c}>{c}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="colName" label="Product Name Column">
                        <Select placeholder="Select column">
                            {columns.map(c => <Option key={c} value={c}>{c}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="colTime" label="Timestamp Column">
                        <Select placeholder="Select column">
                            {columns.map(c => <Option key={c} value={c}>{c}</Option>)}
                        </Select>
                    </Form.Item>
                </div>
            ),
        },
        {
            title: 'Preferences',
            icon: <SettingOutlined />,
            content: (
                <div style={{ maxWidth: 600, margin: '0 auto' }}>
                    <Form.Item name="pollingInterval" label="Polling Interval (minutes)">
                        <InputNumber min={1} max={60} />
                    </Form.Item>
                    <Form.Item name="mockMode" label="Mock Mode" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Card size="small" title="About Mock Mode">
                        <Text type="secondary">
                            Enable Mock Mode to simulate sales without connecting to a real database.
                            Useful for testing the alert system.
                        </Text>
                    </Card>
                </div>
            ),
        },
    ];

    return (
        <div>
            {contextHolder}
            <Title level={2}>Configuration Wizard</Title>
            <Steps current={currentStep} items={steps} style={{ marginBottom: 40 }} />

            <Form form={form} layout="vertical">
                <div style={{ minHeight: 300 }}>
                    {steps[currentStep].content}
                </div>

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    {currentStep > 0 && (
                        <Button style={{ margin: '0 8px' }} onClick={prev}>
                            Previous
                        </Button>
                    )}
                    {currentStep < steps.length - 1 && (
                        <Button type="primary" onClick={next}>
                            Next
                        </Button>
                    )}
                    {currentStep === steps.length - 1 && (
                        <Button type="primary" onClick={handleSave} loading={loading}>
                            Save Configuration
                        </Button>
                    )}
                </div>
            </Form>
        </div>
    );
};

export default Settings;
