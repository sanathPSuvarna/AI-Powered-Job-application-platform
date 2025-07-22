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
                    
                    setUploadSuccess(`Found ${data.matchedSkills.length} skills in your resume that match our database.`);
                } else {
                    setUploadSuccess('Resume analyzed successfully, but no matching skills were found in our database.');
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
    };    return (
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
                                <p>Select skills to add to your profile:</p>
                                <ul className="extracted-skills-list">
                                    {extractedSkills.matchedSkills.map(skill => (
                                        <li key={skill.skill_id}>
                                            <label className="skill-checkbox-label">
                                                <input 
                                                    type="checkbox"
                                                    checked={selectedMatchedSkills.includes(skill.skill_id)}
                                                    onChange={() => handleSkillCheckboxChange(skill.skill_id)}
                                                />
                                                {skill.skill_name}
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
                                    {extractedSkills.unmatchedSkills.map((skill, index) => (
                                        <li key={index}>{skill}</li>
                                    ))}
                                </ul>
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
