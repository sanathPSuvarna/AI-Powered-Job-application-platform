// frontend/src/pages/employer/ReviewApplication.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ReviewApplication.css';

const ReviewApplication = () => {
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { applicationId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApplicationDetails = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                
                // Debug logs
                console.log('Fetching application ID:', applicationId);
                
                const response = await fetch(
                    `http://localhost:5000/api/applications/${applicationId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                    }
                );

                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('Response data:', data);

                if (response.ok) {
                    setApplication(data);
                } else {
                    setError(data.message || 'Failed to fetch application details');
                }
            } catch (error) {
                console.error('Error fetching application:', error);
                setError('Error fetching application details');
            } finally {
                setLoading(false);
            }
        };

        fetchApplicationDetails();
    }, [applicationId]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/applications/${applicationId}/status`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            if (response.ok) {
                setApplication(prev => ({ ...prev, status: newStatus }));
                alert('Application status updated successfully');
            } else {
                alert('Failed to update application status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating application status');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading application details...</p>
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="error-container">
                <div className="error-content">
                    <h2>Application Not Found</h2>
                    <p>{error || 'The requested application could not be found.'}</p>
                    <button 
                        onClick={() => navigate('/employer/dashboard')} 
                        className="back-button"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Add this console log to verify data before rendering
    console.log('Rendering application data:', application);

    return (
        <div className="review-application-container">
            <div className="review-header">
                <div className="header-content">
                    <h2>Review Application</h2>
                    {application.status && (
                        <span className={`status-badge status-${application.status}`}>
                            {application.status.replace('_', ' ').toUpperCase()}
                        </span>
                    )}
                </div>
                <button onClick={() => navigate('/employer/dashboard')} className="secondary-button">
                    <i className="fas fa-arrow-left"></i> Back to Dashboard
                </button>
            </div>

            <div className="application-grid">
                <section className="job-details card">
                    <h3><i className="fas fa-briefcase"></i> Job Details</h3>
                    <div className="details-grid">
                        <div className="detail-item">
                            <label>Position</label>
                            <p>{application.job_title}</p>
                        </div>
                        <div className="detail-item">
                            <label>Location</label>
                            <p><i className="fas fa-map-marker-alt"></i> {application.location}</p>
                        </div>
                        <div className="detail-item">
                            <label>Job Type</label>
                            <p><i className="fas fa-clock"></i> {application.job_type}</p>
                        </div>
                    </div>
                </section>

                <section className="applicant-details card">
                    <h3><i className="fas fa-user"></i> Applicant Details</h3>
                    <div className="details-grid">
                        <div className="detail-item">
                            <label>Name</label>
                            <p>{application.applicant_name}</p>
                        </div>
                        <div className="detail-item">
                            <label>Professional Status</label>
                            <p>{application.professional_status}</p>
                        </div>
                        {application.experience_years && (
                            <div className="detail-item">
                                <label>Experience</label>
                                <p>{application.experience_years} years</p>
                            </div>
                        )}
                        <div className="detail-item">
                            <label>Applied Date</label>
                            <p><i className="far fa-calendar"></i> {new Date(application.application_date).toLocaleDateString()}</p>
                        </div>
                        {application.matching_percentage && (
                            <div className="detail-item">
                                <label>Matching Percentage</label>
                                <p>{application.matching_percentage}%</p>
                            </div>
                        )}
                    </div>
                </section>

                {application.skills && application.skills.length > 0 && (
                    <section className="applicant-skills card">
                        <h3><i className="fas fa-tools"></i> Skills</h3>
                        <div className="skills-container">
                            {application.skills.map((skill, index) => (
                                <div key={index} className="skill-badge">
                                    <span className="skill-name">{skill.skill_name}</span>
                                    <span className="skill-level">{skill.proficiency_level}</span>
                                </div>
                            ))}
                        </div>
                        
                    </section>
                )}

                <section className="application-actions card">
                    <h3><i className="fas fa-tasks"></i> Application Status</h3>
                    <div className="status-controls">
                        {/* <button 
                            onClick={() => handleStatusUpdate('under_review')}
                            className={`action-button review ${application.status === 'under_review' ? 'active' : ''}`}
                            disabled={application.status === 'under_review'}
                        >
                            <i className="fas fa-search"></i>
                            Mark Under Review
                        </button> */}
                        <button 
                            onClick={() => handleStatusUpdate('accepted')}
                            className={`action-button accept ${application.status === 'accepted' ? 'active' : ''}`}
                            disabled={application.status === 'accepted'}
                        >
                            <i className="fas fa-check"></i>
                            Accept
                        </button>
                        <button 
                            onClick={() => handleStatusUpdate('rejected')}
                            className={`action-button reject ${application.status === 'rejected' ? 'active' : ''}`}
                            disabled={application.status === 'rejected'}
                        >
                            <i className="fas fa-times"></i>
                            Reject
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default ReviewApplication;
