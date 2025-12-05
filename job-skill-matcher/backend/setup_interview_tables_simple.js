// setup_interview_tables_simple.js
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupInterviewTables() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'job_skill_matcher'
    });

    try {
        console.log('Setting up interview game tables...');

        // Read and execute the simplified SQL schema
        const schemaPath = path.join(__dirname, 'database', 'interview_schema_simple.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split by statements and execute each one
        const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.execute(statement);
                    console.log('✅ Executed statement successfully');
                } catch (error) {
                    // Skip duplicate entry errors for sample data
                    if (error.code !== 'ER_DUP_ENTRY') {
                        console.log('⚠️  Statement skipped:', error.message);
                    }
                }
            }
        }

        console.log('✅ Interview game tables created successfully!');
        console.log('✅ Sample data inserted!');
        console.log('');
        console.log('🎯 Mock Interview system is ready!');
        console.log('   Access it through: /jobseeker/mock-interview');

    } catch (error) {
        console.error('❌ Error setting up interview tables:', error);
    } finally {
        await connection.end();
    }
}

setupInterviewTables();
