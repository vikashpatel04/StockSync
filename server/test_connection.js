const db = require('./config/db');

async function test() {
    console.log('Testing connection...');
    console.log('Config:', JSON.stringify(db.getConfig(), null, 2));

    await db.connectDB();

    try {
        const pool = db.getPool();
        if (pool) {
            console.log('Pool is ready!');
            const result = await db.query('SELECT 1 as val');
            console.log('Query result:', result.recordset);
        } else {
            console.log('Pool is null after connectDB');
        }
    } catch (err) {
        console.error('Test failed:', err);
    }
}

test();
