import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Bell, Search, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ROLES } from '../data/courses';

// Islamic star SVG for branding
const StarOfDavid = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <polygon points="14,2 17.5,8.5 24.5,8.5 19,14 24.5,19.5 17.5,19.5 14,26 10.5,19.5 3.5,19.5 9,14 3.5,8.5 10.5,8.5" fill="none" stroke="#f59e0b" strokeWidth="1.5"/>
    <circle cx="14" cy="14" r="3" fill="#f59e0b"/>
  </svg>
);

export default function Navbar({ onToggleSidebar }) {
  const { role, changeRole, studentName, changeName } = useApp();
  const [roleOpen, setRoleOpen] = useState(false);
  const [nameEdit, setNameEdit] = useState(false);
  const [nameInput, setNameInput] = useState(studentName);
  const location = useLocation();

  const roleBadgeColor = {
    Student: 'badge-emerald',
    Teacher: 'badge-gold',
    Admin: 'badge-red',
    'Super Admin': 'badge-red',
  }[role] || 'badge-emerald';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 gap-4"
      style={{ background: 'rgba(2,15,10,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(245,158,11,0.15)' }}>

      {/* Hamburger — mobile */}
      <button onClick={onToggleSidebar}
        className="text-gold-400 hover:text-gold-300 transition-colors p-1 lg:hidden">
        <Menu size={22} />
      </button>

      {/* Brand */}
      <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
        <StarOfDavid />
          <div className="leading-none">
            <div className="font-cinzel font-bold text-gold-400 text-[11px] sm:text-[13px] md:text-base tracking-[0.2em]">ALI NAWAZ ACADEMY</div>
            <div className="text-emerald-400 text-[10px] font-crimson tracking-widest opacity-70">أكاديمية علي نواز</div>
          </div>
        </Link>

      <div className="flex-1" />

      {/* Search (decorative on mobile) */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg"
        style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.1)' }}>
        <Search size={14} className="text-gold-500 opacity-60" />
        <span className="text-xs font-crimson text-emerald-400 opacity-50">Search courses...</span>
      </div>

      {/* Notification bell */}
      <button className="relative text-gold-500 opacity-60 hover:opacity-100 transition-opacity">
        <Bell size={18} />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gold-500 rounded-full" />
      </button>

      {/* Student Name */}
      <div className="flex items-center gap-2">
        {nameEdit ? (
          <form onSubmit={(e) => { e.preventDefault(); changeName(nameInput); setNameEdit(false); }}
            className="flex gap-1">
            <input value={nameInput} onChange={e => setNameInput(e.target.value)}
              className="text-xs px-2 py-1 rounded font-crimson text-cream bg-emerald-900 border border-gold-600 outline-none w-32" />
            <button type="submit" className="text-xs btn-gold px-2 py-1">Save</button>
          </form>
        ) : (
          <button onClick={() => setNameEdit(true)}
            className="flex items-center gap-1.5 text-cream opacity-80 hover:opacity-100 text-sm font-crimson">
            <div className="w-7 h-7 rounded-full bg-emerald-800 flex items-center justify-center border border-gold-600">
              <User size={13} className="text-gold-400" />
            </div>
            <span className="hidden sm:block max-w-[120px] truncate">{studentName}</span>
          </button>
        )}
      </div>

      {/* Role Switcher */}
      <div className="relative">
        <button onClick={() => setRoleOpen(!roleOpen)}
          className={`badge ${roleBadgeColor} flex items-center gap-1 cursor-pointer`}>
          {role}
          <ChevronDown size={11} className={`transition-transform ${roleOpen ? 'rotate-180' : ''}`} />
        </button>

        {roleOpen && (
          <div className="absolute right-0 top-full mt-2 w-40 rounded-lg overflow-hidden z-50 animate-slide-up"
            style={{ background: 'rgba(5,26,15,0.97)', border: '1px solid rgba(245,158,11,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            <div className="px-3 py-2 text-[10px] font-cinzel text-gold-500 opacity-60 border-b border-gold-900/30">
              SWITCH ROLE
            </div>
            {ROLES.map(r => (
              <button key={r} onClick={() => { changeRole(r); setRoleOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm font-crimson transition-all
                  ${role === r ? 'text-gold-400 bg-gold-900/20' : 'text-cream/70 hover:text-cream hover:bg-emerald-800/30'}`}>
                {r}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
