// controllers/resumeSkillController.js
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const db = require('../config/database');

const resumeSkillController = {
    // Extract skills from uploaded resume
    extractSkills: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const userId = req.user.userId;
            const filePath = req.file.path;            // Use the local Python script
            const pythonProcess = spawn('python', [
                path.join(__dirname, '../resume_parser_cli.py'),
                filePath,
                'extract_skills'
            ]);

            let dataString = '';
            let errorString = '';

            pythonProcess.stdout.on('data', (data) => {
                dataString += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorString += data.toString();
            });            pythonProcess.on('close', async (code) => {
                // Clean up the temporary file
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } catch (err) {
                    console.error('Error deleting temporary file:', err);
                }
                
                if (code !== 0) {
                    console.error(`Python process exited with code ${code}`);
                    console.error(`Error: ${errorString}`);
                    return res.status(500).json({ 
                        message: 'Error extracting skills', 
                        error: errorString 
                    });
                }
                
                try {
                    // Parse the skills from the Python script output
                    let extractedSkills = [];
                    try {
                        extractedSkills = JSON.parse(dataString);
                    } catch (parseError) {
                        console.error('Error parsing Python output:', parseError);
                        console.log('Raw output:', dataString);
                        return res.status(500).json({ 
                            message: 'Error parsing skills from resume', 
                            error: parseError.message 
                        });
                    }
                    
                    // Get profile_id
                    const [profiles] = await db.query(
                        'SELECT profile_id FROM job_seeker_profiles WHERE user_id = ?',
                        [userId]
                    );

                    if (profiles.length === 0) {
                        return res.status(404).json({ message: 'Profile not found' });
                    }
                    
                    const profileId = profiles[0].profile_id;
                    
                    // Get all skills from database
                    const [allSkills] = await db.query('SELECT * FROM skills');                    // Match extracted skills with skills in database
                    const matchedSkills = [];
                    const unmatchedSkills = [];
                    
                    for (const extractedItem of extractedSkills) {
                        // Handle both formats: string or object with skill and category
                        const extractedSkill = typeof extractedItem === 'string' ? extractedItem : extractedItem.skill;
                        // Normalize both sides of the comparison
                        const normalizedExtractedSkill = extractedSkill.toLowerCase().trim();
                        
                        // First look for exact matches
                        const exactMatch = allSkills.find(
                            skill => skill.skill_name.toLowerCase() === normalizedExtractedSkill
                        );
                        
                        if (exactMatch) {
                            if (!matchedSkills.some(s => s.skill_id === exactMatch.skill_id)) {
                                matchedSkills.push(exactMatch);
                            }
                        } else {
                            // Try partial matching for technology names
                            const partialMatch = allSkills.find(skill => {
                                const normalizedSkillName = skill.skill_name.toLowerCase();
                                return normalizedSkillName.includes(normalizedExtractedSkill) || 
                                       normalizedExtractedSkill.includes(normalizedSkillName);
                            });
                            
                            if (partialMatch) {
                                if (!matchedSkills.some(s => s.skill_id === partialMatch.skill_id)) {
                                    matchedSkills.push(partialMatch);
                                }
                            } else {
                                // Only add to unmatched if it's not already there
                                if (!unmatchedSkills.includes(extractedSkill)) {
                                    unmatchedSkills.push(extractedSkill);
                                }
                            }
                        }
                    }
                    
                    res.json({
                        matchedSkills,
                        unmatchedSkills,
                        message: 'Skills extracted successfully'
                    });
                    
                } catch (error) {
                    console.error('Error processing extracted skills:', error);
                    return res.status(500).json({ 
                        message: 'Error processing extracted skills',
                        error: error.message 
                    });
                }
            });
            
        } catch (error) {
            console.error('Error extracting skills from resume:', error);
            res.status(500).json({ 
                message: 'Error extracting skills from resume',
                error: error.message
            });
        }
    },
      // Add all extracted skills to user profile
    addExtractedSkills: async (req, res) => {
        try {
            const { skillIds, defaultProficiency = 'beginner' } = req.body;
            const userId = req.user.userId;
            
            // Validate skillIds input
            if (!skillIds || !Array.isArray(skillIds) || skillIds.length === 0) {
                return res.status(400).json({ message: 'No skills provided to add' });
            }
            
            // Get profile_id
            const [profiles] = await db.query(
                'SELECT profile_id FROM job_seeker_profiles WHERE user_id = ?',
                [userId]
            );

            if (profiles.length === 0) {
                return res.status(404).json({ message: 'Profile not found' });
            }
            
            const profileId = profiles[0].profile_id;
            
            // Check which skills already exist for the user
            const [existingSkills] = await db.query(
                'SELECT skill_id FROM job_seeker_skills WHERE profile_id = ? AND skill_id IN (?)',
                [profileId, skillIds]
            );
            
            const existingSkillIds = existingSkills.map(skill => skill.skill_id);
            const skillsToAdd = skillIds.filter(skillId => !existingSkillIds.includes(parseInt(skillId)));
            
            if (skillsToAdd.length === 0) {
                return res.json({ message: 'No new skills to add' });
            }
            
            // Prepare batch insert values
            const values = skillsToAdd.map(skillId => [profileId, skillId, defaultProficiency]);
            
            // Insert new skills
            await db.query(
                'INSERT INTO job_seeker_skills (profile_id, skill_id, proficiency_level) VALUES ?',
                [values]
            );
            
            res.status(201).json({ 
                message: 'Skills added successfully',
                addedCount: skillsToAdd.length
            });
            
        } catch (error) {
            console.error('Error adding extracted skills:', error);
            res.status(500).json({ 
                message: 'Error adding extracted skills',
                error: error.message
            });
        }
    }
};

module.exports = resumeSkillController;
