// controllers/employerProfileController.js
const { update } = require('../models/CompanyProfile');
const EmployerProfile = require('../models/EmployerProfile');
const db = require('../config/database');

const employerProfileController = {
    createProfile: async (req, res) => {
        try {
            const { 
                companyName, 
                industry, 
                companySize, 
                companyDescription, 
                websiteUrl 
            } = req.body;
            const userId = req.user.userId; // From auth middleware

            const profile = new EmployerProfile(
                userId,
                companyName,
                industry,
                companySize,
                companyDescription,
                websiteUrl
            );
            
            const profileId = await profile.save();
            res.status(201).json({ 
                message: 'Employer profile created successfully',
                profileId 
            });
        } catch (error) {
            console.error('Profile creation error:', error);
            res.status(500).json({ message: 'Error creating employer profile' });
        }
    },

    getProfile: async (req, res) => {
        try {
            const userId = req.user.userId;
            const profile = await EmployerProfile.findByUserId(userId);
            
            if (!profile) {
                return res.status(404).json({ message: 'Profile not found' });
            }
            
            res.json(profile);
        } catch (error) {
            console.error('Profile fetch error:', error);
            res.status(500).json({ message: 'Error fetching profile' });
        }
    },

   // backend/controllers/employerProfileController.js
updateProfile: async (req, res) => {
    try {
        const { 
            companyName, 
            industry, 
            companySize, 
            companyDescription, 
            websiteUrl 
        } = req.body;
        const userId = req.user.userId; 
        // Get userId from JWT token

        // First get the employer_id using user_id
        
        const [employers] = await db.query(
            'SELECT employer_id FROM employer_profiles WHERE user_id = ?',
            [userId]
        );

        if (employers.length === 0) {
            return res.status(404).json({ message: 'Employer profile not found' });
        }

        const employerId = employers[0].employer_id;

        const success = await EmployerProfile.update(employerId, {
            companyName,
            industry,
            companySize,
            companyDescription,
            websiteUrl
        });

        if (success) {
            res.json({ message: 'Profile updated successfully' });
        } else {
            res.status(404).json({ message: 'Profile not found' });
        }
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
}
};

module.exports = employerProfileController;
