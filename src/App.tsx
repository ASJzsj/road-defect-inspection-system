import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/auth-context";
import { AnalysisProvider } from "./context/analysis-context";
import LoginPage from "./pages/login-page";
import AppLayout from "./components/layout/app-layout";

// 懒加载页面
const ProjectsPage = React.lazy(() => import("./pages/projects-page"));
const DashboardPage = React.lazy(() => import("./pages/dashboard-page"));
const DefectsPage = React.lazy(() => import("./pages/defects-page"));
const ImportPage = React.lazy(() => import("./pages/import-page"));
const AnalysisPage = React.lazy(() => import("./pages/analysis-page"));
const ReportPage = React.lazy(() => import("./pages/report-page"));

// 路由守卫
function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="w-8 h-8 border-2 border-[#E8873A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/projects" element={
            <React.Suspense fallback={<PageLoader />}><ProjectsPage /></React.Suspense>
          } />
          <Route path="/projects/:id/dashboard" element={
            <React.Suspense fallback={<PageLoader />}><DashboardPage /></React.Suspense>
          } />
          <Route path="/projects/:id/defects" element={
            <React.Suspense fallback={<PageLoader />}><DefectsPage /></React.Suspense>
          } />
          <Route path="/projects/:id/import" element={
            <React.Suspense fallback={<PageLoader />}><ImportPage /></React.Suspense>
          } />
          <Route path="/projects/:id/analysis" element={
            <React.Suspense fallback={<PageLoader />}><AnalysisPage /></React.Suspense>
          } />
          <Route path="/projects/:id/report" element={
            <React.Suspense fallback={<PageLoader />}><ReportPage /></React.Suspense>
          } />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#E8873A] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnalysisProvider>
          <AppRoutes />
        </AnalysisProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
