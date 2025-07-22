// controllers/skillController.js
const Skill = require('../models/Skill');
const db = require('../config/database');

const skillController = {
    // Get all available skills
    getAllSkills: async (req, res) => {
        try {
            const [skills] = await db.query('SELECT * FROM skills');
            res.json(skills);
        } catch (error) {
            console.error('Error fetching skills:', error);
            res.status(500).json({ message: 'Error fetching skills' });
        }
    },
    
    // Add a new skill to user profile
addUserSkill: async (req, res) => {
    try {
        const { skillId, proficiencyLevel } = req.body;
        const userId = req.user.userId;

        // Get profile_id
        const [profiles] = await db.query(
            'SELECT profile_id FROM job_seeker_profiles WHERE user_id = ?',
            [userId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const profileId = profiles[0].profile_id;

        // Check if skill already exists for user
        const [existingSkill] = await db.query(
            'SELECT * FROM job_seeker_skills WHERE profile_id = ? AND skill_id = ?',
            [profileId, skillId]
        );

        if (existingSkill.length > 0) {
            return res.status(400).json({ message: 'Skill already exists for user' });
        }

        // Insert new skill
        await db.query(
            'INSERT INTO job_seeker_skills (profile_id, skill_id, proficiency_level) VALUES (?, ?, ?)',
            [profileId, skillId, proficiencyLevel]
        );

        res.status(201).json({ message: 'Skill added successfully' });
    } catch (error) {
        console.error('Error adding skill:', error);
        res.status(500).json({ message: 'Error adding skill', error: error.message });
    }
}
,

deleteUserSkill: async (req, res) => {
    try {
        const skillId = req.params.skillId;
        const userId = req.user.userId;

        // Get profile_id
        const [profiles] = await db.query(
            'SELECT profile_id FROM job_seeker_profiles WHERE user_id = ?',
            [userId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const profileId = profiles[0].profile_id;

        await db.query(
            'DELETE FROM job_seeker_skills WHERE profile_id = ? AND skill_id = ?',
            [profileId, skillId]
        );

        res.json({ message: 'Skill removed successfully' });
    } catch (error) {
        console.error('Error removing skill:', error);
        res.status(500).json({ message: 'Error removing skill' });
    }
}
,

getUserSkills: async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const [skills] = await db.query(
            `SELECT s.skill_id, s.skill_name, js.proficiency_level 
             FROM skills s
             JOIN job_seeker_skills js ON s.skill_id = js.skill_id
             JOIN job_seeker_profiles jsp ON js.profile_id = jsp.profile_id
             WHERE jsp.user_id = ?`,
            [userId]
        );
        
        res.json(skills);
    } catch (error) {
        console.error('Error fetching user skills:', error);
        res.status(500).json({ message: 'Error fetching user skills' });
    }
}

,
    // Add a skill to a job listing
    addJobSkill: async (req, res) => {
        try {
            const { job_id, skill_id } = req.body;
            await db.query(
                'INSERT INTO job_required_skills (job_id, skill_id) VALUES (?, ?)',
                [job_id, skill_id]
            );
            res.status(201).json({ message: 'Skill added to job successfully' });
        } catch (error) {
            console.error('Error adding job skill:', error);
            res.status(500).json({ message: 'Error adding skill to job' });
        }
    },

    // Remove a skill from a job listing
    removeJobSkill: async (req, res) => {
        try {
            const { job_id, skill_id } = req.params;
            await db.query(
                'DELETE FROM job_required_skills WHERE job_id = ? AND skill_id = ?',
                [job_id, skill_id]
            );
            res.json({ message: 'Skill removed from job successfully' });
        } catch (error) {
            console.error('Error removing job skill:', error);
            res.status(500).json({ message: 'Error removing skill from job' });
        }
    },

    // Get matching jobs based on user skills
    getMatchingJobs: async (req, res) => {
        try {
            const userId = req.user.userId;

            // Get profile_id using the same approach as other methods
            const [profiles] = await db.query(
                'SELECT profile_id FROM job_seeker_profiles WHERE user_id = ?',
                [userId]
            );

            if (profiles.length === 0) {
                return res.status(404).json({ message: 'Profile not found' });
            }

            const profileId = profiles[0].profile_id;
            
            // Now use the Skill model to find matching jobs
            const matchingJobs = await Skill.findMatchingJobs(profileId);
            
            // Add some logging to help debug
            console.log(`Found ${matchingJobs.length} matching jobs for profile ${profileId}`);
            
            res.json(matchingJobs);
        } catch (error) {
            console.error('Error finding matching jobs:', error);
            res.status(500).json({ message: 'Error finding matching jobs', error: error.message });
        }
    }
    
};

module.exports = skillController;
