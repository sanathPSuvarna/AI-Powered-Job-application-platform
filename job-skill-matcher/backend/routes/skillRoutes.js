// routes/skillRoutes.js
const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const authMiddleware = require('../middleware/auth');

// Public route - get all skills
router.get('/', skillController.getAllSkills);

// Protected routes - require authentication
router.use(authMiddleware);
router.post('/user-skills', skillController.addUserSkill);
router.post('/job/:jobId/skills', skillController.addJobSkill);
router.get('/matching-jobs', skillController.getMatchingJobs);
router.delete('/user-skills/:skillId', skillController.deleteUserSkill);
router.get('/user-skills', skillController.getUserSkills);


module.exports = router;
