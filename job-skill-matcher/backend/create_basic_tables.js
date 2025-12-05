// create_basic_tables.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createBasicTables() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'job_skill_matcher'
    });

    try {
        console.log('Creating basic tables if they don\'t exist...');

        // Create users table if it doesn't exist
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                user_type ENUM('jobseeker', 'employer') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_user_type (user_type)
            )
        `);
        console.log('✅ Users table created/verified');

        // Create skills table if it doesn't exist
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS skills (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                category VARCHAR(100),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_name (name),
                INDEX idx_category (category)
            )
        `);
        console.log('✅ Skills table created/verified');

        // Create job_seekers_profiles table if it doesn't exist (without foreign key for now)
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS job_seekers_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                location VARCHAR(255),
                experience_years INT DEFAULT 0,
                bio TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id)
            )
        `);
        console.log('✅ Job seekers profiles table created/verified');

        // Create company_profiles table if it doesn't exist
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS company_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                company_name VARCHAR(255) NOT NULL,
                industry VARCHAR(100),
                company_size ENUM('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'),
                company_description TEXT,
                website_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id)
            )
        `);
        console.log('✅ Company profiles table created/verified');

        console.log('✅ All basic tables are ready!');

    } catch (error) {
        console.error('❌ Error creating basic tables:', error);
    } finally {
        await connection.end();
    }
}

createBasicTables();
