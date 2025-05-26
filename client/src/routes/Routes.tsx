import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import JobListPage from '../pages/JobListPage';
import JobDetailsPage from '../pages/JobDetailsPage';
import LoginPage from '../pages/LoginPage';
import ProtectedRoute from '../components/ProtectedRoute'; 
import Layout from '../components/Layout';
import RegisterPage from '../pages/RegisterPage';
import PostJobPage from '../pages/PostJobPage';
import EditJobPage from '../pages/EditJobPage';
import MyJobsPage from '../pages/MyJobs';
import Applicants from '../pages/Applicants';
import MyApplications from '../pages/MyApplications';
import ProfilePage from '../pages/ProfilePage';
import EditProfilePage from '../pages/EditProfilePage';
import SavedJobsPage from '../pages/SavedJobsPage';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobListPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/my-applications" element={<MyApplications />} />
        </Route>
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/employer/jobs/:id/edit" element={<EditJobPage />} />
        <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
        <Route path="/applications/job/:id" element ={<Applicants/>} />
        <Route path="/saved-jobs" element={<SavedJobsPage />} />
       
            <Route path="/post-job" element={<PostJobPage />} />
            <Route path="/my-jobs" element={<MyJobsPage />} />
            <Route path="/profile/me" element={<ProfilePage />} />
            <Route path="/profile" element={<EditProfilePage />}/> 
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
