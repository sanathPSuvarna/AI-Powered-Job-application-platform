// controllers/careerPathController.js
const CareerPath = require('../models/CareerPath');

const careerPathController = {
    // Get all available career goals
    getCareerGoals: async (req, res) => {
        try {
            const goals = await CareerPath.getCareerGoals();
            res.json({
                success: true,
                data: goals,
                message: 'Career goals retrieved successfully'
            });
        } catch (error) {
            console.error('Error fetching career goals:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching career goals',
                error: error.message
            });
        }
    },

    // Get career path steps for a specific goal
    getCareerPathSteps: async (req, res) => {
        try {
            const { goalId } = req.params;
            const steps = await CareerPath.getCareerPathSteps(goalId);
            
            // Get detailed information for each step
            const detailedSteps = [];
            for (const step of steps) {
                const requiredSkills = await CareerPath.getStepRequiredSkills(step.step_id);
                const resources = await CareerPath.getStepResources(step.step_id);
                const matchingJobs = await CareerPath.getMatchingJobsForStep(step.step_id);
                
                detailedSteps.push({
                    ...step,
                    required_skills: requiredSkills,
                    resources: resources,
                    matching_jobs: matchingJobs
                });
            }

            res.json({
                success: true,
                data: detailedSteps,
                message: 'Career path steps retrieved successfully'
            });
        } catch (error) {
            console.error('Error fetching career path steps:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching career path steps',
                error: error.message
            });
        }
    },

    // Simulate career path for a user
    simulateCareerPath: async (req, res) => {
        try {
            const { goalId, currentSkills, experienceLevel } = req.body;
            const userId = req.user ? req.user.userId : null;

            if (!goalId) {
                return res.status(400).json({
                    success: false,
                    message: 'Career goal ID is required'
                });
            }

            // If user is authenticated, use their profile skills
            // If not authenticated or currentSkills provided, use provided skills
            let simulation;
            if (userId && !currentSkills) {
                simulation = await CareerPath.simulateCareerPath(userId, goalId);
            } else {
                // Use provided skills for guest users or manual skill input
                simulation = await CareerPath.simulateCareerPathWithSkills(goalId, currentSkills || [], experienceLevel || 'entry');
            }

            res.json({
                success: true,
                data: simulation,
                message: 'Career path simulation completed successfully'
            });
        } catch (error) {
            console.error('Error simulating career path:', error);
            res.status(500).json({
                success: false,
                message: 'Error simulating career path',
                error: error.message
            });
        }
    },

    // Save user's career goal
    saveCareerGoal: async (req, res) => {
        try {
            const { goalId, targetCompletionDate } = req.body;
            const userId = req.user.userId;

            if (!goalId) {
                return res.status(400).json({
                    success: false,
                    message: 'Career goal ID is required'
                });
            }

            const userGoalId = await CareerPath.saveUserCareerGoal(userId, goalId, targetCompletionDate);

            res.status(201).json({
                success: true,
                data: { user_goal_id: userGoalId },
                message: 'Career goal saved successfully'
            });
        } catch (error) {
            console.error('Error saving career goal:', error);
            res.status(500).json({
                success: false,
                message: 'Error saving career goal',
                error: error.message
            });
        }
    },

    // Get user's career goals and progress
    getUserCareerGoals: async (req, res) => {
        try {
            const userId = req.user.userId;
            const userGoals = await CareerPath.getUserCareerGoals(userId);

            res.json({
                success: true,
                data: userGoals,
                message: 'User career goals retrieved successfully'
            });
        } catch (error) {
            console.error('Error fetching user career goals:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching user career goals',
                error: error.message
            });
        }
    },

    // Get personalized career roadmap for user
    getPersonalizedRoadmap: async (req, res) => {
        try {
            const userId = req.user.userId;
            const userGoals = await CareerPath.getUserCareerGoals(userId);

            if (userGoals.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No active career goals found for user'
                });
            }

            // Get simulation for the most recent goal
            const latestGoal = userGoals[0];
            const simulation = await CareerPath.simulateCareerPath(userId, latestGoal.goal_id);

            res.json({
                success: true,
                data: {
                    user_goal: latestGoal,
                    simulation: simulation
                },
                message: 'Personalized roadmap retrieved successfully'
            });
        } catch (error) {
            console.error('Error fetching personalized roadmap:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching personalized roadmap',
                error: error.message
            });
        }
    }
};

module.exports = careerPathController;
