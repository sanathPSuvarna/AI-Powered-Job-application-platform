// pages/jobseeker/CareerPathSimulator.jsx
import React, { useState, useEffect } from 'react';
import { careerPathApi } from '../../services/api';
import './CareerPathSimulator.css';

const CareerPathSimulator = () => {
    const [careerGoals, setCareerGoals] = useState([]);
    const [selectedGoal, setSelectedGoal] = useState('');
    const [simulation, setSimulation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userGoals, setUserGoals] = useState([]);
    const [resourceFilter, setResourceFilter] = useState('all');
    const [expandedSteps, setExpandedSteps] = useState(new Set());
    
    // New state for skills input
    const [currentSkills, setCurrentSkills] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('entry');
    const [useProfileSkills, setUseProfileSkills] = useState(true);

    useEffect(() => {
        fetchCareerGoals();
        fetchUserCareerGoals();
    }, []);

    const fetchCareerGoals = async () => {
        try {
            const response = await careerPathApi.getCareerGoals();
            if (response.data.success) {
                setCareerGoals(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching career goals:', error);
            setError('Failed to load career goals');
        }
    };

    const fetchUserCareerGoals = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await careerPathApi.getUserCareerGoals();
                if (response.data.success) {
                    setUserGoals(response.data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching user career goals:', error);
        }
    };

    const handleSimulation = async () => {
        if (!selectedGoal) {
            setError('Please select a career goal');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = { goalId: selectedGoal };
            
            // If user chose to input skills manually or not logged in
            if (!useProfileSkills || !localStorage.getItem('token')) {
                const skillsArray = currentSkills
                    .split(',')
                    .map(skill => skill.trim())
                    .filter(skill => skill.length > 0);
                
                payload.currentSkills = skillsArray;
                payload.experienceLevel = experienceLevel;
            }

            const response = await careerPathApi.simulateCareerPath(payload);
            if (response.data.success) {
                setSimulation(response.data.data);
            }
        } catch (error) {
            console.error('Error simulating career path:', error);
            setError('Failed to simulate career path. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGoal = async () => {
        if (!selectedGoal) {
            setError('Please select a career goal');
            return;
        }

        try {
            const response = await careerPathApi.saveCareerGoal({ 
                goalId: selectedGoal,
                targetCompletionDate: null 
            });
            if (response.data.success) {
                alert('Career goal saved successfully!');
                fetchUserCareerGoals();
            }
        } catch (error) {
            console.error('Error saving career goal:', error);
            setError('Failed to save career goal');
        }
    };

    const getStatusColor = (percentage) => {
        if (percentage >= 80) return 'status-excellent';
        if (percentage >= 60) return 'status-good';
        if (percentage >= 40) return 'status-fair';
        return 'status-poor';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filterResources = (resources) => {
        if (resourceFilter === 'all') return resources;
        return resources.filter(resource => resource.resource_type === resourceFilter);
    };

    const toggleStepExpansion = (stepId) => {
        const newExpanded = new Set(expandedSteps);
        if (newExpanded.has(stepId)) {
            newExpanded.delete(stepId);
        } else {
            newExpanded.add(stepId);
        }
        setExpandedSteps(newExpanded);
    };

    const getResourceTypeIcon = (type) => {
        const icons = {
            course: '',
            
        };
        return icons[type] || '📝';
    };

    return (
        <div className="career-simulator-container">
            <h2>Career Path Simulator</h2>
            <p className="simulator-description">
                Discover your personalized roadmap to career success with AI-driven insights, 
                skill gap analysis, and step-by-step guidance.
            </p>

            {error && <div className="error-message">{error}</div>}

            {/* Career Goal Selection */}
            <div className="goal-selection-section">
                <h3>Select Your Career Goal</h3>
                <div className="goal-selection">
                    <select 
                        value={selectedGoal} 
                        onChange={(e) => setSelectedGoal(e.target.value)}
                        className="goal-select"
                    >
                        <option value="">-- Choose a Career Goal --</option>
                        {careerGoals.map(goal => (
                            <option key={goal.goal_id} value={goal.goal_id}>
                                {goal.title} - {goal.industry}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Skills Input Section */}
            <div className="skills-input-section">
                <h3>Your Current Skills</h3>
                <div className="skills-input-options">
                    {localStorage.getItem('token') && (
                        <label className="skills-option">
                            <input
                                type="radio"
                                name="skillsSource"
                                checked={useProfileSkills}
                                onChange={() => setUseProfileSkills(true)}
                            />
                            Use skills from my profile
                        </label>
                    )}
                    <label className="skills-option">
                        <input
                            type="radio"
                            name="skillsSource"
                            checked={!useProfileSkills}
                            onChange={() => setUseProfileSkills(false)}
                        />
                        Enter my skills manually
                    </label>
                </div>

                {!useProfileSkills && (
                    <div className="manual-skills-input">
                        <div className="input-group">
                            <label htmlFor="currentSkills">Enter your current skills (comma-separated):</label>
                            <textarea
                                id="currentSkills"
                                value={currentSkills}
                                onChange={(e) => setCurrentSkills(e.target.value)}
                                placeholder="e.g., Python, JavaScript, SQL, React, Node.js, Machine Learning"
                                className="skills-textarea"
                                rows="3"
                            />
                            <small className="input-help">
                                List your current skills separated by commas. Be specific (e.g., "Python" instead of "Programming").
                            </small>
                        </div>
                        
                        <div className="input-group">
                            <label htmlFor="experienceLevel">Your experience level:</label>
                            <select
                                id="experienceLevel"
                                value={experienceLevel}
                                onChange={(e) => setExperienceLevel(e.target.value)}
                                className="experience-select"
                            >
                                <option value="entry">Entry Level (0-2 years)</option>
                                <option value="mid">Mid Level (3-5 years)</option>
                                <option value="senior">Senior Level (5+ years)</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Simulation Action */}
            <div className="simulation-actions">
                <div className="goal-actions">
                    <button 
                        onClick={handleSimulation}
                        disabled={loading || !selectedGoal}
                        className="btn-primary simulate-btn"
                    >
                        {loading ? 'Simulating...' : 'Simulate Career Path'}
                    </button>
                    <button 
                        onClick={handleSaveGoal}
                        disabled={!selectedGoal}
                        className="btn-secondary save-goal-btn"
                    >
                        Save as My Goal
                    </button>
                </div>
            </div>

            {/* User's Saved Goals */}
            {userGoals.length > 0 && (
                <div className="saved-goals-section">
                    <h3>Your Active Career Goals</h3>
                    <div className="saved-goals-list">
                        {userGoals.map(goal => (
                            <div key={goal.id} className="saved-goal-card">
                                <h4>{goal.title}</h4>
                                <p>{goal.description}</p>
                                <small>Started: {formatDate(goal.started_at)}</small>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Simulation Results */}
            {simulation && (
                <div className="simulation-results">
                    <div className="simulation-header">
                        <h3>Your Career Path to {simulation.goal.title}</h3>
                        <div className="overall-stats">
                            <div className="stat-item">
                                <span className="stat-label">Overall Readiness:</span>
                                <span className={`stat-value ${getStatusColor(simulation.overall_readiness)}`}>
                                    {simulation.overall_readiness}%
                                </span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Estimated Duration:</span>
                                <span className="stat-value">
                                    {simulation.total_estimated_duration} months
                                </span>
                            </div>
                        </div>
                    </div>
{/* 
                    Resource Filter Controls
                    <div className="resource-filter-section">
                        <h4>Filter Learning Resources:</h4>
                        <div className="filter-buttons">
                            <button 
                                className={`filter-btn ${resourceFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setResourceFilter('all')}
                            >
                                All Resources
                            </button>
                            <button 
                                className={`filter-btn ${resourceFilter === 'course' ? 'active' : ''}`}
                                onClick={() => setResourceFilter('course')}
                            >
                                📚 Courses
                            </button>
                            <button 
                                className={`filter-btn ${resourceFilter === 'project' ? 'active' : ''}`}
                                onClick={() => setResourceFilter('project')}
                            >
                                💼 Projects
                            </button>
                            <button 
                                className={`filter-btn ${resourceFilter === 'certification' ? 'active' : ''}`}
                                onClick={() => setResourceFilter('certification')}
                            >
                                🏆 Certifications
                            </button>
                            <button 
                                className={`filter-btn ${resourceFilter === 'practice' ? 'active' : ''}`}
                                onClick={() => setResourceFilter('practice')}
                            >
                                ⚡ Practice
                            </button>
                        </div>
                    </div> */}

                    {/* Current Skills Overview */}
                    <div className="current-skills-section">
                        <h4>Your Current Skills ({simulation.user_skills.length})</h4>
                        <div className="skills-list">
                            {simulation.user_skills.map(skill => (
                                <span key={skill.skill_id} className="skill-tag current-skill">
                                    {skill.skill_name} ({skill.proficiency_level})
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Career Roadmap */}
                    <div className="career-roadmap">
                        <h4>Your Personalized Roadmap</h4>
                        <div className="roadmap-timeline">
                        {simulation.roadmap.map((item, index) => (
                                <div key={item.step.step_id} className={`roadmap-step ${item.analysis.is_ready ? 'step-ready' : 'step-not-ready'}`}>
                                    <div className="step-number">{index + 1}</div>
                                    <div className="step-content">
                                        <div className="step-header">
                                            <h5>{item.step.step_title}</h5>
                                            <div className="step-stats">
                                                <span className={`completion-badge ${getStatusColor(item.analysis.completion_percentage)}`}>
                                                    {item.analysis.completion_percentage}% Ready
                                                </span>
                                                {item.analysis.is_ready && <span className="ready-badge">READY</span>}
                                            </div>
                                        </div>
                                        
                                        <p className="step-description">{item.step.step_description}</p>
                                        
                                        {/* Progress Bar */}
                                        <div className="step-progress-bar">
                                            <div className={`step-progress-fill progress-${Math.round(item.analysis.completion_percentage/25)*25}`}></div>
                                        </div>
                                        
                                        <div className="step-details">
                                            <div className="timeline-info">
                                                <small>
                                                    <strong>Duration:</strong> {item.step.estimated_duration_months} months | 
                                                    <strong> Experience Required:</strong> {item.step.required_experience_years} years
                                                </small>
                                            </div>
                                        </div>

                                        {/* Skills Analysis */}
                                        <div className="skills-analysis">
                                            {item.analysis.matched_skills.length > 0 && (
                                                <div className="matched-skills">
                                                    <h6>Skills You Have ({item.analysis.matched_skills.length})</h6>
                                                    <div className="skills-list">
                                                        {item.analysis.matched_skills.map(skill => (
                                                            <span key={skill.skill_id} className="skill-tag matched-skill">
                                                                {skill.skill_name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {item.analysis.missing_skills.length > 0 && (
                                                <div className="missing-skills">
                                                    <h6>Skills to Learn ({item.analysis.missing_skills.length})</h6>
                                                    <div className="skills-list">
                                                        {item.analysis.missing_skills.map(skill => (
                                                            <span key={skill.skill_id} className="skill-tag missing-skill">
                                                                {skill.skill_name} ({skill.importance_level})
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {item.analysis.optional_skills.length > 0 && (
                                                <div className="optional-skills">
                                                    <h6>Optional Skills ({item.analysis.optional_skills.length})</h6>
                                                    <div className="skills-list">
                                                        {item.analysis.optional_skills.map(skill => (
                                                            <span key={skill.skill_id} className="skill-tag optional-skill">
                                                                {skill.skill_name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Learning Resources */}
                                        {item.resources && item.resources.length > 0 && (
                                            <div className="learning-resources">
                                                <div className="resources-header">
                                                    <h6>Recommended Learning Resources ({filterResources(item.resources).length})</h6>
                                                    <button 
                                                        className="expand-btn"
                                                        onClick={() => toggleStepExpansion(item.step.step_id)}
                                                    >
                                                        {expandedSteps.has(item.step.step_id) ? 'Show Less' : 'Show All'}
                                                    </button>
                                                </div>
                                                <div className="resources-list">
                                                    {filterResources(item.resources)
                                                        .slice(0, expandedSteps.has(item.step.step_id) ? undefined : 3)
                                                        .map(resource => (
                                                        <div key={resource.id} className="resource-item">
                                                            <div className="resource-header">
                                                                <span className={`resource-type ${resource.resource_type}`}>
                                                                    {getResourceTypeIcon(resource.resource_type)} {resource.resource_type}
                                                                </span>
                                                                <a 
                                                                    href={resource.resource_url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="resource-link"
                                                                >
                                                                    {resource.resource_title}
                                                                </a>
                                                            </div>
                                                            <div className="resource-meta">
                                                                {resource.provider && (
                                                                    <span className="resource-provider">
                                                                        👨‍🏫 {resource.provider}
                                                                    </span>
                                                                )}
                                                                {resource.estimated_duration && (
                                                                    <span className="resource-duration">
                                                                        ⏱️ {resource.estimated_duration}
                                                                    </span>
                                                                )}
                                                                {resource.cost_range && (
                                                                    <span className="resource-cost">
                                                                        💰 {resource.cost_range}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {filterResources(item.resources).length > 3 && !expandedSteps.has(item.step.step_id) && (
                                                        <div className="resource-show-more">
                                                            <small>+{filterResources(item.resources).length - 3} more resources...</small>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Items */}
                    <div className="action-items">
                        <h4>Next Steps</h4>
                        <div className="next-steps">
                            {simulation.roadmap
                                .filter(item => !item.analysis.is_ready)
                                .slice(0, 1)
                                .map(item => (
                                    <div key={item.step.step_id} className="next-step-card">
                                        <h5>Focus on: {item.step.step_title}</h5>
                                        <p>Priority skills to learn:</p>
                                        <ul>
                                            {item.analysis.missing_skills.slice(0, 3).map(skill => (
                                                <li key={skill.skill_id}>{skill.skill_name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CareerPathSimulator;
