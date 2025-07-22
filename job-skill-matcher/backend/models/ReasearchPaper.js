const db = require('../config/database');

class ResearchPaper {
    // Add a new research paper
    static async addPaper(profileId, title, publicationDate, journalName, paperUrl) {
        try {
            const [result] = await db.query(
                `INSERT INTO research_papers 
                (profile_id, title, publication_date, journal_name, paper_url)
                VALUES (?, ?, ?, ?, ?)`,
                [profileId, title, publicationDate, journalName, paperUrl]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Get research papers by profile ID
    static async getPapersByProfileId(profileId) {
        try {
            const [papers] = await db.query(
                'SELECT * FROM research_papers WHERE profile_id = ?',
                [profileId]
            );
            return papers;
        } catch (error) {
            throw error;
        }
    }

    // Get research papers by user ID
    static async getPapersByUserId(userId) {
        try {
            const [papers] = await db.query(
                `SELECT r.* 
                FROM research_papers r
                JOIN job_seeker_profiles p ON r.profile_id = p.profile_id
                WHERE p.user_id = ?`,
                [userId]
            );
            return papers;
        } catch (error) {
            throw error;
        }
    }

    // Delete a research paper
    static async deletePaper(paperId, profileId) {
        try {
            const [result] = await db.query(
                'DELETE FROM research_papers WHERE paper_id = ? AND profile_id = ?',
                [paperId, profileId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Update a research paper
    static async updatePaper(paperId, profileId, title, publicationDate, journalName, paperUrl) {
        try {
            const [result] = await db.query(
                `UPDATE research_papers 
                SET title = ?, publication_date = ?, journal_name = ?, paper_url = ?
                WHERE paper_id = ? AND profile_id = ?`,
                [title, publicationDate, journalName, paperUrl, paperId, profileId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async getPaperById(paperId) {
        try {
            const [papers] = await db.query(
                'SELECT * FROM research_papers WHERE paper_id = ?',
                [paperId]
            );
            return papers[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ResearchPaper;
