// database/update_skills_schema.js
// Migration to add columns for user-contributed skills

const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'job_skill_matcher'
};

async function updateSkillsSchema() {
    let connection;
    
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('🔗 Connected to database');

        // Add missing columns to skills table
        console.log('📝 Updating skills table schema...');
        
        // First, let's check what columns exist
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'skills'
        `, [dbConfig.database]);
        
        const existingColumns = columns.map(col => col.COLUMN_NAME.toLowerCase());
        console.log('📋 Existing columns:', existingColumns);

        // Add category column if it doesn't exist
        if (!existingColumns.includes('category')) {
            await connection.execute(`
                ALTER TABLE skills ADD COLUMN category VARCHAR(100) DEFAULT 'other'
            `);
            console.log('✅ Added category column');
        } else {
            console.log('ℹ️ Category column already exists');
        }

        // Add created_by_user_id column if it doesn't exist
        if (!existingColumns.includes('created_by_user_id')) {
            await connection.execute(`
                ALTER TABLE skills ADD COLUMN created_by_user_id INT NULL
            `);
            console.log('✅ Added created_by_user_id column');
        } else {
            console.log('ℹ️ created_by_user_id column already exists');
        }

        // Add confidence_score column if it doesn't exist
        if (!existingColumns.includes('confidence_score')) {
            await connection.execute(`
                ALTER TABLE skills ADD COLUMN confidence_score DECIMAL(4,3) DEFAULT 0.800
            `);
            console.log('✅ Added confidence_score column');
        } else {
            console.log('ℹ️ confidence_score column already exists');
        }

        // Fix the primary key column name if needed
        if (existingColumns.includes('id') && !existingColumns.includes('skill_id')) {
            await connection.execute(`
                ALTER TABLE skills CHANGE COLUMN id skill_id INT AUTO_INCREMENT PRIMARY KEY
            `);
            console.log('✅ Renamed id column to skill_id');
        }

        // Fix the name column if needed
        if (existingColumns.includes('name') && !existingColumns.includes('skill_name')) {
            await connection.execute(`
                ALTER TABLE skills CHANGE COLUMN name skill_name VARCHAR(255) UNIQUE NOT NULL
            `);
            console.log('✅ Renamed name column to skill_name');
        }

        // Add indexes for better performance
        const indexes = [
            { name: 'idx_skill_name', column: 'skill_name' },
            { name: 'idx_category', column: 'category' },
            { name: 'idx_confidence', column: 'confidence_score' },
            { name: 'idx_created_by_user', column: 'created_by_user_id' }
        ];

        for (const index of indexes) {
            try {
                await connection.execute(`
                    ALTER TABLE skills ADD INDEX ${index.name} (${index.column})
                `);
                console.log(`✅ Added index: ${index.name}`);
            } catch (error) {
                if (error.message.includes('Duplicate key name')) {
                    console.log(`ℹ️ Index ${index.name} already exists`);
                } else {
                    console.log(`⚠️ Could not add index ${index.name}:`, error.message);
                }
            }
        }

        console.log('🎉 Skills table schema update completed!');
        
        // Show current table structure
        const [describe] = await connection.execute('DESCRIBE skills');
        console.log('\n📋 Current skills table structure:');
        console.table(describe);

    } catch (error) {
        console.error('❌ Error updating skills schema:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔐 Database connection closed');
        }
    }
}

// Run the migration
if (require.main === module) {
    updateSkillsSchema()
        .then(() => {
            console.log('✅ Migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Migration failed:', error);
            process.exit(1);
        });
}

module.exports = updateSkillsSchema;