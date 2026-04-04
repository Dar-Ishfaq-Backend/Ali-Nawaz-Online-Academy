import { useEffect, useState } from 'react';
import { AlertCircle, ExternalLink, Loader2, LifeBuoy, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { createIssue, fetchIssues } from '../utils/issues';

const statusBadgeMap = {
  open: 'badge-gold',
  resolved: 'badge-emerald',
  escalated: 'badge-red',
};

export default function StudentIssueForm() {
  const { currentUser, role, isSupabaseEnabled } = useApp();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let active = true;

    const loadIssues = async () => {
      if (!isSupabaseEnabled || !currentUser?.id) {
        if (active) {
          setIssues([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const result = await fetchIssues({ currentUser, viewerRole: role });

      if (!active) return;

      if (!result.ok) {
        setFeedback({ type: 'error', text: result.message });
        setIssues([]);
        setLoading(false);
        return;
      }

      setIssues(result.issues);
      setLoading(false);
    };

    void loadIssues();

    return () => {
      active = false;
    };
  }, [currentUser, isSupabaseEnabled, role]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    const result = await createIssue({
      currentUser,
      subject,
      message,
      screenshotFile,
    });

    setSubmitting(false);

    if (!result.ok) {
      setFeedback({ type: 'error', text: result.message });
      return;
    }

    setIssues((current) => [result.issue, ...current]);
    setSubject('');
    setMessage('');
    setScreenshotFile(null);
    setFeedback({ type: 'success', text: 'Your issue has been submitted and assigned to the admin team.' });
  };

  if (role !== 'Student') {
    return (
      <div className="glass-card p-16 text-center animate-fade-in">
        <AlertCircle size={40} className="text-cream/10 mx-auto mb-4" />
        <p className="font-cinzel text-cream/30 text-lg">Student Support Only</p>
        <p className="text-cream/20 font-crimson mt-2">This issue form is currently available for student accounts.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-cinzel font-black text-2xl md:text-3xl text-gold-400 mb-1">Support & Issues</h1>
        <p className="text-cream/50 font-crimson">Report platform problems, payment issues, or course access errors to the admin team.</p>
      </div>

      {!isSupabaseEnabled && (
        <div className="glass-card p-5">
          <p className="text-sm font-crimson text-cream/55">
            Add your Supabase environment keys before using the issue system.
          </p>
        </div>
      )}

      {feedback && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-crimson ${feedback.type === 'success' ? 'text-emerald-200' : 'text-red-200'}`}
          style={{
            background: feedback.type === 'success' ? 'rgba(6,78,59,0.35)' : 'rgba(127,29,29,0.35)',
            border: feedback.type === 'success' ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(248,113,113,0.25)',
          }}
        >
          {feedback.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <LifeBuoy size={18} className="text-gold-400" />
          <h2 className="font-cinzel font-bold text-gold-400 text-sm">Submit a New Issue</h2>
        </div>

        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Issue subject"
          className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
          style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.2)' }}
          required
        />

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Describe the issue in detail..."
          rows={6}
          className="w-full px-3 py-3 rounded-lg text-sm font-crimson text-cream outline-none resize-y"
          style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.2)' }}
          required
        />

        <div className="space-y-2">
          <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider">OPTIONAL SCREENSHOT</label>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setScreenshotFile(event.target.files?.[0] || null)}
            className="w-full text-sm font-crimson text-cream/60"
          />
          {screenshotFile && (
            <p className="text-xs font-crimson text-cream/35">
              Selected: {screenshotFile.name}
            </p>
          )}
        </div>

        <button type="submit" disabled={!isSupabaseEnabled || submitting} className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {submitting ? 'Submitting Issue...' : 'Submit Issue'}
        </button>
      </form>

      <div className="space-y-4">
        <div>
          <h2 className="font-cinzel font-bold text-gold-400">Your Submitted Issues</h2>
          <p className="text-sm font-crimson text-cream/40 mt-1">Track the latest admin replies and escalation status here.</p>
        </div>

        {loading ? (
          <div className="glass-card p-6 flex items-center gap-3 text-cream/55">
            <Loader2 size={18} className="animate-spin text-gold-400" />
            Loading your issues...
          </div>
        ) : issues.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <p className="font-cinzel text-cream/30 text-lg">No issues submitted yet</p>
            <p className="text-cream/20 font-crimson mt-2">Submit your first issue above whenever you need help.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <div key={issue.id} className="glass-card p-5 space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-cinzel font-bold text-gold-400 text-sm">{issue.subject}</p>
                    <p className="text-xs font-crimson text-cream/35 mt-1">
                      Submitted {issue.createdAt ? new Date(issue.createdAt).toLocaleString() : 'recently'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`badge ${statusBadgeMap[issue.status] || 'badge-gold'}`}>{issue.statusLabel}</span>
                    <span className="badge badge-emerald">{issue.assignedToLabel}</span>
                  </div>
                </div>

                <div
                  className="rounded-xl px-4 py-4 text-sm font-crimson text-cream/70 whitespace-pre-line"
                  style={{ background: 'rgba(2,15,10,0.34)', border: '1px solid rgba(245,158,11,0.08)' }}
                >
                  {issue.message}
                </div>

                {issue.screenshotUrl && (
                  <button
                    type="button"
                    onClick={() => window.open(issue.screenshotUrl, '_blank', 'noopener,noreferrer')}
                    className="btn-emerald text-xs px-4 py-2 inline-flex items-center gap-2"
                  >
                    <ExternalLink size={14} />
                    Open Screenshot
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
