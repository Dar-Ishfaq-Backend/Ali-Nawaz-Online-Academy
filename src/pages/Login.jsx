import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const inputStyle = {
  background: 'rgba(6,78,59,0.18)',
  border: '1px solid rgba(245,158,11,0.18)',
};

const portalButtonClass = (active) => (
  `flex-1 rounded-2xl px-4 py-3 text-left transition-all ${
    active
      ? 'bg-gold-500 text-emerald-950 shadow-lg shadow-gold-500/10'
      : 'text-cream/70 hover:bg-emerald-900/10'
  }`
);

const portalMeta = {
  student: {
    badge: 'Student Module',
    title: 'Student Sign In',
    helper: 'Access your courses, certificates, and learning progress.',
  },
  staff: {
    badge: 'Teacher & Staff',
    title: 'Teacher / Staff Sign In',
    helper: 'Use your academy email for teacher, admin, or super admin access.',
  },
};

export default function Login() {
  const navigate = useNavigate();
  const { isSupabaseEnabled, login } = useApp();
  const [activePortal, setActivePortal] = useState('student');
  const [studentForm, setStudentForm] = useState({ email: '', password: '' });
  const [staffForm, setStaffForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loadingPortal, setLoadingPortal] = useState(null);

  const handleFieldChange = (portal, key, value) => {
    if (portal === 'student') {
      setStudentForm((current) => ({ ...current, [key]: value }));
      return;
    }

    setStaffForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (portal, event) => {
    event.preventDefault();
    setError('');
    setLoadingPortal(portal);

    const form = portal === 'student' ? studentForm : staffForm;
    const result = await login(form.email, form.password);

    setLoadingPortal(null);

    if (!result.ok || !result.user) {
      setError(result.message || 'We could not sign you in with those details.');
      return;
    }

    const signedInRole = result.user.role;

    if (portal === 'student') {
      if (signedInRole !== 'Student') {
        setError('Please use the teacher / staff sign-in module for this account.');
        return;
      }

      navigate('/');
      return;
    }

    if (signedInRole === 'Student') {
      setError('Please use the student sign-in module for student accounts.');
      return;
    }

    if (signedInRole === 'Teacher') {
      navigate('/teacher');
      return;
    }

    navigate('/admin');
  };

  const activeMeta = portalMeta[activePortal];

  return (
    <div className="geometric-bg min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-7xl grid xl:grid-cols-[1.04fr_0.96fr] gap-6">
        <section className="glass-card p-6 md:p-8 lg:p-10 overflow-hidden relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at top right, rgba(245,158,11,0.12), transparent 34%), radial-gradient(circle at bottom left, rgba(16,185,129,0.14), transparent 30%)',
            }}
          />

          <div className="relative">
            <div className="inline-flex items-center gap-2 badge badge-gold mb-5">
              <ShieldCheck size={14} />
              Ali Nawaz Academy
            </div>

            <h1 className="font-cinzel font-black text-3xl md:text-5xl text-gold-400 leading-tight">
              Welcome back to your academy portal
            </h1>

            <p className="text-cream/60 font-crimson text-base md:text-lg mt-4 max-w-2xl">
              Sign in to continue learning, manage teaching activity, or review academy operations from one secure dashboard.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mt-8">
              {[
                {
                  icon: GraduationCap,
                  title: 'Student Learning',
                  text: 'Courses, lesson progress, notes, and certificates in one place.',
                },
                {
                  icon: Users,
                  title: 'Teacher Workflow',
                  text: 'Manage course delivery and student-facing learning content.',
                },
                {
                  icon: BookOpen,
                  title: 'Academy Access',
                  text: isSupabaseEnabled ? 'Supabase authentication is connected for this portal.' : 'Portal is currently running in local setup mode.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(2,15,10,0.35)', border: '1px solid rgba(245,158,11,0.08)' }}
                >
                  <item.icon size={18} className="text-gold-400 mb-2" />
                  <p className="text-gold-300 text-sm font-cinzel">{item.title}</p>
                  <p className="text-cream/45 text-sm font-crimson mt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass-card p-6 md:p-8">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setActivePortal('student')}
              className={portalButtonClass(activePortal === 'student')}
            >
              Student Portal
            </button>

            <button
              type="button"
              onClick={() => setActivePortal('staff')}
              className={portalButtonClass(activePortal === 'staff')}
            >
              Teacher / Staff
            </button>
          </div>

          <div className="mb-6">
            <p className="text-xs font-cinzel text-gold-500/60 tracking-[0.25em] mb-2">{activeMeta.badge}</p>
            <h2 className="font-cinzel font-black text-2xl text-cream mb-2">{activeMeta.title}</h2>
            <p className="text-cream/50 font-crimson">{activeMeta.helper}</p>
          </div>

          <form onSubmit={(event) => handleSubmit(activePortal, event)} className="space-y-4">
            <div>
              <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">EMAIL ADDRESS</label>
              <input
                type="email"
                autoComplete="username"
                value={activePortal === 'student' ? studentForm.email : staffForm.email}
                onChange={(event) => handleFieldChange(activePortal, 'email', event.target.value)}
                placeholder="Enter your academy email"
                className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">PASSWORD</label>
              <input
                type="password"
                autoComplete="current-password"
                value={activePortal === 'student' ? studentForm.password : staffForm.password}
                onChange={(event) => handleFieldChange(activePortal, 'password', event.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                style={inputStyle}
                required
              />
            </div>

            {error && (
              <div
                className="rounded-lg px-3 py-2 text-sm font-crimson text-red-200"
                style={{ background: 'rgba(127,29,29,0.35)', border: '1px solid rgba(248,113,113,0.25)' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loadingPortal !== null}
              className="btn-gold w-full py-3 inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loadingPortal === activePortal ? 'Signing In...' : 'Sign In'}
              {loadingPortal !== activePortal && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="gold-divider my-5" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm font-crimson">
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300">
              Create student account
            </Link>
            <Link to="/forgot-password" className="text-gold-400 hover:text-gold-300">
              Forgot password?
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
