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
      style={{ background: 'rgba(2,15,10,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(245,158,11,0.15)' }}>

      <button onClick={onToggleSidebar}
        className="text-gold-400 hover:text-gold-300 transition-colors p-1 lg:hidden">
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
        style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.1)' }}>
        <Search size={14} className="text-gold-500 opacity-60" />
        <span className="text-xs font-crimson text-emerald-400 opacity-50">Search courses...</span>
      </div>

      <button className="relative text-gold-500 opacity-60 hover:opacity-100 transition-opacity">
        <Bell size={18} />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gold-500 rounded-full" />
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
              className="text-xs px-2 py-1 rounded font-crimson text-cream bg-emerald-900 border border-gold-600 outline-none w-32"
            />
            <button type="submit" className="text-xs btn-gold px-2 py-1">Save</button>
          </form>
        ) : (
          <button onClick={() => setNameEdit(true)}
            className="flex items-center gap-1.5 text-cream opacity-80 hover:opacity-100 text-sm font-crimson">
            <div className="w-7 h-7 rounded-full bg-emerald-800 flex items-center justify-center border border-gold-600">
              <User size={13} className="text-gold-400" />
            </div>
        <span className="hidden sm:block max-w-[120px] md:max-w-[140px] truncate">{studentName}</span>
      </button>
        )}
      </div>

      <button type="button" onClick={logout}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-cinzel text-gold-300 border border-gold-700/30 hover:bg-gold-900/20 transition-colors">
        <LogOut size={14} />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </header>
  );
}
