// frontend/src/pages/jobseeker/EditProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        professionalStatus: '',
        experienceYears: 0,
        bio: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/profile', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const profile = await response.json();
                    setFormData({
                        firstName: profile.first_name,
                        lastName: profile.last_name,
                        professionalStatus: profile.professional_status,
                        experienceYears: profile.experience_years,
                        bio: profile.bio || ''
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
            const response = await fetch('http://localhost:5000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                navigate('/jobseeker/dashboard');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <div className="edit-profile-container">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmit}>
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
                        <option value="working">Working Professional</option>
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
                    <label htmlFor="bio">Professional Bio</label>
                    <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="4"
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
