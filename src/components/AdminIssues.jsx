import { useEffect, useState } from 'react';
import { AlertCircle, ArrowUpRight, ExternalLink, LifeBuoy, Loader2, Send, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchIssues, updateIssue } from '../utils/issues';

const statusBadgeMap = {
  open: 'badge-gold',
  resolved: 'badge-emerald',
  escalated: 'badge-red',
};

export default function AdminIssues() {
  const { currentUser, role, isSupabaseEnabled } = useApp();
  const [issues, setIssues] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeIssueId, setActiveIssueId] = useState('');
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let active = true;

    const loadIssues = async () => {
      if (!isSupabaseEnabled || !currentUser?.id || role !== 'Admin') {
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

  const replaceIssue = (nextIssue) => {
    setIssues((current) => current.map((issue) => (issue.id === nextIssue.id ? nextIssue : issue)));
  };

  const handleAction = async (issue, action) => {
    setActiveIssueId(issue.id);
    setFeedback(null);

    const result = await updateIssue({
      issueId: issue.id,
      currentUser,
      viewerRole: role,
      action,
      reply: replyDrafts[issue.id] || '',
    });

    setActiveIssueId('');

    if (!result.ok) {
      setFeedback({ type: 'error', text: result.message });
      return;
    }

    replaceIssue(result.issue);
    if (action === 'reply') {
      setReplyDrafts((current) => ({ ...current, [issue.id]: '' }));
    }

    const successText = (
      action === 'escalate'
        ? 'Issue escalated to Super Admin.'
        : action === 'resolve'
          ? 'Issue marked as resolved.'
          : 'Reply sent to the student.'
    );

    setFeedback({ type: 'success', text: successText });
  };

  if (role !== 'Admin') {
    return (
      <div className="glass-card p-16 text-center animate-fade-in">
        <AlertCircle size={40} className="text-cream/10 mx-auto mb-4" />
        <p className="font-cinzel text-cream/30 text-lg">Admin Inbox Only</p>
        <p className="text-cream/20 font-crimson mt-2">This issue view is available for admin accounts only.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-cinzel font-black text-2xl md:text-3xl text-gold-400 mb-1">Student Issues</h1>
        <p className="text-cream/50 font-crimson">Review student-reported problems, reply directly, resolve them, or escalate them to the Super Admin.</p>
      </div>

      {!isSupabaseEnabled && (
        <div className="glass-card p-5">
          <p className="text-sm font-crimson text-cream/55">
            Add your Supabase environment keys before using the issue inbox.
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

      {loading ? (
        <div className="glass-card p-6 flex items-center gap-3 text-cream/55">
          <Loader2 size={18} className="animate-spin text-gold-400" />
          Loading student issues...
        </div>
      ) : issues.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <LifeBuoy size={34} className="text-cream/10 mx-auto mb-4" />
          <p className="font-cinzel text-cream/30 text-lg">No student issues yet</p>
          <p className="text-cream/20 font-crimson mt-2">Fresh student issue reports will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => {
            const lockedToSuperAdmin = issue.assignedTo === 'super_admin';
            const isBusy = activeIssueId === issue.id;

            return (
              <div key={issue.id} className="glass-card p-5 space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-cinzel font-bold text-gold-400 text-sm">{issue.subject}</p>
                      <span className={`badge ${statusBadgeMap[issue.status] || 'badge-gold'}`}>{issue.statusLabel}</span>
                      <span className="badge badge-emerald">{issue.assignedToLabel}</span>
                    </div>
                    <p className="text-xs font-crimson text-cream/45">
                      {issue.reporterName}
                      {issue.reporterEmail ? ` • ${issue.reporterEmail}` : ''}
                    </p>
                    <p className="text-xs font-crimson text-cream/35">
                      Submitted {issue.createdAt ? new Date(issue.createdAt).toLocaleString() : 'recently'}
                    </p>
                  </div>

                  {issue.screenshotUrl && (
                    <button
                      type="button"
                      onClick={() => window.open(issue.screenshotUrl, '_blank', 'noopener,noreferrer')}
                      className="btn-emerald text-xs px-4 py-2 inline-flex items-center gap-2 w-fit"
                    >
                      <ExternalLink size={14} />
                      Open Screenshot
                    </button>
                  )}
                </div>

                <div
                  className="rounded-xl px-4 py-4 text-sm font-crimson text-cream/70 whitespace-pre-line"
                  style={{ background: 'rgba(2,15,10,0.34)', border: '1px solid rgba(245,158,11,0.08)' }}
                >
                  {issue.message}
                </div>

                {lockedToSuperAdmin && (
                  <div
                    className="rounded-xl px-4 py-3 text-sm font-crimson text-amber-100/85 flex items-start gap-2"
                    style={{ background: 'rgba(120,53,15,0.28)', border: '1px solid rgba(251,191,36,0.18)' }}
                  >
                    <ArrowUpRight size={16} className="mt-0.5 text-gold-400" />
                    This issue is currently assigned to the Super Admin. Admin actions are locked after escalation.
                  </div>
                )}

                <div className="space-y-3">
                  <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider">ADMIN REPLY</label>
                  <textarea
                    value={replyDrafts[issue.id] || ''}
                    onChange={(event) => setReplyDrafts((current) => ({ ...current, [issue.id]: event.target.value }))}
                    placeholder={lockedToSuperAdmin ? 'Escalated issues are now handled by the Super Admin.' : 'Write a reply for the student...'}
                    rows={4}
                    disabled={lockedToSuperAdmin}
                    className="w-full px-3 py-3 rounded-lg text-sm font-crimson text-cream outline-none resize-y disabled:opacity-60"
                    style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.2)' }}
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={lockedToSuperAdmin || isBusy || !(replyDrafts[issue.id] || '').trim()}
                    onClick={() => handleAction(issue, 'reply')}
                    className="btn-gold inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isBusy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Send Reply
                  </button>
                  <button
                    type="button"
                    disabled={lockedToSuperAdmin || isBusy || issue.status === 'resolved'}
                    onClick={() => handleAction(issue, 'resolve')}
                    className="btn-emerald inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <ShieldCheck size={16} />
                    Mark Resolved
                  </button>
                  <button
                    type="button"
                    disabled={lockedToSuperAdmin || isBusy || issue.status === 'resolved'}
                    onClick={() => handleAction(issue, 'escalate')}
                    className="px-4 py-2 rounded-lg text-sm font-cinzel text-red-100 border border-red-500/30 bg-red-900/20 hover:bg-red-900/35 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Escalate to Super Admin
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
