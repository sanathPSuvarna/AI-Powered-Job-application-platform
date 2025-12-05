// frontend/src/pages/employer/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EmployerDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [postedJobs, setPostedJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [metrics, setMetrics] = useState({
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        newApplications: 0,
    });
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    
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
                    
                    // Calculate job metrics
                    const activeJobs = jobsData.filter(job => job.status.toLowerCase() === 'open').length;
                    setMetrics(prev => ({
                        ...prev,
                        totalJobs: jobsData.length,
                        activeJobs: activeJobs
                    }));
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
                    
                    // Calculate application metrics
                    const newApps = applicationsData.filter(
                        app => new Date(app.application_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    ).length;
                    
                    setMetrics(prev => ({
                        ...prev,
                        totalApplications: applicationsData.length,
                        newApplications: newApps
                    }));
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate, refreshTrigger]);

    // Handle job status change (open/closed)
    const handleJobStatusChange = async (jobId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:5000/api/jobs/${jobId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (response.ok) {
                setRefreshTrigger(!refreshTrigger);
            }
        } catch (error) {
            console.error("Error updating job status:", error);
        }
    };

    // Prepare chart data
    const applicationStatusData = {
        labels: ['Pending', 'Under Review', 'Accepted', 'Rejected'],
        datasets: [
            {
                label: 'Applications by Status',
                data: [
                    applications.filter(app => app.status === 'pending').length,
                    applications.filter(app => app.status === 'under_review').length,
                    applications.filter(app => app.status === 'accepted').length,
                    applications.filter(app => app.status === 'rejected').length
                ],
                backgroundColor: [
                    '#ffc107',
                    '#17a2b8',
                    '#28a745',
                    '#dc3545'
                ],
                borderWidth: 1,
            },
        ],
    };
    
    const jobsByTypeData = {
        labels: [...new Set(postedJobs.map(job => job.job_type))],
        datasets: [
            {
                label: 'Jobs by Type',
                data: [...new Set(postedJobs.map(job => job.job_type))].map(
                    type => postedJobs.filter(job => job.job_type === type).length
                ),
                backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
            },
        ],
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-content">
                    <div className="loading-spinner"></div>
                    <p>Loading your dashboard...</p>
                </div>
                <div className="skeleton-dashboard">
                    <div className="skeleton-metrics"></div>
                    <div className="skeleton-profile"></div>
                    <div className="skeleton-jobs-grid">
                        {[1, 2, 3].map(i => <div key={i} className="skeleton-card"></div>)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h2>Employer Dashboard</h2>
                    <p className="welcome-message">Welcome back, <strong>{profile?.company_name || 'Employer'}</strong></p>
                </div>
                <div className="header-actions">
                    <button onClick={() => navigate('/employer/post-job')} className="primary-button">
                        <i className="fas fa-plus"></i> Post New Job
                    </button>
                    <button onClick={() => navigate('/employer/edit-profile')} className="secondary-button">
                        <i className="fas fa-user-edit"></i> Edit Profile
                    </button>
                </div>
            </div>

            {/* Analytics Section */}
            <section className="metrics-section">
                <div className="metrics-card">
                    <div className="metric-icon jobs-icon">
                        <i className="fas fa-briefcase"></i>
                    </div>
                    <div className="metric-content">
                        <h4>Total Jobs</h4>
                        <p className="metric-value">{metrics.totalJobs}</p>
                    </div>
                </div>
                <div className="metrics-card">
                    <div className="metric-icon active-icon">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="metric-content">
                        <h4>Active Jobs</h4>
                        <p className="metric-value">{metrics.activeJobs}</p>
                    </div>
                </div>
                <div className="metrics-card">
                    <div className="metric-icon applications-icon">
                        <i className="fas fa-file-alt"></i>
                    </div>
                    <div className="metric-content">
                        <h4>Total Applications</h4>
                        <p className="metric-value">{metrics.totalApplications}</p>
                    </div>
                </div>
                <div className="metrics-card">
                    <div className="metric-icon new-apps-icon">
                        <i className="fas fa-bell"></i>
                    </div>
                    <div className="metric-content">
                        <h4>New Applications</h4>
                        <p className="metric-value">{metrics.newApplications}</p>
                        <span className="time-period">Last 7 days</span>
                    </div>
                </div>
            </section>

            {/* Company Profile Section */}
            <section className="company-profile">
                <div className="company-profile-header">
                    <h3>Company Profile</h3>
                </div>
                <div className="company-details">
                    <div className="detail-item">
                        <label>Company</label>
                        <p>{profile?.company_name || 'Not specified'}</p>
                    </div>
                    <div className="detail-item">
                        <label>Industry</label>
                        <p>{profile?.industry || 'Not specified'}</p>
                    </div>
                    <div className="detail-item">
                        <label>Company Size</label>
                        <p>{profile?.company_size || 'Not specified'}</p>
                    </div>
                    <div className="detail-item">
                        <label>Location</label>
                        <p>{profile?.location || 'Not specified'}</p>
                    </div>
                </div>
                <div className="company-description">
                    <label>About</label>
                    <p>{profile?.description || 'No company description available.'}</p>
                </div>
            </section>

            {/* Data Visualization Section */}
            <section className="analytics-section">
                <div className="section-header">
                    <h3>Analytics Overview</h3>
                </div>
                <div className="charts-container">
                    <div className="chart-card">
                        <h4>Applications by Status</h4>
                        <div className="chart-area">
                            <Doughnut data={applicationStatusData} options={{ maintainAspectRatio: false }} />
                        </div>
                    </div>
                    <div className="chart-card">
                        <h4>Jobs by Type</h4>
                        <div className="chart-area">
                            <Bar 
                                data={jobsByTypeData} 
                                options={{
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                precision: 0
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Jobs Section */}
            <section className="jobs-section">
                <div className="section-header">
                    <h3>Posted Jobs</h3>
                    <div className="job-filter-container">
                        <div className="filter-group">
                            <label>Status:</label>
                            <select 
                                value={filterStatus} 
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All</option>
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Sort by:</label>
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)}
                                className="filter-select"
                            >
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                                <option value="applications">Most Applications</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                {postedJobs.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-briefcase empty-icon"></i>
                        <p>No jobs found matching your filters</p>
                        <button onClick={() => navigate('/employer/post-job')} className="primary-button">
                            Post your first job
                        </button>
                    </div>
                ) : (
                    <div className="jobs-grid">
                        {postedJobs
                            .filter(job => {
                                if (filterStatus === 'all') return true;
                                return job.status.toLowerCase() === filterStatus.toLowerCase();
                            })
                            .sort((a, b) => {
                                if (sortBy === 'newest') {
                                    return new Date(b.created_at) - new Date(a.created_at);
                                } else if (sortBy === 'oldest') {
                                    return new Date(a.created_at) - new Date(b.created_at);
                                } else if (sortBy === 'applications') {
                                    return (b.application_count || 0) - (a.application_count || 0);
                                }
                                return 0;
                            })
                            .map(job => (
                                <div key={job.job_id} className="job-card">
                                    <div className="job-card-header">
                                        <h4>{job.title}</h4>
                                        <span className={`status-badge ${job.status.toLowerCase()}`}>
                                            {job.status}
                                        </span>
                                    </div>
                                    
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
                                        <div className="job-info-item">
                                            <i className="fas fa-calendar-alt"></i>
                                            <span>Posted: {new Date(job.created_at || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="job-applications">
                                        <div className="applications-count">
                                            <i className="fas fa-users"></i>
                                            <span>{job.application_count || 0} Applications</span>
                                        </div>
                                    </div>
                                    <div className="job-actions">
                                        <button 
                                            onClick={() => navigate(`/employer/jobs/${job.job_id}`)}
                                            className="action-button view"
                                        >
                                            <i className="fas fa-eye"></i> View
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/employer/jobs/${job.job_id}/edit`)}
                                            className="action-button edit"
                                        >
                                            <i className="fas fa-pencil-alt"></i> Edit
                                        </button>
                                        {job.status.toLowerCase() === 'open' ? (
                                            <button 
                                                onClick={() => handleJobStatusChange(job.job_id, 'closed')}
                                                className="action-button close"
                                            >
                                                <i className="fas fa-times-circle"></i> Close
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleJobStatusChange(job.job_id, 'open')}
                                                className="action-button reopen"
                                            >
                                                <i className="fas fa-redo"></i> Reopen
                                            </button>
                                        )}
                                    </div>
                                </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Recent Applications Section */}
            <section className="applications-section">
                <div className="section-header">
                    <h3>Recent Applications</h3>
                    <button 
                        onClick={() => navigate('/employer/applications')}
                        className="secondary-button"
                    >
                        <i className="fas fa-list"></i> View All
                    </button>
                </div>
                
                {applications.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-file-alt empty-icon"></i>
                        <p>No applications received yet</p>
                    </div>
                ) : (
                    <div className="applications-grid">
                        {applications.slice(0, 6).map(application => (
                            <div key={application.application_id} className="application-card">
                                <div className="application-card-header">
                                    <h4>{application.job_title}</h4>
                                    <span className={`application-status status-${application.status}`}>
                                        {application.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="applicant-info">
                                    <div className="applicant-detail">
                                        <i className="fas fa-user"></i>
                                        <p>{application.applicant_name}</p>
                                    </div>
                                    <div className="applicant-detail">
                                        <i className="fas fa-calendar-day"></i>
                                        <p>Applied: {new Date(application.application_date).toLocaleDateString()}</p>
                                    </div>
                                    {application.match_score && (
                                        <div className="applicant-detail">
                                            <i className="fas fa-percentage"></i>
                                            <p>Match: <span className="match-score">{application.match_score}%</span></p>
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => navigate(`/employer/applications/${application.application_id}`)}
                                    className="review-button"
                                >
                                    <i className="fas fa-search"></i> Review Application
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                
                {applications.length > 6 && (
                    <div className="view-more-container">
                        <button 
                            onClick={() => navigate('/employer/applications')}
                            className="view-more-button"
                        >
                            View All Applications
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default EmployerDashboard;
