import React, { useState, useEffect } from 'react';
import { Typography, Form, Input, Button, Steps, Select, Switch, InputNumber, message, Divider, Card, Descriptions, Modal, Space, Tag } from 'antd';
import { DatabaseOutlined, TableOutlined, SettingOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
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
    const [isEditMode, setIsEditMode] = useState(false);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/api/settings');
            const { dbConfig, mockMode } = response.data;
            setSettings({
                dbConfig,
                mockMode,
                pollingInterval: 5 // Default or fetch if available
            });
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
            fetchTables(values); // Pre-fetch tables if successful
            return true;
        } catch (error) {
            messageApi.error('Connection failed: ' + (error.response?.data?.error || error.message));
            return false;
        } finally {
            setLoading(false);
        }
    };

    const fetchTables = async (config = null) => {
        try {
            let response;
            if (config) {
                response = await axios.post('/api/db/tables', config);
            } else {
                response = await axios.get('/api/db/tables');
            }
            setTables(response.data);
        } catch (error) {
            console.error('Error fetching tables:', error);
        }
    };

    const handleTableChange = async (table) => {
        try {
            const values = form.getFieldsValue(['user', 'password', 'server', 'database', 'options']);
            const response = await axios.post('/api/db/columns', { table, config: values });
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
                options: values.options || { encrypt: false, trustServerCertificate: true }
            };

            await axios.post('/api/settings', {
                dbConfig,
                mockMode: values.mockMode,
                pollingInterval: values.pollingInterval
            });
            messageApi.success('Settings saved successfully!');
            setIsEditMode(false);
            setCurrentStep(0);
            fetchSettings(); // Refresh settings
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

    const handleEditClick = () => {
        setIsEditMode(true);
        setCurrentStep(0);
        // Pre-load tables if we have a valid connection
        if (settings?.dbConfig?.server) {
            fetchTables();
        }
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setCurrentStep(0);
        form.setFieldsValue({
            ...settings.dbConfig,
            mockMode: settings.mockMode,
            pollingInterval: settings.pollingInterval || 5
        });
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
                    <Form.Item name={['options', 'encrypt']} valuePropName="checked" label="Encrypt Connection (SSL)">
                        <Switch />
                    </Form.Item>
                    <Form.Item name={['options', 'trustServerCertificate']} valuePropName="checked" initialValue={true} hidden>
                        <Switch />
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

    // View-only settings display
    const renderSettingsOverview = () => {
        if (!settings) {
            return <Card loading />;
        }

        const { dbConfig, mockMode, pollingInterval } = settings;

        return (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card
                    title={
                        <Space>
                            <DatabaseOutlined />
                            <span>Database Connection</span>
                        </Space>
                    }
                    extra={mockMode ? <Tag color="orange">Mock Mode Active</Tag> : <Tag color="green">Live Connection</Tag>}
                >
                    <Descriptions column={2} bordered>
                        <Descriptions.Item label="Server">{dbConfig?.server || 'Not configured'}</Descriptions.Item>
                        <Descriptions.Item label="Database">{dbConfig?.database || 'Not configured'}</Descriptions.Item>
                        <Descriptions.Item label="Username">{dbConfig?.user || 'Not configured'}</Descriptions.Item>
                        <Descriptions.Item label="Password">{'*'.repeat(dbConfig?.password?.length || 0)}</Descriptions.Item>
                        <Descriptions.Item label="SSL Encryption" span={2}>
                            {dbConfig?.options?.encrypt ? (
                                <Tag color="green" icon={<CheckCircleOutlined />}>Enabled</Tag>
                            ) : (
                                <Tag color="default" icon={<CloseCircleOutlined />}>Disabled</Tag>
                            )}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card
                    title={
                        <Space>
                            <TableOutlined />
                            <span>Table Mapping</span>
                        </Space>
                    }
                >
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Target Table">{dbConfig?.targetTable || 'Not configured'}</Descriptions.Item>
                        <Descriptions.Item label="SKU Column">{dbConfig?.colSku || 'Not configured'}</Descriptions.Item>
                        <Descriptions.Item label="Product Name Column">{dbConfig?.colName || 'Not configured'}</Descriptions.Item>
                        <Descriptions.Item label="Timestamp Column">{dbConfig?.colTime || 'Not configured'}</Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card
                    title={
                        <Space>
                            <SettingOutlined />
                            <span>Preferences</span>
                        </Space>
                    }
                >
                    <Descriptions column={2} bordered>
                        <Descriptions.Item label="Polling Interval">{pollingInterval || 5} minutes</Descriptions.Item>
                        <Descriptions.Item label="Mock Mode">
                            {mockMode ? (
                                <Tag color="orange" icon={<CheckCircleOutlined />}>Enabled</Tag>
                            ) : (
                                <Tag color="default" icon={<CloseCircleOutlined />}>Disabled</Tag>
                            )}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            </Space>
        );
    };

    return (
        <div>
            {contextHolder}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Settings</Title>
                {!isEditMode && (
                    <Button type="primary" icon={<EditOutlined />} onClick={handleEditClick}>
                        Edit Settings
                    </Button>
                )}
            </div>

            {!isEditMode ? (
                renderSettingsOverview()
            ) : (
                <Modal
                    title="Edit Configuration"
                    open={isEditMode}
                    onCancel={handleCancelEdit}
                    footer={null}
                    width={800}
                    destroyOnClose
                >
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
                </Modal>
            )}
        </div>
    );
};

export default Settings;
