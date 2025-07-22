// frontend/src/pages/employer/EditProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
    const [formData, setFormData] = useState({
        companyName: '',
        industry: '',
        companySize: '',
        companyDescription: '',
        websiteUrl: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/employer-profile', {
                    
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const profile = await response.json();
                    setFormData({
                        companyName: profile.company_name,
                        industry: profile.industry,
                        companySize: profile.company_size,
                        companyDescription: profile.company_description,
                        websiteUrl: profile.website_url
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/employer-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });
    
            if (response.ok) {
                navigate('/employer/dashboard');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };
    

    return (
        <div className="edit-profile-container">
            <h2>Edit Company Profile</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="companyName">Company Name</label>
                    <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="industry">Industry</label>
                    <input
                        type="text"
                        id="industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="companySize">Company Size</label>
                    <input
                        type="text"
                        id="companySize"
                        name="companySize"
                        value={formData.companySize}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="companyDescription">Company Description</label>
                    <textarea
                        id="companyDescription"
                        name="companyDescription"
                        value={formData.companyDescription}
                        onChange={handleChange}
                        rows="4"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="websiteUrl">Website URL</label>
                    <input
                        type="url"
                        id="websiteUrl"
                        name="websiteUrl"
                        value={formData.websiteUrl}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="btn-primary">
                    Update Profile
                </button>
            </form>
        </div>
    );
};

export default EditProfile;
