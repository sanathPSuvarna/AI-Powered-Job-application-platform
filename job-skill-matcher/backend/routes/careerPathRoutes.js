// routes/careerPathRoutes.js
const express = require('express');
const router = express.Router();
const careerPathController = require('../controllers/careerPathController');
const auth = require('../middleware/auth');

// Get all available career goals
router.get('/goals', careerPathController.getCareerGoals);

// Get career path steps for a specific goal
router.get('/goals/:goalId/steps', careerPathController.getCareerPathSteps);

// Simulate career path for a user (auth optional - supports both authenticated and guest users)
router.post('/simulate', (req, res, next) => {
    // Make auth optional - if token exists, validate it, otherwise continue as guest
    const token = req.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
        auth(req, res, next);
    } else {
        next();
    }
}, careerPathController.simulateCareerPath);

// Save user's career goal (requires authentication)
router.post('/goals', auth, careerPathController.saveCareerGoal);

// Get user's career goals and progress (requires authentication)
router.get('/my-goals', auth, careerPathController.getUserCareerGoals);

// Get personalized career roadmap for user (requires authentication)
router.get('/roadmap', auth, careerPathController.getPersonalizedRoadmap);

module.exports = router;
