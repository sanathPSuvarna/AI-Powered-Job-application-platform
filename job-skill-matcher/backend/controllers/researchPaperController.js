// backend/controllers/researchController.js
const research = require('../models/ReasearchPaper');
const db = require('../config/database');

const researchController = {
    getAllResearchPapers: async (req, res) => {
        try {
            const [papers] = await db.query('SELECT * FROM research_papers');
            res.json(papers);
        } catch (error) {
            console.error('Error fetching research papers:', error);
            res.status(500).json({ message: 'Error fetching research papers' });
        }
    },

    getResearchPaperById: async (req, res) => {
        try {
            const [paper] = await db.query('SELECT * FROM research_papers WHERE paper_id = ?', [req.params.id]);
            if (paper.length === 0) {
                return res.status(404).json({ message: 'Research paper not found' });
            }
            res.json(paper[0]);
        } catch (error) {
            console.error('Error fetching research paper:', error);
            res.status(500).json({ message: 'Error fetching research paper' });
        }
    },

    createResearchPaper: async (req, res) => {
        try {
            const { profile_id, title, publication_date, journal_name, paper_url } = req.body;
            const [result] = await db.query(
                'INSERT INTO research_papers (profile_id, title, publication_date, journal_name, paper_url) VALUES (?, ?, ?, ?, ?)',
                [profile_id, title, publication_date, journal_name, paper_url]
            );
            res.status(201).json({ id: result.insertId, message: 'Research paper created successfully' });
        } catch (error) {
            console.error('Error creating research paper:', error);
            res.status(500).json({ message: 'Error creating research paper' });
        }
    },

    updateResearchPaper: async (req, res) => {
        try {
            const { profile_id, title, publication_date, journal_name, paper_url } = req.body;
            const [result] = await db.query(
                'UPDATE research_papers SET profile_id = ?, title = ?, publication_date = ?, journal_name = ?, paper_url = ? WHERE paper_id = ?',
                [profile_id, title, publication_date, journal_name, paper_url, req.params.id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Research paper not found' });
            }
            res.json({ message: 'Research paper updated successfully' });
        } catch (error) {
            console.error('Error updating research paper:', error);
            res.status(500).json({ message: 'Error updating research paper' });
        }
    },

    deleteResearchPaper: async (req, res) => {
        try {
            const [result] = await db.query('DELETE FROM research_papers WHERE paper_id = ?', [req.params.id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Research paper not found' });
            }
            res.json({ message: 'Research paper deleted successfully' });
        } catch (error) {
            console.error('Error deleting research paper:', error);
            res.status(500).json({ message: 'Error deleting research paper' });
        }
    }
};

module.exports = researchController;
