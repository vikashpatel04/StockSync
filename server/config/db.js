const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'config.json');

let pool = null;
let mockMode = false; // Default to false, can be toggled via settings

// Load config from file if exists, otherwise use hardcoded defaults
let dbConfig = {
    user: 'sa',
    password: 'NMINFOTECH',
    server: '192.168.0.102',
    database: 'DLTT2526',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

try {
    if (fs.existsSync(CONFIG_FILE)) {
        const savedConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        dbConfig = { ...dbConfig, ...savedConfig };
    }
} catch (err) {
    console.error('Error loading config file:', err);
}

// --- HARDCODE FALLBACK ---
// Uncomment and fill in details to override settings manually
/*
dbConfig = {
    user: 'sa',
    password: 'yourStrong(!)Password',
    server: 'localhost',
    database: 'BNEEDS_POS',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};
*/
// -------------------------

const connectDB = async () => {
    if (mockMode) {
        console.log('Mock Mode enabled. Skipping actual DB connection.');
        return;
    }

    if (!dbConfig.server || !dbConfig.database) {
        console.log('Database configuration missing. Waiting for setup.');
        return;
    }

    try {
        pool = await sql.connect(dbConfig);
        console.log('Connected to MSSQL Database');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
};

const getPool = () => pool;

const setConfig = async (newConfig) => {
    dbConfig = { ...dbConfig, ...newConfig };

    // Save to file
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(dbConfig, null, 2));
    } catch (err) {
        console.error('Error saving config file:', err);
    }

    if (pool) {
        await pool.close();
    }
    await connectDB();

    // Also try to connect immediately to validate
    try {
        if (!mockMode) {
            await connectDB();
        }
    } catch (e) {
        console.log("Connection attempt failed during setConfig");
    }
};

const getConfig = () => dbConfig;

const setMockMode = (enabled) => {
    mockMode = enabled;
    if (mockMode && pool) {
        pool.close();
        pool = null;
    } else if (!mockMode) {
        connectDB();
    }
};

const isMockMode = () => mockMode;

const query = async (queryString) => {
    if (mockMode) {
        // Simple mock response for testing
        console.log('Executing Mock Query:', queryString);
        // Return fake data based on query content if needed
        return { recordset: [] };
    }

    if (!pool) {
        throw new Error('Database not connected');
    }
    return await pool.request().query(queryString);
};

module.exports = {
    connectDB,
    getPool,
    setConfig,
    getConfig,
    setMockMode,
    isMockMode,
    query,
    sql // Export sql for types/constants if needed
};
