// backend/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const auth = require('../middleware/auth');

// Ensure the more specific routes come first
router.get('/employer', auth, applicationController.getEmployerApplications);
router.get('/user', auth, applicationController.getUserApplications);
router.get('/:applicationId', auth, applicationController.getApplicationDetails);
router.put('/:applicationId/status', auth, applicationController.updateApplicationStatus);
router.post('/', auth, applicationController.createApplication);

module.exports = router;
