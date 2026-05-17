import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import PTLayout from './pages/pt/PTLayout';
import PTSchedule from './pages/pt/PTSchedule';
import PTClients from './pages/pt/PTClients';
import PTClientProfile from './pages/pt/PTClientProfile';
import PTBlockTracker from './pages/pt/PTBlockTracker';
import PTIncome from './pages/pt/PTIncome';
import PTWellness from './pages/pt/PTWellness';
import PTProgress from './pages/pt/PTProgress';
import PTClasses from './pages/pt/PTClasses';
import PTSubscriptions from './pages/pt/PTSubscriptions';

import ClientLayout from './pages/client/ClientLayout';
import ClientHome from './pages/client/ClientHome';
import ClientSessions from './pages/client/ClientSessions';
import ClientProgress from './pages/client/ClientProgress';
import ClientProfilePage from './pages/client/ClientProfilePage';
import ClientNutrition from './pages/client/ClientNutrition';
import ClientHabits from './pages/client/ClientHabits';
import ClientWellness from './pages/client/ClientWellness';
import ClientExercises from './pages/client/ClientExercises';
import ClientWorkout from './pages/client/ClientWorkout';
import ClientOnboarding from './pages/client/ClientOnboarding';
import ClientFoodDiary from './pages/client/ClientFoodDiary';
import ClientWorkoutLog from './pages/client/ClientWorkoutLog';
import ClientProgramme from './pages/client/ClientProgramme';
import ClientProgrammes from './pages/client/ClientProgrammes';
import ClientCheckIn from './pages/client/ClientCheckin';
import ClientMessages from './pages/client/ClientMessages';
import ClientWearable from './pages/client/ClientWearable';
import ClientWorkouts from './pages/client/ClientWorkouts';
import SuccessStories from './pages/client/SuccessStories';
import ProUpgradePage from './pages/client/ProUpgradePage';
import ClientWorkoutPlayer from './pages/client/ClientWorkoutPlayer';

import PrivacyPolicy from './pages/client/PrivacyPolicy';
import PTAnalytics from './pages/pt/PTAnalytics';
import PTExercises from './pages/pt/PTExercises';
import PTWorkoutBuilder from './pages/pt/PTWorkoutBuilder';
import PTWorkouts from './pages/pt/PTWorkouts';
import PTMediaManager from './pages/pt/PTMediaManager';

import PTAdvancedBlockManagement from './pages/pt/PTAdvancedBlockManagement';
import ClientSettings from './pages/client/ClientSettings';
import ClientHelp from './pages/client/ClientHelp';


import PTMessages from './pages/pt/PTMessages';
import ClientProgressPhotos from './pages/client/ClientProgressPhotos';

function ProtectedRoute({ children, requireRole }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
        <p className="text-grey-200 text-sm">Loading BrazilFit...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (requireRole && user.role !== requireRole) {
    return <Navigate to={user.role === 'pt' ? '/pt' : '/client'} replace />;
  }
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to={user.role === 'pt' ? '/pt' : '/client'} replace /> : <Login />
      } />

      {/* PT Routes */}
      <Route path="/pt" element={
        <ProtectedRoute requireRole="pt"><PTLayout /></ProtectedRoute>
      }>
        <Route index element={<PTSchedule />} />
        <Route path="clients" element={<PTClients />} />
        <Route path="clients/:id" element={<PTClientProfile />} />
        <Route path="messages/:clientId" element={<PTMessages />} />
        <Route path="blocks" element={<PTBlockTracker />} />
        <Route path="income" element={<PTIncome />} />
        <Route path="wellness" element={<PTWellness />} />
        <Route path="progress" element={<PTProgress />} />
        <Route path="classes" element={<PTClasses />} />
        <Route path="subscriptions" element={<PTSubscriptions />} />
        <Route path="exercises" element={<PTExercises />} />
        <Route path="workouts" element={<PTWorkouts />} />
        <Route path="media" element={<PTMediaManager />} />
        <Route path="analytics" element={<PTAnalytics />} />
        <Route path="settings" element={<ClientSettings />} />
      </Route>

      {/* Client Routes */}
      <Route path="/client" element={
        <ProtectedRoute requireRole="client"><ClientLayout /></ProtectedRoute>
      }>
        <Route index element={<ClientHome />} />
        <Route path="sessions" element={<ClientSessions />} />
        <Route path="progress" element={<ClientProgress />} />
        <Route path="nutrition" element={<ClientNutrition />} />
        <Route path="habits" element={<ClientHabits />} />
        <Route path="wellness" element={<ClientWellness />} />
        <Route path="exercises" element={<ClientExercises />} />
        <Route path="workout" element={<ClientWorkout />} />
        <Route path="workouts" element={<ClientWorkouts />} />
        <Route path="onboarding" element={<ClientOnboarding />} />
        <Route path="diary" element={<ClientFoodDiary />} />
        <Route path="programmes" element={<ClientProgrammes />} />
        <Route path="programme" element={<ClientProgramme />} />
        <Route path="checkin" element={<ClientCheckIn />} />
        <Route path="messages" element={<ClientMessages />} />
        <Route path="progress-photos" element={<ClientProgressPhotos />} />
        <Route path="wearables" element={<ClientWearable />} />
        <Route path="stories" element={<SuccessStories />} />
        <Route path="upgrade" element={<ProUpgradePage />} />
        <Route path="pro-success" element={<ProUpgradePage success />} />
        <Route path="profile" element={<ClientProfilePage />} />

        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="settings" element={<ClientSettings />} />
        <Route path="help" element={<ClientHelp />} />
      </Route>

      <Route path="/" element={
        user ? <Navigate to={user.role === 'pt' ? '/pt' : '/client'} replace /> : <Navigate to="/login" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#111111',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#27AE60', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#E74C3C', secondary: '#fff' },
          },
        }}
      />
    </AuthProvider>
  );
}

