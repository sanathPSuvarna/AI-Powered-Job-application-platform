// src/pages/jobseeker/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileSummary from "../../components/ProfileSummary";

import "./Dashboard.css";

const JobSeekerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allJobs, setAllJobs] = useState([]);
  const [researchPapers, setResearchPapers] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch profile data
        const profileResponse = await fetch("http://localhost:5000/api/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile(profileData);
        } else if (profileResponse.status === 404) {
          navigate("/jobseeker/create-profile");
          return;
        }
        const researchPapersResponse = await fetch(
          "http://localhost:5000/api/research-papers",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (researchPapersResponse.ok) {
          const researchPapersData = await researchPapersResponse.json();
          setResearchPapers(researchPapersData);
        } else {
          console.error("Error fetching research papers");
        }

        const skillsResponse = await fetch(
          "http://localhost:5000/api/skill/user-skills",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (skillsResponse.ok) {
          const skillsData = await skillsResponse.json();
          setSkills(skillsData);
        } else {
          console.error("Error fetching skills");
        }

         // Fetch matching jobs
      const fetchMatchingJobs = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/skill/matching-jobs", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setMatchingJobs(data);
          } else {
            console.error("Error fetching matching jobs");
          }
        } catch (error) {
          console.error("Error fetching matching jobs:", error);
        }
      };

      await fetchMatchingJobs();



         // const jobsResponse = await fetch(
        //   "http://localhost:5000/api/skill/matching-jobs",
        //   {
        //     headers: {
        //       Authorization: `Bearer ${localStorage.getItem("token")}`,
        //     },
        //   }
        // );

        // if (jobsResponse.ok) {
        //   const jobsData = await jobsResponse.json();
        //   setMatchingJobs(jobsData);
        // } else {
        //   console.error("Error fetching matching jobs");
        // }

        // Fetch all jobs
        const allJobsResponse = await fetch("http://localhost:5000/api/jobs", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (allJobsResponse.ok) {
          const allJobsData = await allJobsResponse.json();
          setAllJobs(allJobsData);
        }

        // Fetch applications
        const applicationsResponse = await fetch(
          "http://localhost:5000/api/applications/user",
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
  }, [navigate]);
  

  const handleApply = async (jobId) => {
    try {
      // First get the profile ID
      const profileResponse = await fetch("http://localhost:5000/api/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!profileResponse.ok) {
        alert("Please create a profile first");
        navigate("/jobseeker/create-profile");
        return;
      }

      const profileData = await profileResponse.json();
      const profileId = profileData.profile_id;

      // Then submit the application
      const response = await fetch("http://localhost:5000/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          jobId,
          profileId,
        }),
      });

      if (response.ok) {
        alert("Application submitted successfully!");
        // Refresh applications list
        const applicationsResponse = await fetch(
          "http://localhost:5000/api/applications/user",
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
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Error submitting application");
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>JOBSEEKER DASHBOARD</h2>

      {/* Profile Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h3>My Profile</h3>
          <button onClick={() => navigate("/jobseeker/edit-profile")}>
            Edit Profile
          </button>
        </div>
        <ProfileSummary profile={profile} />
      </section>

      {/* Skills Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h3>My Skills</h3>
          <button onClick={() => navigate("/jobseeker/skills")}>
            Manage Skills
          </button>
        </div>
        <div className="skills-grid">
          {skills.map((skill) => (
            <div key={skill.skill_id} className="skill-card">
              <h4>{skill.skill_name}</h4>
              <p>Level: {skill.proficiency_level}</p>
            </div>
          ))}
        </div>
      </section>



    {/* Research Papers Section */}
    <section className="dashboard-section">
      <div className="section-header">
        <h3>My Research Papers</h3>
        <button onClick={() => navigate("/jobseeker/research-papers")}>
          Manage Research Papers
        </button>
      </div>
      <div className="research-papers-grid">
        {researchPapers.length === 0 ? (
          <p>No research papers added yet.</p>
        ) : (
          researchPapers.map((paper) => (
            <div key={paper.paper_id} className="research-paper-card">
              <h4>{paper.title}</h4>
              <p>Published: {new Date(paper.publication_date).toLocaleDateString()}</p>
              <div className="paper-links">
                {paper.doi_link && (
                  <a
                    href={paper.doi_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paper-link"
                  >
                    View DOI
                  </a>
                )}
                {paper.paper_link && (
                  <a
                    href={paper.paper_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paper-link"
                  >
                    View Paper
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>

          {/* Matching Jobs Section */}
          <section className="dashboard-section">
            <h3>Matching Jobs</h3>
            <div className="jobs-grid">
          {matchingJobs.length === 0 ? (
            <p>No matching jobs found.</p>
              ) : (
            matchingJobs.map((job) => (
                    <div key={job.job_id} className="job-card">
                      <h4>{job.title}</h4>
                      <p>{job.company_name}</p>
                      <p>Location: {job.location}</p>
                      <p>Type: {job.job_type}</p>
                      <p>Salary: ${job.salary_min} - ${job.salary_max}</p>
                <p >Description: {job.description}</p>
                <p>Skills Matched: {job.matched_skills}</p>
                
                      <p className="match-percentage">
                        Match: {Math.round(job.match_percentage)}%
                      </p>
                      <button onClick={() => handleApply(job.job_id)}>Apply</button>
                    </div>
                  ))
              )}
            </div>
          </section>

      {/* All Available Jobs Section */}
      <section className="dashboard-section">
        <h3>All Available Jobs</h3>
        <div className="jobs-grid">
          {allJobs.length === 0 ? (
            <p>No jobs available.</p>
          ) : (
            allJobs.map((job) => (
              <div key={job.job_id} className="job-card">
                <h4>{job.title}</h4>
                <p>{job.company_name}</p>
                <p>Location: {job.location}</p>
                <p>Type: {job.job_type}</p>
                <p>Salary: ${job.salary_min} - ${job.salary_max}</p>
                <button onClick={() => handleApply(job.job_id)}>Apply</button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Applications Section */}
      <section className="dashboard-section">
        <h3>My Applications</h3>
        <div className="applications-list">
          {applications.length === 0 ? (
            <p>No applications submitted yet.</p>
          ) : (
            applications.map((application) => (
              <div key={application.application_id} className="application-card">
                <h4>{application.job_title}</h4>
                <p>Company: {application.company_name}</p>
                <p>Status: {application.status}</p>
                <p>
                  Applied:{" "}
                  {new Date(application.application_date).toLocaleDateString()}
                </p>
                
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default JobSeekerDashboard;
