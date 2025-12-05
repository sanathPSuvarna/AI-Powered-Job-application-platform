// frontend/src/pages/jobseeker/Skills.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Skills.css';

const Skills = () => {
    const [skills, setSkills] = useState([]);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [proficiencyLevel, setProficiencyLevel] = useState('beginner');
    const navigate = useNavigate();
      // New states for resume upload feature
    const [resumeFile, setResumeFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [extractedSkills, setExtractedSkills] = useState({ matchedSkills: [], unmatchedSkills: [] });
    const [selectedMatchedSkills, setSelectedMatchedSkills] = useState([]);
    const [showExtractedSkills, setShowExtractedSkills] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');
    const [isAddingToDatabase, setIsAddingToDatabase] = useState(false);

    // Function to fetch available skills from the database
    const fetchAvailableSkills = async () => {
        try {
            const availableSkillsResponse = await fetch('http://localhost:5000/api/skill', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (availableSkillsResponse.ok) {
                const availableSkillsData = await availableSkillsResponse.json();
                setAvailableSkills(availableSkillsData);
            }
        } catch (error) {
            console.error('Error fetching available skills:', error);
        }
    };

    // Fetch user's skills and available skills on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user's current skills
                const userSkillsResponse = await fetch('http://localhost:5000/api/skill/user-skills', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (userSkillsResponse.ok) {
                    const userSkillsData = await userSkillsResponse.json();
                    setSkills(userSkillsData);
                }

                // Fetch all available skills from the database
                await fetchAvailableSkills();
            } catch (error) {
                console.error('Error fetching skills:', error);
            }
        };
    

        fetchData();
    }, []);

    // Handle adding a new skill
    const handleAddSkill = async (e) => {
        e.preventDefault();
        if (!selectedSkill) {
            alert('Please select a skill');
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/api/skill/user-skills', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    skillId: selectedSkill,
                    proficiencyLevel
                })
            });

            if (response.ok) {
                // Refresh the skills list after successful addition
                console.log('Skill added successfully');
                const userSkillsResponse = await fetch('http://localhost:5000/api/skill/user-skills', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (userSkillsResponse.ok) {
                    const updatedSkills = await userSkillsResponse.json();
                    setSkills(updatedSkills);
                    //dialoge box of skill added successfully
                    alert('Skill added successfully');
                    setSelectedSkill(''); // Reset selection
                    setProficiencyLevel('beginner'); // Reset proficiency
                    
                }
            } else {
                console.error('Failed to add skill');
            }
        } catch (error) {
            console.error('Error adding skill:', error);
        }
    };

    // Handle removing a skill
    const handleRemoveSkill = async (skillId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/skill/user-skills/${skillId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setSkills(skills.filter(skill => skill.skill_id !== skillId));
            }
        } catch (error) {
            console.error('Error removing skill:', error);
        }
    };

    // Handle resume file selection
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };    // Handle resume upload and skill extraction
    const handleResumeUpload = async (e) => {
        e.preventDefault();
        if (!resumeFile) {
            setUploadError('Please select a resume file to upload');
            return;
        }

        setIsUploading(true);
        setShowExtractedSkills(false);
        setUploadError('');
        setUploadSuccess('');

        try {
            const formData = new FormData();
            formData.append('resume', resumeFile);

            const response = await fetch('http://localhost:5000/api/resume-skills/extract', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setExtractedSkills(data);
                
                if (data.matchedSkills.length > 0) {
                    setShowExtractedSkills(true);
                    
                    // Pre-select all matched skills
                    setSelectedMatchedSkills(data.matchedSkills.map(skill => skill.skill_id));
                    
                    // Enhanced success message with Large-Scale Model info
                    const modelInfo = data.modelInfo ? ` (${data.modelInfo.name} detected ${data.modelInfo.totalSkillsDetected} total skills)` : '';
                    setUploadSuccess(`Found ${data.matchedSkills.length} skills in your resume that match our database${modelInfo}.`);
                } else {
                    const modelInfo = data.modelInfo ? ` The ${data.modelInfo.name} detected ${data.modelInfo.totalSkillsDetected} skills total.` : '';
                    setUploadSuccess(`Resume analyzed successfully, but no matching skills were found in our database.${modelInfo}`);
                    if (data.unmatchedSkills.length > 0) {
                        setShowExtractedSkills(true);
                    }
                }
            } else {
                const errorData = await response.json();
                setUploadError(`Error extracting skills: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error uploading resume:', error);
            setUploadError('Error uploading resume. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };    // Handle adding extracted skills
    const handleAddExtractedSkills = async () => {
        if (selectedMatchedSkills.length === 0) {
            setUploadError('Please select at least one skill to add');
            return;
        }

        setUploadError('');
        setUploadSuccess('');
        setIsUploading(true); // Show loading state

        try {
            const response = await fetch('http://localhost:5000/api/resume-skills/add-extracted', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    skillIds: selectedMatchedSkills,
                    defaultProficiency: proficiencyLevel
                })
            });

            if (response.ok) {
                const result = await response.json();
                
                // Refresh the skills list after successful addition
                const userSkillsResponse = await fetch('http://localhost:5000/api/skill/user-skills', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (userSkillsResponse.ok) {
                    const updatedSkills = await userSkillsResponse.json();
                    setSkills(updatedSkills);
                    setUploadSuccess(`${result.addedCount} skills added successfully to your profile!`);
                    setShowExtractedSkills(false);
                    setResumeFile(null);
                    setSelectedMatchedSkills([]);
                    
                    // Clear the file input
                    const fileInput = document.getElementById('resume');
                    if (fileInput) {
                        fileInput.value = '';
                    }
                }
            } else {
                const errorData = await response.json();
                setUploadError(`Error adding skills: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error adding extracted skills:', error);
            setUploadError('Error adding skills. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    // Handle checkbox change for matched skills
    const handleSkillCheckboxChange = (skillId) => {
        setSelectedMatchedSkills(prevSelected => {
            if (prevSelected.includes(skillId)) {
                return prevSelected.filter(id => id !== skillId);
            } else {
                return [...prevSelected, skillId];
            }
        });
    };

    // Handle adding high-confidence unmatched skills to the database
    const handleAddSkillsToDatabase = async () => {
        try {
            setIsAddingToDatabase(true);
            setUploadError('');
            setUploadSuccess('');

            // Get high-confidence unmatched skills
            const highConfidenceSkills = extractedSkills.unmatchedSkills
                .filter(skillItem => {
                    const confidence = typeof skillItem === 'object' ? skillItem.confidence : 1.0;
                    return confidence >= 0.7;
                })
                .map(skillItem => ({
                    skill: typeof skillItem === 'string' ? skillItem : skillItem.skill,
                    category: typeof skillItem === 'object' ? skillItem.category : 'other',
                    confidence: typeof skillItem === 'object' ? skillItem.confidence : 1.0
                }));

            if (highConfidenceSkills.length === 0) {
                setUploadError('No high-confidence skills available to add to database.');
                return;
            }

            console.log(`Adding ${highConfidenceSkills.length} skills to database:`, highConfidenceSkills);

            const response = await fetch('http://localhost:5000/api/resume-skills/add-to-database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ skills: highConfidenceSkills })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Database addition result:', result);
                
                const { summary } = result;
                setUploadSuccess(
                    `Successfully added ${summary.added} skills to our database! ` +
                    `${summary.skipped > 0 ? `(${summary.skipped} were skipped as they already exist)` : ''} ` +
                    `Thank you for helping improve our platform for all users!`
                );

                // Optionally refresh the available skills or update the UI
                // You might want to remove the added skills from unmatched skills display
                if (summary.added > 0) {
                    // Refresh available skills for future use
                    fetchAvailableSkills();
                }
                
            } else {
                const errorData = await response.json();
                setUploadError(`Error adding skills to database: ${errorData.message}`);
            }

        } catch (error) {
            console.error('Error adding skills to database:', error);
            setUploadError('Error adding skills to database. Please try again.');
        } finally {
            setIsAddingToDatabase(false);
        }
    };

    return (
        <div className="skills-container">
            <h2>My Skills</h2>

            <ul className="skills-list">
                {skills.map(skill => (
                    <li key={skill.skill_id}>
                        <span>{skill.skill_name} - {skill.proficiency_level}</span>
                        <button onClick={() => handleRemoveSkill(skill.skill_id)} className="remove-btn">
                            Remove
                        </button>
                    </li>
                ))}
            </ul>            {/* Resume Upload Section */}
            <div className="resume-upload-section">
                <h3>Extract Skills from Resume</h3>
                
                {uploadError && (
                    <div className="error-message">
                        {uploadError}
                    </div>
                )}
                
                {uploadSuccess && (
                    <div className="success-message">
                        {uploadSuccess}
                    </div>
                )}
                
                <form onSubmit={handleResumeUpload} className="upload-form">
                    <div className="form-group">
                        <label htmlFor="resume">Upload Resume (PDF):</label>
                        <input 
                            type="file" 
                            id="resume" 
                            accept=".pdf" 
                            onChange={handleFileChange}
                            className="file-input" 
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="upload-btn" 
                        disabled={isUploading || !resumeFile}
                    >
                        {isUploading ? 'Processing...' : 'Extract Skills'}
                    </button>
                </form>

                {/* Extracted Skills Section */}
                {showExtractedSkills && (
                    <div className="extracted-skills-section">
                        <h4>Skills Found in Your Resume</h4>
                        
                        {extractedSkills.matchedSkills.length > 0 ? (
                            <>
                                <p>
                                    Select skills to add to your profile:
                                    {extractedSkills.modelInfo && (
                                        <span className="model-info-badge">
                                            {extractedSkills.modelInfo.name} detected {extractedSkills.modelInfo.totalSkillsDetected} skills
                                        </span>
                                    )}
                                </p>
                                <ul className="extracted-skills-list">
                                    {extractedSkills.matchedSkills
                                        .filter(skill => {
                                            // Filter by confidence - prioritize higher confidence matches
                                            const confidence = skill.confidence || 1.0;
                                            return confidence >= 0.5; // Minimum 50% confidence for matched skills
                                        })
                                        .sort((a, b) => (b.confidence || 1.0) - (a.confidence || 1.0)) // Sort by confidence desc
                                        .map(skill => (
                                        <li key={skill.skill_id} className={skill.confidence >= 0.8 ? 'high-confidence' : ''}>
                                            <label className="skill-checkbox-label">
                                                <input 
                                                    type="checkbox"
                                                    checked={selectedMatchedSkills.includes(skill.skill_id)}
                                                    onChange={() => handleSkillCheckboxChange(skill.skill_id)}
                                                />
                                                <span className="skill-name">{skill.skill_name}</span>
                                                {skill.category && skill.category !== 'other' && (
                                                    <span className="skill-category">{skill.category}</span>
                                                )}
                                                {skill.confidence && skill.confidence < 1.0 && (
                                                    <span className="skill-confidence">{Math.round(skill.confidence * 100)}%</span>
                                                )}
                                                {skill.match_type && skill.match_type === 'fuzzy' && (
                                                    <span className="skill-confidence">fuzzy match</span>
                                                )}
                                                {skill.confidence >= 0.9 && (
                                                    <span className="high-confidence-badge">HIGH</span>
                                                )}
                                            </label>
                                        </li>
                                    ))}
                                </ul>

                                <div className="form-group">
                                    <label htmlFor="extracted-proficiency">Set Proficiency Level:</label>
                                    <select
                                        id="extracted-proficiency"
                                        value={proficiencyLevel}
                                        onChange={(e) => setProficiencyLevel(e.target.value)}
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>

                                <button 
                                    onClick={handleAddExtractedSkills}
                                    className="add-extracted-btn"
                                    disabled={selectedMatchedSkills.length === 0}
                                >
                                    Add Selected Skills
                                </button>
                            </>
                        ) : (
                            <p>No matching skills found in our database.</p>
                        )}

                        {extractedSkills.unmatchedSkills.length > 0 && (
                            <div className="unmatched-skills">
                                <h4>Other Skills Found (Not in Database)</h4>
                                <p>These skills were detected but are not in our database:</p>
                                <ul>
                                    {extractedSkills.unmatchedSkills
                                        .filter(skillItem => {
                                            // Filter by confidence - only show skills with decent confidence
                                            const confidence = typeof skillItem === 'object' ? skillItem.confidence : 1.0;
                                            return confidence >= 0.6; // Minimum 60% confidence
                                        })
                                        .map((skillItem, index) => {
                                        // Handle both string and object formats from Large-Scale Skills Model
                                        const skillName = typeof skillItem === 'string' ? skillItem : skillItem.skill;
                                        const category = typeof skillItem === 'object' ? skillItem.category : 'other';
                                        const confidence = typeof skillItem === 'object' ? skillItem.confidence : 1.0;
                                        const suggestedAdd = typeof skillItem === 'object' ? skillItem.suggested_add : false;
                                        
                                        return (
                                            <li key={index} className={suggestedAdd ? 'suggested-skill' : ''}>
                                                <span className="skill-name">{skillName}</span>
                                                {category && category !== 'other' && (
                                                    <span className="skill-category"> ({category})</span>
                                                )}
                                                {confidence && confidence < 1.0 && (
                                                    <span className="skill-confidence"> - {Math.round(confidence * 100)}% confidence</span>
                                                )}
                                                {suggestedAdd && (
                                                    <span className="suggested-badge">RECOMMENDED</span>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                                {extractedSkills.unmatchedSkills.filter(skillItem => {
                                    const confidence = typeof skillItem === 'object' ? skillItem.confidence : 1.0;
                                    return confidence < 0.6;
                                }).length > 0 && (
                                    <p className="filtered-note">
                                        {extractedSkills.unmatchedSkills.filter(skillItem => {
                                            const confidence = typeof skillItem === 'object' ? skillItem.confidence : 1.0;
                                            return confidence < 0.6;
                                        }).length} additional low-confidence detections were filtered out to reduce false positives.
                                    </p>
                                )}

                                {/* Add to Database Section */}
                                {extractedSkills.unmatchedSkills.filter(skillItem => {
                                    const confidence = typeof skillItem === 'object' ? skillItem.confidence : 1.0;
                                    return confidence >= 0.7; // Only high-confidence skills for database addition
                                }).length > 0 && (
                                    <div className="add-to-database-section">
                                        <h5>Help Improve Our Database</h5>
                                        <p>These high-confidence skills aren't in our database yet. Help other job seekers by adding them:</p>
                                        <div className="database-skills">
                                            {extractedSkills.unmatchedSkills
                                                .filter(skillItem => {
                                                    const confidence = typeof skillItem === 'object' ? skillItem.confidence : 1.0;
                                                    return confidence >= 0.7;
                                                })
                                                .map((skillItem, index) => {
                                                    const skillName = typeof skillItem === 'string' ? skillItem : skillItem.skill;
                                                    const category = typeof skillItem === 'object' ? skillItem.category : 'other';
                                                    const confidence = typeof skillItem === 'object' ? skillItem.confidence : 1.0;
                                                    
                                                    return (
                                                        <div key={index} className="database-skill-item">
                                                            <span className="skill-name">{skillName}</span>
                                                            <span className="skill-category">({category})</span>
                                                            <span className="skill-confidence">{Math.round(confidence * 100)}%</span>
                                                        </div>
                                                    );
                                                })
                                            }
                                        </div>
                                        <button 
                                            className="add-to-database-btn"
                                            onClick={handleAddSkillsToDatabase}
                                            disabled={isAddingToDatabase}
                                        >
                                            {isAddingToDatabase ? 'Adding...' : 'Add These Skills to Database'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Skills by Category Display */}
                        {extractedSkills.skillsByCategory && Object.keys(extractedSkills.skillsByCategory).length > 0 && (
                            <div className="skills-by-category">
                                <h4>Skills Organized by Category</h4>
                                <p>Here's how the Large-Scale Skills Model categorized your skills:</p>
                                <div className="category-grid">
                                    {Object.entries(extractedSkills.skillsByCategory).map(([category, skills]) => (
                                        <div key={category} className="category-section">
                                            <h5 className="category-title">{category.replace(/_/g, ' ').toUpperCase()}</h5>
                                            <div className="category-skills">
                                                {skills.slice(0, 5).map((skillItem, index) => {
                                                    const skillName = typeof skillItem === 'object' ? skillItem.skill : skillItem;
                                                    const matched = typeof skillItem === 'object' ? skillItem.matched : true;
                                                    const confidence = typeof skillItem === 'object' ? skillItem.confidence : 1.0;
                                                    
                                                    return (
                                                        <span 
                                                            key={index} 
                                                            className={`category-skill ${matched ? 'matched' : 'unmatched'}`}
                                                            title={`${confidence ? Math.round(confidence * 100) + '% confidence' : ''} - ${matched ? 'Found in database' : 'Not in database'}`}
                                                        >
                                                            {skillName}
                                                            {matched && <span className="match-indicator">✓</span>}
                                                        </span>
                                                    );
                                                })}
                                                {skills.length > 5 && (
                                                    <span className="more-skills">+{skills.length - 5} more</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add New Skill Form */}
            <div className="add-skill-form">
                <h3>Add New Skill Manually</h3>
                <form onSubmit={handleAddSkill}>
                    <div className="form-group">
                        <label htmlFor="skill">Select Skill:</label>
                        <select
                            id="skill"
                            value={selectedSkill}
                            onChange={(e) => setSelectedSkill(e.target.value)}
                            required
                        >
                            <option value="">Select a skill</option>
                            {availableSkills.map(skill => (
                                <option key={skill.skill_id} value={skill.skill_id}>
                                    {skill.skill_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="proficiency">Proficiency Level:</label>
                        <select
                            id="proficiency"
                            value={proficiencyLevel}
                            onChange={(e) => setProficiencyLevel(e.target.value)}
                            required
                        >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>

                    <button type="submit" className="add-btn">
                        Add Skill
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Skills;
