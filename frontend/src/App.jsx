import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // FIX: Trim the role to remove any spaces
  const userRole = (user.role || (user.admin === true ? 'admin' : 'user')).trim();
  
  console.log('App - User Role:', `"${userRole}"`); // This will show if there are spaces
  console.log('App - User Object:', user);

  // ADMIN ROUTES
  if (userRole === 'admin') {
    console.log('Rendering Admin Routes');
    return (
      <Layout>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/subscriptions" element={<AdminSubscriptions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="*" element={<Navigate to="/" replace />} />
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
        <Route path="ai-assistant" element={<AIAssistant />} />
        <Route path="/my-coach" element={<CoachProfileView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;