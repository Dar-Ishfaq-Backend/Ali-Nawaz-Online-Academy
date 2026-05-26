import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, LogOut, Menu, Search, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import AcademyLogo from './AcademyLogo';

const badgeMap = {
  Student: 'badge-emerald',
  Teacher: 'badge-gold',
  Admin: 'badge-red',
  'Super Admin': 'badge-red',
};

export default function Navbar({ onToggleSidebar }) {
  const { currentUser, role, studentName, changeName, logout } = useApp();
  const [nameEdit, setNameEdit] = useState(false);
  const [nameInput, setNameInput] = useState(studentName);

  useEffect(() => {
    setNameInput(studentName);
  }, [studentName]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 gap-4"
      style={{ background: 'rgba(10,22,40,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(28,46,74,0.9)' }}>

      <button onClick={onToggleSidebar}
        className="text-slate-muted hover:text-cream transition-colors p-1 lg:hidden">
        <Menu size={22} />
      </button>

      <Link to="/" className="flex items-center flex-shrink-0 min-w-0">
        <AcademyLogo
          size="sm"
          className="min-w-0"
          imageClassName="h-11 w-11 sm:h-12 sm:w-12"
        />
      </Link>

      <div className="flex-1" />

      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg"
        style={{ background: 'rgba(6,14,26,0.72)', border: '1px solid rgba(28,46,74,0.95)' }}>
        <Search size={14} className="text-slate-muted" />
        <span className="text-xs font-crimson text-slate-muted">Search courses...</span>
      </div>

      <button className="relative text-slate-muted hover:text-cream transition-colors p-2 rounded-xl hover:bg-navy-border/50">
        <Bell size={18} />
        <span className="absolute top-1 right-1 w-2 h-2 bg-gold-400 rounded-full" />
      </button>

      <div className="hidden md:flex flex-col items-end min-w-0">
        <span className={`badge ${badgeMap[role] || 'badge-emerald'} mb-1`}>{role}</span>
        <span className="text-[11px] text-cream/40 font-crimson truncate max-w-[180px]">
          {currentUser?.email}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {nameEdit ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              changeName(nameInput);
              setNameEdit(false);
            }}
            className="flex gap-1"
          >
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="text-xs px-2 py-1 rounded-lg font-crimson text-cream bg-navy-dark border border-navy-border outline-none w-32 focus:border-green/60"
            />
            <button type="submit" className="text-xs btn-gold px-2 py-1">Save</button>
          </form>
        ) : (
          <button onClick={() => setNameEdit(true)}
            className="flex items-center gap-1.5 text-cream opacity-80 hover:opacity-100 text-sm font-crimson">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green to-gold flex items-center justify-center">
              <User size={13} className="text-navy" />
            </div>
        <span className="hidden sm:block max-w-[120px] md:max-w-[140px] truncate">{studentName}</span>
      </button>
        )}
      </div>

      <button type="button" onClick={logout}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-crimson font-semibold text-cream-muted border border-navy-border hover:border-gold-400/40 hover:text-cream transition-colors">
        <LogOut size={14} />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </header>
  );
}
