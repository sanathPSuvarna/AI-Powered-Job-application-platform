const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');

// Start a new interview session
router.post('/start', interviewController.startInterview);

// Get next question
router.post('/next-question', interviewController.getNextQuestion);

// Submit answer
router.post('/submit-answer', interviewController.submitAnswer);

// End interview
router.post('/end', interviewController.endInterview);

// Get session summary
router.get('/session/:sessionId/summary', interviewController.getSessionSummary);

// Get user's interview history
router.get('/history/:userId', interviewController.getInterviewHistory);

// Get user's interview statistics
router.get('/stats/:userId', interviewController.getInterviewStats);

module.exports = router;