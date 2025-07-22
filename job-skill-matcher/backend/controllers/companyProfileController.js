// controllers/companyProfileController.js
const CompanyProfile = require('../models/CompanyProfile');

const companyProfileController = {
    createProfile: async (req, res) => {
        try {
            const { companyName, industry, companySize, companyDescription, websiteUrl } = req.body;
            const userId = req.user.userId; // From auth middleware

            const profile = new CompanyProfile(
                userId, 
                companyName, 
                industry, 
                companySize, 
                companyDescription, 
                websiteUrl
            );
            
            const profileId = await profile.save();
            res.status(201).json({ 
                message: 'Company profile created successfully',
                profileId 
            });
        } catch (error) {
            console.error('Profile creation error:', error);
            res.status(500).json({ message: 'Error creating company profile' });
        }
    },

    getProfile: async (req, res) => {
        try {
            const userId = req.user.userId;
            const profile = await CompanyProfile.findByUserId(userId);
            
            if (!profile) {
                return res.status(404).json({ message: 'Profile not found' });
            }
            
            res.json(profile);
        } catch (error) {
            console.error('Profile fetch error:', error);
            res.status(500).json({ message: 'Error fetching company profile' });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const { companyName, industry, companySize, companyDescription, websiteUrl } = req.body;
            const employerId = req.params.employerId;

            const success = await CompanyProfile.update(employerId, {
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
            res.status(500).json({ message: 'Error updating company profile' });
        }
    }
};

module.exports = companyProfileController;
