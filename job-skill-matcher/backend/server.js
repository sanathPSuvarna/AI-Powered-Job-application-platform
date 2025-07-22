// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const skillRoutes = require('./routes/skillRoutes');
const jobRoutes = require('./routes/jobRoutes');
const companyProfileRoutes = require('./routes/companyProfileRoutes');
const employerProfileRoutes = require('./routes/employerProfileRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const researchPaperRoutes = require('./routes/researchPaperRoutes');
const resumeSkillRoutes = require('./routes/resumeSkillRoutes');

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Basic route for testing
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

app.use('/api/skill', skillRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/company-profile', companyProfileRoutes);
app.use('/api/employer-profile', employerProfileRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/research-papers', researchPaperRoutes);
app.use('/api/resume-skills', resumeSkillRoutes);
app.get('/api/test', (req, res) => {
    res.json({ message: 'Welcome to Job Skill Matcher API' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
