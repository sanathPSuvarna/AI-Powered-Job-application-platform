-- Enhanced Skill Extraction System Database Schema
-- Optional tables for storing A/B testing and feedback data

-- Table for storing ensemble system feedback
CREATE TABLE IF NOT EXISTS ensemble_feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    test_id VARCHAR(255),
    correct_skills JSON,
    missed_skills JSON,
    incorrect_skills JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_test_id (test_id),
    INDEX idx_created_at (created_at)
);

-- Table for storing A/B test results and metrics
CREATE TABLE IF NOT EXISTS ab_test_metrics (
    metric_id INT AUTO_INCREMENT PRIMARY KEY,
    test_id VARCHAR(255) NOT NULL,
    variant_name VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,4),
    user_id INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_test_variant (test_id, variant_name),
    INDEX idx_metric_name (metric_name),
    INDEX idx_recorded_at (recorded_at)
);

-- Table for tracking extraction performance over time
CREATE TABLE IF NOT EXISTS extraction_performance (
    performance_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    extraction_method VARCHAR(50) NOT NULL,
    skills_extracted INT DEFAULT 0,
    avg_confidence DECIMAL(4,3),
    extraction_time_ms INT,
    success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_method (user_id, extraction_method),
    INDEX idx_created_at (created_at)
);

-- Add confidence_score column to skills table if it doesn't exist
ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(4,3) DEFAULT 0.8,
ADD COLUMN IF NOT EXISTS created_by_user_id INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS extraction_method VARCHAR(50) DEFAULT 'manual';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_skills_confidence ON skills(confidence_score);
CREATE INDEX IF NOT EXISTS idx_skills_created_by ON skills(created_by_user_id);

-- View for analyzing feedback trends
CREATE OR REPLACE VIEW feedback_analytics AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_feedback,
    AVG(JSON_LENGTH(correct_skills)) as avg_correct_skills,
    AVG(JSON_LENGTH(missed_skills)) as avg_missed_skills,
    AVG(JSON_LENGTH(incorrect_skills)) as avg_incorrect_skills
FROM ensemble_feedback
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View for A/B test performance comparison
CREATE OR REPLACE VIEW ab_test_summary AS
SELECT 
    test_id,
    variant_name,
    COUNT(*) as sample_size,
    AVG(CASE WHEN metric_name = 'precision' THEN metric_value END) as avg_precision,
    AVG(CASE WHEN metric_name = 'recall' THEN metric_value END) as avg_recall,
    AVG(CASE WHEN metric_name = 'f1_score' THEN metric_value END) as avg_f1_score,
    AVG(CASE WHEN metric_name = 'skills_extracted' THEN metric_value END) as avg_skills_extracted
FROM ab_test_metrics
GROUP BY test_id, variant_name;

-- Insert sample configuration data for ensemble weights
INSERT IGNORE INTO skills (skill_name, category, confidence_score, created_by_user_id, extraction_method) VALUES
('ensemble_configuration', 'system', 1.0, 1, 'system'),
('baseline_weights', 'system', 1.0, 1, 'system'),
('optimized_weights', 'system', 1.0, 1, 'system');

COMMIT;