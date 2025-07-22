// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');

// Protected routes - require authentication
router.use(authMiddleware);

router.post('/', profileController.createProfile);
router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

module.exports = router;
