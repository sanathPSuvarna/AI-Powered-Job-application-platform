// routes/companyProfileRoutes.js
const express = require('express');
const router = express.Router();
const companyProfileController = require('../controllers/companyProfileController');
const authMiddleware = require('../middleware/auth');

// Protected routes - require authentication
router.use(authMiddleware);

router.post('/', companyProfileController.createProfile);
router.get('/', companyProfileController.getProfile);
router.put('/:employerId', companyProfileController.updateProfile);

module.exports = router;
