import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    LinearProgress,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Avatar,
    Divider
} from '@mui/material';
import {
    TrendingUp,
    EmojiEvents,
    Assessment,
    History,
    PlayArrow,
    Star
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const InterviewDashboard = () => {
    const [stats, setStats] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // Load stats
            const statsResponse = await fetch('http://localhost:5000/api/interviews/stats/1');
            const statsData = await statsResponse.json();
            setStats(statsData.stats);
            setAchievements(statsData.achievements);
            
            // Load history
            const historyResponse = await fetch('http://localhost:5000/api/interviews/history/1');
            const historyData = await historyResponse.json();
            setSessions(historyData.sessions);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getPerformanceBand = (score) => {
        if (score >= 90) return { label: 'Interview Ready', color: '#4caf50' };
        if (score >= 75) return { label: 'Strong Performance', color: '#8bc34a' };
        if (score >= 60) return { label: 'Good Foundation', color: '#ff9800' };
        if (score >= 40) return { label: 'Keep Practicing', color: '#f44336' };
        return { label: 'Needs Practice', color: '#9e9e9e' };
    };

    const chartData = {
        labels: sessions.slice(-10).map((session, index) => `Session ${index + 1}`),
        datasets: [
            {
                label: 'Interview Score',
                data: sessions.slice(-10).map(session => session.average_score || 0),
                borderColor: '#1976d2',
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Performance Trend',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
            },
        },
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h6">Loading interview dashboard...</Typography>
                <LinearProgress sx={{ mt: 2 }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Interview Progress Dashboard
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Track your mock interview performance and improvement
                </Typography>
            </Box>

            {/* Stats Overview */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Assessment sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                            <Typography variant="h4" color="primary">
                                {stats?.total_sessions || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Interviews
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <TrendingUp sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                            <Typography variant="h4" color="primary">
                                {Math.round(stats?.average_score || 0)}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Average Score
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Star sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
                            <Typography variant="h4" color="primary">
                                {Math.round(stats?.best_score || 0)}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Best Score
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <EmojiEvents sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
                            <Typography variant="h4" color="primary">
                                {stats?.roles_practiced || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Roles Practiced
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Performance Chart */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Performance Trend
                            </Typography>
                            {sessions.length > 0 ? (
                                <Line data={chartData} options={chartOptions} />
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No interview data available yet
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<PlayArrow />}
                                        sx={{ mt: 2 }}
                                        onClick={() => window.location.href = '/jobseeker/mock-interview'}
                                    >
                                        Start Your First Interview
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Achievements */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Achievements
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {achievements.map((achievement, index) => (
                                    <Paper
                                        key={index}
                                        sx={{
                                            p: 2,
                                            backgroundColor: achievement.earned ? '#e8f5e8' : '#f5f5f5',
                                            border: achievement.earned ? '1px solid #4caf50' : '1px solid #e0e0e0'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Avatar
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    bgcolor: achievement.earned ? '#4caf50' : '#9e9e9e',
                                                    mr: 1
                                                }}
                                            >
                                                {achievement.earned ? '✓' : '?'}
                                            </Avatar>
                                            <Typography variant="subtitle2">
                                                {achievement.name}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {achievement.description}
                                        </Typography>
                                    </Paper>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Sessions */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <History sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Recent Interview Sessions
                            </Typography>
                            
                            {sessions.length > 0 ? (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Date</TableCell>
                                                <TableCell>Role</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Score</TableCell>
                                                <TableCell>Performance</TableCell>
                                                <TableCell>Questions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {sessions.slice(0, 10).map((session) => {
                                                const performance = getPerformanceBand(session.average_score || 0);
                                                return (
                                                    <TableRow key={session.id}>
                                                        <TableCell>
                                                            {formatDate(session.created_at)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={session.role}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={session.status}
                                                                size="small"
                                                                color={session.status === 'completed' ? 'success' : 'warning'}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {Math.round(session.average_score || 0)}%
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={performance.label}
                                                                size="small"
                                                                sx={{ backgroundColor: performance.color, color: 'white' }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            {session.questions_answered}/10
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        No interview sessions yet
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        startIcon={<PlayArrow />}
                                        onClick={() => window.location.href = '/jobseeker/mock-interview'}
                                    >
                                        Start Your First Interview
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Current Performance Summary */}
            {stats && stats.average_score > 0 && (
                <Card sx={{ mt: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Current Performance Level
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h4" sx={{ mr: 2 }}>
                                        {Math.round(stats.average_score)}%
                                    </Typography>
                                    <Box>
                                        <Typography variant="subtitle1">
                                            {getPerformanceBand(stats.average_score).label}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Based on {stats.completed_sessions} completed interviews
                                        </Typography>
                                    </Box>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={stats.average_score}
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: getPerformanceBand(stats.average_score).color
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<PlayArrow />}
                                        onClick={() => window.location.href = '/jobseeker/mock-interview'}
                                    >
                                        Continue Practicing
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default InterviewDashboard;
