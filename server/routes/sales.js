const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Helper to handle DB errors
const handleDbError = (res, error) => {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Database operation failed', details: error.message });
};

// GET /api/sales/today
// Purpose: Main sales transaction summary table (one row per bill)
router.get('/today', async (req, res) => {
    try {
        const query = `
            SELECT * FROM SalesEntry 
            WHERE CAST(BILLDATE AS DATE) = CAST(GETDATE() AS DATE)
        `;
        const result = await db.query(query);
        res.json(result.recordset);
    } catch (error) {
        handleDbError(res, error);
    }
});

// GET /api/sales/items
// Purpose: Item-level breakdown of each sale (multiple rows per bill)
router.get('/items', async (req, res) => {
    try {
        const query = `
            SELECT 
                s.BILLNO,
                s.BILLDATE as Timestamp,
                s.ITEMID as ProductID,
                s.QTY as QuantitySold,
                s.SELRATE as SellingRate,
                s.AMOUNT as ItemAmount,
                s.PURRATE as CostRate,
                (s.AMOUNT - (s.PURRATE * s.QTY)) as Profit
            FROM sales s
            WHERE CAST(s.BILLDATE AS DATE) = CAST(GETDATE() AS DATE)
              AND (s.Cancel IS NULL OR s.Cancel != 'Y')
            ORDER BY s.BILLDATE DESC
        `;
        const result = await db.query(query);
        res.json(result.recordset);
    } catch (error) {
        handleDbError(res, error);
    }
});

// GET /api/sales/inventory
// Purpose: Current stock levels for all items
router.get('/inventory', async (req, res) => {
    try {
        const query = `
            SELECT * FROM tempstockItems WHERE Qty > 0
        `;
        const result = await db.query(query);
        res.json(result.recordset);
    } catch (error) {
        handleDbError(res, error);
    }
});

// GET /api/sales/purchases
// Purpose: Purchase transaction summaries
router.get('/purchases', async (req, res) => {
    try {
        const query = `
            SELECT * FROM purchhead
            ORDER BY Dcdate DESC
        `;
        const result = await db.query(query);
        res.json(result.recordset);
    } catch (error) {
        handleDbError(res, error);
    }
});

// GET /api/sales/purchases/items
// Purpose: Item-level purchase details
router.get('/purchases/items', async (req, res) => {
    try {
        const query = `
            SELECT * FROM itemPurch
            ORDER BY Dcdate DESC
        `;
        const result = await db.query(query);
        res.json(result.recordset);
    } catch (error) {
        handleDbError(res, error);
    }
});

module.exports = router;
