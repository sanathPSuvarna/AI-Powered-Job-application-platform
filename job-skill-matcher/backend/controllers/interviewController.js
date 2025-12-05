const db = require('../config/database');
const aiInterviewService = require('../services/aiInterviewService');

// Start a new interview session
const startInterview = async (req, res) => {
    try {
        const { role, experience, userId } = req.body;
        
        console.log('Starting interview for:', { role, experience, userId });
        
        // Map experience to seniority level
        const seniorityMap = {
            'fresher': 'junior',
            'beginner': 'junior',
            'junior': 'junior',
            'mid': 'mid',
            'senior': 'senior',
            'experienced': 'senior'
        };
        
        const seniorityLevel = seniorityMap[experience] || 'junior';
        console.log('Mapped experience to seniority:', experience, '->', seniorityLevel);
        
        // Create new interview session
        const sessionQuery = `
            INSERT INTO interview_sessions (user_id, role, seniority_level, status, created_at)
            VALUES (?, ?, ?, 'active', NOW())
        `;
        
        const [sessionResult] = await db.execute(sessionQuery, [userId, role, seniorityLevel]);
        const sessionId = sessionResult.insertId;
        
        console.log('Session created with ID:', sessionId);
        
        // Generate first question
        const firstQuestion = await aiInterviewService.generateQuestion(role, seniorityLevel, 1, 'easy');
        
        console.log('Generated question:', firstQuestion);
        
        if (!firstQuestion || !firstQuestion.question) {
            throw new Error('Failed to generate question');
        }
        
        // Save the question
        const questionQuery = `
            INSERT INTO interview_questions (session_id, question_text, question_type, difficulty, expected_answer_time, order_index, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        
        await db.execute(questionQuery, [
            sessionId,
            firstQuestion.question,
            firstQuestion.type || 'behavioral',
            firstQuestion.difficulty || 'beginner',
            firstQuestion.timeLimit || 120,
            1
        ]);
        
        console.log('Question saved successfully');
        
        res.json({
            sessionId,
            question: firstQuestion,
            questionNumber: 1,
            totalQuestions: 10
        });
        
    } catch (error) {
        console.error('Error starting interview:', error);
        res.status(500).json({ message: 'Failed to start interview', error: error.message });
    }
};

// Submit answer and get next question
const submitAnswer = async (req, res) => {
    try {
        const { sessionId, questionNumber, answer, timeSpent } = req.body;
        
        // Get session details
        const sessionQuery = 'SELECT * FROM interview_sessions WHERE id = ?';
        const [sessions] = await db.execute(sessionQuery, [sessionId]);
        
        if (sessions.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }
        
        const session = sessions[0];
        
        // Get the current question
        const questionQuery = 'SELECT * FROM interview_questions WHERE session_id = ? AND order_index = ?';
        const [questions] = await db.execute(questionQuery, [sessionId, questionNumber]);
        
        if (questions.length === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }
        
        const question = questions[0];
        
        // Score the answer using AI
        const scoreResult = await aiInterviewService.scoreAnswer(
            question.question_text, 
            answer, 
            question.difficulty, 
            question.question_type
        );
        
        const score = scoreResult.score || 0;
        const aiFeedback = scoreResult.feedback || 'Good effort!';
        
        // Use AI feedback as primary feedback
        const feedback = aiFeedback;
        
        // Save the answer
        const answerQuery = `
            INSERT INTO interview_answers (question_id, session_id, answer_text, answer_time, score, feedback, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        
        await db.execute(answerQuery, [question.id, sessionId, answer, timeSpent, score, feedback]);
        
        // Check if this is the last question
        if (questionNumber >= 10) {
            // End the interview
            const updateSessionQuery = 'UPDATE interview_sessions SET status = "completed", completed_at = NOW() WHERE id = ?';
            await db.execute(updateSessionQuery, [sessionId]);
            
            // Generate session summary
            const summary = await aiInterviewService.generateSessionSummary(sessionId);
            
            return res.json({
                completed: true,
                feedback,
                score,
                strengths: scoreResult.strengths || [],
                improvements: scoreResult.improvements || [],
                summary
            });
        }
        
        // Generate next question
        const nextQuestionNumber = questionNumber + 1;
        const difficulty = aiInterviewService.determineNextQuestionBranch(score, question.difficulty);
        const nextQuestion = await aiInterviewService.generateQuestion(session.role, session.seniority_level, nextQuestionNumber, difficulty);
        
        // Save next question
        const nextQuestionQuery = `
            INSERT INTO interview_questions (session_id, question_text, question_type, difficulty, expected_answer_time, order_index, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        
        await db.execute(nextQuestionQuery, [
            sessionId,
            nextQuestion.question,
            nextQuestion.type,
            nextQuestion.difficulty,
            nextQuestion.timeLimit || 120,
            nextQuestionNumber
        ]);
        
        res.json({
            completed: false,
            feedback,
            score,
            strengths: scoreResult.strengths || [],
            improvements: scoreResult.improvements || [],
            nextQuestion,
            questionNumber: nextQuestionNumber,
            totalQuestions: 10
        });
        
    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).json({ message: 'Failed to submit answer' });
    }
};

// Get next question (alternative endpoint)
const getNextQuestion = async (req, res) => {
    try {
        const { sessionId, questionNumber } = req.body;
        
        const questionQuery = 'SELECT * FROM interview_questions WHERE session_id = ? AND order_index = ?';
        const [questions] = await db.execute(questionQuery, [sessionId, questionNumber]);
        
        if (questions.length === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }
        
        const question = questions[0];
        
        res.json({
            question: {
                question: question.question_text,
                type: question.question_type,
                difficulty: question.difficulty
            },
            questionNumber,
            totalQuestions: 10
        });
        
    } catch (error) {
        console.error('Error getting next question:', error);
        res.status(500).json({ message: 'Failed to get next question' });
    }
};

// End interview session
const endInterview = async (req, res) => {
    try {
        const { sessionId } = req.body;
        
        const updateQuery = 'UPDATE interview_sessions SET status = "completed", completed_at = NOW() WHERE id = ?';
        await db.execute(updateQuery, [sessionId]);
        
        const summary = await aiInterviewService.generateSessionSummary(sessionId);
        
        res.json({ summary });
        
    } catch (error) {
        console.error('Error ending interview:', error);
        res.status(500).json({ message: 'Failed to end interview' });
    }
};

// Get session summary
const getSessionSummary = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const summary = await aiInterviewService.generateSessionSummary(sessionId);
        
        res.json({ summary });
        
    } catch (error) {
        console.error('Error getting session summary:', error);
        res.status(500).json({ message: 'Failed to get session summary' });
    }
};

// Get user's interview history
const getInterviewHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const query = `
            SELECT 
                id,
                role,
                seniority_level,
                status,
                created_at,
                completed_at,
                (SELECT AVG(score) FROM interview_answers WHERE session_id = interview_sessions.id) as average_score,
                (SELECT COUNT(*) FROM interview_answers WHERE session_id = interview_sessions.id) as questions_answered
            FROM interview_sessions 
            WHERE user_id = ? 
            ORDER BY created_at DESC
            LIMIT 20
        `;
        
        const [sessions] = await db.execute(query, [userId]);
        
        res.json({ sessions });
        
    } catch (error) {
        console.error('Error getting interview history:', error);
        res.status(500).json({ message: 'Failed to get interview history' });
    }
};

// Get user's interview statistics
const getInterviewStats = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const statsQuery = `
            SELECT 
                COUNT(*) as total_sessions,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sessions,
                AVG(CASE WHEN status = 'completed' THEN 
                    (SELECT AVG(score) FROM interview_answers WHERE session_id = interview_sessions.id) 
                END) as average_score,
                MAX(CASE WHEN status = 'completed' THEN 
                    (SELECT AVG(score) FROM interview_answers WHERE session_id = interview_sessions.id) 
                END) as best_score,
                COUNT(DISTINCT role) as roles_practiced
            FROM interview_sessions 
            WHERE user_id = ?
        `;
        
        const [stats] = await db.execute(statsQuery, [userId]);
        
        // Get recent achievements (mock data for now)
        const achievements = [
            { name: 'First Interview', description: 'Completed your first mock interview', earned: true },
            { name: 'Perfect Score', description: 'Scored 100% in an interview', earned: stats[0].best_score >= 100 },
            { name: 'Consistent Performer', description: 'Maintained 80%+ average across 5 interviews', earned: stats[0].average_score >= 80 && stats[0].completed_sessions >= 5 },
            { name: 'Multi-Role Expert', description: 'Practiced interviews for 3+ different roles', earned: stats[0].roles_practiced >= 3 }
        ];
        
        res.json({
            stats: stats[0],
            achievements
        });
        
    } catch (error) {
        console.error('Error getting interview stats:', error);
        res.status(500).json({ message: 'Failed to get interview stats' });
    }
};

module.exports = {
    startInterview,
    submitAnswer,
    getNextQuestion,
    endInterview,
    getSessionSummary,
    getInterviewHistory,
    getInterviewStats
};