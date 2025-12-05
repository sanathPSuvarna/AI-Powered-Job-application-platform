// setup_career_path_tables.js
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'dbms',
    multipleStatements: true
});

const sqlCommands = `
-- Career Path Simulator Database Schema

-- Table to store available career goals/paths
CREATE TABLE IF NOT EXISTS career_goals (
    goal_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    average_salary_range VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store career path steps for each goal
CREATE TABLE IF NOT EXISTS career_path_steps (
    step_id INT AUTO_INCREMENT PRIMARY KEY,
    goal_id INT NOT NULL,
    step_order INT NOT NULL,
    step_title VARCHAR(100) NOT NULL,
    step_description TEXT,
    required_experience_years INT DEFAULT 0,
    estimated_duration_months INT DEFAULT 6,
    FOREIGN KEY (goal_id) REFERENCES career_goals(goal_id)
);

-- Table to store required skills for each career step
CREATE TABLE IF NOT EXISTS career_step_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    step_id INT NOT NULL,
    skill_id INT NOT NULL,
    importance_level ENUM('required', 'preferred', 'optional') DEFAULT 'required',
    FOREIGN KEY (step_id) REFERENCES career_path_steps(step_id),
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
);

-- Table to store user's career goals and progress
CREATE TABLE IF NOT EXISTS user_career_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    goal_id INT NOT NULL,
    current_step INT DEFAULT 1,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    target_completion_date DATE,
    status ENUM('active', 'completed', 'paused') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (goal_id) REFERENCES career_goals(goal_id)
);

-- Table to store recommended courses/resources for career steps
CREATE TABLE IF NOT EXISTS career_step_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    step_id INT NOT NULL,
    resource_title VARCHAR(200) NOT NULL,
    resource_url VARCHAR(500),
    resource_type ENUM('course', 'certification', 'book', 'project', 'experience') DEFAULT 'course',
    provider VARCHAR(100),
    estimated_duration VARCHAR(50),
    cost_range VARCHAR(50),
    FOREIGN KEY (step_id) REFERENCES career_path_steps(step_id)
);

-- Insert sample career goals
INSERT IGNORE INTO career_goals (goal_id, title, description, industry, average_salary_range) VALUES
(1, 'Data Scientist', 'Analyze and interpret complex data to help organizations make decisions', 'Technology', '$70,000 - $150,000'),
(2, 'Full Stack Developer', 'Develop both front-end and back-end of web applications', 'Technology', '$60,000 - $130,000'),
(3, 'Product Manager', 'Guide the development of products from conception to launch', 'Technology/Business', '$80,000 - $160,000'),
(4, 'UX/UI Designer', 'Design user interfaces and experiences for digital products', 'Design/Technology', '$55,000 - $120,000'),
(5, 'DevOps Engineer', 'Manage development operations and infrastructure automation', 'Technology', '$70,000 - $140,000'),
(6, 'Research Scientist', 'Conduct research and publish findings in academic or industrial settings', 'Research/Academia', '$65,000 - $130,000'),
(7, 'Software Architect', 'Design high-level software solutions and system architecture', 'Technology', '$90,000 - $180,000'),
(8, 'Data Engineer', 'Build and maintain data pipelines and infrastructure', 'Technology', '$75,000 - $145,000');

-- Insert sample career path steps for Data Scientist
INSERT IGNORE INTO career_path_steps (step_id, goal_id, step_order, step_title, step_description, required_experience_years, estimated_duration_months) VALUES
(1, 1, 1, 'Junior Data Analyst', 'Entry-level position analyzing data and creating basic reports', 0, 12),
(2, 1, 2, 'Data Analyst', 'Intermediate role with advanced analytics and visualization skills', 1, 18),
(3, 1, 3, 'Senior Data Analyst', 'Lead analytics projects and mentor junior team members', 3, 24),
(4, 1, 4, 'Data Scientist', 'Apply machine learning and advanced statistical methods', 5, 0);

-- Insert sample career path steps for Full Stack Developer
INSERT IGNORE INTO career_path_steps (step_id, goal_id, step_order, step_title, step_description, required_experience_years, estimated_duration_months) VALUES
(5, 2, 1, 'Frontend Developer', 'Develop user interfaces using HTML, CSS, JavaScript, and frameworks', 0, 12),
(6, 2, 2, 'Backend Developer', 'Build server-side applications and APIs', 1, 18),
(7, 2, 3, 'Full Stack Developer', 'Develop complete web applications from front to back', 2, 0);

-- Insert sample career path steps for Product Manager
INSERT IGNORE INTO career_path_steps (step_id, goal_id, step_order, step_title, step_description, required_experience_years, estimated_duration_months) VALUES
(8, 3, 1, 'Associate Product Manager', 'Support senior PMs with market research and feature planning', 0, 12),
(9, 3, 2, 'Product Manager', 'Own product roadmap and coordinate with engineering teams', 2, 18),
(10, 3, 3, 'Senior Product Manager', 'Lead multiple products and strategic initiatives', 5, 0);

-- Insert sample career path steps for UX/UI Designer
INSERT IGNORE INTO career_path_steps (step_id, goal_id, step_order, step_title, step_description, required_experience_years, estimated_duration_months) VALUES
(11, 4, 1, 'Junior UX/UI Designer', 'Create basic wireframes and design mockups under supervision', 0, 12),
(12, 4, 2, 'UX/UI Designer', 'Design complete user interfaces and conduct usability testing', 1, 18),
(13, 4, 3, 'Senior UX/UI Designer', 'Lead design projects and mentor junior designers', 3, 24),
(14, 4, 4, 'Principal Designer', 'Define design strategy and oversee multiple design teams', 6, 0);

-- Insert sample career path steps for DevOps Engineer
INSERT IGNORE INTO career_path_steps (step_id, goal_id, step_order, step_title, step_description, required_experience_years, estimated_duration_months) VALUES
(15, 5, 1, 'System Administrator', 'Manage servers and basic infrastructure maintenance', 0, 12),
(16, 5, 2, 'Cloud Engineer', 'Deploy and manage cloud infrastructure and services', 1, 18),
(17, 5, 3, 'DevOps Engineer', 'Implement CI/CD pipelines and infrastructure automation', 3, 24),
(18, 5, 4, 'Principal DevOps Engineer', 'Architect enterprise-level DevOps solutions', 6, 0);

-- Insert sample career path steps for Research Scientist
INSERT IGNORE INTO career_path_steps (step_id, goal_id, step_order, step_title, step_description, required_experience_years, estimated_duration_months) VALUES
(19, 6, 1, 'Research Assistant', 'Support senior researchers and conduct basic experiments', 0, 24),
(20, 6, 2, 'Research Associate', 'Lead research projects and publish findings', 2, 36),
(21, 6, 3, 'Research Scientist', 'Independent research and grant proposal writing', 5, 0);

-- Insert sample career path steps for Software Architect
INSERT IGNORE INTO career_path_steps (step_id, goal_id, step_order, step_title, step_description, required_experience_years, estimated_duration_months) VALUES
(22, 7, 1, 'Software Developer', 'Write code and implement software features', 0, 24),
(23, 7, 2, 'Senior Software Developer', 'Lead development teams and design software components', 3, 24),
(24, 7, 3, 'Technical Lead', 'Guide technical decisions and mentor development teams', 5, 24),
(25, 7, 4, 'Software Architect', 'Design enterprise-level software architecture', 8, 0);

-- Insert sample career path steps for Data Engineer
INSERT IGNORE INTO career_path_steps (step_id, goal_id, step_order, step_title, step_description, required_experience_years, estimated_duration_months) VALUES
(26, 8, 1, 'Junior Data Engineer', 'Build basic data pipelines and maintain data systems', 0, 12),
(27, 8, 2, 'Data Engineer', 'Design and implement complex data architectures', 2, 18),
(28, 8, 3, 'Senior Data Engineer', 'Lead data infrastructure projects and optimize systems', 4, 24),
(29, 8, 4, 'Principal Data Engineer', 'Architect enterprise data platforms and lead teams', 7, 0);
`;

const resourcesSQL = `
-- Insert sample resources for career steps
INSERT IGNORE INTO career_step_resources (step_id, resource_title, resource_url, resource_type, provider, estimated_duration, cost_range) VALUES
-- Data Analyst resources
(1, 'Excel for Data Analysis', 'https://coursera.org/excel-data-analysis', 'course', 'Coursera', '4 weeks', '$39-79'),
(1, 'Introduction to SQL', 'https://codecademy.com/sql-course', 'course', 'Codecademy', '6 weeks', '$15-35'),
(1, 'Data Visualization with Tableau', 'https://udemy.com/tableau-course', 'course', 'Udemy', '8 weeks', '$50-100'),

-- Data Scientist resources
(2, 'Python for Data Science', 'https://datacamp.com/python-data-science', 'course', 'DataCamp', '3 months', '$25-35/month'),
(3, 'Machine Learning Specialization', 'https://coursera.org/ml-specialization', 'course', 'Coursera', '3 months', '$39-79'),
(4, 'Deep Learning Specialization', 'https://coursera.org/deep-learning', 'course', 'Coursera', '4 months', '$39-79'),

-- Full Stack Developer resources
(5, 'Complete Web Development Bootcamp', 'https://udemy.com/web-development-bootcamp', 'course', 'Udemy', '12 weeks', '$50-200'),
(6, 'Node.js and Express.js Course', 'https://nodejs.org/learn', 'course', 'Node.js Foundation', '8 weeks', 'Free'),
(7, 'Full Stack React Developer', 'https://reactjs.org/tutorial', 'course', 'React Team', '6 weeks', 'Free'),

-- Product Manager resources
(8, 'Product Management Fundamentals', 'https://coursera.org/product-management', 'course', 'Coursera', '6 weeks', '$39-79'),
(9, 'Agile Development Specialization', 'https://coursera.org/agile-development', 'course', 'Coursera', '4 months', '$39-79'),
(10, 'Strategic Product Management', 'https://edx.org/strategic-product-management', 'course', 'edX', '8 weeks', '$99-299'),

-- UX/UI Designer resources
(11, 'UX Design Fundamentals', 'https://coursera.org/ux-design-fundamentals', 'course', 'Coursera', '6 weeks', '$39-79'),
(12, 'Adobe Creative Suite Mastery', 'https://adobe.com/creative-suite-training', 'course', 'Adobe', '8 weeks', '$20-50/month'),
(13, 'Design Systems and Prototyping', 'https://figma.com/design-systems-course', 'course', 'Figma', '4 weeks', 'Free'),
(14, 'Advanced UX Research', 'https://nngroup.com/ux-research-course', 'course', 'Nielsen Norman Group', '12 weeks', '$500-1000'),

-- DevOps Engineer resources
(15, 'Linux System Administration', 'https://linuxacademy.com/linux-admin', 'course', 'Linux Academy', '8 weeks', '$29-49/month'),
(16, 'AWS Cloud Practitioner', 'https://aws.amazon.com/training/cloud-practitioner', 'certification', 'AWS', '6 weeks', '$100-300'),
(17, 'Docker and Kubernetes', 'https://docker.com/kubernetes-course', 'course', 'Docker', '10 weeks', '$200-500'),
(18, 'Infrastructure as Code with Terraform', 'https://terraform.io/learn', 'course', 'HashiCorp', '8 weeks', 'Free'),

-- Research Scientist resources
(19, 'Research Methodology in Computer Science', 'https://coursera.org/research-methodology', 'course', 'Coursera', '12 weeks', '$39-79'),
(20, 'Statistical Analysis with R', 'https://r-project.org/statistical-analysis', 'course', 'R Foundation', '10 weeks', 'Free'),
(21, 'Grant Writing for Scientists', 'https://nature.com/grant-writing-course', 'course', 'Nature', '6 weeks', '$200-400'),

-- Software Architect resources
(22, 'System Design Interview Prep', 'https://educative.io/system-design', 'course', 'Educative', '8 weeks', '$59-99'),
(23, 'Microservices Architecture', 'https://microservices.io/architecture-course', 'course', 'Microservices.io', '12 weeks', '$300-600'),
(24, 'Enterprise Architecture Patterns', 'https://martinfowler.com/architecture-patterns', 'course', 'Martin Fowler', '10 weeks', '$400-800'),
(25, 'Cloud Architecture Certification', 'https://cloud.google.com/architect-certification', 'certification', 'Google Cloud', '16 weeks', '$200-500'),

-- Data Engineer resources
(26, 'Apache Spark and Hadoop', 'https://databricks.com/spark-hadoop-course', 'course', 'Databricks', '10 weeks', '$300-600'),
(27, 'Data Pipeline Engineering', 'https://airflow.apache.org/data-pipeline-course', 'course', 'Apache Airflow', '8 weeks', 'Free'),
(28, 'Advanced Data Warehousing', 'https://snowflake.com/data-warehousing-course', 'course', 'Snowflake', '12 weeks', '$500-1000'),
(29, 'Big Data Architecture', 'https://cloudera.com/big-data-architecture', 'certification', 'Cloudera', '16 weeks', '$400-800');
`;

async function setupTables() {
    try {
        console.log('Connecting to database...');
        
        // Execute main schema
        await new Promise((resolve, reject) => {
            connection.query(sqlCommands, (error, results) => {
                if (error) {
                    console.error('Error executing schema:', error);
                    reject(error);
                } else {
                    console.log('Career path tables created successfully!');
                    resolve(results);
                }
            });
        });

        // Execute resources SQL
        await new Promise((resolve, reject) => {
            connection.query(resourcesSQL, (error, results) => {
                if (error) {
                    console.error('Error inserting resources:', error);
                    reject(error);
                } else {
                    console.log('Sample resources inserted successfully!');
                    resolve(results);
                }
            });
        });

        console.log('Database setup completed successfully!');
        
    } catch (error) {
        console.error('Setup failed:', error);
    } finally {
        connection.end();
    }
}

// Run setup
setupTables();
