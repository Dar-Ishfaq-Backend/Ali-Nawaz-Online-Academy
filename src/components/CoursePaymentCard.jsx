import { useMemo, useState } from 'react';
import { CheckCircle2, CreditCard, QrCode, ShieldCheck } from 'lucide-react';
import upiQrImage from '../assets/upi-payment-qr.jpeg';
import { COURSE_PAYMENT_DETAILS } from '../utils/paymentConfig';

const formatPKR = (amount) => `PKR ${new Intl.NumberFormat('en-PK').format(Math.max(0, Number(amount) || 0))}`;

export default function CoursePaymentCard({ course, payment, onUnlock }) {
  const [payerName, setPayerName] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [feedback, setFeedback] = useState(null);
  const priceLabel = useMemo(() => formatPKR(course.pricePKR), [course.pricePKR]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = onUnlock({
      payerName,
      transactionId,
    });

    if (!result.ok) {
      setFeedback({ type: 'error', text: result.message });
      return;
    }

    setFeedback({
      type: 'success',
      text: 'Paid lessons are now unlocked on this student account.',
    });
    setPayerName('');
    setTransactionId('');
  };

  if (payment?.unlockedAt) {
    return (
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.24)' }}>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="font-cinzel font-bold text-gold-400 text-sm">Paid Access Active</h3>
            <p className="text-sm font-crimson text-cream/55 mt-1">
              This student account now has full access to all lessons in {course.title}.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-sm font-crimson">
          <div className="rounded-xl px-3 py-3" style={{ background: 'rgba(6,78,59,0.14)', border: '1px solid rgba(16,185,129,0.14)' }}>
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold-500/60 font-cinzel">Payer</p>
            <p className="text-cream/75 mt-1">{payment.payerName}</p>
          </div>
          <div className="rounded-xl px-3 py-3" style={{ background: 'rgba(6,78,59,0.14)', border: '1px solid rgba(16,185,129,0.14)' }}>
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold-500/60 font-cinzel">Reference</p>
            <p className="text-cream/75 mt-1 break-all">{payment.transactionId}</p>
          </div>
        </div>

        <p className="text-xs font-crimson text-emerald-300">
          Unlocked on {new Date(payment.unlockedAt).toLocaleString()} for {priceLabel}.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <CreditCard size={18} className="text-gold-400" />
        </div>
        <div>
          <h3 className="font-cinzel font-bold text-gold-400 text-sm">Unlock Full Course Access</h3>
          <p className="text-sm font-crimson text-cream/55 mt-1">
            Your student account includes the first {course.freePreviewLessons} lessons free. Pay once to continue the full course.
          </p>
        </div>
      </div>

      <div className="grid xl:grid-cols-[220px,1fr] gap-4 items-start">
        <div className="rounded-2xl p-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <img src={upiQrImage} alt="UPI payment QR code" className="w-full rounded-2xl object-cover" />
          <div className="mt-3 space-y-2 text-xs font-crimson">
            <div className="flex items-center gap-2 text-gold-400">
              <QrCode size={13} />
              <span>{COURSE_PAYMENT_DETAILS.note}</span>
            </div>
            <p className="text-cream/55">Account Holder: {COURSE_PAYMENT_DETAILS.accountName}</p>
            <p className="text-cream/55 break-all">UPI ID: {COURSE_PAYMENT_DETAILS.upiId}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(6,78,59,0.16)', border: '1px solid rgba(16,185,129,0.12)' }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-gold-500/60 font-cinzel">Course Fee</p>
                <p className="font-cinzel font-black text-2xl text-gold-400 mt-1">{priceLabel}</p>
              </div>
              <div className="rounded-xl px-3 py-2 text-xs font-crimson text-emerald-300"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.18)' }}>
                Student account unlock
              </div>
            </div>
            <p className="text-xs font-crimson text-cream/45 mt-3">
              This is a temporary manual unlock flow for the current student account. You can replace it later with your final payment system.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">PAYER NAME</label>
              <input
                value={payerName}
                onChange={(event) => setPayerName(event.target.value)}
                placeholder="Enter the payer name"
                className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.2)' }}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">TRANSACTION / REFERENCE ID</label>
              <input
                value={transactionId}
                onChange={(event) => setTransactionId(event.target.value)}
                placeholder="Paste the payment reference from your app"
                className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.2)' }}
                required
              />
            </div>

            {feedback && (
              <div className={`rounded-xl px-3 py-2 text-sm font-crimson ${feedback.type === 'success' ? 'text-emerald-200' : 'text-red-200'}`}
                style={{
                  background: feedback.type === 'success' ? 'rgba(6,78,59,0.35)' : 'rgba(127,29,29,0.35)',
                  border: feedback.type === 'success' ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(248,113,113,0.25)',
                }}>
                {feedback.text}
              </div>
            )}

            <button type="submit" className="btn-gold w-full py-3 inline-flex items-center justify-center gap-2">
              <ShieldCheck size={15} />
              Confirm Payment & Unlock
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
