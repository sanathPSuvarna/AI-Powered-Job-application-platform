// backend/controllers/applicationController.js
const db = require('../config/database');

const applicationController = {
    getUserApplications: async (req, res) => {
        try {
            const userId = req.user.userId;
            
            const [applications] = await db.query(
                `SELECT ja.*, jl.title as job_title, ep.company_name 
                FROM job_applications ja 
                JOIN job_listings jl ON ja.job_id = jl.job_id 
                JOIN employer_profiles ep ON jl.employer_id = ep.employer_id 
                WHERE ja.profile_id = (
                    SELECT profile_id FROM job_seeker_profiles 
                    WHERE user_id = ?
                )`,
                [userId]
            );
            
            res.json(applications);
        } catch (error) {
            console.error('Error fetching applications:', error);
            res.status(500).json({ message: 'Error fetching applications' });
        }
    },

    getEmployerApplications: async (req, res) => {
        try {
            const userId = req.user.userId;
            
            const [applications] = await db.query(
                `SELECT ja.*, jl.title as job_title, 
                        CONCAT(jsp.first_name, ' ', jsp.last_name) as applicant_name 
                FROM job_applications ja 
                JOIN job_listings jl ON ja.job_id = jl.job_id 
                JOIN job_seeker_profiles jsp ON ja.profile_id = jsp.profile_id 
                WHERE jl.employer_id = (
                    SELECT employer_id FROM employer_profiles 
                    WHERE user_id = ?
                )`,
                [userId]
            );
            
            res.json(applications);
        } catch (error) {
            console.error('Error fetching applications:', error);
            res.status(500).json({ message: 'Error fetching applications' });
        }
    },
    createApplication: async (req, res) => {
        try {
            const { jobId, profileId } = req.body;
            const userId = req.user.userId;
            
            // Verify the profile belongs to the user
            const [profiles] = await db.query(
                'SELECT profile_id FROM job_seeker_profiles WHERE user_id = ? AND profile_id = ?',
                [userId, profileId]
            );
            
            if (profiles.length === 0) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
    
            // Insert the application
            const [result] = await db.query(
                'INSERT INTO job_applications (job_id, profile_id, status) VALUES (?, ?, "pending")',
                [jobId, profileId]
            );
    
            res.status(201).json({ 
                message: 'Application submitted successfully',
                applicationId: result.insertId 
            });
        } catch (error) {
            console.error('Error creating application:', error);
            res.status(500).json({ message: 'Error submitting application' });
        }
    },
getApplicationDetails: async (req, res) => {
    try {
        const { applicationId } = req.params;
        const userId = req.user.userId;

        console.log('Fetching application details for:', { applicationId, userId }); // Debug log

        // First verify employer ID
        const [employers] = await db.query(
            'SELECT employer_id FROM employer_profiles WHERE user_id = ?',
            [userId]
        );

        if (employers.length === 0) {
            return res.status(403).json({ message: 'Employer profile not found' });
        }

        const employerId = employers[0].employer_id;

        // Modified query to match your database structure
        const [applications] = await db.query(
            `SELECT 
                ja.application_id,
                ja.status,
                ja.application_date,
                jl.title as job_title,
                jl.location,
                jl.job_type,
                CONCAT(jsp.first_name, ' ', jsp.last_name) as applicant_name,
                jsp.professional_status,
                jsp.experience_years,
                jsp.profile_id
            FROM job_applications ja 
            JOIN job_listings jl ON ja.job_id = jl.job_id 
            JOIN job_seeker_profiles jsp ON ja.profile_id = jsp.profile_id
            WHERE ja.application_id = ? 
            AND jl.employer_id = ?`,
            [applicationId, employerId]
        );

        console.log('Query result:', applications); // Debug log

        if (!applications || applications.length === 0) {
            return res.status(404).json({ 
                message: 'Application not found or you do not have permission to view it' 
            });
        }

        // Get applicant's skills
        const [skills] = await db.query(
            `SELECT s.skill_name, us.proficiency_level
            FROM job_seeker_skills us
            JOIN skills s ON us.skill_id = s.skill_id
            WHERE us.profile_id = ?`,
            [applications[0].profile_id]
        );

        const applicationData = {
            ...applications[0],
            skills: skills || []
        };

        res.json(applicationData);

    } catch (error) {
        console.error('Error in getApplicationDetails:', error);
        res.status(500).json({ 
            message: 'Error fetching application details',
            error: error.message 
        });
    }
},


updateApplicationStatus: async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;
        const userId = req.user.userId;

        // Verify the application belongs to the employer
        const [application] = await db.query(
            `SELECT ja.* FROM job_applications ja 
            JOIN job_listings jl ON ja.job_id = jl.job_id
            WHERE ja.application_id = ? 
            AND jl.employer_id = (
                SELECT employer_id FROM employer_profiles WHERE user_id = ?
            )`,
            [applicationId, userId]
        );

        if (application.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Update the status
        await db.query(
            'UPDATE job_applications SET status = ? WHERE application_id = ?',
            [status, applicationId]
        );

        res.json({ message: 'Application status updated successfully' });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ message: 'Error updating application status' });
    }
}

    
};


module.exports = applicationController;
