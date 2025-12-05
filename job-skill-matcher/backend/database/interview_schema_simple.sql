-- database/interview_schema_simple.sql
-- Simplified Database schema for Adaptive Mock Interview Game (without foreign keys)

-- Interview Scenarios (templates for different roles/industries)
CREATE TABLE IF NOT EXISTS interview_scenarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(100) NOT NULL,
    seniority_level ENUM('intern', 'junior', 'mid', 'senior', 'lead', 'manager') NOT NULL,
    domain VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    question_templates JSON,
    branching_rules JSON,
    difficulty_progression JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_seniority (seniority_level),
    INDEX idx_active (is_active)
);

-- Interview Sessions (user practice sessions)
CREATE TABLE IF NOT EXISTS interview_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    scenario_id INT,
    session_type ENUM('practice', 'phone_screen', 'onsite', 'behavioral_only', 'technical_only') NOT NULL,
    difficulty_level ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'easy',
    role VARCHAR(100) NOT NULL,
    seniority_level VARCHAR(50),
    status ENUM('active', 'completed', 'paused', 'abandoned') NOT NULL DEFAULT 'active',
    current_question_index INT DEFAULT 0,
    total_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    INDEX idx_user_sessions (user_id),
    INDEX idx_session_status (status),
    INDEX idx_session_created (created_at)
);

-- Interview Questions (generated for each session)
CREATE TABLE IF NOT EXISTS interview_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('behavioral', 'technical', 'case_study', 'situational') NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
    expected_answer_time INT NOT NULL, -- in seconds
    branch_context JSON, -- context for branching logic
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_questions (session_id),
    INDEX idx_question_order (session_id, order_index)
);

-- Interview Answers (user responses with scoring)
CREATE TABLE IF NOT EXISTS interview_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    session_id INT NOT NULL,
    answer_text TEXT NOT NULL,
    answer_time INT NOT NULL, -- time taken to answer in seconds
    score DECIMAL(5,2) NOT NULL,
    relevance_score DECIMAL(5,2) DEFAULT 0,
    structure_score DECIMAL(5,2) DEFAULT 0,
    evidence_score DECIMAL(5,2) DEFAULT 0,
    technical_score DECIMAL(5,2) DEFAULT 0,
    communication_score DECIMAL(5,2) DEFAULT 0,
    feedback TEXT,
    micro_tasks JSON, -- suggested improvements
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_answers (session_id),
    INDEX idx_answer_scores (score)
);

-- User Progress Tracking
CREATE TABLE IF NOT EXISTS interview_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_area VARCHAR(100) NOT NULL,
    current_level ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
    sessions_completed INT DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    improvement_rate DECIMAL(5,2) DEFAULT 0,
    last_session_date TIMESTAMP NULL,
    target_score DECIMAL(5,2) DEFAULT 80,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_skill (user_id, skill_area),
    INDEX idx_user_progress (user_id)
);

-- Achievement System
CREATE TABLE IF NOT EXISTS interview_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_type VARCHAR(100) NOT NULL,
    achievement_name VARCHAR(200) NOT NULL,
    description TEXT,
    points_awarded INT DEFAULT 0,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id INT,
    INDEX idx_user_achievements (user_id),
    INDEX idx_achievement_type (achievement_type)
);

-- Insert sample scenarios for freshers
INSERT INTO interview_scenarios (role, seniority_level, domain, title, description, question_templates, branching_rules, difficulty_progression) VALUES
('Software Engineer', 'junior', 'Technology', 'Junior Software Engineer Interview', 
 'Practice interview for entry-level software engineering positions focusing on basic programming concepts and problem-solving.',
 '[]', '{}', '["easy", "medium"]'),

('Software Engineer', 'mid', 'Technology', 'Mid-Level Software Engineer Interview',
 'Practice interview for experienced software engineers with focus on system design and architecture.',
 '[]', '{}', '["medium", "hard"]'),

('Data Scientist', 'junior', 'Technology', 'Junior Data Scientist Interview',
 'Practice interview for entry-level data science roles covering statistics, ML basics, and data analysis.',
 '[]', '{}', '["easy", "medium"]'),

('Product Manager', 'mid', 'Business', 'Product Manager Interview',
 'Practice interview for product management roles focusing on strategy, user research, and prioritization.',
 '[]', '{}', '["medium", "hard"]'),

('Frontend Developer', 'junior', 'Technology', 'Frontend Developer Interview',
 'Practice interview for frontend development positions covering HTML, CSS, JavaScript, and frameworks.',
 '[]', '{}', '["easy", "medium"]'),

('Backend Developer', 'mid', 'Technology', 'Backend Developer Interview',
 'Practice interview for backend development roles focusing on APIs, databases, and server architecture.',
 '[]', '{}', '["medium", "hard"]'),

('DevOps Engineer', 'mid', 'Technology', 'DevOps Engineer Interview',
 'Practice interview for DevOps roles covering CI/CD, cloud platforms, and infrastructure automation.',
 '[]', '{}', '["medium", "hard"]'),

('UX Designer', 'junior', 'Design', 'UX Designer Interview',
 'Practice interview for UX design positions focusing on design process, user research, and portfolio presentation.',
 '[]', '{}', '["easy", "medium"]'),

('Marketing Manager', 'mid', 'Business', 'Marketing Manager Interview',
 'Practice interview for marketing roles covering strategy, campaign management, and analytics.',
 '[]', '{}', '["medium", "hard"]'),

('Sales Representative', 'junior', 'Business', 'Sales Representative Interview',
 'Practice interview for sales positions focusing on communication, persuasion, and customer relationship management.',
 '[]', '{}', '["easy", "medium"]');

-- Create indexes for better performance
CREATE INDEX idx_scenarios_role_seniority ON interview_scenarios(role, seniority_level);
CREATE INDEX idx_sessions_user_status ON interview_sessions(user_id, status);
CREATE INDEX idx_answers_session_score ON interview_answers(session_id, score);
CREATE INDEX idx_progress_user_skill ON interview_progress(user_id, skill_area);
