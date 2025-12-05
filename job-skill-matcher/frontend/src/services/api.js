
import axios from 'axios';

const API_URL = "http://localhost:5000/api";

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const api = {
    test: () => fetch(`${API_URL}/test`)
        .then(response => response.json())
        .catch(error => console.error('Error:', error))
};

// Career Path API
export const careerPathApi = {
    // Get all available career goals
    getCareerGoals: () => apiClient.get('/career-path/goals'),
    
    // Get career path steps for a specific goal
    getCareerPathSteps: (goalId) => apiClient.get(`/career-path/goals/${goalId}/steps`),
    
    // Simulate career path for a user
    simulateCareerPath: (data) => apiClient.post('/career-path/simulate', data),
    
    // Save user's career goal
    saveCareerGoal: (data) => apiClient.post('/career-path/goals', data),
    
    // Get user's career goals and progress
    getUserCareerGoals: () => apiClient.get('/career-path/my-goals'),
    
    // Get personalized career roadmap for user
    getPersonalizedRoadmap: () => apiClient.get('/career-path/roadmap'),
};

export default API_URL;
