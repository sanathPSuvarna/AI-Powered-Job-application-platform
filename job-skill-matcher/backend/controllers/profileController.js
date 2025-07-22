// controllers/profileController.js
const db = require('../config/database');
const JobSeekerProfile = require('../models/JobSeekersProfile');

const profileController = {
    // Create profile for newly registered user
    createProfile: async (req, res) => {
        try {
            const { firstName, lastName, professionalStatus, experienceYears, bio } = req.body;
            const userId = req.user.userId; // From auth middleware

            const profile = new JobSeekerProfile(
                userId, 
                firstName, 
                lastName, 
                professionalStatus, 
                experienceYears, 
                bio
            );
            
            const profileId = await profile.save();
            res.status(201).json({ 
                message: 'Profile created successfully',
                profileId 
            });
        } catch (error) {
            console.error('Profile creation error:', error);
            res.status(500).json({ message: 'Error creating profile' });
        }
    },

    // Get user profile
    getProfile: async (req, res) => {
        try {
            const userId = req.user.userId;
            const profile = await JobSeekerProfile.findByUserId(userId);
            
            if (!profile) {
                return res.status(404).json({ message: 'Profile not found' });
            }
            
            res.json(profile);
        } catch (error) {
            console.error('Profile fetch error:', error);
            res.status(500).json({ message: 'Error fetching profile' });
        }
    },
// backend/controllers/profileController.js

updateProfile: async (req, res) => {
    try {
        const { firstName, lastName, professionalStatus, experienceYears, bio } = req.body;
        const userId = req.user.userId;

        // First get the profile_id
        const [profiles] = await db.query(
            'SELECT profile_id FROM job_seeker_profiles WHERE user_id = ?',
            [userId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const profileId = profiles[0].profile_id;

        const [result] = await db.query(
            `UPDATE job_seeker_profiles 
             SET first_name = ?, last_name = ?, professional_status = ?, 
                 experience_years = ?, bio = ?
             WHERE profile_id = ?`,
            [firstName, lastName, professionalStatus, experienceYears, bio, profileId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
}


};


module.exports = profileController;
