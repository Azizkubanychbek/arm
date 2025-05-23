import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layout components
import { AuthLayout } from './components/layout/AuthLayout';
import { ProtectedLayout } from './components/layout/ProtectedLayout';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Dashboard
import { DashboardPage } from './pages/dashboard/DashboardPage';

// Test pages
import { CreateTestPage } from './pages/tests/CreateTestPage';
import { TakeTestPage } from './pages/tests/TakeTestPage';
import { TestResultPage } from './pages/tests/TestResultPage';
import { TestDetailsPage } from './pages/tests/TestDetailsPage';
import { OfflineSubmissionPage } from './pages/tests/OfflineSubmissionPage';

// Analytics
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';

function App() {
  const { checkAuth } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        
        {/* Protected routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Test routes */}
          <Route path="/tests/create" element={<CreateTestPage />} />
          <Route path="/tests/manage" element={<DashboardPage />} />
          <Route path="/tests/available" element={<DashboardPage />} />
          <Route path="/tests/results" element={<DashboardPage />} />
          <Route path="/tests/take/:id" element={<TakeTestPage />} />
          <Route path="/tests/results/:id" element={<TestResultPage />} />
          <Route path="/tests/details/:id" element={<TestDetailsPage />} />
          <Route path="/tests/offline-submission/:id" element={<OfflineSubmissionPage />} />
          
          {/* Analytics */}
          <Route path="/analytics" element={<AnalyticsPage />} />
          
          {/* Settings */}
          <Route path="/settings" element={<DashboardPage />} />
        </Route>
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;