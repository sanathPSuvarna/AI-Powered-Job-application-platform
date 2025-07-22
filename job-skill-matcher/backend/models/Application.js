// models/Application.js

const db = require('../config/database');

class Application {
    // Create new application
    static async createApplication(jobId, profileId) {
        try {
            const [result] = await db.query(
                'INSERT INTO job_applications (job_id, profile_id) VALUES (?, ?)',
                [jobId, profileId]
            );
            return result.insertId;
        } catch (error) {
            throw new Error('Error creating application: ' + error.message);
        }
    }

    // Update application status
    static async updateStatus(applicationId, status) {
        try {
            const [result] = await db.query(
                'UPDATE job_applications SET status = ? WHERE application_id = ?',
                [status, applicationId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error updating application status: ' + error.message);
        }
    }

    // Get applications by job seeker
    static async getJobSeekerApplications(profileId) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM job_applications WHERE profile_id = ?',
                [profileId]
            );
            return rows;
        } catch (error) {
            throw new Error('Error fetching applications: ' + error.message);
        }
    }
}

module.exports = Application;
