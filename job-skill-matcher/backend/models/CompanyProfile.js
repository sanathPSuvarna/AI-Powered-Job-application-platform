// models/CompanyProfile.js
const db = require('../config/database');

class CompanyProfile {
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
                `INSERT INTO company_profiles (user_id, company_name, industry, company_size, company_description, website_url) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [this.userId, this.companyName, this.industry, this.companySize, this.companyDescription, this.websiteUrl]
            );
            return result.insertId;
        } catch (error) {
            throw new Error('Could not create company profile: ' + error.message);
        }
    }

    static async findByUserId(userId) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM company_profiles WHERE user_id = ?',
                [userId]
            );
            return rows[0];
        } catch (error) {
            throw new Error('Error finding company profile: ' + error.message);
        }
    }

    static async updateByUserId(userId, profileData) {
        try {
            const { companyName, industry, companySize, companyDescription, websiteUrl } = profileData;
            const [result] = await db.execute(
                `UPDATE company_profiles 
                 SET company_name = ?, industry = ?, company_size = ?, company_description = ?, website_url = ? 
                 WHERE user_id = ?`,
                [companyName, industry, companySize, companyDescription, websiteUrl, userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error updating company profile: ' + error.message);
        }
    }

    static async findAll() {
        try {
            const [rows] = await db.execute('SELECT * FROM company_profiles');
            return rows;
        } catch (error) {
            throw new Error('Error fetching company profiles: ' + error.message);
        }
    }
}

module.exports = CompanyProfile;
