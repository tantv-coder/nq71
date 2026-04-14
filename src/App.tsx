import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { useAppStore } from './stores/appStore';
import { IS_DEMO_MODE, supabase } from './lib/supabase';
import { Toaster } from 'react-hot-toast';

// Layout
import AppLayout from './components/layout/AppLayout';

// Auth
import LoginPage from './features/auth/LoginPage';
import AuthGuard from './features/auth/AuthGuard';

// Admin pages
import DashboardPage from './features/dashboard/DashboardPage';
import TaskListPage from './features/tasks/TaskListPage';
import TaskDetailPage from './features/tasks/TaskDetailPage';
import UserListPage from './features/admin/UserListPage';
import AuditLogPage from './features/admin/AuditLogPage';
import StatisticsPage from './features/statistics/StatisticsPage';

// Reporter pages
import MyTasksPage from './features/reports/MyTasksPage';
import MyReportsPage from './features/reports/MyReportsPage';
import ReportFormPage from './features/reports/ReportFormPage';

// Profile page
import ProfilePage from './features/profile/ProfilePage';

// Public generic pages
import PublicStatisticsPage from './features/public/PublicStatisticsPage';

function AppRoutes() {
  const { profile } = useAuthStore();
  const isAdmin = profile?.role === 'ROLE_ADMIN';

  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage />}
      />
      
      {/* Public Pages */}
      <Route
        path="/public/statistics"
        element={<PublicStatisticsPage />}
      />

      <Route
        path="/"
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      >
        {/* Home route - different per role */}
        <Route
          index
          element={isAdmin ? <DashboardPage /> : <MyTasksPage />}
        />

        {/* Shared routes */}
        <Route path="profile" element={<ProfilePage />} />

        {/* Admin routes */}
        <Route path="tasks" element={isAdmin ? <TaskListPage /> : <Navigate to="/" />} />
        <Route path="tasks/:taskId" element={isAdmin ? <TaskDetailPage /> : <Navigate to="/" />} />
        <Route path="statistics" element={isAdmin ? <StatisticsPage /> : <Navigate to="/" />} />
        <Route path="users" element={isAdmin ? <UserListPage /> : <Navigate to="/" />} />
        <Route path="audit-log" element={isAdmin ? <AuditLogPage /> : <Navigate to="/" />} />

        {/* Reporter routes */}
        <Route path="my-reports" element={!isAdmin ? <MyReportsPage /> : <Navigate to="/" />} />
        <Route path="report/:taskId" element={!isAdmin ? <ReportFormPage /> : <Navigate to="/" />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  const { setLoading, loginDemo, loginSupabase } = useAuthStore();
  const { loadFromSupabase, isLoaded } = useAppStore();

  useEffect(() => {
    async function initApp() {
      if (IS_DEMO_MODE) {
        const savedEmail = localStorage.getItem('demo_user_email');
        if (savedEmail) {
          loginDemo(savedEmail, 'demo');
        }
        await loadFromSupabase();
        setLoading(false);
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.email) {
          await loginSupabase(session.user.email);
        } else {
          const savedEmail = localStorage.getItem('supabase_user_email');
          if (savedEmail) {
            await loginSupabase(savedEmail);
          }
        }
        
        await loadFromSupabase();
        setLoading(false);

        supabase.auth.onAuthStateChange(async (_event, currentSession) => {
          if (currentSession?.user?.email) {
            await loginSupabase(currentSession.user.email);
          }
        });
      }
    }
    
    if (!isLoaded) {
      initApp();
    }
  }, [setLoading, loginDemo, loginSupabase, loadFromSupabase, isLoaded]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AppRoutes />
    </BrowserRouter>
  );
}
