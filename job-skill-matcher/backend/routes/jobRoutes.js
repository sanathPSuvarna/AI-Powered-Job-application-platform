// backend/routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const auth = require('../middleware/auth');

// Reorder routes
router.get('/employer', auth, jobController.getEmployerJobs);  // Move this BEFORE :jobId
router.get('/', jobController.getAllJobs);
router.get('/:jobId', jobController.getJobById);
router.post('/', auth, jobController.createJob);

module.exports = router;
