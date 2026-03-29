import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import CoursePlayer from './pages/CoursePlayer';
import MyCourses from './pages/MyCourses';
import Certificates from './pages/Certificates';
import TeacherPanel from './pages/TeacherPanel';
import AdminPanel from './pages/AdminPanel';
import './index.css';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="geometric-bg min-h-screen">
      <Navbar onToggleSidebar={() => setSidebarOpen(v => !v)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content — offset for fixed navbar (h-16) and desktop sidebar (w-56) */}
      <main className="pt-16 lg:pl-56 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/course/:courseId" element={<CoursePlayer />} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/teacher" element={<TeacherPanel />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/users" element={<AdminPanel />} />
            <Route path="/admin/settings" element={<AdminPanel />} />
            <Route path="*" element={
              <div className="text-center py-20">
                <p className="font-cinzel text-4xl text-gold-400 mb-4">404</p>
                <p className="text-cream/40 font-crimson mb-6">Page not found</p>
                <a href="/" className="btn-gold inline-block">Go Home</a>
              </div>
            } />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout />
      </AppProvider>
    </BrowserRouter>
  );
}
