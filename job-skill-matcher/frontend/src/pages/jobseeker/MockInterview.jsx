import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Card,
    CardContent,
    LinearProgress,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    Grid,
    Alert,
    Stepper,
    Step,
    StepLabel,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    PlayArrow,
    Stop,
    Send,
    Timer,
    Help,
    EmojiEvents,
    TrendingUp,
    School
} from '@mui/icons-material';
import './MockInterview.css';

const MockInterview = () => {
    const [gameState, setGameState] = useState('setup'); // setup, active, feedback, summary
    const [sessionData, setSessionData] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [questionNumber, setQuestionNumber] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [showHints, setShowHints] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [score, setScore] = useState(0);
    const [strengths, setStrengths] = useState([]);
    const [improvements, setImprovements] = useState([]);
    const [summary, setSummary] = useState(null);
    const [selectedRole, setSelectedRole] = useState('Software Engineer');
    const [loading, setLoading] = useState(false);
    
    const timerRef = useRef(null);
    const answerStartTime = useRef(null);

    const popularRoles = [
        'Software Engineer',
        'Data Scientist', 
        'Marketing Manager',
        'Business Analyst',
        'Product Manager',
        'UI/UX Designer'
    ];

    const steps = ['Setup', 'Interview', 'Feedback', 'Summary'];

    // Timer management
    useEffect(() => {
        if (gameState === 'active' && timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0 && gameState === 'active') {
            handleTimeUp();
        }
        
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [timeLeft, gameState]);

    const startInterview = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/interviews/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: selectedRole,
                    experience: 'fresher',
                    userId: 1 // Mock user ID
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to start interview');
            }
            
            if (!data.question) {
                throw new Error('No question received from server');
            }
            
            setSessionData(data);
            setCurrentQuestion(data.question);
            setQuestionNumber(data.questionNumber);
            setTimeLeft(data.question.timeLimit || 120);
            setGameState('active');
            answerStartTime.current = Date.now();
        } catch (error) {
            console.error('Error starting interview:', error);
            alert(`Failed to start interview: ${error.message}. Please ensure the backend server is running.`);
        }
        setLoading(false);
    };

    const submitAnswer = async () => {
        if (!currentAnswer.trim()) {
            alert('Please provide an answer before submitting.');
            return;
        }

        setLoading(true);
        const timeSpent = Math.floor((Date.now() - answerStartTime.current) / 1000);
        
        try {
            const response = await fetch('http://localhost:5000/api/interviews/submit-answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: sessionData.sessionId,
                    questionNumber: questionNumber,
                    answer: currentAnswer,
                    timeSpent: timeSpent
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit answer');
            }
            
            setFeedback(data.feedback);
            setScore(data.score);
            setStrengths(data.strengths || []);
            setImprovements(data.improvements || []);
            
            if (data.completed) {
                setSummary(data.summary);
                setGameState('summary');
            } else {
                if (!data.nextQuestion) {
                    throw new Error('No next question received from server');
                }
                setCurrentQuestion(data.nextQuestion);
                setQuestionNumber(data.questionNumber);
                setTimeLeft(data.nextQuestion.timeLimit || 120);
                setGameState('feedback');
            }
            
            setCurrentAnswer('');
        } catch (error) {
            console.error('Error submitting answer:', error);
            alert(`Failed to submit answer: ${error.message}. Please try again.`);
        }
        setLoading(false);
    };

    const nextQuestion = () => {
        setGameState('active');
        setShowHints(false);
        answerStartTime.current = Date.now();
    };

    const handleTimeUp = () => {
        if (currentAnswer.trim()) {
            submitAnswer();
        } else {
            alert('Time is up! Please submit your answer or the question will be skipped.');
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgressPercentage = () => {
        if (!sessionData) return 0;
        return (questionNumber / 10) * 100;
    };

    const getScoreColor = (score) => {
        if (score >= 90) return '#4caf50';
        if (score >= 75) return '#8bc34a';
        if (score >= 60) return '#ff9800';
        if (score >= 40) return '#f44336';
        return '#9e9e9e';
    };

    const restartInterview = () => {
        setGameState('setup');
        setSessionData(null);
        setCurrentQuestion(null);
        setCurrentAnswer('');
        setQuestionNumber(0);
        setTimeLeft(0);
        setFeedback('');
        setScore(0);
        setStrengths([]);
        setImprovements([]);
        setSummary(null);
        setShowHints(false);
    };

    // Setup Phase
    if (gameState === 'setup') {
        return (
            <Box className="mock-interview-container">
                <Card className="setup-card">
                    <CardContent>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <EmojiEvents sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                            <Typography variant="h4" gutterBottom>
                                Mock Interview Challenge
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                Practice with AI-powered adaptive questions designed for freshers
                            </Typography>
                        </Box>

                        <Stepper activeStep={0} sx={{ mb: 4 }}>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Select Your Target Role
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {popularRoles.map((role) => (
                                    <Chip
                                        key={role}
                                        label={role}
                                        clickable
                                        color={selectedRole === role ? 'primary' : 'default'}
                                        onClick={() => setSelectedRole(role)}
                                        sx={{ mb: 1 }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        

                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<PlayArrow />}
                                onClick={startInterview}
                                disabled={loading}
                                className="start-button"
                            >
                                {loading ? 'Starting Interview...' : 'Start Mock Interview'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    // Active Interview Phase
    if (gameState === 'active') {
        return (
            <Box className="mock-interview-container">
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper className="interview-header" sx={{ p: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h6">
                                        Question {questionNumber} of 10
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedRole} Interview
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Chip
                                        icon={<Timer />}
                                        label={formatTime(timeLeft)}
                                        color={timeLeft <= 30 ? 'error' : 'primary'}
                                        variant="outlined"
                                    />
                                    <Tooltip title="Show hints">
                                        <IconButton onClick={() => setShowHints(!showHints)}>
                                            <Help />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                            <LinearProgress 
                                variant="determinate" 
                                value={getProgressPercentage()} 
                                sx={{ mt: 1 }}
                            />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Card className="question-card">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {currentQuestion?.question}
                                </Typography>
                                
                                <Box sx={{ mb: 2 }}>
                                    <Chip 
                                        label={currentQuestion?.type} 
                                        size="small" 
                                        sx={{ mr: 1 }}
                                    />
                                    <Chip 
                                        label={currentQuestion?.difficulty} 
                                        size="small" 
                                        color="secondary"
                                    />
                                </Box>

                                {showHints && currentQuestion?.hints && (
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        <Typography variant="body2">
                                            <strong>Hints:</strong>
                                            <ul>
                                                {currentQuestion.hints.map((hint, index) => (
                                                    <li key={index}>{hint}</li>
                                                ))}
                                            </ul>
                                        </Typography>
                                    </Alert>
                                )}

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={8}
                                    placeholder="Type your answer here..."
                                    value={currentAnswer}
                                    onChange={(e) => setCurrentAnswer(e.target.value)}
                                    sx={{ mb: 2 }}
                                />

                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setCurrentAnswer('')}
                                        disabled={loading}
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        variant="contained"
                                        endIcon={<Send />}
                                        onClick={submitAnswer}
                                        disabled={loading || !currentAnswer.trim()}
                                    >
                                        {loading ? 'Submitting...' : 'Submit Answer'}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card className="progress-card">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Progress
                                </Typography>
                                
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Questions Completed
                                    </Typography>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={((questionNumber - 1) / 10) * 100} 
                                        sx={{ mt: 1 }}
                                    />
                                    <Typography variant="caption">
                                        {questionNumber - 1} / 10
                                    </Typography>
                                </Box>

                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Tips for Success:
                                </Typography>
                                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                    <Typography component="li" variant="body2">
                                        Be specific and provide examples
                                    </Typography>
                                    <Typography component="li" variant="body2">
                                        Structure your answers clearly
                                    </Typography>
                                    <Typography component="li" variant="body2">
                                        Show your thought process
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    // Feedback Phase
    if (gameState === 'feedback') {
        return (
            <Box className="mock-interview-container">
                <Card className="feedback-card">
                    <CardContent>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Typography variant="h5" gutterBottom>
                                Question {questionNumber - 1} Feedback
                            </Typography>
                            <Box 
                                sx={{ 
                                    fontSize: 48, 
                                    fontWeight: 'bold',
                                    color: getScoreColor(score),
                                    mb: 1
                                }}
                            >
                                {score}/100
                            </Box>
                            <Typography variant="h6" color="text.secondary">
                                {score >= 90 ? 'Excellent!' : score >= 75 ? 'Good Job!' : score >= 60 ? 'Keep Going!' : 'Practice More!'}
                            </Typography>
                        </Box>

                        <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f5f5f5' }}>
                            <Typography variant="h6" gutterBottom>
                                AI Feedback:
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                {feedback}
                            </Typography>
                            
                            {/* Show strengths if available */}
                            {strengths && strengths.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#4caf50', fontWeight: 'bold', mb: 1 }}>
                                        Strengths:
                                    </Typography>
                                    {strengths.map((strength, index) => (
                                        <Typography key={index} variant="body2" sx={{ mb: 0.5, pl: 2 }}>
                                            • {strength}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                            
                            {/* Show improvements if available */}
                            {improvements && improvements.length > 0 && (
                                <Box>
                                    <Typography variant="subtitle2" sx={{ color: '#ff9800', fontWeight: 'bold', mb: 1 }}>
                                        Areas for Improvement:
                                    </Typography>
                                    {improvements.map((improvement, index) => (
                                        <Typography key={index} variant="body2" sx={{ mb: 0.5, pl: 2 }}>
                                            • {improvement}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </Paper>

                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={nextQuestion}
                                startIcon={<PlayArrow />}
                            >
                                Continue to Next Question
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    // Summary Phase
    if (gameState === 'summary') {
        return (
            <Box className="mock-interview-container">
                <Card className="summary-card">
                    <CardContent>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <EmojiEvents sx={{ fontSize: 80, color: '#ffd700', mb: 2 }} />
                            <Typography variant="h4" gutterBottom>
                                Interview Complete!
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                Here's how you performed
                            </Typography>
                        </Box>

                        {summary && (
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                                        <Typography variant="h3" color="primary" gutterBottom>
                                            {summary.averageScore}%
                                        </Typography>
                                        <Typography variant="h6" gutterBottom>
                                            Overall Score
                                        </Typography>
                                        <Chip 
                                            label={summary.performanceBand} 
                                            color="primary" 
                                            sx={{ fontSize: '1rem', p: 1 }}
                                        />
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Session Stats
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography>Duration:</Typography>
                                            <Typography>{summary.duration} minutes</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography>Questions:</Typography>
                                            <Typography>{summary.totalQuestions}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography>Role:</Typography>
                                            <Typography>{summary.role}</Typography>
                                        </Box>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom color="success.main">
                                            Strengths
                                        </Typography>
                                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                            {summary.strengths.map((strength, index) => (
                                                <Typography component="li" key={index} variant="body2" sx={{ mb: 0.5 }}>
                                                    {strength}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom color="warning.main">
                                            Areas for Improvement
                                        </Typography>
                                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                            {summary.improvements.map((improvement, index) => (
                                                <Typography component="li" key={index} variant="body2" sx={{ mb: 0.5 }}>
                                                    {improvement}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Paper>
                                </Grid>

                                {summary.badgeEarned && (
                                    <Grid item xs={12}>
                                        <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#fff3e0' }}>
                                            <Typography variant="h6" gutterBottom>
                                                Achievement Unlocked!
                                            </Typography>
                                            <Typography variant="h4" gutterBottom>
                                                {summary.badgeEarned}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                )}
                            </Grid>
                        )}

                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={restartInterview}
                                sx={{ mr: 2 }}
                            >
                                Try Another Interview
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => window.location.href = '/jobseeker/dashboard'}
                            >
                                Back to Dashboard
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return null;
};

export default MockInterview;
