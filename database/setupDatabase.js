const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

async function setupDatabase() {
  let pool;
  try {
    // Create pool
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

    // Create database if not exists
    await pool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await pool.query(`USE ${process.env.DB_NAME}`);

    // Create tables
    const schema = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('SystemAdmin', 'Admin', 'Supervisor', 'Agent') NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_role (role),
        INDEX idx_is_active (is_active)
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category_id INT,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS offices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        status ENUM('Pending', 'InProgress', 'Completed', 'Cancelled') NOT NULL,
        priority ENUM('Low', 'Medium', 'High') NOT NULL,
        due_date DATE,
        assigned_user_id INT,
        category_id INT,
        service_id INT,
        office_id INT,
        source_id INT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_user_id) REFERENCES users(id),
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (service_id) REFERENCES services(id),
        FOREIGN KEY (office_id) REFERENCES offices(id),
        FOREIGN KEY (source_id) REFERENCES sources(id),
        FOREIGN KEY (created_by) REFERENCES users(id),
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_assigned_user (assigned_user_id)
      );

      CREATE TABLE IF NOT EXISTS leaves (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
        approved_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (approved_by) REFERENCES users(id),
        INDEX idx_status (status),
        INDEX idx_user_id (user_id)
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        entity VARCHAR(50) NOT NULL,
        entity_id INT,
        before_value JSON,
        after_value JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        INDEX idx_user_id (user_id),
        INDEX idx_entity (entity)
      );
    `;

    const schemaQueries = schema.split(';').filter(query => query.trim());
    for (const query of schemaQueries) {
      await pool.query(query);
    }
    console.log('Database schema created successfully.');

    // Hash password for seed users
    const password = await bcrypt.hash('password123', 10);

    // Seed data
    const seedData = `
      INSERT IGNORE INTO categories (name) VALUES ('General'), ('HR'), ('Finance'), ('IT'), ('Operations');
      INSERT IGNORE INTO services (name, category_id) VALUES 
        ('Recruitment', 2), ('Payroll', 3), ('Support', 4), ('Maintenance', 5), ('Onboarding', 2);
      INSERT IGNORE INTO offices (name) VALUES ('Head Office'), ('Branch A'), ('Branch B');
      INSERT IGNORE INTO sources (name) VALUES ('Internal'), ('Client'), ('Vendor');
      INSERT IGNORE INTO users (username, email, password, role) VALUES
        ('systemadmin1', 'sysadmin1@example.com', '${password}', 'SystemAdmin'),
        ('admin1', 'admin1@example.com', '${password}', 'Admin'),
        ('supervisor1', 'sup1@example.com', '${password}', 'Supervisor'),
        ('agent1', 'agent1@example.com', '${password}', 'Agent');
      INSERT IGNORE INTO tasks (title, description, status, priority, due_date, assigned_user_id, category_id, service_id, office_id, source_id, created_by) VALUES
        ('Task 1', 'Description 1', 'Pending', 'High', '2025-09-15', 4, 1, 1, 1, 1, 1);
      INSERT IGNORE INTO leaves (user_id, start_date, end_date, reason, status) VALUES
        (4, '2025-09-10', '2025-09-12', 'Vacation', 'Pending');
      INSERT IGNORE INTO audit_logs (user_id, action, entity, entity_id, before_value, after_value, ip_address, user_agent) VALUES
        (1, 'CREATE', 'Task', 1, NULL, '{"title": "Task 1"}', '127.0.0.1', 'Mozilla/5.0');
    `;

    const seedQueries = seedData.split(';').filter(query => query.trim());
    for (const query of seedQueries) {
      await pool.query(query);
    }
    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Database setup failed:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage
    });
    process.exit(1);
  } finally {
    if (pool) await pool.end();
  }
}

setupDatabase();