import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { CreditCard, QrCode, ShieldCheck } from 'lucide-react';
import { COURSE_PAYMENT_DETAILS } from '../utils/paymentConfig';
import { useApp } from '../context/AppContext';
import { supabase } from '../supabase';

const formatPKR = (amount) => `PKR ${new Intl.NumberFormat('en-PK').format(Math.max(0, Number(amount) || 0))}`;

const buildReference = (course, currentUser) => (
  `ANA-${course.id}-${(currentUser?.id || 'guest').slice(0, 8)}`
    .replace(/[^A-Za-z0-9-]/g, '')
    .toUpperCase()
);

export default function CoursePaymentCard({ course, onUnlock }) {
  const { currentUser } = useApp();
  const [payerName, setPayerName] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState('');
  const coursePrice = Math.max(0, Number(course.price) || 0);

  const priceLabel = useMemo(() => formatPKR(coursePrice), [coursePrice]);
  const paymentReference = useMemo(() => buildReference(course, currentUser), [course, currentUser]);
  const studentEmail = currentUser?.email || 'student@alinawaz.academy';

  const paymentNote = useMemo(() => (
    `Ali Nawaz Academy | ${course.title} | ${studentEmail} | ${paymentReference}`
  ), [course.title, paymentReference, studentEmail]);

  const paymentPayload = useMemo(() => (
    `upi://pay?pa=${encodeURIComponent(COURSE_PAYMENT_DETAILS.upiId)}`
    + `&pn=${encodeURIComponent(COURSE_PAYMENT_DETAILS.accountName)}`
    + `&tr=${encodeURIComponent(paymentReference)}`
    + `&tn=${encodeURIComponent(paymentNote)}`
    + `&am=${encodeURIComponent(String(coursePrice))}`
    + `&cu=${encodeURIComponent(COURSE_PAYMENT_DETAILS.currency)}`
  ), [coursePrice, paymentNote, paymentReference]);

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(paymentPayload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      scale: 10,
      color: {
        dark: '#052e1b',
        light: '#f8f3e9',
      },
    })
      .then((url) => {
        if (!cancelled) {
          setQrImageUrl(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrImageUrl('');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [paymentPayload]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    if (!screenshot) {
      setSubmitting(false);
      setFeedback({ type: 'error', text: 'Please upload the payment screenshot before submitting.' });
      return;
    }

    const fileName = `${currentUser?.id || 'guest'}-${Date.now()}-${screenshot.name}`.replace(/\s+/g, '-');

    const { error: uploadError } = await supabase.storage
      .from('payments')
      .upload(fileName, screenshot, { upsert: false });

    if (uploadError) {
      setSubmitting(false);
      setFeedback({ type: 'error', text: uploadError.message });
      return;
    }

    const { data } = supabase.storage
      .from('payments')
      .getPublicUrl(fileName);

    const result = await onUnlock({
      payerName,
      transactionId,
      screenshotUrl: data.publicUrl,
      paymentReference,
    });

    setSubmitting(false);

    if (!result.ok) {
      setFeedback({ type: 'error', text: result.message });
      return;
    }

    setFeedback({
      type: 'success',
      text: 'Payment submitted. It is now waiting for admin approval.',
    });
    setPayerName('');
    setTransactionId('');
    setScreenshot(null);
  };

  return (
    <div className="glass-card p-5 space-y-5">
      <div className="flex items-start gap-3">
        <CreditCard className="text-gold-400" />
        <div>
          <h3 className="text-gold-400 text-sm font-cinzel">Unlock Full Course</h3>
          <p className="text-sm text-cream/55 font-crimson">
            Submit the course payment details for {priceLabel} and attach the payment proof below.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-[180px,1fr] gap-4 items-start">
        <div className="rounded-2xl p-3 flex items-center justify-center" style={{ background: 'rgba(248,243,233,0.96)' }}>
          {qrImageUrl ? (
            <img src={qrImageUrl} alt="Course payment QR code" className="w-40 rounded-xl" />
          ) : (
            <div className="w-40 h-40 rounded-xl flex items-center justify-center bg-emerald-950/10 text-emerald-950/70">
              <QrCode size={28} />
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm font-crimson text-cream/60">
          <p><span className="text-gold-400">Account:</span> {COURSE_PAYMENT_DETAILS.accountName}</p>
          <p><span className="text-gold-400">UPI ID:</span> {COURSE_PAYMENT_DETAILS.upiId}</p>
          <p><span className="text-gold-400">Reference:</span> {paymentReference}</p>
          <p><span className="text-gold-400">Course:</span> {course.title}</p>
          <p><span className="text-gold-400">Student:</span> {studentEmail}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={payerName}
          onChange={(event) => setPayerName(event.target.value)}
          placeholder="Payer name"
          className="w-full p-2.5 rounded-lg bg-black/20 text-cream border border-gold-500/15 outline-none font-crimson"
          required
        />

        <input
          value={transactionId}
          onChange={(event) => setTransactionId(event.target.value)}
          placeholder="Transaction ID / UTR"
          className="w-full p-2.5 rounded-lg bg-black/20 text-cream border border-gold-500/15 outline-none font-crimson"
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={(event) => setScreenshot(event.target.files?.[0] || null)}
          className="w-full text-sm font-crimson text-cream/60"
          required
        />

        {feedback && (
          <p className={feedback.type === 'success' ? 'text-green-400 text-sm font-crimson' : 'text-red-400 text-sm font-crimson'}>
            {feedback.text}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn-gold w-full flex justify-center gap-2 disabled:opacity-60">
          <ShieldCheck size={16} />
          {submitting ? 'Submitting Payment...' : 'Submit Payment'}
        </button>
      </form>
    </div>
  );
}
