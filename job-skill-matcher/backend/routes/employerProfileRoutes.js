// routes/employerProfileRoutes.js
const express = require('express');
const router = express.Router();
const employerProfileController = require('../controllers/employerProfileController');
const authMiddleware = require('../middleware/auth');

// Protected routes - require authentication
router.use(authMiddleware);

router.post('/', employerProfileController.createProfile);
router.get('/', employerProfileController.getProfile);

router.put('/', employerProfileController.updateProfile);

module.exports = router;
