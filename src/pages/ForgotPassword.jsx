import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, MailCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

const inputStyle = {
  background: 'rgba(6,78,59,0.2)',
  border: '1px solid rgba(245,158,11,0.2)',
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { resetPassword } = useApp();
  const [form, setForm] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const result = resetPassword({
      email: form.email,
      newPassword: form.newPassword,
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSuccess(result.message);
    setTimeout(() => navigate('/login'), 1200);
  };

  return (
    <div className="geometric-bg min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
        <section className="glass-card p-6 md:p-8">
          <div className="inline-flex items-center gap-2 badge badge-gold mb-5">
            <MailCheck size={14} />
            Demo Password Reset
          </div>
          <h1 className="font-cinzel font-black text-3xl text-gold-400 mb-3">Forgot Password</h1>
          <p className="text-cream/55 font-crimson mb-6">
            This project is frontend-only, so password recovery works as an in-app reset instead of email delivery.
          </p>

          <div className="rounded-xl p-5"
            style={{ background: 'rgba(5,26,15,0.7)', border: '1px solid rgba(245,158,11,0.12)' }}>
            <div className="flex items-center gap-2 mb-3">
              <KeyRound size={16} className="text-gold-400" />
              <p className="font-cinzel text-gold-300 text-sm">How it works</p>
            </div>
            <div className="space-y-2 text-sm font-crimson text-cream/55">
              <p>Enter the email address already registered in this browser.</p>
              <p>Set a new password instantly for demo use.</p>
              <p>You will be redirected back to sign in after a successful reset.</p>
            </div>
          </div>
        </section>

        <section className="glass-card p-6 md:p-8">
          <p className="font-cinzel text-gold-400 text-sm tracking-[0.25em] mb-2">RESET PASSWORD</p>
          <h2 className="font-cinzel font-black text-2xl text-cream mb-2">Choose a new password</h2>
            <p className="text-cream/50 font-crimson mb-6">
            Use the account email and set a replacement password for demo access.
            </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">EMAIL</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="student@alinawaz.academy"
                className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                style={inputStyle}
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">NEW PASSWORD</label>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => handleChange('newPassword', e.target.value)}
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

            <button type="submit" className="btn-gold w-full py-3">Update Password</button>
          </form>

          <div className="gold-divider my-5" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm font-crimson">
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300">
              Back to sign in
            </Link>
            <Link to="/register" className="text-gold-400 hover:text-gold-300">
              Need a new student account?
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
