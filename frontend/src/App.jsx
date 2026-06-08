import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import LandingPage from './pages/LandingPage';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// User pages
import Dashboard from './pages/user/Dashboard';
import Profile from './pages/user/Profile';
import Settings from './pages/user/Settings';
import Workouts from './pages/user/Workouts';
import DietPlan from './pages/user/DietPlan';
import Messages from './pages/user/UserMessages';
import Subscription from './pages/user/Subscription';
import AIAssistant from './pages/user/AIAssistant';
import CoachProfileView from './pages/user/CoachProfileView';
import Contact from './pages/user/Contact';

// Coach pages
import CoachDashboard from './pages/coach/CoachDashboard';
import CoachClients from './pages/coach/CoachUsers';
import ClientDetails from './pages/coach/UserDetails';
import CoachMessages from './pages/coach/CoachMessages';
import CreateDietPlan from './pages/coach/CreateDietPlan'
import CreateWorkout from './pages/coach/CreateWorkout'
import CoachProfile from './pages/coach/CoachProfile';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminFreeTrial from './pages/admin/AdminFreeTrial';
import AdminReports from './pages/admin/AdminReports';
import AdminContacts from './pages/admin/AdminContacts';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // FIX: Trim the role to remove any spaces
  const userRole = (user.role || (user.admin === true ? 'admin' : 'user')).trim();
  
  console.log('App - User Role:', `"${userRole}"`);
  console.log('App - User Object:', user);

  // ADMIN ROUTES - Using /admin prefix for consistency
  if (userRole === 'admin') {
    console.log('Rendering Admin Routes');
    return (
      <Layout>
        <Routes>
          {/* Main admin routes with /admin prefix */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
          <Route path="/admin/free-trial" element={<AdminFreeTrial />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/contacts" element={<AdminContacts />} />
          
          {/* Also support non-prefixed routes for backward compatibility */}
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/subscriptions" element={<AdminSubscriptions />} />
          
          {/* Common routes */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/messages" element={<Messages />} />
          
          {/* Redirect root to admin dashboard for admin users */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Layout>
    );
  }

  // COACH ROUTES
  if (userRole === 'coach') {
    console.log('Rendering Coach Routes');
    return (
      <Layout>
        <Routes>
          <Route path="/" element={<CoachDashboard />} />
          <Route path="/clients" element={<CoachClients />} />
          <Route path="/clients/:clientId" element={<ClientDetails />} />
          <Route path="/messages" element={<CoachMessages />} />
          <Route path="/profile" element={<CoachProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/coach/clients/:userId/diet-plan/create" element={<CreateDietPlan />}/>
          <Route path="/coach/clients/:userId/workout/create" element={<CreateWorkout />} />
          <Route path="/contact" element={<Contact />} /> 
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    );
  }

  // USER ROUTES
  console.log('Rendering User Routes');
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/diet-plan" element={<DietPlan />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/my-coach" element={<CoachProfileView />} />
        <Route path="/contact" element={<Contact />} /> 
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;