// routes/resumeSkillRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const resumeSkillController = require('../controllers/resumeSkillController');
const authMiddleware = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Protected routes - require authentication
router.use(authMiddleware);

// Extract skills from resume
router.post('/extract', upload.single('resume'), resumeSkillController.extractSkills);

// Add extracted skills to user profile
router.post('/add-extracted', resumeSkillController.addExtractedSkills);

// Add new skills to the database from unmatched skills
router.post('/add-to-database', resumeSkillController.addSkillsToDatabase);

// Submit feedback for ensemble system improvement
router.post('/submit-feedback', resumeSkillController.submitEnsembleFeedback);

module.exports = router;
