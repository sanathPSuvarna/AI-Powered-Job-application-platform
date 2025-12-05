// fix_career_path_integration.js
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'dbms',
    multipleStatements: true
});

const fixCareerPathSystem = `
-- First, let's ensure we have basic skills in the database
INSERT IGNORE INTO skills (skill_name, category, description) VALUES
-- Programming Languages
('Python', 'Programming Languages', 'High-level programming language'),
('JavaScript', 'Programming Languages', 'Web programming language'),
('Java', 'Programming Languages', 'Object-oriented programming language'),
('SQL', 'Databases', 'Structured Query Language for databases'),
('HTML', 'Web Development', 'HyperText Markup Language'),
('CSS', 'Web Development', 'Cascading Style Sheets'),
('React', 'Web Development', 'JavaScript library for building user interfaces'),
('Node.js', 'Web Development', 'JavaScript runtime environment'),
('Express.js', 'Web Development', 'Web application framework for Node.js'),

-- Data Engineering Skills
('Apache Spark', 'Big Data', 'Unified analytics engine for large-scale data processing'),
('Apache Airflow', 'Data Engineering', 'Platform for developing and monitoring workflows'),
('Hadoop', 'Big Data', 'Framework for distributed storage and processing'),
('ETL', 'Data Engineering', 'Extract, Transform, Load processes'),
('Data Warehousing', 'Data Engineering', 'Data storage and management systems'),
('Apache Kafka', 'Data Engineering', 'Distributed streaming platform'),

-- Data Science Skills
('Machine Learning', 'Data Science', 'Algorithms that learn from data'),
('Deep Learning', 'Data Science', 'Neural networks with multiple layers'),
('Statistics', 'Data Science', 'Mathematical analysis of data'),
('Data Visualization', 'Data Science', 'Graphical representation of data'),
('Pandas', 'Data Science', 'Python data manipulation library'),
('NumPy', 'Data Science', 'Python numerical computing library'),
('TensorFlow', 'Machine Learning', 'Open-source machine learning framework'),
('Scikit-learn', 'Machine Learning', 'Machine learning library for Python'),

-- DevOps Skills
('Docker', 'DevOps', 'Containerization platform'),
('Kubernetes', 'DevOps', 'Container orchestration system'),
('Linux', 'Operating Systems', 'Open-source operating system'),
('Shell Scripting', 'Automation', 'Command-line scripting'),
('Git', 'Version Control', 'Distributed version control system'),
('CI/CD', 'DevOps', 'Continuous Integration/Continuous Deployment'),
('Terraform', 'Infrastructure', 'Infrastructure as Code tool'),
('Jenkins', 'DevOps', 'Automation server'),
('Monitoring', 'DevOps', 'System and application monitoring'),
('Prometheus', 'Monitoring', 'Monitoring and alerting toolkit'),

-- Cloud Platforms
('AWS', 'Cloud Computing', 'Amazon Web Services'),
('Azure', 'Cloud Computing', 'Microsoft Azure'),
('Google Cloud', 'Cloud Computing', 'Google Cloud Platform'),
('Cloud Computing', 'Cloud Computing', 'On-demand computing services'),

-- Soft Skills
('Leadership', 'Soft Skills', 'Ability to guide and motivate teams'),
('Project Management', 'Management', 'Planning and organizing projects'),
('Team Management', 'Management', 'Leading and coordinating teams'),
('Strategic Planning', 'Management', 'Long-term planning and vision'),
('Communication', 'Soft Skills', 'Effective verbal and written communication'),

-- Design Skills
('UX Design', 'Design', 'User Experience Design'),
('UI Design', 'Design', 'User Interface Design'),
('Figma', 'Design Tools', 'Design and prototyping tool'),
('Adobe Creative Suite', 'Design Tools', 'Collection of design software'),
('Prototyping', 'Design', 'Creating interactive mockups'),
('User Research', 'Design', 'Understanding user needs and behaviors'),

-- Database Skills
('Database Design', 'Databases', 'Designing efficient database structures'),
('MongoDB', 'Databases', 'NoSQL document database'),
('PostgreSQL', 'Databases', 'Advanced open-source relational database'),
('MySQL', 'Databases', 'Popular open-source relational database'),

-- System Design
('System Design', 'Architecture', 'Designing scalable systems'),
('System Architecture', 'Architecture', 'High-level system structure'),
('Software Design', 'Architecture', 'Designing software systems'),
('Data Architecture', 'Architecture', 'Designing data systems'),
('Microservices', 'Architecture', 'Microservices architecture pattern'),

-- Product Management
('Product Strategy', 'Product Management', 'Strategic product planning'),
('Product Roadmapping', 'Product Management', 'Planning product development'),
('Market Research', 'Business', 'Analyzing market conditions'),
('A/B Testing', 'Analytics', 'Comparing two versions to determine performance'),
('Analytics', 'Data Analysis', 'Data analysis and interpretation'),
('Agile', 'Methodologies', 'Agile software development methodology'),
('Scrum', 'Methodologies', 'Agile framework for project management'),

-- Research Skills
('Research', 'Research', 'Systematic investigation and study'),
('Technical Writing', 'Communication', 'Writing technical documentation'),
('Data Analysis', 'Analytics', 'Examining and interpreting data'),

-- Additional Technical Skills
('REST API', 'Web Development', 'Representational State Transfer API'),
('GraphQL', 'Web Development', 'Query language for APIs'),
('Redis', 'Databases', 'In-memory data structure store'),
('Elasticsearch', 'Search', 'Distributed search and analytics engine'),
('Apache NiFi', 'Data Engineering', 'Data integration and distribution system');

-- Now let's properly map skills to career steps with correct step_ids
-- We need to get the actual step_ids from our career_path_steps table

-- Clear existing mappings first
DELETE FROM career_step_skills;

-- Add comprehensive skill mappings for all career paths
INSERT IGNORE INTO career_step_skills (step_id, skill_id, importance_level) 
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Data Engineer' AND cps.step_order = 1 
  AND s.skill_name IN ('SQL', 'Python', 'Database Design')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Data Engineer' AND cps.step_order = 2 
  AND s.skill_name IN ('SQL', 'Python', 'ETL', 'Data Warehousing', 'Apache Airflow')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Data Engineer' AND cps.step_order = 3 
  AND s.skill_name IN ('Python', 'SQL', 'Apache Spark', 'Hadoop', 'AWS', 'Docker')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Data Engineer' AND cps.step_order = 4 
  AND s.skill_name IN ('Python', 'Apache Spark', 'Kubernetes', 'AWS', 'Data Architecture')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Data Engineer' AND cps.step_order = 5 
  AND s.skill_name IN ('Data Architecture', 'Leadership', 'Project Management', 'Cloud Computing')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Data Engineer' AND cps.step_order = 6 
  AND s.skill_name IN ('Leadership', 'Strategic Planning', 'Data Architecture', 'Team Management')

-- Data Scientist skill mappings
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Data Scientist' AND cps.step_order = 1 
  AND s.skill_name IN ('SQL', 'Statistics', 'Data Visualization', 'Python')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Data Scientist' AND cps.step_order = 2 
  AND s.skill_name IN ('Python', 'Machine Learning', 'Statistics', 'Pandas', 'NumPy')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Data Scientist' AND cps.step_order = 3 
  AND s.skill_name IN ('Python', 'Machine Learning', 'TensorFlow', 'Deep Learning', 'Statistics')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Data Scientist' AND cps.step_order = 4 
  AND s.skill_name IN ('Machine Learning', 'Deep Learning', 'Leadership', 'Python', 'Project Management')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Data Scientist' AND cps.step_order = 5 
  AND s.skill_name IN ('Research', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'Python')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Data Scientist' AND cps.step_order = 6 
  AND s.skill_name IN ('Leadership', 'Machine Learning', 'Strategic Planning', 'Team Management')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Data Scientist' AND cps.step_order = 7 
  AND s.skill_name IN ('Strategic Planning', 'Leadership', 'Team Management')

-- DevOps Engineer skill mappings
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'DevOps Engineer' AND cps.step_order = 1 
  AND s.skill_name IN ('Linux', 'Shell Scripting')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'DevOps Engineer' AND cps.step_order = 2 
  AND s.skill_name IN ('Docker', 'Git', 'CI/CD', 'Linux', 'Shell Scripting')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'DevOps Engineer' AND cps.step_order = 3 
  AND s.skill_name IN ('Kubernetes', 'Docker', 'Terraform', 'AWS', 'CI/CD')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'DevOps Engineer' AND cps.step_order = 4 
  AND s.skill_name IN ('Kubernetes', 'Monitoring', 'Prometheus', 'AWS', 'System Design')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'DevOps Engineer' AND cps.step_order = 5 
  AND s.skill_name IN ('Kubernetes', 'Cloud Computing', 'Leadership', 'Terraform')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'DevOps Engineer' AND cps.step_order = 6 
  AND s.skill_name IN ('Cloud Computing', 'AWS', 'System Architecture', 'Leadership')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'DevOps Engineer' AND cps.step_order = 7 
  AND s.skill_name IN ('Leadership', 'Strategic Planning', 'Team Management')

-- Full Stack Developer skill mappings
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Full Stack Developer' AND cps.step_order = 1 
  AND s.skill_name IN ('HTML', 'CSS', 'JavaScript', 'React')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Full Stack Developer' AND cps.step_order = 2 
  AND s.skill_name IN ('Node.js', 'Express.js', 'SQL', 'REST API')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Full Stack Developer' AND cps.step_order = 3 
  AND s.skill_name IN ('JavaScript', 'React', 'Node.js', 'SQL', 'Git')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Full Stack Developer' AND cps.step_order = 4 
  AND s.skill_name IN ('System Design', 'Leadership', 'JavaScript', 'React', 'Node.js')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Full Stack Developer' AND cps.step_order = 5 
  AND s.skill_name IN ('Leadership', 'System Design', 'Project Management', 'Team Management')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Full Stack Developer' AND cps.step_order = 6 
  AND s.skill_name IN ('System Architecture', 'Leadership', 'Software Design', 'Team Management')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Full Stack Developer' AND cps.step_order = 7 
  AND s.skill_name IN ('Leadership', 'Strategic Planning', 'Team Management');

-- Add optional skills as well
INSERT IGNORE INTO career_step_skills (step_id, skill_id, importance_level) 
SELECT cps.step_id, s.skill_id, 'preferred'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Data Engineer' AND cps.step_order = 1 
  AND s.skill_name IN ('Apache Kafka', 'NoSQL')
UNION ALL
SELECT cps.step_id, s.skill_id, 'preferred'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Data Engineer' AND cps.step_order = 2 
  AND s.skill_name IN ('Apache Kafka', 'Redis', 'MongoDB')
UNION ALL
SELECT cps.step_id, s.skill_id, 'preferred'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Data Engineer' AND cps.step_order = 3 
  AND s.skill_name IN ('Elasticsearch', 'Apache NiFi', 'MongoDB')
UNION ALL
SELECT cps.step_id, s.skill_id, 'preferred'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Data Scientist' AND cps.step_order = 1 
  AND s.skill_name IN ('Machine Learning', 'Python')
UNION ALL
SELECT cps.step_id, s.skill_id, 'preferred'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Data Scientist' AND cps.step_order = 2 
  AND s.skill_name IN ('TensorFlow', 'Deep Learning', 'Scikit-learn')
UNION ALL
SELECT cps.step_id, s.skill_id, 'preferred'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'DevOps Engineer' AND cps.step_order = 1 
  AND s.skill_name IN ('Python', 'Git')
UNION ALL
SELECT cps.step_id, s.skill_id, 'preferred'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'DevOps Engineer' AND cps.step_order = 2 
  AND s.skill_name IN ('Jenkins', 'Python', 'Monitoring')
UNION ALL
SELECT cps.step_id, s.skill_id, 'preferred'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Full Stack Developer' AND cps.step_order = 1 
  AND s.skill_name IN ('Git', 'MongoDB')
UNION ALL
SELECT cps.step_id, s.skill_id, 'preferred'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Full Stack Developer' AND cps.step_order = 2 
  AND s.skill_name IN ('MongoDB', 'GraphQL', 'Docker')
UNION ALL
SELECT cps.step_id, s.skill_id, 'preferred'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Full Stack Developer' AND cps.step_order = 3 
  AND s.skill_name IN ('Docker', 'AWS', 'MongoDB', 'GraphQL');
`;

async function fixCareerPathIntegration() {
    try {
        console.log('🔧 Fixing Career Path Integration...');
        console.log('📋 Adding comprehensive skills to database...');
        console.log('🔗 Mapping skills to career steps...');
        
        // Execute the fix
        await new Promise((resolve, reject) => {
            connection.query(fixCareerPathSystem, (error, results) => {
                if (error) {
                    console.error('Error fixing career path system:', error);
                    reject(error);
                } else {
                    console.log('✅ Career path system fixed successfully!');
                    resolve(results);
                }
            });
        });

        console.log('\n🎯 Fixed Career Path Issues:');
        console.log('✓ Added 70+ essential skills to database');
        console.log('✓ Properly mapped skills to career steps');
        console.log('✓ Added required and preferred skill levels');
        console.log('✓ Ensured proper step_id relationships');
        console.log('✓ Connected skills across all career paths');
        
        // Verify the fix
        const [careerGoalsCount] = await new Promise((resolve, reject) => {
            connection.query('SELECT COUNT(*) as count FROM career_goals', (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });

        const [skillsCount] = await new Promise((resolve, reject) => {
            connection.query('SELECT COUNT(*) as count FROM skills', (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });

        const [skillMappingsCount] = await new Promise((resolve, reject) => {
            connection.query('SELECT COUNT(*) as count FROM career_step_skills', (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });

        const [resourcesCount] = await new Promise((resolve, reject) => {
            connection.query('SELECT COUNT(*) as count FROM career_step_resources', (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });

        console.log('\n📊 Database Status:');
        console.log(`📚 Career Goals: ${careerGoalsCount[0].count}`);
        console.log(`🛠️ Skills: ${skillsCount[0].count}`);
        console.log(`🔗 Skill Mappings: ${skillMappingsCount[0].count}`);
        console.log(`📖 Learning Resources: ${resourcesCount[0].count}`);
        
        console.log('\n✨ Career Path Simulator is now ready!');
        
    } catch (error) {
        console.error('Fix failed:', error);
    } finally {
        connection.end();
    }
}

// Run the fix
fixCareerPathIntegration();