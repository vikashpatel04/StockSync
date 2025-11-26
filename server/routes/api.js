const express = require('express');
const router = express.Router();
const pollingService = require('../services/pollingService');
const db = require('../config/db');

// Alerts
router.get('/alerts', (req, res) => {
    res.json(pollingService.getAlerts());
});

router.post('/alerts/:id/dismiss', (req, res) => {
    const success = pollingService.dismissAlert(req.params.id);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Alert not found' });
    }
});

// History
router.get('/history', (req, res) => {
    res.json(pollingService.getHistory());
});

// Settings
router.get('/settings', (req, res) => {
    res.json({
        dbConfig: db.getConfig(),
        mockMode: db.isMockMode()
    });
});

router.post('/settings', async (req, res) => {
    const { dbConfig, mockMode, pollingInterval } = req.body;

    if (mockMode !== undefined) {
        db.setMockMode(mockMode);
    }

    if (dbConfig) {
        await db.setConfig(dbConfig);
    }

    if (pollingInterval) {
        pollingService.setPollingInterval(pollingInterval);
    }

    res.json({ success: true });
});

// DB Discovery
router.post('/db/test', async (req, res) => {
    try {
        // Attempt to connect with provided config
        const tempPool = await new db.sql.ConnectionPool(req.body).connect();
        await tempPool.close();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/db/tables', async (req, res) => {
    try {
        const result = await db.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
        res.json(result.recordset.map(row => row.TABLE_NAME));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/db/tables', async (req, res) => {
    try {
        const pool = await new db.sql.ConnectionPool(req.body).connect();
        const result = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
        await pool.close();
        res.json(result.recordset.map(row => row.TABLE_NAME));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/db/columns/:table', async (req, res) => {
    try {
        const table = req.params.table;
        // Sanitize table name to prevent injection (basic check)
        if (!/^[a-zA-Z0-9_]+$/.test(table)) {
            return res.status(400).json({ error: 'Invalid table name' });
        }

        const result = await db.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}'`);
        res.json(result.recordset.map(row => row.COLUMN_NAME));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/db/columns', async (req, res) => {
    try {
        const { table, config } = req.body;
        if (!/^[a-zA-Z0-9_]+$/.test(table)) {
            return res.status(400).json({ error: 'Invalid table name' });
        }

        const pool = await new db.sql.ConnectionPool(config).connect();
        const result = await pool.request().query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}'`);
        await pool.close();
        res.json(result.recordset.map(row => row.COLUMN_NAME));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
