// controllers/jobController.js

const db = require('../config/database');


const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        // First get the employer profile to ensure it exists
        const profileResponse = await fetch('http://localhost:5000/api/employer-profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!profileResponse.ok) {
            alert('Please create an employer profile first');
            navigate('/employer/create-profile');
            return;
        }

        const response = await fetch('http://localhost:5000/api/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                ...formData,
                salary_min: Number(formData.salary_min),
                salary_max: Number(formData.salary_max)
            })
        });

        if (response.ok) {
            navigate('/employer/dashboard');
        } else {
            const errorData = await response.json();
            alert(errorData.message || 'Error posting job');
        }
    } catch (error) {
        console.error('Error posting job:', error);
        alert('Error posting job. Please try again.');
    }
};



const jobController = {
    // Create a new job listing
    createJob: async (req, res) => {
        try {
            const [employers] = await db.query(
                'SELECT employer_id FROM employer_profiles WHERE user_id = ?',
                [req.user.userId]
            );
    
            if (employers.length === 0) {
                return res.status(404).json({ message: 'Employer profile not found' });
            }
    
            const employer_id = employers[0].employer_id;
            const { 
                title, 
                description, 
                salary_min, 
                salary_max, 
                location, 
                job_type,
                required_skills 
            } = req.body;

            // Start a transaction
            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                // Insert job listing
                const [result] = await connection.query(
                    'INSERT INTO job_listings (employer_id, title, description, salary_min, salary_max, location, job_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [employer_id, title, description, salary_min, salary_max, location, job_type]
                );

                const job_id = result.insertId;

                // Insert required skills
                if (required_skills && required_skills.length > 0) {
                    const skillValues = required_skills.map(skill_id => [job_id, skill_id]);
                    await connection.query(
                        'INSERT INTO job_required_skills (job_id, skill_id) VALUES ?',
                        [skillValues]
                    );
                }

                await connection.commit();
                res.status(201).json({ message: 'Job created successfully', job_id });
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error creating job:', error);
            res.status(500).json({ message: 'Error creating job listing' });
        }
    },
    getEmployerJobs: async (req, res) => {
        try {
            const userId = req.user.userId;
            
            // First get employer_id from employer_profiles
            const [employers] = await db.query(
                'SELECT employer_id FROM employer_profiles WHERE user_id = ?',
                [userId]
            );

            console.log('FOund employers:',employers);
    
            if (employers.length === 0) {
                return res.status(404).json({ message: 'Employer profile not found' });
            }
    
            const employerId = employers[0].employer_id;
    
            // Get all jobs posted by this employer
            const [jobs] = await db.query(
                `SELECT j.*, COUNT(ja.application_id) as application_count 
                 FROM job_listings j 
                 LEFT JOIN job_applications ja ON j.job_id = ja.job_id 
                 WHERE j.employer_id = ? 
                 GROUP BY j.job_id`,
                [employerId]
            );
    
            res.json(jobs);
        } catch (error) {
            console.error('Error fetching employer jobs:', error);
            res.status(500).json({ message: 'Error fetching jobs' });
        }
    },
    

    // Get all jobs with their required skills
    getAllJobs: async (req, res) => {
        try {
            const [jobs] = await db.query(`
                SELECT j.*, 
                       GROUP_CONCAT(s.skill_name) as required_skills
                FROM job_listings j
                LEFT JOIN job_required_skills jr ON j.job_id = jr.job_id
                LEFT JOIN skills s ON jr.skill_id = s.skill_id
                WHERE j.status = 'open'
                GROUP BY j.job_id
            `);
            res.json(jobs);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            res.status(500).json({ message: 'Error fetching jobs' });
        }
    },

    // Get a specific job with its details
    getJobById: async (req, res) => {
        try {
            const [jobs] = await db.query(`
                SELECT j.*, 
                       GROUP_CONCAT(s.skill_name) as required_skills
                FROM job_listings j
                LEFT JOIN job_required_skills jr ON j.job_id = jr.job_id
                LEFT JOIN skills s ON jr.skill_id = s.skill_id
                WHERE j.job_id = ?
                GROUP BY j.job_id
            `, [req.params.jobId]);

            if (jobs.length === 0) {
                return res.status(404).json({ message: 'Job not found' });
            }
            res.json(jobs[0]);
        } catch (error) {
            console.error('Error fetching job:', error);
            res.status(500).json({ message: 'Error fetching job details' });
        }
    },

    // Update job listing
    updateJob: async (req, res) => {
        try {
            const { 
                title, 
                description, 
                salary_min, 
                salary_max, 
                location, 
                job_type,
                required_skills 
            } = req.body;
            const job_id = req.params.jobId;

            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                // Update job listing
                await connection.query(
                    `UPDATE job_listings 
                     SET title = ?, description = ?, salary_min = ?, 
                         salary_max = ?, location = ?, job_type = ?
                     WHERE job_id = ?`,
                    [title, description, salary_min, salary_max, location, job_type, job_id]
                );

                // Update required skills
                if (required_skills) {
                    // Remove existing skills
                    await connection.query(
                        'DELETE FROM job_required_skills WHERE job_id = ?',
                        [job_id]
                    );

                    // Add new skills
                    if (required_skills.length > 0) {
                        const skillValues = required_skills.map(skill_id => [job_id, skill_id]);
                        await connection.query(
                            'INSERT INTO job_required_skills (job_id, skill_id) VALUES ?',
                            [skillValues]
                        );
                    }
                }

                await connection.commit();
                res.json({ message: 'Job updated successfully' });
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error updating job:', error);
            res.status(500).json({ message: 'Error updating job listing' });
        }
    }
};

module.exports = jobController;
