// backend/routes/researchPaperRoutes.js
const express = require('express');
const router = express.Router();
const researchController = require('../controllers/researchPaperController'); 
const auth = require('../middleware/auth'); // Assuming you have auth middleware

router.get('/', researchController.getAllResearchPapers); 

router.get('/:id', researchController.getResearchPaperById);

router.post('/', auth, researchController.createResearchPaper); 

router.put('/:id', auth, researchController.updateResearchPaper); 

router.delete('/:id', auth, researchController.deleteResearchPaper);

module.exports = router;

