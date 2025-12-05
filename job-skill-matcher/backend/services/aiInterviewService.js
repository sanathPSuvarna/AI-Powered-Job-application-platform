const db = require('../config/database');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize OpenAI client (fallback)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Initialize Google Gemini client (primary AI service)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Question templates by role and difficulty
const questionTemplates = {
    'Software Engineer': {
        easy: [
            { question: "What is the difference between a variable and a constant in programming?", type: "technical", difficulty: "easy" },
            { question: "Can you explain what a function is and why we use functions in programming?", type: "technical", difficulty: "easy" },
            { question: "What motivated you to pursue a career in software engineering?", type: "behavioral", difficulty: "easy" },
            { question: "How do you handle debugging when your code doesn't work as expected?", type: "situational", difficulty: "easy" },
            { question: "What programming languages have you learned, and which one do you feel most comfortable with?", type: "technical", difficulty: "easy" }
        ],
        medium: [
            { question: "Explain the concept of Object-Oriented Programming and its key principles.", type: "technical", difficulty: "medium" },
            { question: "What is the difference between a stack and a queue data structure?", type: "technical", difficulty: "medium" },
            { question: "Describe a challenging project you worked on and how you overcame the difficulties.", type: "behavioral", difficulty: "medium" },
            { question: "How would you approach optimizing a slow-running database query?", type: "situational", difficulty: "medium" },
            { question: "What is version control, and why is it important in software development?", type: "technical", difficulty: "medium" }
        ],
        hard: [
            { question: "Design a system to handle 1 million concurrent users. What technologies and patterns would you use?", type: "case_study", difficulty: "hard" },
            { question: "Explain the CAP theorem and its implications for distributed systems.", type: "technical", difficulty: "hard" },
            { question: "Tell me about a time when you had to make a technical decision with incomplete information.", type: "behavioral", difficulty: "hard" },
            { question: "How would you implement a rate limiting system for an API?", type: "case_study", difficulty: "hard" },
            { question: "What are the trade-offs between microservices and monolithic architecture?", type: "case_study", difficulty: "hard" }
        ]
    },
    'Data Scientist': {
        easy: [
            { question: "What is the difference between supervised and unsupervised learning?", type: "technical", difficulty: "easy" },
            { question: "Can you explain what a dataset is and why data quality is important?", type: "technical", difficulty: "easy" },
            { question: "Why are you interested in working with data and analytics?", type: "behavioral", difficulty: "easy" },
            { question: "How would you handle missing values in a dataset?", type: "situational", difficulty: "easy" },
            { question: "What tools or programming languages have you used for data analysis?", type: "technical", difficulty: "easy" }
        ],
        medium: [
            { question: "Explain the bias-variance tradeoff in machine learning models.", type: "technical", difficulty: "medium" },
            { question: "What is cross-validation and why is it important?", type: "technical", difficulty: "medium" },
            { question: "Describe a data analysis project you completed and your methodology.", type: "behavioral", difficulty: "medium" },
            { question: "How would you determine which features are most important in a predictive model?", type: "situational", difficulty: "medium" },
            { question: "What is the difference between correlation and causation?", type: "technical", difficulty: "medium" }
        ],
        hard: [
            { question: "Design an A/B testing framework for a large e-commerce platform.", type: "case_study", difficulty: "hard" },
            { question: "Explain how you would build a recommendation system for a streaming service.", type: "technical", difficulty: "hard" },
            { question: "Tell me about a time when your analysis led to a significant business decision.", type: "behavioral", difficulty: "hard" },
            { question: "How would you handle class imbalance in a machine learning problem?", type: "situational", difficulty: "hard" },
            { question: "What are the ethical considerations in data science and AI?", type: "behavioral", difficulty: "hard" }
        ]
    },
    'Marketing Manager': {
        easy: [
            { question: "What do you understand by digital marketing and its key components?", type: "technical", difficulty: "easy" },
            { question: "Can you explain what a target audience is and why it's important?", type: "technical", difficulty: "easy" },
            { question: "What interests you about pursuing a career in marketing?", type: "behavioral", difficulty: "easy" },
            { question: "How would you approach researching a new market for a product?", type: "situational", difficulty: "easy" },
            { question: "What marketing campaigns or brands have impressed you recently?", type: "behavioral", difficulty: "easy" }
        ],
        medium: [
            { question: "Explain the difference between brand awareness and brand engagement.", type: "technical", difficulty: "medium" },
            { question: "What is a marketing funnel and how do you optimize each stage?", type: "technical", difficulty: "medium" },
            { question: "Describe a successful marketing campaign you've worked on or studied.", type: "behavioral", difficulty: "medium" },
            { question: "How would you measure the ROI of a social media marketing campaign?", type: "situational", difficulty: "medium" },
            { question: "What role does content marketing play in customer acquisition?", type: "technical", difficulty: "medium" }
        ],
        hard: [
            { question: "Design a comprehensive go-to-market strategy for a new SaaS product.", type: "case_study", difficulty: "hard" },
            { question: "How would you build and lead a high-performing marketing team?", type: "behavioral", difficulty: "hard" },
            { question: "Tell me about a time when a marketing campaign failed and how you handled it.", type: "behavioral", difficulty: "hard" },
            { question: "How do you balance short-term growth metrics with long-term brand building?", type: "case_study", difficulty: "hard" },
            { question: "What's your approach to marketing attribution in a multi-channel environment?", type: "technical", difficulty: "hard" }
        ]
    }
};

// Generate a question based on role, experience, and difficulty
const generateQuestion = async (role, experience, questionNumber, difficulty) => {
    try {
        // Map difficulty levels
        const difficultyMap = {
            'beginner': 'easy',
            'intermediate': 'medium',
            'advanced': 'hard',
            'easy': 'easy',
            'medium': 'medium',
            'hard': 'hard'
        };
        
        const mappedDifficulty = difficultyMap[difficulty] || 'easy';
        
        // Get appropriate question pool
        const roleQuestions = questionTemplates[role] || questionTemplates['Software Engineer'];
        const difficultyQuestions = roleQuestions[mappedDifficulty] || roleQuestions['easy'];
        
        // Select a random question from the pool
        const randomIndex = Math.floor(Math.random() * difficultyQuestions.length);
        const selectedQuestion = difficultyQuestions[randomIndex];
        
        return {
            question: selectedQuestion.question,
            type: selectedQuestion.type,
            difficulty: selectedQuestion.difficulty,
            hints: generateHints(selectedQuestion.type, selectedQuestion.difficulty),
            timeLimit: getTimeLimit(selectedQuestion.type, selectedQuestion.difficulty)
        };
    } catch (error) {
        console.error('Error generating question:', error);
        // Fallback question
        return {
            question: "Tell me about yourself and why you're interested in this role.",
            type: "behavioral",
            difficulty: "easy",
            hints: ["Think about your background", "Mention relevant skills", "Explain your motivation"],
            timeLimit: 120
        };
    }
};

// Generate hints based on question type and difficulty
const generateHints = (type, difficulty) => {
    const hints = {
        technical: {
            easy: ["Think about the basic concepts", "Use simple examples", "Don't worry about complex details"],
            medium: ["Consider practical applications", "Think about pros and cons", "Relate to real-world scenarios"],
            hard: ["Consider scalability and performance", "Think about trade-offs", "Discuss best practices"]
        },
        behavioral: {
            easy: ["Use the STAR method (Situation, Task, Action, Result)", "Be specific with examples", "Show your learning mindset"],
            medium: ["Demonstrate problem-solving skills", "Show leadership potential", "Explain your decision-making process"],
            hard: ["Show strategic thinking", "Demonstrate impact and results", "Discuss lessons learned"]
        },
        situational: {
            easy: ["Break down the problem", "Think step by step", "Consider different approaches"],
            medium: ["Analyze requirements", "Consider constraints", "Think about implementation"],
            hard: ["Consider scalability", "Think about edge cases", "Discuss monitoring and maintenance"]
        },
        case_study: {
            easy: ["Start with understanding the problem", "Think about user needs", "Consider simple solutions"],
            medium: ["Analyze business requirements", "Consider technical constraints", "Think about trade-offs"],
            hard: ["Consider system architecture", "Think about scalability", "Discuss implementation strategy"]
        }
    };
    
    return hints[type]?.[difficulty] || hints.behavioral.easy;
};

// Get time limit based on question type and difficulty
const getTimeLimit = (type, difficulty) => {
    const timeLimits = {
        technical: { easy: 120, medium: 180, hard: 300 },
        behavioral: { easy: 120, medium: 180, hard: 240 },
        situational: { easy: 180, medium: 240, hard: 360 },
        case_study: { easy: 240, medium: 360, hard: 480 }
    };
    
    return timeLimits[type]?.[difficulty] || 120;
};

// Score an answer using Google Gemini AI (0-100)
const scoreAnswer = async (question, answer, difficulty, questionType = 'general') => {
    try {
        // Basic validation
        if (!answer || answer.trim().length < 5) {
            return {
                score: 0,
                feedback: "Please provide a more detailed answer.",
                strengths: [],
                improvements: ["Provide more detailed responses", "Address all parts of the question"]
            };
        }

        // Try Google Gemini first (free and high quality)
        if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== 'your-gemini-api-key-here') {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                
                const prompt = `You are an expert technical interviewer evaluating a ${difficulty} difficulty ${questionType} interview question.

Interview Question: "${question}"
Question Type: ${questionType}
Difficulty Level: ${difficulty}
Candidate's Answer: "${answer}"

Analyze this answer and respond with ONLY valid JSON in this exact format:
{
    "score": 85,
    "feedback": "Your answer demonstrates good understanding of the concept. You provided clear explanations and showed practical knowledge.",
    "strengths": ["Clear communication", "Good examples", "Logical structure"],
    "improvements": ["Add more technical depth", "Include specific metrics", "Discuss edge cases"]
}

Scoring Criteria:
- Technical accuracy and depth (40%)
- Communication clarity and structure (30%)
- Relevance to the question (20%)
- Examples and practical knowledge (10%)

For ${difficulty} level, expect:
${difficulty === 'easy' ? '- Basic understanding and clear communication' : 
  difficulty === 'medium' ? '- Good depth with practical examples' : 
  '- Comprehensive knowledge with strategic thinking'}

Respond ONLY with the JSON object, no additional text:`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                
                // Clean the response and parse JSON
                const cleanedText = text.replace(/```json|```/g, '').trim();
                const aiResponse = JSON.parse(cleanedText);
                
                // Validate and sanitize the response
                const score = Math.max(0, Math.min(100, aiResponse.score || 50));
                const feedback = aiResponse.feedback || "Good effort! Keep practicing to improve your interview skills.";
                const strengths = Array.isArray(aiResponse.strengths) ? aiResponse.strengths.slice(0, 3) : ["You attempted to answer the question"];
                const improvements = Array.isArray(aiResponse.improvements) ? aiResponse.improvements.slice(0, 3) : ["Practice providing more detailed responses"];
                
                console.log('✅ Gemini AI scoring successful:', { score, feedback: feedback.substring(0, 50) + '...' });
                
                return {
                    score: Math.round(score),
                    feedback,
                    strengths,
                    improvements
                };
                
            } catch (geminiError) {
                console.error('Gemini AI error:', geminiError.message);
                // Fall through to OpenAI fallback
            }
        }

        // Fallback to OpenAI if Gemini fails
        if (process.env.OPENAI_API_KEY) {
            try {
                const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert technical interviewer. Provide honest, constructive, and actionable feedback. Always respond with valid JSON format."
                        },
                        {
                            role: "user",
                            content: `Evaluate this interview answer and respond with JSON:
Question: "${question}"
Answer: "${answer}"
Difficulty: ${difficulty}

Return: {"score": 85, "feedback": "...", "strengths": [...], "improvements": [...]}`
                        }
                    ],
                    max_tokens: 400,
                    temperature: 0.3
                });

                const aiResponse = completion.choices[0].message.content;
                const parsedResponse = JSON.parse(aiResponse);
                
                return {
                    score: Math.round(Math.max(0, Math.min(100, parsedResponse.score || 50))),
                    feedback: parsedResponse.feedback || "Good effort!",
                    strengths: Array.isArray(parsedResponse.strengths) ? parsedResponse.strengths.slice(0, 3) : ["You answered the question"],
                    improvements: Array.isArray(parsedResponse.improvements) ? parsedResponse.improvements.slice(0, 3) : ["Keep practicing"]
                };
                
            } catch (openaiError) {
                console.error('OpenAI fallback error:', openaiError.message);
            }
        }
        
    } catch (error) {
        console.error('Error with AI scoring:', error);
    }
    
    // Final fallback to basic scoring algorithm
    console.log('🔄 Using basic scoring fallback');
    return await basicScoreAnswer(question, answer, difficulty);
};

// Fallback basic scoring function
const basicScoreAnswer = async (question, answer, difficulty) => {
    try {
        let score = 0;
        
        // Basic checks
        if (!answer || answer.trim().length < 10) {
            return {
                score: 0,
                feedback: "Please provide a more detailed answer.",
                strengths: [],
                improvements: ["Provide more detailed responses"]
            };
        }
        
        // Length-based scoring (minimum baseline)
        const wordCount = answer.trim().split(/\s+/).length;
        if (wordCount >= 20) score += 20;
        else if (wordCount >= 10) score += 10;
        else if (wordCount >= 5) score += 5;
        
        // Content quality indicators (keyword-based)
        const keywords = extractKeywords(question.toLowerCase());
        let keywordMatches = 0;
        keywords.forEach(keyword => {
            if (answer.toLowerCase().includes(keyword)) {
                keywordMatches++;
            }
        });
        
        // Score based on keyword relevance
        const keywordScore = Math.min((keywordMatches / keywords.length) * 40, 40);
        score += keywordScore;
        
        // Structure and clarity (simple heuristics)
        if (answer.includes('.') || answer.includes('!') || answer.includes('?')) score += 10;
        if (answer.length > 100) score += 10;
        if (containsExamples(answer)) score += 10;
        if (showsReflection(answer)) score += 10;
        
        // Difficulty adjustment
        const difficultyMultiplier = {
            easy: 1.0,
            medium: 0.9,
            hard: 0.8
        };
        
        score = Math.round(score * (difficultyMultiplier[difficulty] || 1.0));
        
        const finalScore = Math.min(Math.max(score, 0), 100);
        
        // Generate basic feedback
        let feedback = "";
        const strengths = [];
        const improvements = [];
        
        if (finalScore >= 80) {
            feedback = "Good answer! You covered the key points well.";
            strengths.push("Addressed the main question", "Provided sufficient detail");
        } else if (finalScore >= 60) {
            feedback = "Decent answer. Consider adding more depth and examples.";
            strengths.push("Attempted to answer the question");
            improvements.push("Add more specific examples", "Provide more detailed explanations");
        } else {
            feedback = "Your answer needs more detail and clarity.";
            improvements.push("Provide more comprehensive responses", "Include specific examples", "Address all parts of the question");
        }
        
        if (!containsExamples(answer)) improvements.push("Include specific examples");
        if (wordCount < 20) improvements.push("Provide more detailed responses");
        
        return {
            score: finalScore,
            feedback,
            strengths: strengths.length > 0 ? strengths : ["You attempted to answer"],
            improvements: improvements.length > 0 ? improvements : ["Keep practicing"]
        };
        
    } catch (error) {
        console.error('Error with basic scoring:', error);
        return {
            score: 50,
            feedback: "Thank you for your answer. Keep practicing!",
            strengths: ["Participated in the interview"],
            improvements: ["Keep practicing to improve"]
        };
    }
};

// Extract keywords from question
const extractKeywords = (question) => {
    const commonWords = ['what', 'how', 'why', 'when', 'where', 'who', 'is', 'are', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return question.split(/\s+/)
        .filter(word => word.length > 2 && !commonWords.includes(word))
        .slice(0, 5); // Top 5 relevant words
};

// Check if answer contains examples
const containsExamples = (answer) => {
    const exampleIndicators = ['example', 'instance', 'case', 'such as', 'like', 'including', 'for instance', 'specifically'];
    return exampleIndicators.some(indicator => answer.toLowerCase().includes(indicator));
};

// Check if answer shows reflection/thinking
const showsReflection = (answer) => {
    const reflectionIndicators = ['think', 'believe', 'consider', 'realize', 'understand', 'learned', 'experience', 'approach'];
    return reflectionIndicators.some(indicator => answer.toLowerCase().includes(indicator));
};

// Generate AI-powered feedback using Gemini
const generateFeedback = async (question, answer, score, questionType = 'general') => {
    try {
        // If score is very low, provide basic encouragement
        if (score < 20) {
            return "Keep practicing! Focus on providing more detailed and structured answers.";
        }

        // Try Gemini first
        if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== 'your-gemini-api-key-here') {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                
                const prompt = `As an experienced interview coach, provide constructive feedback for this interview response:

Question: "${question}"
Type: ${questionType}
Answer: "${answer}"
Score: ${score}/100

Provide specific, actionable feedback in 2-3 sentences that:
1. Acknowledges what they did well
2. Gives specific suggestions for improvement
3. Encourages continued practice

Keep the tone supportive and professional. Return only the feedback text, no JSON.`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text().trim();
                
            } catch (geminiError) {
                console.error('Gemini feedback error:', geminiError.message);
            }
        }

        // Fallback to OpenAI if available
        if (process.env.OPENAI_API_KEY) {
            try {
                const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are a supportive interview coach providing constructive feedback to help candidates improve."
                        },
                        {
                            role: "user",
                            content: `Provide brief constructive feedback for: "${answer}" (Score: ${score}/100)`
                        }
                    ],
                    max_tokens: 150,
                    temperature: 0.5
                });

                return completion.choices[0].message.content.trim();
            } catch (openaiError) {
                console.error('OpenAI feedback error:', openaiError.message);
            }
        }
        
    } catch (error) {
        console.error('Error generating AI feedback:', error);
    }
    
    // Final fallback to rule-based feedback
    if (score >= 80) {
        return "Great answer! You demonstrated strong understanding and provided comprehensive details.";
    } else if (score >= 60) {
        return "Good response! Consider adding more specific examples and depth to strengthen your answer.";
    } else {
        return "Your answer addresses the question but could benefit from more detail and structure. Keep practicing!";
    }
};

// Determine difficulty for next question based on performance
const determineNextQuestionBranch = (currentScore, currentDifficulty) => {
    if (currentScore >= 80) {
        // High score - increase difficulty
        if (currentDifficulty === 'easy') return 'medium';
        if (currentDifficulty === 'medium') return 'hard';
        return 'hard';
    } else if (currentScore >= 60) {
        // Medium score - maintain or slightly increase difficulty
        if (currentDifficulty === 'easy') return Math.random() > 0.5 ? 'easy' : 'medium';
        return currentDifficulty;
    } else {
        // Low score - maintain or decrease difficulty
        if (currentDifficulty === 'hard') return 'medium';
        if (currentDifficulty === 'medium') return Math.random() > 0.5 ? 'easy' : 'medium';
        return 'easy';
    }
};

// Generate session summary
const generateSessionSummary = async (sessionId) => {
    try {
        // Get session details
        const sessionQuery = 'SELECT * FROM interview_sessions WHERE id = ?';
        const [sessions] = await db.execute(sessionQuery, [sessionId]);
        
        if (sessions.length === 0) {
            throw new Error('Session not found');
        }
        
        const session = sessions[0];
        
        // Get all answers for the session
        const answersQuery = 'SELECT * FROM interview_answers WHERE session_id = ? ORDER BY id';
        const [answers] = await db.execute(answersQuery, [sessionId]);
        
        // Calculate overall statistics
        const totalQuestions = answers.length;
        const averageScore = answers.reduce((sum, answer) => sum + answer.score, 0) / totalQuestions;
        const totalTime = answers.reduce((sum, answer) => sum + (answer.answer_time || 0), 0);
        
        // Performance analysis
        let performanceBand = "";
        let badgeEarned = null;
        
        if (averageScore >= 90) {
            performanceBand = "Interview Ready";
            badgeEarned = "🏆 Interview Master";
        } else if (averageScore >= 75) {
            performanceBand = "Strong Performance";
            badgeEarned = "⭐ Strong Performer";
        } else if (averageScore >= 60) {
            performanceBand = "Good Foundation";
            badgeEarned = "👍 Good Foundation";
        } else if (averageScore >= 40) {
            performanceBand = "Keep Practicing";
            badgeEarned = "📚 Learner";
        } else {
            performanceBand = "Needs Practice";
            badgeEarned = "🌱 Beginner";
        }
        
        // Strengths and improvements
        const strengths = [];
        const improvements = [];
        
        const highScoreAnswers = answers.filter(a => a.score >= 75);
        const lowScoreAnswers = answers.filter(a => a.score < 60);
        
        if (highScoreAnswers.length > totalQuestions * 0.6) {
            strengths.push("Consistent high-quality responses");
        }
        if (averageScore >= 80) {
            strengths.push("Strong technical knowledge");
        }
        if (totalTime / totalQuestions <= 90) {
            strengths.push("Good time management");
        }
        
        if (lowScoreAnswers.length > totalQuestions * 0.4) {
            improvements.push("Work on providing more detailed responses");
        }
        if (averageScore < 70) {
            improvements.push("Practice explaining concepts more clearly");
        }
        if (totalTime / totalQuestions > 150) {
            improvements.push("Work on being more concise");
        }
        
        return {
            sessionId,
            role: session.role,
            date: session.created_at,
            duration: Math.round(totalTime / 60), // minutes
            totalQuestions,
            averageScore: Math.round(averageScore),
            performanceBand,
            badgeEarned,
            strengths: strengths.length > 0 ? strengths : ["You completed the interview - great start!"],
            improvements: improvements.length > 0 ? improvements : ["Keep practicing to improve further"],
            detailedScores: answers.map((answer, index) => ({
                questionNumber: index + 1,
                score: answer.score,
                timeSpent: answer.answer_time
            }))
        };
        
    } catch (error) {
        console.error('Error generating session summary:', error);
        return {
            sessionId,
            error: "Could not generate summary",
            averageScore: 0,
            performanceBand: "Unknown",
            strengths: ["Completed the interview"],
            improvements: ["Keep practicing"]
        };
    }
};

module.exports = {
    generateQuestion,
    scoreAnswer,
    generateFeedback,
    determineNextQuestionBranch,
    generateSessionSummary
};