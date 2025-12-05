// simple_career_update.js
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'dbms',
    multipleStatements: true
});

const updateCareerData = `
-- Safely handle foreign key constraints by clearing in proper order
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data for fresh setup
DELETE FROM user_career_goals;
DELETE FROM career_step_resources WHERE step_id IN (SELECT step_id FROM career_path_steps);
DELETE FROM career_step_skills WHERE step_id IN (SELECT step_id FROM career_path_steps);
DELETE FROM career_path_steps;
DELETE FROM career_goals;

SET FOREIGN_KEY_CHECKS = 1;

-- Insert updated career goals (without salary ranges)
INSERT INTO career_goals (goal_id, title, description, industry) VALUES
(1, 'Data Engineer', 'Build and maintain data pipelines, ETL processes, and big data infrastructure', 'Technology'),
(2, 'Data Scientist', 'Analyze complex data using machine learning and statistical methods to drive business insights', 'Technology'),
(3, 'DevOps Engineer', 'Manage development operations, CI/CD pipelines, and cloud infrastructure automation', 'Technology'),
(4, 'Full Stack Developer', 'Develop complete web applications from frontend to backend and deployment', 'Technology'),
(5, 'Product Manager', 'Guide product development from conception to launch using data-driven decision making', 'Technology/Business'),
(6, 'Research Scientist', 'Conduct advanced research in AI, ML, and emerging technologies', 'Research/Academia'),
(7, 'Software Architect', 'Design high-level software solutions and enterprise system architecture', 'Technology'),
(8, 'UX/UI Designer', 'Design user interfaces and experiences for digital products and applications', 'Design/Technology');

-- Data Engineer Career Path
INSERT INTO career_path_steps (goal_id, step_order, step_title, step_description, required_experience_years, estimated_duration_months) VALUES
(1, 1, 'Intern', 'Learn data engineering fundamentals and assist with basic data tasks', 0, 6),
(1, 2, 'Junior Data Engineer', 'Build basic ETL pipelines and work with data warehousing tools', 0, 12),
(1, 3, 'Data Engineer', 'Design and implement complex data pipelines and big data solutions', 2, 18),
(1, 4, 'Senior Data Engineer', 'Lead data infrastructure projects and mentor junior engineers', 4, 24),
(1, 5, 'Data Architect', 'Design enterprise-level data architecture and strategy', 7, 24),
(1, 6, 'Head of Data Engineering', 'Lead data engineering teams and drive organizational data strategy', 10, 0);

-- Data Scientist Career Path  
INSERT INTO career_path_steps (goal_id, step_order, step_title, step_description, required_experience_years, estimated_duration_months) VALUES
(2, 1, 'Data Analyst', 'Analyze data and create reports using SQL and visualization tools', 0, 12),
(2, 2, 'Junior Data Scientist', 'Apply basic machine learning models and statistical analysis', 1, 18),
(2, 3, 'Data Scientist', 'Develop advanced ML models and lead analytics projects', 3, 24),
(2, 4, 'Senior Data Scientist', 'Design ML systems and guide strategic data science initiatives', 5, 24),
(2, 5, 'Applied Scientist', 'Research and implement cutting-edge ML algorithms in production', 7, 24),
(2, 6, 'Lead Data Scientist', 'Lead data science teams and drive AI/ML strategy', 10, 24),
(2, 7, 'Chief AI Officer', 'Executive leadership for AI strategy and implementation', 12, 0);

-- DevOps Engineer Career Path
INSERT INTO career_path_steps (goal_id, step_order, step_title, step_description, required_experience_years, estimated_duration_months) VALUES
(3, 1, 'System Administrator', 'Manage servers, networks, and basic infrastructure maintenance', 0, 12),
(3, 2, 'Junior DevOps Engineer', 'Implement basic CI/CD pipelines and cloud deployments', 1, 18),
(3, 3, 'DevOps Engineer', 'Design automated infrastructure and manage container orchestration', 3, 24),
(3, 4, 'Site Reliability Engineer (SRE)', 'Ensure system reliability, monitoring, and incident response', 5, 24),
(3, 5, 'Senior DevOps Engineer', 'Lead infrastructure automation and cloud architecture projects', 7, 24),
(3, 6, 'Cloud Architect', 'Design enterprise cloud solutions and migration strategies', 10, 24),
(3, 7, 'Chief Technology Officer', 'Executive leadership for technology strategy and infrastructure', 12, 0);

-- Full Stack Developer Career Path
INSERT INTO career_path_steps (goal_id, step_order, step_title, step_description, required_experience_years, estimated_duration_months) VALUES
(4, 1, 'Frontend Developer', 'Develop user interfaces using HTML, CSS, JavaScript, and modern frameworks', 0, 12),
(4, 2, 'Backend Developer', 'Build server-side applications, APIs, and database integrations', 1, 12),
(4, 3, 'Full Stack Developer', 'Develop complete web applications from frontend to backend', 2, 18),
(4, 4, 'Senior Full Stack Developer', 'Lead full stack projects and mentor junior developers', 4, 24),
(4, 5, 'Tech Lead', 'Guide technical decisions and coordinate development teams', 6, 24),
(4, 6, 'Software Architect', 'Design application architecture and technical roadmaps', 8, 24),
(4, 7, 'Chief Technology Officer', 'Executive leadership for technology strategy and development', 12, 0);

-- Product Manager Career Path
INSERT INTO career_path_steps (goal_id, step_order, step_title, step_description, required_experience_years, estimated_duration_months) VALUES
(5, 1, 'Associate Product Manager', 'Support product development with market research and feature planning', 0, 12),
(5, 2, 'Product Manager', 'Own product roadmap and coordinate with engineering and design teams', 2, 18),
(5, 3, 'Senior Product Manager', 'Lead multiple products and drive strategic product initiatives', 4, 24),
(5, 4, 'Group Product Manager', 'Manage product managers and oversee product portfolio', 6, 24),
(5, 5, 'Director of Product', 'Set product strategy and lead product organization', 8, 24),
(5, 6, 'VP of Product', 'Executive leadership for product strategy and vision', 10, 24),
(5, 7, 'Chief Product Officer', 'C-level executive responsible for entire product strategy', 12, 0);

-- Research Scientist Career Path
INSERT INTO career_path_steps (goal_id, step_order, step_title, step_description, required_experience_years, estimated_duration_months) VALUES
(6, 1, 'Research Assistant', 'Support senior researchers with experiments and data collection', 0, 24),
(6, 2, 'PhD Candidate', 'Conduct independent research and work toward doctoral degree', 2, 48),
(6, 3, 'Postdoctoral Researcher', 'Advanced research training and publication in specialized field', 5, 24),
(6, 4, 'Research Scientist', 'Lead independent research projects and publish findings', 7, 36),
(6, 5, 'Senior Research Scientist', 'Direct research programs and mentor junior researchers', 10, 36),
(6, 6, 'Principal Investigator', 'Lead major research initiatives and secure funding', 12, 24),
(6, 7, 'Head of Research & Development', 'Executive leadership for research strategy and innovation', 15, 0);

-- Software Architect Career Path
INSERT INTO career_path_steps (goal_id, step_order, step_title, step_description, required_experience_years, estimated_duration_months) VALUES
(7, 1, 'Software Engineer', 'Write code and implement software features under supervision', 0, 18),
(7, 2, 'Senior Software Engineer', 'Lead feature development and mentor junior engineers', 3, 24),
(7, 3, 'Tech Lead', 'Guide technical decisions and coordinate engineering teams', 5, 24),
(7, 4, 'Software Architect', 'Design system architecture and technical solutions', 7, 24),
(7, 5, 'Principal Architect', 'Lead architecture decisions across multiple systems', 10, 24),
(7, 6, 'Director of Engineering', 'Manage engineering teams and technical strategy', 12, 24),
(7, 7, 'Chief Technology Officer', 'Executive leadership for technology and engineering', 15, 0);

-- UX/UI Designer Career Path
INSERT INTO career_path_steps (goal_id, step_order, step_title, step_description, required_experience_years, estimated_duration_months) VALUES
(8, 1, 'Junior Designer', 'Create basic wireframes and design mockups under supervision', 0, 12),
(8, 2, 'UX/UI Designer', 'Design complete user interfaces and conduct usability testing', 1, 18),
(8, 3, 'Senior Designer', 'Lead design projects and establish design standards', 3, 24),
(8, 4, 'Product Designer', 'Own end-to-end product design and user experience strategy', 5, 24),
(8, 5, 'Design Lead', 'Lead design teams and mentor other designers', 7, 24),
(8, 6, 'UX Manager', 'Manage design teams and coordinate with product and engineering', 9, 24),
(8, 7, 'Chief Design Officer', 'Executive leadership for design strategy and vision', 12, 0);
`;

async function updateCareerPaths() {
    try {
        console.log('Connecting to database...');
        
        // Execute career data update
        await new Promise((resolve, reject) => {
            connection.query(updateCareerData, (error, results) => {
                if (error) {
                    console.error('Error updating career data:', error);
                    reject(error);
                } else {
                    console.log('✅ Comprehensive career paths updated successfully!');
                    resolve(results);
                }
            });
        });

        console.log('🎯 Added 8 comprehensive career paths:');
        console.log('   • Data Engineer (6 levels: Intern → Head of Data Engineering)');
        console.log('   • Data Scientist (7 levels: Data Analyst → Chief AI Officer)'); 
        console.log('   • DevOps Engineer (7 levels: System Admin → CTO)');
        console.log('   • Full Stack Developer (7 levels: Frontend Dev → CTO)');
        console.log('   • Product Manager (7 levels: Associate PM → CPO)');
        console.log('   • Research Scientist (7 levels: Research Assistant → Head of R&D)');
        console.log('   • Software Architect (7 levels: Software Engineer → CTO)');
        console.log('   • UX/UI Designer (7 levels: Junior Designer → CDO)');
        console.log('📋 Removed salary ranges for cleaner interface');
        
    } catch (error) {
        console.error('Update failed:', error);
    } finally {
        connection.end();
    }
}

// Run the update
updateCareerPaths();