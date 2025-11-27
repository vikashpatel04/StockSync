const cron = require('node-cron');
const db = require('../config/db');

let pollingInterval = '*/5 * * * *'; // Default 5 minutes
let task = null;
let lastCheckTime = new Date();
lastCheckTime.setHours(0, 0, 0, 0); // Start of today
let alerts = []; // In-memory alert storage (replace with DB/File for persistence)
let history = []; // In-memory history

const start = () => {
    if (task) {
        task.stop();
    }
    task = cron.schedule(pollingInterval, async () => {
        console.log('Polling for new sales...');
        await checkForNewSales();
    });
    console.log(`Polling service started with interval: ${pollingInterval}`);
    // Run immediately on start
    checkForNewSales();
};

const stop = () => {
    if (task) {
        task.stop();
        console.log('Polling service stopped.');
    }
};

const setPollingInterval = (minutes) => {
    pollingInterval = `*/${minutes} * * * *`;
    start(); // Restart with new interval
};

const checkForNewSales = async () => {
    try {
        if (db.isMockMode()) {
            // Simulate finding a new sale occasionally
            if (Math.random() > 0.7) {
                const newAlert = {
                    id: Date.now(),
                    sku: 'MOCK-' + Math.floor(Math.random() * 1000),
                    productName: 'Mock Product ' + Math.floor(Math.random() * 100),
                    soldTime: new Date(),
                    status: 'pending'
                };
                addAlert(newAlert);
                console.log('Mock Alert Generated:', newAlert);
            }
            return;
        }

        // Real DB Query Logic
        // Fetching item-level details from 'sales' table
        // Using GETDATE() to match server's local time for "today"
        const result = await db.query(`
            SELECT * FROM sales 
            WHERE CAST(BILLDATE AS DATE) = CAST(GETDATE() AS DATE)
            ORDER BY BILLDATE ASC
        `);

        if (result.recordset && result.recordset.length > 0) {
            result.recordset.forEach(item => {
                // Create a unique ID for the alert based on BillNo and ItemID
                const uniqueId = `${item.BILLNO}-${item.ITEMID}-${item.ENTRYORDER || Math.random()}`;

                const newAlert = {
                    id: uniqueId,
                    billNo: item.BILLNO,
                    sku: item.ITEMID, // Using ITEMID as SKU/Product ID
                    productName: item.ITEMID, // Displaying ITEMID as product name for now
                    qty: item.QTY,
                    soldTime: new Date(item.BILLDATE),
                    status: 'pending',
                    details: item
                };
                addAlert(newAlert);
                console.log('New Item Sold:', newAlert.sku);
            });
        }

        // Update lastCheckTime after successful query
        lastCheckTime = new Date();

    } catch (error) {
        console.error('Error during polling:', error);
    }
};

const addAlert = (alert) => {
    // Check for duplicates by unique ID
    const exists = alerts.find(a => a.id === alert.id);
    if (!exists) {
        alerts.push(alert);
    }
};

const getAlerts = () => alerts;

const dismissAlert = (id) => {
    const index = alerts.findIndex(a => a.id == id);
    if (index > -1) {
        const alert = alerts[index];
        alert.status = 'synced';
        alert.syncedTime = new Date();
        history.push(alert);
        alerts.splice(index, 1);
        return true;
    }
    return false;
};

const markAsNotOnline = (id) => {
    const index = alerts.findIndex(a => a.id == id);
    if (index > -1) {
        const alert = alerts[index];
        alert.status = 'not-online';
        alert.syncedTime = new Date();
        history.push(alert);
        alerts.splice(index, 1);
        return true;
    }
    return false;
};

const getHistory = () => history;

module.exports = {
    start,
    stop,
    setPollingInterval,
    getAlerts,
    dismissAlert,
    markAsNotOnline,
    getHistory
};
