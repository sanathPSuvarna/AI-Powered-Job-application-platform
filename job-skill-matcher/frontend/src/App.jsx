import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import Layout from './components/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// JobSeeker Pages
import JobSeekerDashboard from './pages/jobseeker/Dashboard';
import CreateProfile from './pages/jobseeker/CreateProfile';
import Skills from './pages/jobseeker/Skills';
import ResearchPapers from './pages/jobseeker/ResearchPapers';
import EditProfile from './pages/jobseeker/EditProfile';
import CareerPathSimulator from './pages/jobseeker/CareerPathSimulator';
import MockInterview from './pages/jobseeker/MockInterview';
import InterviewDashboard from './pages/jobseeker/InterviewDashboard';

// Employer Pages
import EmployerDashboard from './pages/employer/Dashboard';
import EmployerEditProfile from './pages/employer/EditProfile';
import PostJob from './pages/employer/PostJob';
import CreateEmployerProfile from './pages/employer/CreateProfile';
import ReviewApplication from './pages/employer/ReviewApplication';

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/auth/login" replace />;
};

const UserTypeLayout = ({ children, userType }) => {
  return (
    <Layout userType={userType}>
      {children}
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          {/* JobSeeker Routes */}
          <Route path="/jobseeker/*" element={
            <AuthRoute>
              <UserTypeLayout userType="jobseeker">
                <Routes>
                  <Route path="/dashboard" element={<JobSeekerDashboard />} />
                  <Route path="/create-profile" element={<CreateProfile />} />
                  <Route path="/research-papers" element={<ResearchPapers />} />
                  <Route path="/edit-profile" element={<EditProfile />} />
                  <Route path="/skills" element={<Skills />} />
                  <Route path="/career-path-simulator" element={<CareerPathSimulator />} />
                  <Route path="/mock-interview" element={<MockInterview />} />
                  <Route path="/interview-dashboard" element={<InterviewDashboard />} />
                </Routes>
              </UserTypeLayout>
            </AuthRoute>
          } />

          {/* Employer Routes */}
          <Route path="/employer/*" element={
            <AuthRoute>
              <UserTypeLayout userType="employer">
                <Routes>
                  <Route path="/dashboard" element={<EmployerDashboard />} />
                  <Route path="/create-profile" element={<CreateEmployerProfile />} />
                  <Route path="/edit-profile" element={<EmployerEditProfile />} />
                  <Route path="/post-job" element={<PostJob />} />
                  <Route path="/applications/:applicationId" element={<ReviewApplication />} />
                </Routes>
              </UserTypeLayout>
            </AuthRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
