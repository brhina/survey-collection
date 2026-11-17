import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/feedback/ErrorBoundary';
import AdminLayout from './components/layout/AdminLayout';
import PublicLayout from './components/layout/PublicLayout';

// Auth Provider & Route Guard
import { AuthProvider } from './features/auth/context/AuthContext';
import AdminRoute from './features/auth/components/AdminRoute';

// Modular Route Pages
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardPage from './pages/admin/DashboardPage';
import CreateSurveyPage from './pages/admin/CreateSurveyPage';
import SurveyResultsPage from './pages/admin/SurveyResultsPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import TakeSurveyPage from './pages/student/TakeSurveyPage';
import ThankYouPage from './pages/student/ThankYouPage';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #f1f5f9',
                borderRadius: '16px',
                padding: '12px 18px',
                fontSize: '14px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.07)'
              },
              success: {
                iconTheme: {
                  primary: '#059669',
                  secondary: '#ffffff'
                }
              }
            }}
          />

          <Routes>
            {/* Public Landing & Survey Browsing */}
            <Route
              path="/"
              element={
                <AdminLayout>
                  <HomePage />
                </AdminLayout>
              }
            />

            {/* Admin Authentication */}
            <Route
              path="/admin/login"
              element={
                <PublicLayout>
                  <AdminLoginPage />
                </PublicLayout>
              }
            />

            {/* Protected Admin Management Area */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <DashboardPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/create"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <CreateSurveyPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/results/:id"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <SurveyResultsPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            {/* Respondent / Student Taking Canvas */}
            <Route
              path="/survey/:id"
              element={
                <PublicLayout>
                  <TakeSurveyPage />
                </PublicLayout>
              }
            />
            <Route
              path="/thank-you"
              element={
                <PublicLayout>
                  <ThankYouPage />
                </PublicLayout>
              }
            />

            {/* 404 Catch-All */}
            <Route
              path="*"
              element={
                <AdminLayout>
                  <NotFoundPage />
                </AdminLayout>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
