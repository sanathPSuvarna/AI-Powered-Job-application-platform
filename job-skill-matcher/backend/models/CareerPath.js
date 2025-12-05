// models/CareerPath.js
const db = require('../config/database');

class CareerPath {
    // Get all available career goals
    static async getCareerGoals() {
        try {
            const [goals] = await db.query('SELECT * FROM career_goals ORDER BY title');
            return goals;
        } catch (error) {
            throw new Error('Error fetching career goals: ' + error.message);
        }
    }

    // Get career path steps for a specific goal
    static async getCareerPathSteps(goalId) {
        try {
            const [steps] = await db.query(
                'SELECT * FROM career_path_steps WHERE goal_id = ? ORDER BY step_order',
                [goalId]
            );
            return steps;
        } catch (error) {
            throw new Error('Error fetching career path steps: ' + error.message);
        }
    }

    // Get required skills for a specific career step
    static async getStepRequiredSkills(stepId) {
        try {
            const [skills] = await db.query(`
                SELECT s.*, css.importance_level 
                FROM skills s
                JOIN career_step_skills css ON s.skill_id = css.skill_id
                WHERE css.step_id = ?
                ORDER BY css.importance_level, s.skill_name
            `, [stepId]);
            return skills;
        } catch (error) {
            throw new Error('Error fetching step required skills: ' + error.message);
        }
    }

    // Get resources for a specific career step
    static async getStepResources(stepId) {
        try {
            const [resources] = await db.query(
                'SELECT * FROM career_step_resources WHERE step_id = ? ORDER BY resource_type',
                [stepId]
            );
            return resources;
        } catch (error) {
            throw new Error('Error fetching step resources: ' + error.message);
        }
    }

    // Simulate career path for a user with provided skills (for guest users)
    static async simulateCareerPathWithSkills(goalId, currentSkillNames, experienceLevel = 'entry') {
        try {
            // Convert skill names to skill objects
            const userSkills = [];
            if (currentSkillNames && currentSkillNames.length > 0) {
                const placeholders = currentSkillNames.map(() => '?').join(',');
                const [skills] = await db.query(
                    `SELECT skill_id, skill_name FROM skills WHERE skill_name IN (${placeholders})`,
                    currentSkillNames
                );
                
                userSkills.push(...skills.map(skill => ({
                    ...skill,
                    proficiency_level: experienceLevel === 'entry' ? 'beginner' : 
                                     experienceLevel === 'mid' ? 'intermediate' : 'advanced'
                })));
            }

            const userSkillIds = userSkills.map(skill => skill.skill_id);

            // Get career goal details
            const [goalDetails] = await db.query('SELECT * FROM career_goals WHERE goal_id = ?', [goalId]);
            if (goalDetails.length === 0) {
                throw new Error('Career goal not found');
            }

            // Get career path steps
            const steps = await this.getCareerPathSteps(goalId);
            
            // Analyze each step
            const roadmap = [];
            let cumulativeMonths = 0;

            for (const step of steps) {
                // Get required skills for this step
                const requiredSkills = await this.getStepRequiredSkills(step.step_id);
                
                // Get resources for this step
                const resources = await this.getStepResources(step.step_id);

                // Calculate skill gaps
                const missingSkills = requiredSkills.filter(skill => 
                    !userSkillIds.includes(skill.skill_id) && skill.importance_level === 'required'
                );

                const optionalSkills = requiredSkills.filter(skill => 
                    !userSkillIds.includes(skill.skill_id) && skill.importance_level !== 'required'
                );

                const matchedSkills = requiredSkills.filter(skill => 
                    userSkillIds.includes(skill.skill_id)
                );

                // Calculate completion percentage
                const totalRequiredSkills = requiredSkills.filter(skill => skill.importance_level === 'required').length;
                const matchedRequiredSkills = matchedSkills.filter(skill => skill.importance_level === 'required').length;
                const completionPercentage = totalRequiredSkills > 0 ? 
                    Math.round((matchedRequiredSkills / totalRequiredSkills) * 100) : 100;

                // Determine if user is ready for this step
                const isReady = missingSkills.length === 0;
                
                // Calculate estimated time to reach this step
                cumulativeMonths += step.estimated_duration_months;

                roadmap.push({
                    step: {
                        ...step,
                        estimated_start_date: new Date(Date.now() + (cumulativeMonths - step.estimated_duration_months) * 30 * 24 * 60 * 60 * 1000),
                        estimated_completion_date: new Date(Date.now() + cumulativeMonths * 30 * 24 * 60 * 60 * 1000)
                    },
                    analysis: {
                        completion_percentage: completionPercentage,
                        is_ready: isReady,
                        matched_skills: matchedSkills,
                        missing_skills: missingSkills,
                        optional_skills: optionalSkills,
                        total_required_skills: totalRequiredSkills
                    },
                    resources: resources
                });
            }

            return {
                goal: goalDetails[0],
                user_skills: userSkills,
                roadmap: roadmap,
                total_estimated_duration: cumulativeMonths,
                overall_readiness: roadmap.length > 0 ? Math.round(roadmap.reduce((sum, step) => sum + step.analysis.completion_percentage, 0) / roadmap.length) : 0
            };

        } catch (error) {
            throw new Error('Error simulating career path with skills: ' + error.message);
        }
    }

    // Simulate career path for a user
    static async simulateCareerPath(userId, goalId) {
        try {
            // Get user's current skills
            const [userSkills] = await db.query(`
                SELECT s.skill_id, s.skill_name, jss.proficiency_level
                FROM skills s
                JOIN job_seeker_skills jss ON s.skill_id = jss.skill_id
                JOIN job_seeker_profiles jsp ON jss.profile_id = jsp.profile_id
                WHERE jsp.user_id = ?
            `, [userId]);

            const userSkillIds = userSkills.map(skill => skill.skill_id);

            // Get career goal details
            const [goalDetails] = await db.query('SELECT * FROM career_goals WHERE goal_id = ?', [goalId]);
            if (goalDetails.length === 0) {
                throw new Error('Career goal not found');
            }

            // Get career path steps
            const steps = await this.getCareerPathSteps(goalId);
            
            // Analyze each step
            const roadmap = [];
            let cumulativeMonths = 0;

            for (const step of steps) {
                // Get required skills for this step
                const requiredSkills = await this.getStepRequiredSkills(step.step_id);
                
                // Get resources for this step
                const resources = await this.getStepResources(step.step_id);

                // Calculate skill gaps
                const missingSkills = requiredSkills.filter(skill => 
                    !userSkillIds.includes(skill.skill_id) && skill.importance_level === 'required'
                );

                const optionalSkills = requiredSkills.filter(skill => 
                    !userSkillIds.includes(skill.skill_id) && skill.importance_level !== 'required'
                );

                const matchedSkills = requiredSkills.filter(skill => 
                    userSkillIds.includes(skill.skill_id)
                );

                // Calculate completion percentage
                const totalRequiredSkills = requiredSkills.filter(skill => skill.importance_level === 'required').length;
                const matchedRequiredSkills = matchedSkills.filter(skill => skill.importance_level === 'required').length;
                const completionPercentage = totalRequiredSkills > 0 ? 
                    Math.round((matchedRequiredSkills / totalRequiredSkills) * 100) : 100;

                // Determine if user is ready for this step
                const isReady = missingSkills.length === 0;
                
                // Calculate estimated time to reach this step
                cumulativeMonths += step.estimated_duration_months;

                roadmap.push({
                    step: {
                        ...step,
                        estimated_start_date: new Date(Date.now() + (cumulativeMonths - step.estimated_duration_months) * 30 * 24 * 60 * 60 * 1000),
                        estimated_completion_date: new Date(Date.now() + cumulativeMonths * 30 * 24 * 60 * 60 * 1000)
                    },
                    analysis: {
                        completion_percentage: completionPercentage,
                        is_ready: isReady,
                        matched_skills: matchedSkills,
                        missing_skills: missingSkills,
                        optional_skills: optionalSkills,
                        total_required_skills: totalRequiredSkills
                    },
                    resources: resources
                });
            }

            return {
                goal: goalDetails[0],
                user_skills: userSkills,
                roadmap: roadmap,
                total_estimated_duration: cumulativeMonths,
                overall_readiness: Math.round(roadmap.reduce((sum, step) => sum + step.analysis.completion_percentage, 0) / roadmap.length)
            };

        } catch (error) {
            throw new Error('Error simulating career path: ' + error.message);
        }
    }

    // Save user's career goal
    static async saveUserCareerGoal(userId, goalId, targetCompletionDate = null) {
        try {
            const [result] = await db.query(
                'INSERT INTO user_career_goals (user_id, goal_id, target_completion_date) VALUES (?, ?, ?)',
                [userId, goalId, targetCompletionDate]
            );
            return result.insertId;
        } catch (error) {
            throw new Error('Error saving user career goal: ' + error.message);
        }
    }

    // Get user's career goals and progress
    static async getUserCareerGoals(userId) {
        try {
            const [goals] = await db.query(`
                SELECT ucg.*, cg.title, cg.description, cg.industry, cg.average_salary_range
                FROM user_career_goals ucg
                JOIN career_goals cg ON ucg.goal_id = cg.goal_id
                WHERE ucg.user_id = ? AND ucg.status = 'active'
                ORDER BY ucg.started_at DESC
            `, [userId]);
            return goals;
        } catch (error) {
            throw new Error('Error fetching user career goals: ' + error.message);
        }
    }

    // Get matching jobs for a career step
    static async getMatchingJobsForStep(stepId) {
        try {
            const [jobs] = await db.query(`
                SELECT DISTINCT jl.*, ep.company_name,
                    COUNT(jrs.skill_id) as matched_skills_count
                FROM job_listings jl
                JOIN employer_profiles ep ON jl.employer_id = ep.employer_id
                JOIN job_required_skills jrs ON jl.job_id = jrs.job_id
                JOIN career_step_skills css ON jrs.skill_id = css.skill_id
                WHERE css.step_id = ? AND jl.status = 'open'
                GROUP BY jl.job_id
                ORDER BY matched_skills_count DESC
                LIMIT 10
            `, [stepId]);
            return jobs;
        } catch (error) {
            throw new Error('Error fetching matching jobs: ' + error.message);
        }
    }
}

module.exports = CareerPath;
