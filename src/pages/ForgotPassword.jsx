import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, MailCheck, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import AcademyLogo from '../components/AcademyLogo';

const inputStyle = {
  background: 'rgba(6,78,59,0.2)',
  border: '1px solid rgba(245,158,11,0.2)',
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const {
    isSupabaseEnabled,
    passwordRecoveryReady,
    requestPasswordReset,
    updatePassword,
  } = useApp();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRecoveryEmail = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await requestPasswordReset(email);

    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSuccess(result.message);
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await updatePassword({ email, newPassword });
    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSuccess(result.message);
    setTimeout(() => navigate('/login'), 1400);
  };

  const showSupabaseRecovery = isSupabaseEnabled && passwordRecoveryReady;
  const showSupabaseEmailRequest = isSupabaseEnabled && !passwordRecoveryReady;

  return (
    <div className="geometric-bg min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl grid lg:grid-cols-[0.92fr_1.08fr] gap-6">
        <section className="glass-card p-6 md:p-8">
          <div className="mb-5">
            <AcademyLogo size="md" />
          </div>
          <div className="inline-flex items-center gap-2 badge badge-gold mb-5">
            <MailCheck size={14} />
            Password Recovery
          </div>
          <h1 className="font-cinzel font-black text-3xl text-gold-400 mb-3">Reset Password</h1>
          <p className="text-cream/55 font-crimson mb-6">
            {showSupabaseEmailRequest
                ? 'Send a secure recovery link through Supabase, then reopen that link in this browser to set a new password.'
                : showSupabaseRecovery
                  ? 'You are in secure recovery mode. Set a new password for the account attached to this reset link.'
                : 'Local setup mode lets you update the password directly for the account stored in this browser.'}
          </p>

          <div
            className="rounded-xl p-5"
            style={{ background: 'rgba(5,26,15,0.7)', border: '1px solid rgba(245,158,11,0.12)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-gold-400" />
              <p className="font-cinzel text-gold-300 text-sm">How this flow works</p>
            </div>
            <div className="space-y-2 text-sm font-crimson text-cream/55">
              {showSupabaseEmailRequest && (
                <>
                  <p>Enter the student or staff email that needs a reset.</p>
                  <p>Supabase emails a recovery link back to this app.</p>
                  <p>Once the link opens here, you can set the new password safely.</p>
                </>
              )}
              {showSupabaseRecovery && (
                <>
                  <p>This browser has already opened a valid recovery link.</p>
                  <p>Set a strong password with at least 8 characters.</p>
                  <p>You will return to the login page automatically after success.</p>
                </>
              )}
              {!isSupabaseEnabled && (
                <>
                  <p>Enter the email already registered in this browser.</p>
                  <p>Set a new password instantly for the local browser account.</p>
                  <p>You will return to the login page automatically after success.</p>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="glass-card p-6 md:p-8">
          {showSupabaseEmailRequest ? (
            <>
              <p className="font-cinzel text-gold-400 text-sm tracking-[0.25em] mb-2">REQUEST RESET LINK</p>
              <h2 className="font-cinzel font-black text-2xl text-cream mb-2">Send recovery email</h2>
              <p className="text-cream/50 font-crimson mb-6">
                Supabase will email a recovery link to the address you enter below.
              </p>

              <form onSubmit={handleRecoveryEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">EMAIL</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="student@example.com"
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

                {success && (
                  <div className="rounded-lg px-3 py-2 text-sm font-crimson text-emerald-200"
                    style={{ background: 'rgba(6,78,59,0.35)', border: '1px solid rgba(52,211,153,0.25)' }}>
                    {success}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-gold w-full py-3 disabled:opacity-60">
                  {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="font-cinzel text-gold-400 text-sm tracking-[0.25em] mb-2">
                {showSupabaseRecovery ? 'SET NEW PASSWORD' : 'LOCAL PASSWORD RESET'}
              </p>
              <h2 className="font-cinzel font-black text-2xl text-cream mb-2">Choose a new password</h2>
              <p className="text-cream/50 font-crimson mb-6">
                {showSupabaseRecovery
                  ? 'This password will update the Supabase account tied to your recovery session.'
                  : 'Use the registered email and replace the password for the local browser account.'}
              </p>

              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                {!showSupabaseRecovery && (
                  <div>
                    <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">EMAIL</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="student@example.com"
                      className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                      style={inputStyle}
                      required
                    />
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">NEW PASSWORD</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
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
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
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

                <button type="submit" disabled={loading} className="btn-gold w-full py-3 disabled:opacity-60 inline-flex items-center justify-center gap-2">
                  <KeyRound size={15} />
                  {loading ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </>
          )}

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
