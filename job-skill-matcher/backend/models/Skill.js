// models/Skill.js

const db = require('../config/database');

class Skill {
    // Get all skills
    static async getAllSkills() {
        try {
            const [rows] = await db.query('SELECT * FROM skills');
            return rows;
        } catch (error) {
            throw new Error('Error fetching skills: ' + error.message);
        }
    }

    // Add new skill
    static async addSkill(skillName) {
        try {
            const [result] = await db.query(
                'INSERT INTO skills (skill_name) VALUES (?)',
                [skillName]
            );
            return result.insertId;
        } catch (error) {
            throw new Error('Error adding skill: ' + error.message);
        }
    }

    // Add skills to job seeker
    static async addJobSeekerSkill(profileId, skillId, proficiencyLevel) {
        try {
            const [result] = await db.query(
                'INSERT INTO job_seeker_skills (profile_id, skill_id, proficiency_level) VALUES (?, ?, ?)',
                [profileId, skillId, proficiencyLevel]
            );
            return result.insertId;
        } catch (error) {
            throw new Error('Error adding job seeker skill: ' + error.message);
        }
    }
    // Add required skills to a job listing
    static async addJobRequiredSkill(jobId, skillId) {
        try {
            const [result] = await db.query(
                'INSERT INTO job_required_skills (job_id, skill_id) VALUES (?, ?)',
                [jobId, skillId]
            );
            return result.insertId;
        } catch (error) {
            throw new Error('Error adding required skill to job: ' + error.message);
        }
    }

    // Remove a required skill from a job listing
    static async removeJobRequiredSkill(jobId, skillId) {
        try {
            const [result] = await db.query(
                'DELETE FROM job_required_skills WHERE job_id = ? AND skill_id = ?',
                [jobId, skillId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error removing required skill from job: ' + error.message);
        }
    }
        // Get all required skills for a specific job
    static async getJobRequiredSkills(jobId) {
        try {
            const [rows] = await db.query(
                `SELECT s.* FROM skills s 
                JOIN job_required_skills jrs ON s.skill_id = jrs.skill_id 
                WHERE jrs.job_id = ?`,
                [jobId]
            );
            return rows;
        } catch (error) {
            throw new Error('Error fetching job required skills: ' + error.message);
        }
    }

    static async findMatchingJobs(profileId) {
        try {
            const [rows] = await db.query(`
                SELECT DISTINCT j.*, 
                        COUNT(jrs.skill_id) as matched_skills,
                        (COUNT(jrs.skill_id) * 100.0 / total_required.cnt) as match_percentage,
                        ep.company_name
                FROM job_listings j
                JOIN job_required_skills jrs ON j.job_id = jrs.job_id
                JOIN employer_profiles ep ON j.employer_id = ep.employer_id
                JOIN (
                    SELECT job_id, COUNT(*) as cnt 
                    FROM job_required_skills 
                    GROUP BY job_id
                ) total_required ON j.job_id = total_required.job_id
                WHERE jrs.skill_id IN (
                    SELECT skill_id 
                    FROM job_seeker_skills 
                    WHERE profile_id = ?
                )
                AND j.status = 'open'
                GROUP BY j.job_id, j.title, j.description, j.location, j.job_type, 
                         j.salary_min, j.salary_max, ep.company_name
                HAVING match_percentage > 0
                ORDER BY match_percentage DESC`,
                [profileId]
            );
            return rows;
        } catch (error) {
            throw new Error('Error finding matching jobs: ' + error.message);
        }
    }
    

} 

module.exports = Skill;
