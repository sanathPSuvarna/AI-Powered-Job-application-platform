import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PostJob.css';

const PostJob = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        salary_min: '',
        salary_max: '',
        location: '',
        job_type: 'full-time',
        required_skills: []
    });
    const [availableSkills, setAvailableSkills] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch available skills when component mounts
        const fetchSkills = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/skill', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const skills = await response.json();
                    setAvailableSkills(skills);
                }
            } catch (error) {
                console.error('Error fetching skills:', error);
            }
        };
        fetchSkills();
    }, []);

    const handleSkillChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
        setFormData({
            ...formData,
            required_skills: selectedOptions
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                console.log('Job posted successfully');
                window.location.href='/employer/dashboard';
                
            }
        } catch (error) {
            console.error('Error posting job:', error);
        }
    };

    return (
        <div className="post-job-container">
            <h2>Post New Job</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Job Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Job Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="salary_min">Minimum Salary</label>
                    <input
                        type="number"
                        id="salary_min"
                        name="salary_min"
                        value={formData.salary_min}
                        onChange={(e) => setFormData({...formData, salary_min: e.target.value})}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="salary_max">Maximum Salary</label>
                    <input
                        type="number"
                        id="salary_max"
                        name="salary_max"
                        value={formData.salary_max}
                        onChange={(e) => setFormData({...formData, salary_max: e.target.value})}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="job_type">Job Type</label>
                    <select
                        id="job_type"
                        name="job_type"
                        value={formData.job_type}
                        onChange={(e) => setFormData({...formData, job_type: e.target.value})}
                        required
                    >
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                    </select>
                </div>
                <div className="form-group">
                <label htmlFor="required_skills">Required Skills</label>
                <select
                    id="required_skills"
                    name="required_skills"
                    multiple
                    value={formData.required_skills}
                    onChange={handleSkillChange}
                    className="skills-select"
                >
                    {availableSkills.map(skill => (
                        <option key={skill.skill_id} value={skill.skill_id}>
                            {skill.skill_name}
                        </option>
                    ))}
                </select>
                <small>Hold Ctrl (Cmd on Mac) to select multiple skills</small>
            </div>

                <button type="submit" className="btn-primary">
                    Post Job
                </button>
            </form>
        </div>
    );
};

export default PostJob;
