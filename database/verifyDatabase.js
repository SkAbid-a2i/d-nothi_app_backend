const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function verifyDatabase() {
  let pool;
  try {
    pool = await mysql.createPool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: { rejectUnauthorized: true }
    });

    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tables in database:', tables);
    const [users] = await pool.query('SELECT * FROM users LIMIT 5');
    console.log('Sample users:', users);
  } catch (error) {
    console.error('Verification failed:', error.message);
  } finally {
    if (pool) await pool.end();
  }
}

verifyDatabase();