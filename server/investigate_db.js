const sql = require('mssql');
const fs = require('fs');

const config = {
    user: 'sa',
    password: 'NMINFOTECH',
    server: '192.168.0.102',
    database: 'DLTT2526',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function investigate() {
    try {
        let output = '';
        const log = (msg) => { output += msg + '\n'; console.log(msg); };

        log('Connecting to database...');
        await sql.connect(config);
        log('Connected!');

        // 1. List all tables
        log('\n--- ALL TABLES ---');
        const tablesResult = await sql.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME");
        log(tablesResult.recordset.map(r => r.TABLE_NAME).join(', '));

        // 2. Inspect SalesEntry
        log('\n--- SalesEntry Columns ---');
        const salesEntryCols = await sql.query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SalesEntry'");
        salesEntryCols.recordset.forEach(r => log(`${r.COLUMN_NAME} (${r.DATA_TYPE})`));

        // 3. Inspect sales
        log('\n--- sales Columns ---');
        const salesCols = await sql.query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'sales'");
        salesCols.recordset.forEach(r => log(`${r.COLUMN_NAME} (${r.DATA_TYPE})`));

        // 4. Inspect tempstockItems
        log('\n--- tempstockItems Columns ---');
        const stockCols = await sql.query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'tempstockItems'");
        stockCols.recordset.forEach(r => log(`${r.COLUMN_NAME} (${r.DATA_TYPE})`));

        // 5. Check Data Counts
        log('\n--- Row Counts ---');
        const counts = await sql.query(`
            SELECT 
                (SELECT COUNT(*) FROM SalesEntry) as SalesEntryCount,
                (SELECT COUNT(*) FROM sales) as SalesCount,
                (SELECT COUNT(*) FROM tempstockItems) as StockCount
        `);
        log(JSON.stringify(counts.recordset[0], null, 2));

        fs.writeFileSync('db_investigation.txt', output);
        console.log('Output written to db_investigation.txt');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sql.close();
    }
}

investigate();
