// populate_skill_mappings.js
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'dbms',
    multipleStatements: true
});

const skillMappingsSQL = `
-- Map skills to career steps (assuming we have skills with IDs 1-200 from earlier)
-- Data Scientist path skills
INSERT IGNORE INTO career_step_skills (step_id, skill_id, importance_level) VALUES
-- Junior Data Analyst skills
(1, 45, 'required'),  -- Excel 
(1, 6, 'required'),   -- SQL
(1, 63, 'preferred'), -- Tableau
(1, 28, 'preferred'), -- Statistics
(1, 89, 'preferred'), -- Data Analysis

-- Data Analyst skills  
(2, 1, 'required'),   -- Python
(2, 6, 'required'),   -- SQL
(2, 63, 'required'),  -- Tableau
(2, 64, 'preferred'), -- Power BI
(2, 28, 'required'),  -- Statistics
(2, 87, 'preferred'), -- Machine Learning

-- Senior Data Analyst skills
(3, 1, 'required'),   -- Python
(3, 29, 'required'),  -- R
(3, 87, 'required'),  -- Machine Learning  
(3, 47, 'preferred'), -- Leadership
(3, 48, 'required'),  -- Communication
(3, 89, 'required'),  -- Data Analysis

-- Data Scientist skills
(4, 1, 'required'),   -- Python
(4, 29, 'required'),  -- R
(4, 87, 'required'),  -- Machine Learning
(4, 88, 'required'),  -- Deep Learning
(4, 89, 'required'),  -- TensorFlow
(4, 90, 'preferred'), -- PyTorch
(4, 91, 'preferred'), -- Natural Language Processing

-- Full Stack Developer path skills
-- Frontend Developer skills
(5, 7, 'required'),   -- HTML
(5, 8, 'required'),   -- CSS  
(5, 3, 'required'),   -- JavaScript
(5, 9, 'preferred'),  -- React
(5, 10, 'optional'),  -- Angular

-- Backend Developer skills  
(6, 11, 'required'),  -- Node.js
(6, 12, 'required'),  -- Express.js
(6, 6, 'required'),   -- SQL
(6, 99, 'preferred'), -- MongoDB
(6, 34, 'preferred'), -- AWS

-- Full Stack Developer skills
(7, 3, 'required'),   -- JavaScript
(7, 9, 'required'),   -- React
(7, 11, 'required'),  -- Node.js
(7, 6, 'required'),   -- SQL
(7, 41, 'required'),  -- Git
(7, 44, 'preferred'), -- Agile

-- Product Manager path skills
-- Associate Product Manager skills
(8, 46, 'required'),  -- Project Management
(8, 48, 'required'),  -- Communication  
(8, 49, 'required'),  -- Teamwork
(8, 44, 'preferred'), -- Agile
(8, 58, 'preferred'), -- Marketing

-- Product Manager skills
(9, 46, 'required'),  -- Project Management
(9, 47, 'required'),  -- Leadership
(9, 44, 'required'),  -- Agile
(9, 45, 'required'),  -- Scrum
(9, 48, 'required'),  -- Communication
(9, 89, 'preferred'), -- Data Analysis

-- Senior Product Manager skills
(10, 47, 'required'), -- Leadership
(10, 46, 'required'), -- Project Management
(10, 50, 'required'), -- Problem Solving
(10, 51, 'required'), -- Critical Thinking
(10, 54, 'preferred'), -- Time Management
(10, 56, 'preferred'); -- Presentation
`;

async function populateSkillMappings() {
    try {
        console.log('Connecting to database...');
        
        await new Promise((resolve, reject) => {
            connection.query(skillMappingsSQL, (error, results) => {
                if (error) {
                    console.error('Error inserting skill mappings:', error);
                    reject(error);
                } else {
                    console.log('Career step skill mappings created successfully!');
                    resolve(results);
                }
            });
        });

        console.log('Skill mappings setup completed successfully!');
        
    } catch (error) {
        console.error('Setup failed:', error);
    } finally {
        connection.end();
    }
}

// Run setup
populateSkillMappings();
