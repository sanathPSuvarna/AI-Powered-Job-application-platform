// models/EmployerProfile.js
const db = require('../config/database');

class EmployerProfile {
    constructor(userId, companyName, industry, companySize, companyDescription, websiteUrl) {
        this.userId = userId;
        this.companyName = companyName;
        this.industry = industry;
        this.companySize = companySize;
        this.companyDescription = companyDescription;
        this.websiteUrl = websiteUrl;
    }

    async save() {
        try {
            const [result] = await db.execute(
                `INSERT INTO employer_profiles 
                (user_id, company_name, industry, company_size, company_description, website_url) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [this.userId, this.companyName, this.industry, this.companySize, 
                 this.companyDescription, this.websiteUrl]
            );
            return result.insertId;
        } catch (error) {
            throw new Error('Could not create employer profile: ' + error.message);
        }
    }

    static async findByUserId(userId) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM employer_profiles WHERE user_id = ?',
                [userId]
            );
            return rows[0];
        } catch (error) {
            throw new Error('Error finding employer profile: ' + error.message);
        }
    }
    static async updateProfile(userId, companyName, industry, companySize, companyDescription, websiteUrl) {
        try {
            const [result] = await db.execute(
                `UPDATE employer_profiles SET company_name = ?, industry = ?, company_size = ?, company_description = ?, website_url = ? WHERE user_id = ?`,
                [companyName, industry, companySize, companyDescription, websiteUrl, userId]
            );
            return result.affectedRows;
        } catch (error) {
            throw new Error('Could not update employer profile: ' + error.message);
        }
    }
}

module.exports = EmployerProfile;
