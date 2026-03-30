import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, KeyRound, ShieldCheck, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

const inputStyle = {
  background: 'rgba(6,78,59,0.2)',
  border: '1px solid rgba(245,158,11,0.2)',
};

const badgeMap = {
  Student: 'badge-emerald',
  Teacher: 'badge-gold',
  Admin: 'badge-red',
  'Super Admin': 'badge-red',
};

export default function Login() {
  const navigate = useNavigate();
  const { login, demoAccounts } = useApp();
  const [email, setEmail] = useState(demoAccounts[0]?.email || '');
  const [password, setPassword] = useState(demoAccounts[0]?.password || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(email, password);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    navigate('/');
  };

  const handleDemoLogin = (account) => {
    setError('');
    setEmail(account.email);
    setPassword(account.password);
    const result = login(account.email, account.password);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    navigate('/');
  };

  return (
    <div className="geometric-bg min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <section className="glass-card p-6 md:p-8 lg:p-10">
          <div className="inline-flex items-center gap-2 badge badge-gold mb-5">
            <ShieldCheck size={14} />
            Demo Access Ready
          </div>
          <h1 className="font-cinzel font-black text-3xl md:text-4xl text-gold-400 mb-3">
            Ali Nawaz Academy
          </h1>
          <p className="text-cream/60 font-crimson max-w-2xl mb-8">
            Sign in with one of the built-in demo accounts, or create a new student account for client testing.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { icon: GraduationCap, title: 'Student Demo', text: 'Browse courses, save progress, and claim certificates.' },
              { icon: BookOpen, title: 'Teacher Demo', text: 'Review course content and use the teacher panel.' },
              { icon: Users, title: 'Admin Demo', text: 'View analytics, users, and management screens.' },
              { icon: ShieldCheck, title: 'Super Admin Demo', text: 'Access full admin controls and settings.' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl p-4"
                style={{ background: 'rgba(5,26,15,0.7)', border: '1px solid rgba(245,158,11,0.12)' }}>
                <item.icon size={18} className="text-gold-400 mb-3" />
                <p className="font-cinzel text-gold-300 text-sm mb-1">{item.title}</p>
                <p className="text-cream/45 font-crimson text-sm">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound size={16} className="text-gold-400" />
              <h2 className="font-cinzel font-bold text-gold-400 text-sm">Demo Accounts</h2>
            </div>

            <div className="space-y-3">
              {demoAccounts.map((account) => (
                <div key={account.id} className="rounded-xl p-4"
                  style={{ background: 'rgba(6,78,59,0.12)', border: '1px solid rgba(16,185,129,0.16)' }}>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <p className="font-cinzel text-gold-300 text-sm">{account.name}</p>
                    <span className={`badge ${badgeMap[account.role] || 'badge-emerald'}`}>{account.role}</span>
                  </div>
                  <p className="text-cream/60 font-crimson text-sm">Email: {account.email}</p>
                  <p className="text-cream/60 font-crimson text-sm mb-3">Password: {account.password}</p>
                  <button type="button" onClick={() => handleDemoLogin(account)} className="btn-gold text-xs px-4 py-2">
                    Sign In As {account.role}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass-card p-6 md:p-8">
          <p className="font-cinzel text-gold-400 text-sm tracking-[0.25em] mb-2">SIGN IN</p>
          <h2 className="font-cinzel font-black text-2xl text-cream mb-2">Welcome back</h2>
          <p className="text-cream/50 font-crimson mb-6">
            Use one of the demo accounts or your own student account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@alinawaz.academy"
                className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                style={inputStyle}
                required
              />
            </div>

            {error && (
              <div className="rounded-lg px-3 py-2 text-sm font-crimson text-red-200"
                style={{ background: 'rgba(127,29,29,0.35)', border: '1px solid rgba(248,113,113,0.25)' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-gold w-full py-3">Sign In</button>
          </form>

          <div className="gold-divider my-5" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm font-crimson">
            <Link to="/forgot-password" className="text-emerald-400 hover:text-emerald-300">
              Forgot password?
            </Link>
            <Link to="/register" className="text-gold-400 hover:text-gold-300">
              Create a student account
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
