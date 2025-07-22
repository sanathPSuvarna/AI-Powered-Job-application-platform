// models/JobSeekerProfile.js
const db = require('../config/database');

class JobSeekerProfile {
    constructor(userId, firstName, lastName, professionalStatus, experienceYears = null, bio = null) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.professionalStatus = professionalStatus;
        this.experienceYears = experienceYears;
        this.bio = bio;
    }

    async save() {
        try {
            const [result] = await db.execute(
                `INSERT INTO job_seeker_profiles 
                (user_id, first_name, last_name, professional_status, experience_years, bio) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [this.userId, this.firstName, this.lastName, this.professionalStatus, this.experienceYears, this.bio]
            );
            return result.insertId;
        } catch (error) {
            throw new Error('Could not create profile: ' + error.message);
        }
    }

    static async findByUserId(userId) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM job_seeker_profiles WHERE user_id = ?',
                [userId]
            );
            return rows[0];
        } catch (error) {
            throw new Error('Error finding profile: ' + error.message);
        }
    }

    static async updateProfile(profileId, updateData) {
        try {
            const [result] = await db.execute(
                `UPDATE job_seeker_profiles 
                SET first_name = ?, last_name = ?, professional_status = ?, 
                    experience_years = ?, bio = ?
                WHERE profile_id = ?`,
                [updateData.firstName, updateData.lastName, updateData.professionalStatus, 
                 updateData.experienceYears, updateData.bio, profileId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Could not update profile: ' + error.message);
        }
    }
}

module.exports = JobSeekerProfile;
