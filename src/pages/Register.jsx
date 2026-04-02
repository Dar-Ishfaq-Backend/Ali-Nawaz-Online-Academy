import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';

const inputStyle = {
  background: 'rgba(6,78,59,0.2)',
  border: '1px solid rgba(245,158,11,0.2)',
};

export default function Register() {
  const navigate = useNavigate();
  const { register, isSupabaseEnabled } = useApp();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    if (result.needsEmailConfirmation) {
      setSuccess(result.message);
      setTimeout(() => navigate('/login'), 1600);
      return;
    }

    setSuccess(result.message || 'Your student account has been created.');
    navigate('/');
  };

  return (
    <div className="geometric-bg min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl grid lg:grid-cols-[0.85fr_1.15fr] gap-6">
        <section className="glass-card p-6 md:p-8">
          <div className="inline-flex items-center gap-2 badge badge-emerald mb-5">
            <UserPlus size={14} />
            Student Sign-Up
          </div>
          <h1 className="font-cinzel font-black text-3xl text-gold-400 mb-3">Create Account</h1>
          <p className="text-cream/55 font-crimson mb-6">
            New registrations create student accounts. Teacher, admin, and super admin access stay in the separate staff sign-in module for Ali Nawaz Academy.
          </p>

          <div className="rounded-xl p-5"
            style={{ background: 'rgba(5,26,15,0.7)', border: '1px solid rgba(245,158,11,0.12)' }}>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-gold-400" />
              <p className="font-cinzel text-gold-300 text-sm">What this gives you</p>
            </div>
            <div className="space-y-2 text-sm font-crimson text-cream/55">
              <p>{isSupabaseEnabled ? 'Your student login is created in Supabase Auth.' : 'Your student login is stored locally in this browser setup.'}</p>
              <p>Separate course progress, notes, streak, and certificates.</p>
              <p>{isSupabaseEnabled ? 'If email confirmation is enabled, you will verify the account before signing in.' : 'Instant access is available right after sign-up.'}</p>
            </div>
          </div>
        </section>

        <section className="glass-card p-6 md:p-8">
          <p className="font-cinzel text-gold-400 text-sm tracking-[0.25em] mb-2">REGISTER</p>
          <h2 className="font-cinzel font-black text-2xl text-cream mb-2">Start learning</h2>
          <p className="text-cream/50 font-crimson mb-6">
            Create a student account to test the learner experience end to end.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">FULL NAME</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ayesha Rahman"
                className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">EMAIL</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="student@example.com"
                className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                style={inputStyle}
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">PASSWORD</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">CONFIRM PASSWORD</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg px-3 py-2 text-sm font-crimson text-red-200"
                style={{ background: 'rgba(127,29,29,0.35)', border: '1px solid rgba(248,113,113,0.25)' }}>
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg px-3 py-2 text-sm font-crimson text-emerald-200"
                style={{ background: 'rgba(6,78,59,0.35)', border: '1px solid rgba(52,211,153,0.25)' }}>
                {success}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full py-3 disabled:opacity-60">
              {loading ? 'Creating Account...' : 'Create Student Account'}
            </button>
          </form>

          <div className="gold-divider my-5" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm font-crimson">
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300">
              Back to sign in
            </Link>
            <Link to="/forgot-password" className="text-gold-400 hover:text-gold-300">
              Need a password reset?
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
