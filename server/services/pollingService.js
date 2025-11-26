const cron = require('node-cron');
const db = require('../config/db');

let pollingInterval = '*/5 * * * *'; // Default 5 minutes
let task = null;
let lastCheckTime = new Date(); // Initialize with current time
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
        // This query needs to be dynamic based on user mapping configuration
        // For now, we'll assume a standard structure or use the mapped columns
        /*
        const result = await db.query(`
            SELECT * FROM Sales_Transactions 
            WHERE Transaction_Timestamp > '${lastCheckTime.toISOString()}'
        `);
        // Process result...
        */

        // Update lastCheckTime after successful query
        lastCheckTime = new Date();

    } catch (error) {
        console.error('Error during polling:', error);
    }
};

const addAlert = (alert) => {
    // Check for duplicates
    const exists = alerts.find(a => a.sku === alert.sku && a.soldTime.getTime() === alert.soldTime.getTime());
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

const getHistory = () => history;

module.exports = {
    start,
    stop,
    setPollingInterval,
    getAlerts,
    dismissAlert,
    getHistory
};
