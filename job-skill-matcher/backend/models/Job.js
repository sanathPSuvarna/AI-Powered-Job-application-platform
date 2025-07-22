// models/Job.js
const db = require('../config/database');

class Job {
    constructor(employerId, title, description, salaryMin, salaryMax, location, jobType) {
        this.employerId = employerId;
        this.title = title;
        this.description = description;
        this.salaryMin = salaryMin;
        this.salaryMax = salaryMax;
        this.location = location;
        this.jobType = jobType;
    }

    async save() {
        try {
            const [result] = await db.execute(
                `INSERT INTO job_listings 
                (employer_id, title, description, salary_min, salary_max, location, job_type) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [this.employerId, this.title, this.description, 
                 this.salaryMin, this.salaryMax, this.location, this.jobType]
            );
            return result.insertId;
        } catch (error) {
            throw new Error('Could not create job listing: ' + error.message);
        }
    }

    static async findById(jobId) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM job_listings WHERE job_id = ?',
                [jobId]
            );
            return rows[0];
        } catch (error) {
            throw new Error('Error finding job: ' + error.message);
        }
    }

    static async findAll(filters = {}) {
        try {
            let query = 'SELECT * FROM job_listings WHERE status = "open"';
            const params = [];

            if (filters.location) {
                query += ' AND location = ?';
                params.push(filters.location);
            }

            if (filters.jobType) {
                query += ' AND job_type = ?';
                params.push(filters.jobType);
            }

            const [rows] = await db.execute(query, params);
            return rows;
        } catch (error) {
            throw new Error('Error fetching jobs: ' + error.message);
        }
    }
    
}

module.exports = Job;
