const sql = require('mssql');

let pool = null;
let mockMode = false; // Default to false, can be toggled via settings

// In-memory storage for settings (in a real app, this might be a file or another DB)
let dbConfig = {
    user: '',
    password: '',
    server: '',
    database: '',
    options: {
        encrypt: true, // Use this if you're on Azure
        trustServerCertificate: true // Change to true for local dev / self-signed certs
    }
};

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
    if (pool) {
        await pool.close();
    }
    await connectDB();
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
