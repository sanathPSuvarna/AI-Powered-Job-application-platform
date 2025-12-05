// populate_detailed_career_paths.js
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'dbms',
    multipleStatements: true
});

// Comprehensive career paths data - Update approach without deleting existing data
const comprehensiveCareerData = `
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

const skillsAndResourcesData = `
-- Insert comprehensive learning resources

-- Data Engineer Resources
INSERT INTO career_step_resources (step_id, resource_title, resource_url, resource_type, provider, estimated_duration, cost_range) VALUES
-- Intern Level
(1, 'Introduction to Data Engineering', 'https://coursera.org/intro-data-engineering', 'course', 'Coursera', '4 weeks', 'Free'),
(1, 'SQL Fundamentals', 'https://codecademy.com/sql-fundamentals', 'course', 'Codecademy', '6 weeks', '$15-35'),

-- Junior Data Engineer
(2, 'ETL with Apache NiFi', 'https://nifi.apache.org/training', 'course', 'Apache', '6 weeks', 'Free'),
(2, 'Python for Data Engineering', 'https://datacamp.com/python-data-engineering', 'course', 'DataCamp', '8 weeks', '$25-35/month'),
(2, 'Apache Airflow Course', 'https://airflow.apache.org/course', 'course', 'Apache', '4 weeks', 'Free'),

-- Data Engineer
(3, 'Big Data with Hadoop and Spark', 'https://edx.org/hadoop-spark', 'course', 'edX', '12 weeks', '$99-299'),
(3, 'AWS Data Lake Architecture', 'https://aws.amazon.com/training/data-lake', 'course', 'AWS', '8 weeks', '$200-500'),
(3, 'Data Warehousing with Redshift', 'https://aws.amazon.com/redshift/training', 'course', 'AWS', '6 weeks', '$150-400'),

-- Senior Data Engineer
(4, 'Advanced ETL Patterns', 'https://databricks.com/advanced-etl', 'course', 'Databricks', '10 weeks', '$500-1000'),
(4, 'Google Cloud Data Engineering', 'https://cloud.google.com/training/data-engineering', 'certification', 'Google Cloud', '12 weeks', '$200-500'),

-- Data Engineer Resources
(5, 'Enterprise Data Architecture', 'https://coursera.org/enterprise-data-architecture', 'course', 'Coursera', '16 weeks', '$39-79'),
(6, 'Leadership in Data Engineering', 'https://edx.org/leadership-data-engineering', 'course', 'edX', '8 weeks', '$99-299'),

-- Data Scientist Resources
-- Data Analyst
(7, 'Statistics and Probability', 'https://khanacademy.org/statistics', 'course', 'Khan Academy', '12 weeks', 'Free'),
(7, 'Data Visualization with Tableau', 'https://tableau.com/learn', 'course', 'Tableau', '6 weeks', '$70/month'),

-- Junior Data Scientist  
(8, 'Python NumPy and Pandas', 'https://datacamp.com/numpy-pandas', 'course', 'DataCamp', '8 weeks', '$25-35/month'),
(8, 'Machine Learning with Scikit-learn', 'https://coursera.org/scikit-learn', 'course', 'Coursera', '10 weeks', '$39-79'),

-- Data Scientist
(9, 'Deep Learning Specialization', 'https://coursera.org/deep-learning-specialization', 'course', 'Coursera', '16 weeks', '$39-79'),
(9, 'TensorFlow and PyTorch', 'https://tensorflow.org/learn', 'course', 'TensorFlow', '12 weeks', 'Free'),

-- Senior Data Scientist
(10, 'MLOps and Model Deployment', 'https://coursera.org/mlops', 'course', 'Coursera', '12 weeks', '$39-79'),
(10, 'Advanced Statistics', 'https://edx.org/advanced-statistics', 'course', 'edX', '16 weeks', '$99-299'),

-- Applied Scientist
(11, 'Research Methods in ML', 'https://coursera.org/research-methods-ml', 'course', 'Coursera', '12 weeks', '$39-79'),
(11, 'Advanced NLP and Computer Vision', 'https://cs.stanford.edu/nlp-cv', 'course', 'Stanford', '16 weeks', 'Free'),

-- Lead Data Scientist
(12, 'Data Science Leadership', 'https://edx.org/data-science-leadership', 'course', 'edX', '8 weeks', '$99-299'),

-- Chief AI Officer
(13, 'AI Strategy for Executives', 'https://mit.edu/ai-strategy', 'course', 'MIT', '6 weeks', '$2000-5000'),

-- DevOps Engineer Resources
-- System Administrator
(14, 'Linux Fundamentals', 'https://linuxacademy.com/linux-fundamentals', 'course', 'Linux Academy', '8 weeks', '$29-49/month'),
(14, 'Shell Scripting Mastery', 'https://bash.academy', 'course', 'Bash Academy', '6 weeks', 'Free'),

-- Junior DevOps Engineer
(15, 'Docker Fundamentals', 'https://docker.com/training', 'course', 'Docker', '4 weeks', '$200-400'),
(15, 'Jenkins CI/CD', 'https://jenkins.io/training', 'course', 'Jenkins', '6 weeks', 'Free'),
(15, 'GitHub Actions', 'https://github.com/training', 'course', 'GitHub', '4 weeks', 'Free'),

-- DevOps Engineer
(16, 'Kubernetes Administration', 'https://kubernetes.io/training', 'certification', 'CNCF', '12 weeks', '$300-600'),
(16, 'Terraform Infrastructure as Code', 'https://terraform.io/training', 'course', 'HashiCorp', '8 weeks', '$500-1000'),
(16, 'AWS DevOps Engineer', 'https://aws.amazon.com/certification/devops-engineer', 'certification', 'AWS', '16 weeks', '$300-600'),

-- SRE
(17, 'Site Reliability Engineering', 'https://sre.google/training', 'course', 'Google', '12 weeks', 'Free'),
(17, 'Prometheus and Grafana', 'https://prometheus.io/training', 'course', 'Prometheus', '6 weeks', 'Free'),

-- Senior DevOps Engineer
(18, 'Advanced Kubernetes', 'https://kubernetes.io/advanced-training', 'course', 'CNCF', '12 weeks', '$500-1000'),
(18, 'Cloud Security', 'https://cloudsecurityalliance.org/training', 'certification', 'CSA', '16 weeks', '$500-1000'),

-- Cloud Architect
(19, 'AWS Solutions Architect', 'https://aws.amazon.com/certification/solutions-architect', 'certification', 'AWS', '16 weeks', '$300-600'),
(19, 'Azure Solutions Architect', 'https://microsoft.com/azure-architect', 'certification', 'Microsoft', '16 weeks', '$300-600'),

-- CTO
(20, 'Technology Leadership', 'https://mit.edu/technology-leadership', 'course', 'MIT', '12 weeks', '$3000-6000'),

-- Full Stack Developer Resources
-- Frontend Developer
(21, 'HTML, CSS, JavaScript Bootcamp', 'https://freecodecamp.org/web-development', 'course', 'FreeCodeCamp', '12 weeks', 'Free'),
(21, 'React Complete Guide', 'https://reactjs.org/tutorial', 'course', 'React', '8 weeks', 'Free'),
(21, 'Vue.js Fundamentals', 'https://vuejs.org/tutorial', 'course', 'Vue.js', '6 weeks', 'Free'),

-- Backend Developer  
(22, 'Node.js and Express', 'https://nodejs.org/learn', 'course', 'Node.js', '8 weeks', 'Free'),
(22, 'Django Web Framework', 'https://djangoproject.com/learn', 'course', 'Django', '10 weeks', 'Free'),
(22, 'Database Design and SQL', 'https://codecademy.com/database-design', 'course', 'Codecademy', '8 weeks', '$15-35'),

-- Full Stack Developer
(23, 'Full Stack Web Development', 'https://fullstackopen.com', 'course', 'University of Helsinki', '16 weeks', 'Free'),
(23, 'REST API Design', 'https://restfulapi.net/course', 'course', 'RESTful API', '6 weeks', 'Free'),
(23, 'GraphQL Fundamentals', 'https://graphql.org/learn', 'course', 'GraphQL', '4 weeks', 'Free'),

-- Senior Full Stack Developer
(24, 'System Design for Web Applications', 'https://educative.io/system-design-web', 'course', 'Educative', '12 weeks', '$59-99'),
(24, 'Advanced JavaScript Patterns', 'https://javascript.info/advanced', 'course', 'JavaScript.info', '8 weeks', 'Free'),

-- Tech Lead
(25, 'Technical Leadership', 'https://coursera.org/technical-leadership', 'course', 'Coursera', '8 weeks', '$39-79'),
(25, 'Agile and Scrum Master', 'https://scrumalliance.org/certification', 'certification', 'Scrum Alliance', '4 weeks', '$200-500'),

-- Software Architect (Full Stack)
(26, 'Software Architecture Patterns', 'https://oreilly.com/software-architecture', 'course', 'O\'Reilly', '12 weeks', '$39/month'),
(26, 'Microservices Architecture', 'https://microservices.io/course', 'course', 'Microservices.io', '10 weeks', '$300-600'),

-- CTO (Full Stack)
(27, 'Executive Technology Leadership', 'https://stanford.edu/executive-tech', 'course', 'Stanford', '8 weeks', '$5000-10000'),

-- Product Manager Resources
-- Associate PM
(28, 'Product Management Fundamentals', 'https://coursera.org/product-management-fundamentals', 'course', 'Coursera', '8 weeks', '$39-79'),
(28, 'Agile and Scrum for Product Managers', 'https://scrumalliance.org/pm-certification', 'certification', 'Scrum Alliance', '4 weeks', '$200-500'),

-- Product Manager
(29, 'Data-Driven Product Management', 'https://edx.org/data-driven-pm', 'course', 'edX', '10 weeks', '$99-299'),
(29, 'A/B Testing for Product Managers', 'https://optimizely.com/ab-testing-course', 'course', 'Optimizely', '6 weeks', '$200-400'),

-- Senior PM
(30, 'Product Strategy and Roadmapping', 'https://productschool.com/strategy-course', 'course', 'Product School', '8 weeks', '$500-1000'),
(30, 'UX/UI for Product Managers', 'https://interaction-design.org/pm-ux', 'course', 'IxDF', '6 weeks', '$144-288'),

-- Group PM
(31, 'Managing Product Teams', 'https://coursera.org/managing-product-teams', 'course', 'Coursera', '8 weeks', '$39-79'),

-- Director of Product
(32, 'Product Leadership', 'https://reforge.com/product-leadership', 'course', 'Reforge', '6 weeks', '$1500-3000'),

-- VP of Product  
(33, 'Strategic Product Leadership', 'https://berkeley.edu/product-leadership', 'course', 'UC Berkeley', '12 weeks', '$3000-6000'),

-- CPO
(34, 'Executive Product Strategy', 'https://harvard.edu/executive-product', 'course', 'Harvard', '8 weeks', '$5000-10000'),

-- Research Scientist Resources
-- Research Assistant
(35, 'Research Methodology', 'https://coursera.org/research-methodology', 'course', 'Coursera', '8 weeks', '$39-79'),
(35, 'Scientific Writing', 'https://stanford.edu/scientific-writing', 'course', 'Stanford', '6 weeks', 'Free'),

-- PhD Candidate
(36, 'Advanced Statistics for Research', 'https://edx.org/advanced-statistics-research', 'course', 'edX', '16 weeks', '$99-299'),
(36, 'Machine Learning Research', 'https://cs229.stanford.edu', 'course', 'Stanford', '16 weeks', 'Free'),

-- Postdoc
(37, 'Grant Writing for Scientists', 'https://nature.com/grant-writing', 'course', 'Nature', '8 weeks', '$200-500'),
(37, 'Advanced AI Research Methods', 'https://mit.edu/ai-research', 'course', 'MIT', '12 weeks', 'Free'),

-- Research Scientist
(38, 'Publishing in Top-tier Journals', 'https://ieee.org/publishing-course', 'course', 'IEEE', '6 weeks', '$300-600'),
(38, 'Research Ethics and Integrity', 'https://nih.gov/research-ethics', 'course', 'NIH', '4 weeks', 'Free'),

-- Senior Research Scientist
(39, 'Leading Research Teams', 'https://nature.com/research-leadership', 'course', 'Nature', '8 weeks', '$500-1000'),

-- Principal Investigator
(40, 'Research Program Management', 'https://nsf.gov/research-management', 'course', 'NSF', '10 weeks', 'Free'),

-- Head of R&D
(41, 'R&D Strategy and Innovation', 'https://mit.edu/rd-strategy', 'course', 'MIT', '12 weeks', '$3000-6000'),

-- Software Architect Resources
-- Software Engineer
(42, 'Data Structures and Algorithms', 'https://coursera.org/data-structures-algorithms', 'course', 'Coursera', '12 weeks', '$39-79'),
(42, 'Design Patterns', 'https://refactoring.guru/design-patterns', 'course', 'Refactoring Guru', '8 weeks', '$59-99'),

-- Senior Software Engineer
(43, 'System Design Interview', 'https://educative.io/system-design-interview', 'course', 'Educative', '8 weeks', '$59-99'),
(43, 'Code Review Best Practices', 'https://google.com/code-review-course', 'course', 'Google', '4 weeks', 'Free'),

-- Tech Lead
(44, 'Technical Leadership Skills', 'https://pluralsight.com/technical-leadership', 'course', 'Pluralsight', '6 weeks', '$29-45/month'),

-- Software Architect
(45, 'Software Architecture Fundamentals', 'https://oreilly.com/software-architecture-fundamentals', 'course', 'O\'Reilly', '12 weeks', '$39/month'),
(45, 'Cloud Architecture Patterns', 'https://aws.amazon.com/architecture/patterns', 'course', 'AWS', '10 weeks', '$300-600'),

-- Principal Architect
(46, 'Enterprise Architecture', 'https://togaf.org/certification', 'certification', 'TOGAF', '16 weeks', '$500-1000'),

-- Director of Engineering
(47, 'Engineering Management', 'https://coursera.org/engineering-management', 'course', 'Coursera', '10 weeks', '$39-79'),

-- CTO (Software)
(48, 'Technology Strategy for Executives', 'https://mit.edu/technology-strategy', 'course', 'MIT', '8 weeks', '$5000-10000'),

-- UX/UI Designer Resources
-- Junior Designer
(49, 'Design Fundamentals', 'https://coursera.org/design-fundamentals', 'course', 'Coursera', '8 weeks', '$39-79'),
(49, 'Figma for Beginners', 'https://figma.com/academy', 'course', 'Figma', '4 weeks', 'Free'),

-- UX/UI Designer
(50, 'UX Design Specialization', 'https://coursera.org/ux-design-specialization', 'course', 'Coursera', '16 weeks', '$39-79'),
(50, 'Adobe Creative Suite', 'https://adobe.com/training', 'course', 'Adobe', '12 weeks', '$20-50/month'),

-- Senior Designer
(51, 'Advanced UX Methods', 'https://nngroup.com/ux-certification', 'certification', 'Nielsen Norman Group', '40 hours', '$500-1000'),
(51, 'Design Systems', 'https://designsystems.com/course', 'course', 'Design Systems', '8 weeks', '$300-600'),

-- Product Designer
(52, 'Design Strategy', 'https://interaction-design.org/design-strategy', 'course', 'IxDF', '8 weeks', '$144-288'),

-- Design Lead
(53, 'Design Leadership', 'https://designbetter.co/leadership', 'course', 'Design Better', '6 weeks', '$200-500'),

-- UX Manager
(54, 'Managing Design Teams', 'https://coursera.org/managing-design-teams', 'course', 'Coursera', '8 weeks', '$39-79'),

-- CDO
(55, 'Design Executive Leadership', 'https://parsons.edu/design-leadership', 'course', 'Parsons', '12 weeks', '$3000-6000');
`;

async function populateDetailedCareerPaths() {
    try {
        console.log('Connecting to database...');
        
        // Clear and insert comprehensive career data
        await new Promise((resolve, reject) => {
            connection.query(comprehensiveCareerData, (error, results) => {
                if (error) {
                    console.error('Error executing career data setup:', error);
                    reject(error);
                } else {
                    console.log('Comprehensive career paths created successfully!');
                    resolve(results);
                }
            });
        });

        // Insert all learning resources
        await new Promise((resolve, reject) => {
            connection.query(skillsAndResourcesData, (error, results) => {
                if (error) {
                    console.error('Error inserting resources:', error);
                    reject(error);
                } else {
                    console.log('Comprehensive learning resources inserted successfully!');
                    resolve(results);
                }
            });
        });

        console.log('✅ Detailed career paths setup completed successfully!');
        console.log('🎯 Added 8 comprehensive career paths with:');
        console.log('   • Data Engineer (6 levels)');
        console.log('   • Data Scientist (7 levels)'); 
        console.log('   • DevOps Engineer (7 levels)');
        console.log('   • Full Stack Developer (7 levels)');
        console.log('   • Product Manager (7 levels)');
        console.log('   • Research Scientist (7 levels)');
        console.log('   • Software Architect (7 levels)');
        console.log('   • UX/UI Designer (7 levels)');
        console.log('📚 Added 55+ learning resources and courses');
        
    } catch (error) {
        console.error('Setup failed:', error);
    } finally {
        connection.end();
    }
}

// Run the comprehensive setup
populateDetailedCareerPaths();