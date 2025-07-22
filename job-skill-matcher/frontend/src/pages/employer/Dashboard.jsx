// frontend/src/pages/employer/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const EmployerDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [postedJobs, setPostedJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const[refreshTrigger, setRefreshTrigger] = useState(false);
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // Fetch employer profile
                const profileResponse = await fetch(
                    "http://localhost:5000/api/employer-profile",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
               
          
                  if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    setProfile(profileData);
                } else if (profileResponse.status === 404) {
                    navigate("/employer/create-profile");
                    return;
                }

                

                // Fetch posted jobs
                const jobsResponse = await fetch(
                    "http://localhost:5000/api/jobs/employer",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                if (jobsResponse.ok) {
                    const jobsData = await jobsResponse.json();
                    setPostedJobs(jobsData);
                }
                

                // Fetch job applications
                const applicationsResponse = await fetch(
                    "http://localhost:5000/api/applications/employer",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

               

               

                if (applicationsResponse.ok) {
                    const applicationsData = await applicationsResponse.json();
                    setApplications(applicationsData);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate,refreshTrigger]);

    if (loading) {
        return <div>Loading dashboard...</div>;
    }

    return (
        // frontend/src/pages/employer/Dashboard.jsx
<div className="dashboard-container">
    <div className="dashboard-header">
        <h2>Employer Dashboard</h2>
        <button onClick={() => navigate('/employer/edit-profile')} className="post-job-button">
            <i className="fas fa-user-edit"></i> Edit Profile
        </button>
    </div>

    <section className="company-profile">
        <div className="company-profile-header">
            <h3>Company Profile</h3>
        </div>
        <div className="company-details">
            <div className="detail-item">
                <label>Industry</label>
                <p>{profile?.industry}</p>
            </div>
            <div className="detail-item">
                <label>Company Size</label>
                <p>{profile?.company_size}</p>
            </div>
            <div className="detail-item">
                <label>Description</label>
                <p>{profile?.description}</p>
            </div>
        </div>
    </section>

    <section className="jobs-section">
        <div className="section-header">
            <h3>Posted Jobs</h3>
            <button onClick={() => navigate('/employer/post-job')} className="post-job-button">
                <i className="fas fa-plus"></i> Post New Job
            </button>
        </div>
        <div className="jobs-grid">
            {postedJobs.map(job => (
                <div key={job.job_id} className="job-card">
                    <h4>{job.title}</h4>
                    <div className="job-info">
                        <div className="job-info-item">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{job.location}</span>
                        </div>
                        <div className="job-info-item">
                            <i className="fas fa-briefcase"></i>
                            <span>{job.job_type}</span>
                        </div>
                        <div className="job-info-item">
                            <i className="fas fa-money-bill-wave"></i>
                            <span>${job.salary_min} - ${job.salary_max}</span>
                        </div>
                    </div>
                    <div className="job-status">
                        <span className={`status-badge ${job.status.toLowerCase()}`}>
                            {job.status}
                        </span>
                        <span>Applications: {job.application_count || 0}</span>
                    </div>
                </div>
            ))}
        </div>
    </section>

    <section className="applications-section">
        <div className="section-header">
            <h3>Recent Applications</h3>
        </div>
        <div className="applications-grid">
            {applications.map(application => (
                <div key={application.application_id} className="application-card">
                    <h4>{application.job_title}</h4>
                    <div className="applicant-info">
                        <p>Applicant: {application.applicant_name}</p>
                        <p>Applied: {new Date(application.application_date).toLocaleDateString()}</p>
                    </div>
                    <span className={`application-status status-${application.status}`}>
                        {application.status.replace('_', ' ')}
                    </span>
                    <button 
                        onClick={() => navigate(`/employer/applications/${application.application_id}`)}
                        className="review-button"
                    >
                        Review
                    </button>
                </div>
            ))}
        </div>
    </section>
</div>

    );
};

export default EmployerDashboard;
