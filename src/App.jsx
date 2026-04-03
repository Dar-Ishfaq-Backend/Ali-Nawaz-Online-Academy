
import { useState } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import AcademyLogo from './components/AcademyLogo';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import CoursePlayer from './pages/CoursePlayer';
import MyCourses from './pages/MyCourses';
import Certificates from './pages/Certificates';
import TeacherPanel from './pages/TeacherPanel';
import AdminPanel from './pages/AdminPanel';
import AalimProgram from './pages/AalimProgram';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import './index.css';

function PublicOnlyRoute() {
  const { authReady, isAuthenticated } = useApp();
  if (!authReady) {
    return (
      <div className="geometric-bg min-h-screen flex items-center justify-center px-4">
        <div className="glass-card px-6 py-5 text-center">
          <AcademyLogo size="md" textAlign="center" className="justify-center mb-4" />
          <p className="font-cinzel text-gold-400 text-sm tracking-[0.2em] mb-2">LOADING</p>
          <p className="text-cream/55 font-crimson">Preparing your academy portal...</p>
        </div>
      </div>
    );
  }
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

function ProtectedShell() {
  const { authReady, isAuthenticated } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!authReady) {
    return (
      <div className="geometric-bg min-h-screen flex items-center justify-center px-4">
        <div className="glass-card px-6 py-5 text-center">
          <AcademyLogo size="md" textAlign="center" className="justify-center mb-4" />
          <p className="font-cinzel text-gold-400 text-sm tracking-[0.2em] mb-2">LOADING</p>
          <p className="text-cream/55 font-crimson">Syncing your account...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="geometric-bg min-h-screen">
      <Navbar onToggleSidebar={() => setSidebarOpen((value) => !value)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="pt-16 lg:pl-56 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function ProtectedNotFound() {
  return (
    <div className="text-center py-20">
      <p className="font-cinzel text-4xl text-gold-400 mb-4">404</p>
      <p className="text-cream/40 font-crimson mb-6">Page not found</p>
      <a href="/" className="btn-gold inline-block">Go Home</a>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<ProtectedShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/aalim-program" element={<AalimProgram />} />
        <Route path="/course/:courseId" element={<CoursePlayer />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/teacher" element={<TeacherPanel />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/users" element={<AdminPanel />} />
        <Route path="/admin/courses" element={<AdminPanel />} />
        <Route path="/admin/payments" element={<AdminPanel />} />
        <Route path="/admin/settings" element={<AdminPanel />} />
        <Route path="*" element={<ProtectedNotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
