// controllers/resumeSkillController.js
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const db = require('../config/database');

const resumeSkillController = {
    // Extract skills from uploaded resume using Large-Scale Skills Model
    extractSkills: async (req, res) => {
        console.log('🚀 extractSkills endpoint called');
        console.log('Request headers:', req.headers);
        console.log('Request user:', req.user);
        console.log('Request file:', req.file);
        
        try {
            if (!req.file) {
                console.log('❌ No file uploaded');
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const userId = req.user.userId;
            const filePath = req.file.path;
            
            console.log('🚀 Starting skill extraction with Enhanced Ensemble System...');
            console.log(`📄 Processing file: ${path.basename(filePath)}`);
            
            // Use the enhanced ensemble skill extraction system
            const pythonProcess = spawn('python', [
                path.join(__dirname, '../enhanced_resume_parser_cli.py'),
                filePath,
                'extract_skills',
                '--user-id', userId.toString()
            ]);

            let dataString = '';
            let errorString = '';

            pythonProcess.stdout.on('data', (data) => {
                dataString += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorString += data.toString();
                // Log skill detection progress
                if (data.toString().includes('Detected skill:')) {
                    console.log('🎯', data.toString().trim());
                }
            });

            pythonProcess.on('close', async (code) => {
                // Clean up the temporary file
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } catch (err) {
                    console.error('Error deleting temporary file:', err);
                }
                
                if (code !== 0) {
                    console.error(`❌ Enhanced ensemble extraction failed with code ${code}`);
                    console.error(`Error: ${errorString}`);
                    return res.status(500).json({ 
                        message: 'Error extracting skills with Enhanced Ensemble System', 
                        error: errorString 
                    });
                }
                
                try {
                    // Parse the skills from the Enhanced Ensemble System output
                    let extractedSkills = [];
                    try {
                        extractedSkills = JSON.parse(dataString);
                        console.log(`✅ Enhanced Ensemble System extracted ${extractedSkills.length} skills`);
                    } catch (parseError) {
                        console.error('❌ Error parsing Enhanced Ensemble System output:', parseError);
                        console.log('Raw output:', dataString);
                        return res.status(500).json({ 
                            message: 'Error parsing skills from Enhanced Ensemble System', 
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
                    const [allSkills] = await db.query('SELECT * FROM skills');
                    
                    // Enhanced skill matching leveraging Ensemble System categories and confidence
                    const matchedSkills = [];
                    const unmatchedSkills = [];
                    const skillsByCategory = {};
                    const ensembleMetrics = {
                        spacy_skills: 0,
                        fuzzy_skills: 0,
                        tfidf_skills: 0,
                        embedding_skills: 0,
                        ensemble_skills: 0
                    };
                    
                    for (const extractedItem of extractedSkills) {
                        // Handle enhanced format from Ensemble System (skill, category, confidence, method)
                        const extractedSkill = extractedItem.skill;
                        const category = extractedItem.category || 'other';
                        const confidence = extractedItem.confidence || 1.0;
                        const method = extractedItem.method || 'unknown';
                        const context = extractedItem.context || '';
                        
                        // Track extraction method metrics
                        if (method === 'spacy') ensembleMetrics.spacy_skills++;
                        else if (method === 'fuzzy') ensembleMetrics.fuzzy_skills++;
                        else if (method === 'tfidf') ensembleMetrics.tfidf_skills++;
                        else if (method === 'embeddings') ensembleMetrics.embedding_skills++;
                        else if (method === 'ensemble') ensembleMetrics.ensemble_skills++;
                        
                        // Normalize for comparison
                        const normalizedExtractedSkill = extractedSkill.toLowerCase().trim();
                        
                        // Enhanced matching algorithm
                        let matchFound = false;
                        
                        // 1. Exact match
                        const exactMatch = allSkills.find(
                            skill => skill.skill_name.toLowerCase() === normalizedExtractedSkill
                        );
                        
                        if (exactMatch && !matchedSkills.some(s => s.skill_id === exactMatch.skill_id)) {
                            matchedSkills.push({
                                ...exactMatch,
                                category: category,
                                confidence: confidence,
                                method: method,
                                context: context,
                                match_type: 'exact'
                            });
                            matchFound = true;
                        }
                        
                        // 2. Fuzzy matching for variations
                        if (!matchFound) {
                            const fuzzyMatch = allSkills.find(skill => {
                                const normalizedSkillName = skill.skill_name.toLowerCase();
                                
                                // Handle common variations
                                const variations = [
                                    // JavaScript variations
                                    (normalizedExtractedSkill === 'js' && normalizedSkillName.includes('javascript')),
                                    (normalizedExtractedSkill === 'javascript' && normalizedSkillName.includes('js')),
                                    
                                    // Node.js variations
                                    (normalizedExtractedSkill === 'nodejs' && normalizedSkillName.includes('node')),
                                    (normalizedExtractedSkill === 'node.js' && normalizedSkillName.includes('node')),
                                    
                                    // Framework variations
                                    (normalizedExtractedSkill.includes('react') && normalizedSkillName.includes('react')),
                                    (normalizedExtractedSkill.includes('angular') && normalizedSkillName.includes('angular')),
                                    
                                    // Database variations
                                    (normalizedExtractedSkill === 'mongodb' && normalizedSkillName.includes('mongo')),
                                    (normalizedExtractedSkill === 'postgresql' && normalizedSkillName.includes('postgres')),
                                    
                                    // Generic partial matching
                                    normalizedSkillName.includes(normalizedExtractedSkill) || 
                                    normalizedExtractedSkill.includes(normalizedSkillName)
                                ];
                                
                                return variations.some(variation => variation);
                            });
                            
                            if (fuzzyMatch && !matchedSkills.some(s => s.skill_id === fuzzyMatch.skill_id)) {
                                matchedSkills.push({
                                    ...fuzzyMatch,
                                    category: category,
                                    confidence: confidence * 0.9, // Slightly lower confidence for fuzzy matches
                                    method: method,
                                    context: context,
                                    match_type: 'fuzzy'
                                });
                                matchFound = true;
                            }
                        }
                        
                        // 3. Add to unmatched if no match found
                        if (!matchFound) {
                            const unmatchedSkill = {
                                skill: extractedSkill,
                                category: category,
                                confidence: confidence,
                                method: method,
                                context: context,
                                suggested_add: confidence > 0.8 // Suggest adding high-confidence unmatched skills
                            };
                            
                            if (!unmatchedSkills.some(s => s.skill.toLowerCase() === normalizedExtractedSkill)) {
                                unmatchedSkills.push(unmatchedSkill);
                            }
                        }
                        
                        // Group skills by category for better organization
                        if (!skillsByCategory[category]) {
                            skillsByCategory[category] = [];
                        }
                        skillsByCategory[category].push({
                            skill: extractedSkill,
                            matched: matchFound,
                            confidence: confidence,
                            method: method
                        });
                    }
                    
                    // Sort matched skills by confidence
                    matchedSkills.sort((a, b) => (b.confidence || 1) - (a.confidence || 1));
                    
                    console.log(`📊 Results: ${matchedSkills.length} matched, ${unmatchedSkills.length} unmatched`);
                    console.log(`🏷️ Categories found: ${Object.keys(skillsByCategory).join(', ')}`);
                    
                    res.json({
                        matchedSkills,
                        unmatchedSkills,
                        skillsByCategory,
                        ensembleMetrics,
                        modelInfo: {
                            name: 'Enhanced Ensemble Skill Extraction System',
                            version: '2.0',
                            methods: ['spaCy NER', 'Fuzzy Matching', 'TF-IDF', 'Semantic Embeddings'],
                            totalSkillsDetected: extractedSkills.length,
                            categories: Object.keys(skillsByCategory),
                            averageConfidence: extractedSkills.reduce((sum, skill) => 
                                sum + (skill.confidence || 1), 0) / extractedSkills.length,
                            extractionBreakdown: ensembleMetrics
                        },
                        message: 'Skills extracted successfully using Enhanced Ensemble System with A/B Testing'
                    });
                    
                } catch (error) {
                    console.error('❌ Error processing Enhanced Ensemble System results:', error);
                    return res.status(500).json({ 
                        message: 'Error processing Enhanced Ensemble System results',
                        error: error.message 
                    });
                }
            });
            
        } catch (error) {
            console.error('❌ Error extracting skills with Enhanced Ensemble System:', error);
            res.status(500).json({ 
                message: 'Error extracting skills with Enhanced Ensemble System',
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
    },

    // Add new skills to the database from unmatched skills
    addSkillsToDatabase: async (req, res) => {
        try {
            const { skills } = req.body; // Array of skill objects: [{skill, category, confidence}]
            const userId = req.user.userId;
            
            if (!skills || !Array.isArray(skills) || skills.length === 0) {
                return res.status(400).json({ message: 'No skills provided to add to database' });
            }

            console.log(`🔄 Adding ${skills.length} new skills to database by user ${userId}`);
            
            const addedSkills = [];
            const skippedSkills = [];
            
            for (const skillData of skills) {
                const { skill, category = 'other', confidence = 0.8 } = skillData;
                
                if (!skill || skill.trim().length < 2) {
                    skippedSkills.push({ skill, reason: 'Invalid skill name' });
                    continue;
                }
                
                const skillName = skill.trim().toLowerCase();
                
                try {
                    // Check if skill already exists
                    const [existingSkills] = await db.query(
                        'SELECT skill_id FROM skills WHERE LOWER(skill_name) = ?',
                        [skillName]
                    );
                    
                    if (existingSkills.length > 0) {
                        skippedSkills.push({ skill: skillName, reason: 'Already exists in database' });
                        continue;
                    }
                    
                    // Add the new skill to database
                    const [result] = await db.query(
                        'INSERT INTO skills (skill_name, category, created_by_user_id, confidence_score) VALUES (?, ?, ?, ?)',
                        [skillName, category, userId, confidence]
                    );
                    
                    addedSkills.push({
                        skill_id: result.insertId,
                        skill_name: skillName,
                        category: category,
                        confidence: confidence,
                        added_by_user: userId
                    });
                    
                    console.log(`✅ Added skill: ${skillName} (category: ${category}, confidence: ${confidence})`);
                    
                } catch (skillError) {
                    console.error(`❌ Error adding skill "${skillName}":`, skillError);
                    skippedSkills.push({ skill: skillName, reason: 'Database error' });
                }
            }
            
            // Log the results
            console.log(`📊 Results: ${addedSkills.length} added, ${skippedSkills.length} skipped`);
            
            res.json({
                message: `Successfully processed ${skills.length} skills`,
                addedSkills: addedSkills,
                skippedSkills: skippedSkills,
                summary: {
                    total: skills.length,
                    added: addedSkills.length,
                    skipped: skippedSkills.length
                }
            });
            
        } catch (error) {
            console.error('❌ Error adding skills to database:', error);
            res.status(500).json({ 
                message: 'Error adding skills to database',
                error: error.message 
            });
        }
    },

    // Submit feedback for ensemble system improvement
    submitEnsembleFeedback: async (req, res) => {
        try {
            const { testId, correctSkills, missedSkills, incorrectSkills } = req.body;
            const userId = req.user.userId;
            
            if (!testId) {
                return res.status(400).json({ message: 'Test ID is required for feedback submission' });
            }
            
            console.log(`💬 Submitting feedback for test ${testId} from user ${userId}`);
            
            // Prepare feedback data
            const feedbackData = {
                correct_skills: correctSkills || [],
                missed_skills: missedSkills || [],
                incorrect_skills: incorrectSkills || []
            };
            
            // Store feedback in database for analysis
            try {
                await db.query(
                    `INSERT INTO ensemble_feedback 
                     (user_id, test_id, correct_skills, missed_skills, incorrect_skills, created_at) 
                     VALUES (?, ?, ?, ?, ?, NOW())`,
                    [
                        userId,
                        testId,
                        JSON.stringify(feedbackData.correct_skills),
                        JSON.stringify(feedbackData.missed_skills),
                        JSON.stringify(feedbackData.incorrect_skills)
                    ]
                );
            } catch (dbError) {
                console.warn('⚠️ Could not store feedback in database:', dbError.message);
                // Continue without failing - feedback storage is optional
            }
            
            console.log('✅ Feedback submitted successfully to ensemble system');
            res.json({
                message: 'Feedback submitted successfully',
                testId: testId,
                feedbackStats: {
                    correctSkills: feedbackData.correct_skills.length,
                    missedSkills: feedbackData.missed_skills.length,
                    incorrectSkills: feedbackData.incorrect_skills.length
                }
            });
            
        } catch (error) {
            console.error('❌ Error submitting ensemble feedback:', error);
            res.status(500).json({ 
                message: 'Error submitting feedback to ensemble system',
                error: error.message
            });
        }
    }
};

module.exports = resumeSkillController;
