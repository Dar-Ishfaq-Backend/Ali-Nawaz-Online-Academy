import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock3 } from 'lucide-react';
import { supabase } from '../supabase';
import { useApp } from '../context/AppContext';
import VideoPlayer from '../components/VideoPlayer';
import CoursePaymentCard from '../components/CoursePaymentCard';

const normalizePaymentInsertError = (message, courseKey) => {
  if (!message) {
    return 'The payment proof could not be submitted. Please try again.';
  }

  if (message.includes("Could not find the 'course_title' column")) {
    return 'Your Supabase payments table is missing the `course_title` text column. Run the schema fix SQL, then submit again.';
  }

  if (message.includes("Could not find the 'payment_reference' column")) {
    return 'Your Supabase payments table is missing the `payment_reference` text column. Run the schema fix SQL, then submit again.';
  }

  if (message.includes('invalid input syntax for type uuid') && message.includes(courseKey)) {
    return 'Your Supabase `course_id` is still configured as UUID somewhere. `payments.course_id` and `enrollments.course_id` must both be `text`, and `course_id` must not use a foreign key.';
  }

  if (message.includes('invalid input syntax for type integer') && message.includes('ANA-')) {
    return 'Your Supabase payment column types are still mismatched. `amount` must be integer, while `transaction_id` and `payment_reference` must be text.';
  }

  return message;
};

export default function CoursePlayer() {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    role,
    currentUser,
    enrollments,
    enrollCourse,
    courses,
    coursePayments,
    isSupabaseEnabled,
    unlockCourseAccess,
  } = useApp();

  const [message, setMessage] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('');
  const [checkingAccess, setCheckingAccess] = useState(false);

  const course = location.state?.course || courses.find((item) => item.id === courseId);
  const courseKey = course ? String(course.id) : '';
  const isPaidCourse = Boolean(course?.is_paid);
  const coursePrice = Math.max(0, Number(course?.price) || 0);

  const enrolled = course ? Boolean(enrollments[courseKey]) : false;
  const needsPayment = isPaidCourse && role === 'Student';
  const localUnlocked = Boolean(course && coursePayments[courseKey]?.unlockedAt);
  const hasFullAccess = Boolean(
    course
    && (role !== 'Student' || !isPaidCourse || localUnlocked || approvalStatus === 'approved'),
  );

  const statusConfig = useMemo(() => {
    if (approvalStatus === 'approved') {
      return {
        icon: CheckCircle2,
        className: 'text-emerald-200',
        style: { background: 'rgba(6,78,59,0.35)', border: '1px solid rgba(52,211,153,0.25)' },
        text: 'Your payment has been approved. Full course access is now active.',
      };
    }

    if (approvalStatus === 'pending') {
      return {
        icon: Clock3,
        className: 'text-yellow-100',
        style: { background: 'rgba(120,53,15,0.32)', border: '1px solid rgba(251,191,36,0.25)' },
        text: 'Your payment proof has been submitted and is waiting for admin review.',
      };
    }

    if (approvalStatus === 'rejected') {
      return {
        icon: AlertCircle,
        className: 'text-red-200',
        style: { background: 'rgba(127,29,29,0.35)', border: '1px solid rgba(248,113,113,0.25)' },
        text: 'The latest payment submission was rejected. You can review the details and submit a fresh payment proof below.',
      };
    }

    return null;
  }, [approvalStatus]);

  useEffect(() => {
    if (!course || !enrolled) {
      setApprovalStatus('');
      return undefined;
    }

    if (role !== 'Student' || !isPaidCourse || localUnlocked) {
      setApprovalStatus(localUnlocked ? 'approved' : '');
      return undefined;
    }

    if (!isSupabaseEnabled || !currentUser?.id) {
      setApprovalStatus('');
      return undefined;
    }

    let active = true;

    const syncPaymentStatus = async () => {
      setCheckingAccess(true);

      const [paymentResult, enrollmentResult] = await Promise.all([
        supabase
          .from('payments')
          .select('id,status,created_at')
          .eq('user_id', currentUser.id)
          .eq('course_id', courseKey)
          .order('created_at', { ascending: false })
          .limit(1),
        supabase
          .from('enrollments')
          .select('id,status')
          .eq('user_id', currentUser.id)
          .eq('course_id', courseKey)
          .eq('status', 'active')
          .limit(1),
      ]);

      if (!active) return;

      if (paymentResult.error || enrollmentResult.error) {
        setCheckingAccess(false);
        return;
      }

      const latestPayment = paymentResult.data?.[0] || null;
      const activeEnrollment = Boolean(enrollmentResult.data?.length);

      if (activeEnrollment || latestPayment?.status === 'approved') {
        setApprovalStatus('approved');
      } else if (latestPayment?.status === 'pending') {
        setApprovalStatus('pending');
      } else if (latestPayment?.status === 'rejected') {
        setApprovalStatus('rejected');
      } else {
        setApprovalStatus('');
      }

      setCheckingAccess(false);
    };

    syncPaymentStatus();

    const channel = supabase
      .channel(`course-access-${course.id}-${currentUser.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, syncPaymentStatus)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments' }, syncPaymentStatus)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [course, courseKey, currentUser?.id, enrolled, isPaidCourse, isSupabaseEnabled, localUnlocked, role]);

  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="font-cinzel text-gold-400 text-2xl mb-3">Course not found</p>
        <Link to="/courses" className="btn-gold inline-block">Back to courses</Link>
      </div>
    );
  }

  const handleEnroll = () => {
    enrollCourse(courseKey);
    setMessage(
      isPaidCourse
        ? 'You can now start the free preview lessons and submit payment when you are ready to unlock the full course.'
        : 'You are enrolled. Start learning below.',
    );
  };

  const handleUnlock = async ({
    payerName,
    transactionId,
    screenshotUrl,
    paymentReference,
  }) => {
    if (!currentUser) {
      return { ok: false, message: 'Please sign in before submitting payment.' };
    }

    if (!isPaidCourse) {
      return unlockCourseAccess(courseKey, { payerName, transactionId });
    }

    if (!isSupabaseEnabled) {
      const result = unlockCourseAccess(courseKey, { payerName, transactionId });
      if (result.ok) {
        setApprovalStatus('approved');
        setMessage('Payment saved locally and the course is now unlocked on this device.');
      }
      return result;
    }

    const { error } = await supabase
      .from('payments')
      .insert([{
        user_id: currentUser.id,
        course_id: courseKey,
        course_title: course.title,
        amount: coursePrice,
        status: 'pending',
        payer_name: payerName,
        transaction_id: transactionId,
        payment_reference: paymentReference,
        screenshot_url: screenshotUrl,
      }]);

    if (error) {
      return { ok: false, message: normalizePaymentInsertError(error.message, courseKey) };
    }

    setApprovalStatus('pending');
    setMessage('Payment submitted successfully. An admin will review it shortly.');

    return { ok: true, message: 'Payment submitted' };
  };

  if (!enrolled) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button type="button" onClick={() => navigate(-1)} className="text-sm font-crimson text-gold-400 hover:text-gold-300">
          ← Back
        </button>

        <div className="glass-card p-6 md:p-8 space-y-5">
          <div>
            <span className="badge badge-gold text-[10px]">{isPaidCourse ? 'Paid Course' : 'Free Course'}</span>
            <h1 className="text-2xl md:text-3xl font-cinzel font-black text-gold-400 mt-3">{course.title}</h1>
            <p className="text-cream/55 font-crimson mt-3">{course.description}</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 text-sm font-crimson text-cream/55">
            <div className="glass-card p-4">
              <p className="text-gold-400 text-xs font-cinzel tracking-wider mb-1">INSTRUCTOR</p>
              <p>{course.instructor}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-gold-400 text-xs font-cinzel tracking-wider mb-1">LESSONS</p>
              <p>{course.totalLessons}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-gold-400 text-xs font-cinzel tracking-wider mb-1">ACCESS</p>
              <p>{isPaidCourse ? `Paid course with ${course.freePreviewLessons} free preview lessons` : 'Free course access'}</p>
            </div>
          </div>

          <button type="button" onClick={handleEnroll} className="btn-gold">
            {isPaidCourse ? 'Start Free Preview' : 'Enroll Now'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="glass-card p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <button type="button" onClick={() => navigate(-1)} className="text-sm font-crimson text-gold-400 hover:text-gold-300 mb-3">
              ← Back
            </button>
            <h1 className="text-2xl md:text-3xl font-cinzel font-black text-gold-400">{course.title}</h1>
            <p className="text-cream/55 font-crimson mt-2">{course.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="badge badge-gold text-[10px]">{isPaidCourse ? 'Paid Course' : 'Free Course'}</span>
            <span className="badge badge-emerald text-[10px]">{course.instructor}</span>
          </div>
        </div>
      </div>

      {message && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-crimson text-emerald-200"
          style={{ background: 'rgba(6,78,59,0.35)', border: '1px solid rgba(52,211,153,0.25)' }}
        >
          {message}
        </div>
      )}

      {statusConfig && (
        <div className={`rounded-xl px-4 py-3 text-sm font-crimson flex items-start gap-3 ${statusConfig.className}`} style={statusConfig.style}>
          <statusConfig.icon size={18} className="mt-0.5 flex-shrink-0" />
          <span>{statusConfig.text}</span>
        </div>
      )}

      {checkingAccess && needsPayment && (
        <div className="rounded-xl px-4 py-3 text-sm font-crimson text-cream/60" style={{ background: 'rgba(5,26,15,0.7)', border: '1px solid rgba(245,158,11,0.12)' }}>
          Checking your payment and access status...
        </div>
      )}

      {needsPayment && !hasFullAccess && approvalStatus !== 'pending' && (
        <CoursePaymentCard course={course} onUnlock={handleUnlock} />
      )}

      <VideoPlayer course={course} accessOverride={hasFullAccess} />
    </div>
  );
}
