import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Login from '@/pages/Login';
import AuthCallback from '@/pages/AuthCallback';
import Onboarding from '@/pages/Onboarding';
import Home from '@/pages/Home';
import Articles from '@/pages/Articles';
import ArticleView from '@/pages/ArticleView';
import Reading from '@/pages/Reading';
import WordBank from '@/pages/WordBank';
import Progress from '@/pages/Progress';
import MyClasses from '@/pages/MyClasses';
import JoinClass from '@/pages/JoinClass';
import Settings from '@/pages/Settings';
import Admin from '@/pages/Admin';
import TeacherDashboard from '@/pages/TeacherDashboard';
import ClassDetail from '@/pages/ClassDetail';

import { useAuth } from '@/hooks/useAuth';
import { loadFullChineseDict } from '@/lib/dictionaries/chinese';

function App() {
  const { profile, loading } = useAuth();

  // Preload Chinese dictionary for Chinese learners
  useEffect(() => {
    if (profile?.target_language === 'zh') {
      console.log('[App] Preloading Chinese dictionary for user...');
      loadFullChineseDict().then(() => {
        console.log('[App] Chinese dictionary preloaded successfully');
      }).catch((error) => {
        console.error('[App] Failed to preload Chinese dictionary:', error);
      });
    }
  }, [profile?.target_language]);

  // Root redirect logic
  const RootRedirect = () => {
    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      );
    }

    if (!profile) {
      return <Navigate to="/login" replace />;
    }

    if (profile.role === 'teacher') {
      return <Navigate to="/teacher" replace />;
    }

    if (!profile.target_language) {
      return <Navigate to="/onboarding" replace />;
    }

    return <Navigate to="/home" replace />;
  };

  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute requiredRole="student">
            <Onboarding />
          </ProtectedRoute>
        }
      />

      <Route
        path="/home"
        element={
          <ProtectedRoute requiredRole="student">
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/articles"
        element={
          <ProtectedRoute requiredRole="student">
            <Articles />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reading"
        element={
          <ProtectedRoute requiredRole="student">
            <Reading />
          </ProtectedRoute>
        }
      />

      <Route
        path="/article/:id"
        element={
          <ProtectedRoute requiredRole="student">
            <ArticleView />
          </ProtectedRoute>
        }
      />

      <Route
        path="/word-bank"
        element={
          <ProtectedRoute requiredRole="student">
            <WordBank />
          </ProtectedRoute>
        }
      />

      <Route
        path="/progress"
        element={
          <ProtectedRoute requiredRole="student">
            <Progress />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-classes"
        element={
          <ProtectedRoute requiredRole="student">
            <MyClasses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/join-class"
        element={
          <ProtectedRoute requiredRole="student">
            <JoinClass />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute requiredRole="student">
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/class/:id"
        element={
          <ProtectedRoute requiredRole="teacher">
            <ClassDetail />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
