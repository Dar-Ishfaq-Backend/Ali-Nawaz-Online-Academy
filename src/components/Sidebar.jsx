import { Link, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, GraduationCap, Award,
  Users, BarChart3, PlusCircle, X, Flame, LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import AcademyLogo from './AcademyLogo';

const NavItem = ({ to, icon: Icon, label, onClick }) => (
  <NavLink to={to} onClick={onClick}
    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
    <Icon size={17} />
    <span>{label}</span>
  </NavLink>
);

export default function Sidebar({ open, onClose }) {
  const { currentUser, role, streak, logout } = useApp();

  // Nav items per role
  const studentNav = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/courses', icon: BookOpen, label: 'All Courses' },
    { to: '/my-courses', icon: GraduationCap, label: 'My Learning' },
    { to: '/certificates', icon: Award, label: 'Certificates' },
  ];

  const teacherNav = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/courses', icon: BookOpen, label: 'All Courses' },
    { to: '/teacher', icon: PlusCircle, label: 'Manage Courses' },
  ];

  const adminNav = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/courses', icon: BookOpen, label: 'All Courses' },
    { to: '/admin', icon: BarChart3, label: 'Admin Panel' },
    { to: '/teacher', icon: PlusCircle, label: 'Content' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/settings', icon: Award, label: 'Templates' },
  ];

  const superAdminNav = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/courses', icon: BookOpen, label: 'All Courses' },
    { to: '/admin', icon: BarChart3, label: 'Analytics' },
    { to: '/teacher', icon: PlusCircle, label: 'Content' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/settings', icon: Award, label: 'Templates' },
  ];

  const navMap = { Student: studentNav, Teacher: teacherNav, Admin: adminNav, 'Super Admin': superAdminNav };
  const navItems = navMap[role] || studentNav;

  const sidebarContent = (
    <div className="flex flex-col h-full pt-4 pb-6">
      {/* Close (mobile) */}
      <div className="flex items-center justify-between px-4 mb-4 lg:hidden">
        <span className="font-cinzel text-gold-400 text-sm">MENU</span>
        <button onClick={onClose} className="text-cream/40 hover:text-cream">
          <X size={18} />
        </button>
      </div>

      <div className="px-3 mb-5">
        <Link
          to="/"
          onClick={onClose}
          className="block rounded-2xl px-3 py-3"
          style={{ background: 'linear-gradient(135deg, rgba(6,78,59,0.24), rgba(2,15,10,0.65))', border: '1px solid rgba(245,158,11,0.12)' }}
        >
          <AcademyLogo size="md" showArabic={false} />
          <p className="mt-3 text-[11px] font-crimson text-cream/45">
            Classical Islamic learning, certificates, and guided student progress in one academy workspace.
          </p>
        </Link>
      </div>

      {/* Streak pill */}
      <div className="mx-3 mb-5 px-3 py-2.5 rounded-xl flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, rgba(124,45,18,0.4), rgba(234,88,12,0.2))', border: '1px solid rgba(251,146,60,0.3)' }}>
        <Flame size={20} className="text-orange-400" />
        <div>
          <div className="font-cinzel text-orange-300 text-sm font-bold">
            {streak.currentStreak} Day{streak.currentStreak !== 1 ? 's' : ''}
          </div>
          <div className="text-[10px] text-orange-400/70 font-crimson">Current Streak 🔥</div>
        </div>
        <div className="ml-auto text-[10px] font-cinzel text-orange-400/50">
          Best: {streak.longestStreak}
        </div>
      </div>

      {/* Section label */}
      <div className="px-4 mb-2">
        <span className="text-[10px] font-cinzel text-gold-500/40 tracking-widest">NAVIGATION</span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 px-2 flex-1">
        {navItems.map(item => (
          <NavItem key={item.to} {...item} onClick={onClose} />
        ))}
      </nav>

      {/* Gold divider */}
      <div className="gold-divider mx-4 my-4" />

      {/* Role indicator */}
      <div className="mx-3 px-3 py-2 rounded-lg"
        style={{ background: 'rgba(6,78,59,0.15)', border: '1px solid rgba(16,185,129,0.15)' }}>
        <div className="text-[10px] font-cinzel text-emerald-500/50 tracking-widest mb-0.5">SIGNED IN AS</div>
        <div className="text-sm font-crimson text-emerald-400 truncate">{currentUser?.name}</div>
        <div className="text-[11px] font-crimson text-cream/35 truncate">{currentUser?.email}</div>
        <div className="text-xs font-cinzel text-gold-400 mt-1">{role}</div>
      </div>

      <button type="button" onClick={logout}
        className="mx-3 mt-3 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-cinzel text-gold-300 border border-gold-700/30 hover:bg-gold-900/20 transition-colors">
        <LogOut size={14} />
        Logout
      </button>
    </div>
  );

  return (
    <>
      {/* Overlay (mobile) */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-56 sidebar-desktop"
        style={{ background: 'rgba(5,26,15,0.97)', borderRight: '1px solid rgba(245,158,11,0.1)' }}>
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <aside className={`lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'rgba(5,26,15,0.99)', borderRight: '1px solid rgba(245,158,11,0.2)' }}>
        {sidebarContent}
      </aside>
    </>
  );
}
