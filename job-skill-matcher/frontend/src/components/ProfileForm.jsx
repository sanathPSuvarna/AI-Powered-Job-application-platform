// components/ProfileForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        professionalStatus: 'fresher', // Default value
        experienceYears: 0,
        bio: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                navigate('/jobseeker/dashboard');
            } else {
                const data = await response.json();
                alert(data.message || 'Error creating profile');
            }
        } catch (error) {
            console.error('Profile creation error:', error);
            alert('Error creating profile');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="professionalStatus">Professional Status</label>
                <select
                    id="professionalStatus"
                    name="professionalStatus"
                    value={formData.professionalStatus}
                    onChange={handleChange}
                    required
                >
                    <option value="fresher">Fresher</option>
                    <option value="working">Working</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="experienceYears">Years of Experience</label>
                <input
                    type="number"
                    id="experienceYears"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    min="0"
                />
            </div>

            <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                />
            </div>

            <button type="submit" className="btn-primary">
                Create Profile
            </button>
        </form>
    );
};

export default ProfileForm;
