import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Login from '@/pages/Login';
import AuthCallback from '@/pages/AuthCallback';
import Onboarding from '@/pages/Onboarding';
import Home from '@/pages/Home';
import ArticleView from '@/pages/ArticleView';
import WordBank from '@/pages/WordBank';
import Progress from '@/pages/Progress';
import MyClasses from '@/pages/MyClasses';
import JoinClass from '@/pages/JoinClass';
import TeacherDashboard from '@/pages/TeacherDashboard';
import ClassDetail from '@/pages/ClassDetail';

import { useAuth } from '@/hooks/useAuth';

function App() {
  const { profile, loading } = useAuth();

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
