-- Career Path Simulator Database Schema

-- Table to store available career goals/paths
CREATE TABLE career_goals (
    goal_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    average_salary_range VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store career path steps for each goal
CREATE TABLE career_path_steps (
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
CREATE TABLE career_step_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    step_id INT NOT NULL,
    skill_id INT NOT NULL,
    importance_level ENUM('required', 'preferred', 'optional') DEFAULT 'required',
    FOREIGN KEY (step_id) REFERENCES career_path_steps(step_id),
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
);

-- Table to store user's career goals and progress
CREATE TABLE user_career_goals (
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
CREATE TABLE career_step_resources (
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
INSERT INTO career_goals (title, description, industry, average_salary_range) VALUES
('Data Scientist', 'Analyze and interpret complex data to help organizations make decisions', 'Technology', '$70,000 - $150,000'),
('Full Stack Developer', 'Develop both front-end and back-end of web applications', 'Technology', '$60,000 - $130,000'),
('Product Manager', 'Guide the development of products from conception to launch', 'Technology/Business', '$80,000 - $160,000'),
('UX/UI Designer', 'Design user interfaces and experiences for digital products', 'Design/Technology', '$55,000 - $120,000'),
('DevOps Engineer', 'Manage development operations and infrastructure automation', 'Technology', '$70,000 - $140,000'),
('Research Scientist', 'Conduct research and publish findings in academic or industrial settings', 'Research/Academia', '$65,000 - $130,000'),
('Software Architect', 'Design high-level software solutions and system architecture', 'Technology', '$90,000 - $180,000'),
('Data Engineer', 'Build and maintain data pipelines and infrastructure', 'Technology', '$75,000 - $145,000');

-- Insert sample career path steps for Data Scientist
INSERT INTO career_path_steps (goal_id, step_order, step_title, step_description, required_experience_years, estimated_duration_months) VALUES
(1, 1, 'Junior Data Analyst', 'Entry-level position analyzing data and creating basic reports', 0, 12),
(1, 2, 'Data Analyst', 'Intermediate role with advanced analytics and visualization skills', 1, 18),
(1, 3, 'Senior Data Analyst', 'Lead analytics projects and mentor junior team members', 3, 24),
(1, 4, 'Data Scientist', 'Apply machine learning and advanced statistical methods', 5, 0);

-- Insert sample career path steps for Full Stack Developer
INSERT INTO career_path_steps (goal_id, step_order, step_title, step_description, required_experience_years, estimated_duration_months) VALUES
(2, 1, 'Frontend Developer', 'Develop user interfaces using HTML, CSS, JavaScript, and frameworks', 0, 12),
(2, 2, 'Backend Developer', 'Build server-side applications and APIs', 1, 18),
(2, 3, 'Full Stack Developer', 'Develop complete web applications from front to back', 2, 0);
