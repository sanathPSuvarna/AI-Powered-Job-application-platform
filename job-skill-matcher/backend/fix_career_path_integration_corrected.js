const db = require('./config/database');

const fixCareerPathSystem = async () => {
    try {
        console.log('🔧 Fixing Career Path Integration...');
        
        // First, let's add comprehensive skills to the database without description column
        console.log('📋 Adding comprehensive skills to database...');
        
        const skillsQuery = `
-- First, let's ensure we have basic skills in the database
INSERT IGNORE INTO skills (skill_name, category) VALUES
-- Programming Languages
('Python', 'Programming Languages'),
('JavaScript', 'Programming Languages'),
('Java', 'Programming Languages'),
('SQL', 'Databases'),
('HTML', 'Web Development'),
('CSS', 'Web Development'),
('React', 'Web Development'),
('Node.js', 'Web Development'),
('Express.js', 'Web Development'),

-- Data Engineering Skills
('Apache Spark', 'Big Data'),
('Apache Airflow', 'Data Engineering'),
('Hadoop', 'Big Data'),
('ETL', 'Data Engineering'),
('Data Warehousing', 'Data Engineering'),
('Apache Kafka', 'Data Engineering'),

-- Data Science Skills
('Machine Learning', 'Data Science'),
('Deep Learning', 'Data Science'),
('Statistics', 'Data Science'),
('Data Visualization', 'Data Science'),
('Pandas', 'Data Science'),
('NumPy', 'Data Science'),
('TensorFlow', 'Machine Learning'),
('Scikit-learn', 'Machine Learning'),

-- DevOps Skills
('Docker', 'DevOps'),
('Kubernetes', 'DevOps'),
('Linux', 'Operating Systems'),
('Shell Scripting', 'Automation'),
('Git', 'Version Control'),
('CI/CD', 'DevOps'),
('Terraform', 'Infrastructure'),
('Jenkins', 'DevOps'),
('Monitoring', 'DevOps'),
('Prometheus', 'Monitoring'),

-- Cloud Platforms
('AWS', 'Cloud Computing'),
('Azure', 'Cloud Computing'),
('Google Cloud', 'Cloud Computing'),
('Cloud Computing', 'Cloud Computing'),

-- Soft Skills
('Leadership', 'Soft Skills'),
('Project Management', 'Management'),
('Team Management', 'Management'),
('Strategic Planning', 'Management'),
('Communication', 'Soft Skills'),

-- Design Skills
('UX Design', 'Design'),
('UI Design', 'Design'),
('Figma', 'Design Tools'),
('Adobe Creative Suite', 'Design Tools'),
('Prototyping', 'Design'),
('User Research', 'Design'),

-- Database Skills
('Database Design', 'Databases'),
('MongoDB', 'Databases'),
('PostgreSQL', 'Databases'),
('MySQL', 'Databases'),

-- System Design
('System Design', 'Architecture'),
('System Architecture', 'Architecture'),
('Software Design', 'Architecture'),
('Data Architecture', 'Architecture'),
('Microservices', 'Architecture'),

-- Product Management
('Product Strategy', 'Product Management'),
('Product Roadmapping', 'Product Management'),
('Market Research', 'Business'),
('A/B Testing', 'Analytics'),
('Analytics', 'Data Analysis'),
('Agile', 'Methodologies'),
('Scrum', 'Methodologies'),

-- Research Skills
('Research', 'Research'),
('Technical Writing', 'Communication'),
('Data Analysis', 'Analytics'),

-- Additional Technical Skills
('REST API', 'Web Development'),
('GraphQL', 'Web Development'),
('Redis', 'Databases'),
('Elasticsearch', 'Search'),
('Apache NiFi', 'Data Engineering');`;

        await db.query(skillsQuery);
        console.log('✅ Skills added successfully');

        // Clear existing mappings
        console.log('🧹 Clearing existing skill mappings...');
        await db.query('DELETE FROM career_step_skills;');
        
        // Add comprehensive skill mappings for all career paths
        console.log('🔗 Mapping skills to career steps...');
        
        const skillMappingQuery = `
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
  AND s.skill_name IN ('Linux', 'Shell Scripting', 'Git', 'Docker')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'DevOps Engineer' AND cps.step_order = 3 
  AND s.skill_name IN ('Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'AWS')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'DevOps Engineer' AND cps.step_order = 4 
  AND s.skill_name IN ('Kubernetes', 'Terraform', 'AWS', 'Monitoring', 'CI/CD')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'DevOps Engineer' AND cps.step_order = 5 
  AND s.skill_name IN ('Leadership', 'System Architecture', 'Cloud Computing', 'Project Management')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'DevOps Engineer' AND cps.step_order = 6 
  AND s.skill_name IN ('Leadership', 'Strategic Planning', 'Team Management', 'System Architecture')

-- Full Stack Developer skill mappings
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Full Stack Developer' AND cps.step_order = 1 
  AND s.skill_name IN ('HTML', 'CSS', 'JavaScript')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Full Stack Developer' AND cps.step_order = 2 
  AND s.skill_name IN ('JavaScript', 'React', 'Node.js', 'Express.js', 'SQL')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Full Stack Developer' AND cps.step_order = 3 
  AND s.skill_name IN ('React', 'Node.js', 'Database Design', 'REST API', 'Git')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Full Stack Developer' AND cps.step_order = 4 
  AND s.skill_name IN ('System Design', 'Microservices', 'AWS', 'Docker', 'Leadership')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Full Stack Developer' AND cps.step_order = 5 
  AND s.skill_name IN ('System Architecture', 'Leadership', 'Project Management', 'Team Management')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Full Stack Developer' AND cps.step_order = 6 
  AND s.skill_name IN ('Leadership', 'Strategic Planning', 'System Architecture', 'Team Management')

-- Product Manager skill mappings
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Product Manager' AND cps.step_order = 1 
  AND s.skill_name IN ('Market Research', 'Analytics')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Product Manager' AND cps.step_order = 2 
  AND s.skill_name IN ('Product Strategy', 'Analytics', 'A/B Testing', 'Agile')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Product Manager' AND cps.step_order = 3 
  AND s.skill_name IN ('Product Strategy', 'Product Roadmapping', 'Leadership', 'Project Management')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Product Manager' AND cps.step_order = 4 
  AND s.skill_name IN ('Leadership', 'Strategic Planning', 'Team Management', 'Product Strategy')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Product Manager' AND cps.step_order = 5 
  AND s.skill_name IN ('Strategic Planning', 'Leadership', 'Team Management')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Product Manager' AND cps.step_order = 6 
  AND s.skill_name IN ('Strategic Planning', 'Leadership', 'Team Management')

-- Research Scientist skill mappings
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Research Scientist' AND cps.step_order = 1 
  AND s.skill_name IN ('Research', 'Statistics', 'Python')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Research Scientist' AND cps.step_order = 2 
  AND s.skill_name IN ('Research', 'Machine Learning', 'Statistics', 'Technical Writing')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Research Scientist' AND cps.step_order = 3 
  AND s.skill_name IN ('Research', 'Deep Learning', 'Machine Learning', 'Technical Writing', 'Python')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Research Scientist' AND cps.step_order = 4 
  AND s.skill_name IN ('Research', 'Deep Learning', 'Leadership', 'Project Management')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Research Scientist' AND cps.step_order = 5 
  AND s.skill_name IN ('Research', 'Leadership', 'Strategic Planning', 'Team Management')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Research Scientist' AND cps.step_order = 6 
  AND s.skill_name IN ('Leadership', 'Strategic Planning', 'Team Management')

-- Software Architect skill mappings
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Software Architect' AND cps.step_order = 1 
  AND s.skill_name IN ('Software Design', 'System Design')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Software Architect' AND cps.step_order = 2 
  AND s.skill_name IN ('Software Design', 'System Design', 'Java', 'Python')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Software Architect' AND cps.step_order = 3 
  AND s.skill_name IN ('System Architecture', 'Microservices', 'System Design', 'Leadership')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Software Architect' AND cps.step_order = 4 
  AND s.skill_name IN ('System Architecture', 'Leadership', 'Project Management', 'Strategic Planning')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Software Architect' AND cps.step_order = 5 
  AND s.skill_name IN ('System Architecture', 'Leadership', 'Strategic Planning', 'Team Management')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'Software Architect' AND cps.step_order = 6 
  AND s.skill_name IN ('Leadership', 'Strategic Planning', 'System Architecture', 'Team Management')

-- UX/UI Designer skill mappings
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'UX/UI Designer' AND cps.step_order = 1 
  AND s.skill_name IN ('UI Design', 'UX Design', 'Figma')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'UX/UI Designer' AND cps.step_order = 2 
  AND s.skill_name IN ('UX Design', 'UI Design', 'User Research', 'Prototyping')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'UX/UI Designer' AND cps.step_order = 3 
  AND s.skill_name IN ('UX Design', 'User Research', 'Prototyping', 'Adobe Creative Suite')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'UX/UI Designer' AND cps.step_order = 4 
  AND s.skill_name IN ('UX Design', 'Leadership', 'Project Management', 'User Research')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'UX/UI Designer' AND cps.step_order = 5 
  AND s.skill_name IN ('Leadership', 'Strategic Planning', 'UX Design', 'Team Management')
UNION ALL
SELECT cps.step_id, s.skill_id, 'required'
FROM career_path_steps cps
JOIN career_goals cg ON cps.goal_id = cg.goal_id
JOIN skills s ON 1=1
WHERE cg.title = 'UX/UI Designer' AND cps.step_order = 6 
  AND s.skill_name IN ('Leadership', 'Strategic Planning', 'Team Management');`;

        await db.query(skillMappingQuery);
        console.log('✅ Skills mapped to career steps successfully');

        // Verify the fix by checking data
        console.log('🔍 Verifying fix...');
        
        // Check if skills exist
        const [skillsResult] = await db.query('SELECT COUNT(*) as skill_count FROM skills');
        console.log(`Skills in database: ${skillsResult[0].skill_count}`);
        
        // Check if career goals exist
        const [goalsResult] = await db.query('SELECT COUNT(*) as goal_count FROM career_goals');
        console.log(`Career goals in database: ${goalsResult[0].goal_count}`);
        
        // Check if skill mappings exist
        const [mappingsResult] = await db.query('SELECT COUNT(*) as mapping_count FROM career_step_skills');
        console.log(`Skill mappings in database: ${mappingsResult[0].mapping_count}`);
        
        // Check sample mappings for Data Engineer
        const [sampleResult] = await db.query(`
            SELECT cg.title, cps.title as step_title, s.skill_name, css.importance_level
            FROM career_step_skills css
            JOIN career_path_steps cps ON css.step_id = cps.step_id
            JOIN career_goals cg ON cps.goal_id = cg.goal_id
            JOIN skills s ON css.skill_id = s.skill_id
            WHERE cg.title = 'Data Engineer'
            ORDER BY cps.step_order, s.skill_name
            LIMIT 10
        `);
        
        console.log('✅ Sample skill mappings for Data Engineer:');
        sampleResult.forEach(row => {
            console.log(`  ${row.step_title}: ${row.skill_name} (${row.importance_level})`);
        });
        
        console.log('🎉 Career path system fixed successfully!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Test the Career Path Simulator in the frontend');
        console.log('2. Verify skill analysis is working correctly');
        console.log('3. Check that recommendations are being generated');
        
        process.exit(0);
        
    } catch (error) {
        console.error('Fix failed:', error);
        process.exit(1);
    }
};

fixCareerPathSystem();