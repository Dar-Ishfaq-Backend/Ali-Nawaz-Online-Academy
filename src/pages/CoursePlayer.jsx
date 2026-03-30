import { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Star, CheckCircle2, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  LESSON_WATCH_THRESHOLD,
  canGenerateCertificate,
  getAccessibleLessonCount,
  getCourseProgress,
  getCourseWatchStats,
  isCourseAccessUnlocked,
} from '../utils/storage';
import VideoPlayer from '../components/VideoPlayer';
import ProgressBar from '../components/ProgressBar';
import CoursePaymentCard from '../components/CoursePaymentCard';

const formatPKR = (amount) => `PKR ${new Intl.NumberFormat('en-PK').format(Math.max(0, Number(amount) || 0))}`;

export default function CoursePlayer() {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    role,
    enrollments,
    enrollCourse,
    issueCert,
    certificates,
    courses,
    coursePayments,
    unlockCourseAccess,
  } = useApp();
  const [claimMessage, setClaimMessage] = useState('');

  // Find course from route state or data file
  const course = location.state?.course || courses.find(c => c.id === courseId);
  if (!course) return (
    <div className="text-center py-20">
      <p className="text-cream/40 font-cinzel">Course not found.</p>
      <Link to="/courses" className="btn-gold inline-block mt-4">Back to Courses</Link>
    </div>
  );

  const enrolled = !!enrollments[course.id];
  const progress = getCourseProgress(course);
  const completed = progress === 100;
  const watchStats = getCourseWatchStats(course);
  const bypassWatchRequirement = role === 'Admin' || role === 'Super Admin';
  const certificateUnlocked = canGenerateCertificate(course);
  const hasCert = !!certificates[course.id];
  const coursePayment = coursePayments[course.id] || null;
  const courseUnlocked = isCourseAccessUnlocked(course, role);
  const accessibleLessonCount = getAccessibleLessonCount(course, role);
  const lockedLessonCount = Math.max(0, course.lessons.length - accessibleLessonCount);
  const studentPaymentLocked = role === 'Student' && course.requiresPayment && !courseUnlocked;
  const courseDurationLabel = course.playlistUrl ? 'YouTube playlist' : course.duration;

  const handleEnroll = () => enrollCourse(course.id);
  const handleUnlockCourse = (payment) => unlockCourseAccess(course.id, payment);

  const handleClaimCert = () => {
    const result = issueCert(course.id, course.title);

    if (!result.ok) {
      setClaimMessage(result.message);
      return;
    }

    setClaimMessage('');
    navigate('/certificates');
  };

  // ── Not enrolled: show course landing ──────────────────────────
  if (!enrolled) {
    return (
      <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-cream/40 hover:text-cream/80 font-crimson text-sm transition-colors">
          <ArrowLeft size={15} /> Back
        </button>

        {/* Hero */}
        <div className="glass-card overflow-hidden">
          <div className="relative h-56 md:h-72">
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(2,15,10,0.95) 30%, rgba(2,15,10,0.3))' }} />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex gap-2 mb-2">
                <span className="badge badge-gold">{course.category}</span>
                <span className="badge badge-emerald">{course.subject}</span>
                <span className="badge" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>{course.level}</span>
              </div>
              <h1 className="font-cinzel font-black text-2xl md:text-3xl text-cream">{course.title}</h1>
            </div>
          </div>

          <div className="p-6">
            <p className="text-cream/70 font-crimson text-lg leading-relaxed mb-6">{course.description}</p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-5 mb-6 pb-6 border-b border-gold-900/20">
              <span className="flex items-center gap-1.5 text-sm font-crimson text-cream/60"><BookOpen size={14} className="text-gold-500" /> {course.totalLessons} lessons</span>
              <span className="flex items-center gap-1.5 text-sm font-crimson text-cream/60"><Clock size={14} className="text-gold-500" /> {courseDurationLabel}</span>
              <span className="flex items-center gap-1.5 text-sm font-crimson text-gold-400"><Star size={14} fill="currentColor" /> 4.9 (128 ratings)</span>
            </div>

            <div className="text-sm font-crimson text-cream/60 mb-6">
              <span className="text-emerald-400 font-semibold">Instructor: </span>{course.instructor}
            </div>

            {(course.requiresPayment || course.isShortCourse) && (
              <div className="rounded-2xl px-4 py-4 mb-6"
                style={{ background: 'rgba(6,78,59,0.16)', border: '1px solid rgba(245,158,11,0.16)' }}>
                {course.requiresPayment && role === 'Student' ? (
                  <>
                    <p className="text-sm font-crimson text-cream/70">
                      Free preview: the first {course.freePreviewLessons} lessons are open on your student account.
                    </p>
                    <p className="text-xs font-crimson text-gold-300 mt-1">
                      Full course fee: {formatPKR(course.pricePKR)} to unlock all remaining lessons.
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-crimson text-emerald-300">
                    {course.isShortCourse ? 'This short course is fully free for all students.' : `Course fee: ${formatPKR(course.pricePKR)}`}
                  </p>
                )}
              </div>
            )}

            {/* Lesson preview */}
            <h3 className="font-cinzel font-bold text-gold-400 mb-3">Course Content</h3>
            <div className="space-y-2 mb-6">
              {course.lessons.map((l, i) => (
                <div key={l.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                  style={{ background: 'rgba(6,78,59,0.15)', border: '1px solid rgba(16,185,129,0.1)' }}>
                  <Lock size={13} className="text-cream/20 flex-shrink-0" />
                  <span className="text-sm font-crimson text-cream/60">{i + 1}. {l.title}</span>
                  <span className="ml-auto text-xs text-cream/30 font-crimson">{l.duration}</span>
                </div>
              ))}
            </div>

            <button onClick={handleEnroll} className="btn-gold w-full text-base py-3">
              {course.requiresPayment && role === 'Student'
                ? `Start Free Preview — ${course.freePreviewLessons} Lessons`
                : 'Enroll Now — Free'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Enrolled: show video player ─────────────────────────────────
  return (
    <div className="animate-fade-in space-y-4">
      {/* Top bar */}
      <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-cream/40 hover:text-cream/80 font-crimson text-sm transition-colors">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="w-full md:w-auto flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="w-full sm:w-32">
            <ProgressBar value={progress} showLabel={false} height={5} className="w-full" />
          </div>
          <span className="font-cinzel text-sm text-emerald-400">{progress}%</span>
          {completed && !hasCert && certificateUnlocked && (
            <button onClick={handleClaimCert} className="btn-gold text-xs flex items-center justify-center gap-1.5 w-full sm:w-auto">
              <CheckCircle2 size={13} /> Claim Certificate
            </button>
          )}
          {completed && !hasCert && !certificateUnlocked && (
            <div
              className="w-full sm:w-auto rounded-lg px-3 py-2 text-xs font-crimson text-gold-300"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              Watch {LESSON_WATCH_THRESHOLD}% of all lessons to unlock your certificate.
            </div>
          )}
          {hasCert && (
            <Link to="/certificates" className="btn-emerald text-xs flex items-center justify-center gap-1.5 w-full sm:w-auto">
              <CheckCircle2 size={13} /> View Certificate
            </Link>
          )}
        </div>
      </div>

      {/* Course title */}
      <h1 className="font-cinzel font-black text-xl md:text-2xl text-gold-400">{course.title}</h1>

      <div
        className="rounded-xl px-4 py-3"
        style={{ background: 'rgba(6,78,59,0.16)', border: '1px solid rgba(16,185,129,0.15)' }}
      >
        {bypassWatchRequirement ? (
          <p className="text-sm font-crimson text-emerald-300">
            Admin access is active for this account. The {LESSON_WATCH_THRESHOLD}% watch rule is bypassed for lesson completion and certificate claiming.
          </p>
        ) : (
          <>
            <p className="text-sm font-crimson text-cream/70">
              Certificate rule: every lesson must be marked complete and watched at least {LESSON_WATCH_THRESHOLD}%.
            </p>
            <p className="text-xs font-crimson text-emerald-400 mt-1">
              Watch-ready lessons: {watchStats.eligibleLessons}/{watchStats.totalLessons}
            </p>
            {studentPaymentLocked && (
              <p className="text-xs font-crimson text-gold-300 mt-1">
                {accessibleLessonCount} lessons are free right now. Pay to unlock the remaining {lockedLessonCount} lessons on this student account.
              </p>
            )}
          </>
        )}
        {claimMessage && (
          <p className="text-xs font-crimson text-gold-300 mt-2">{claimMessage}</p>
        )}
      </div>

      {role === 'Student' && course.requiresPayment && (
        <CoursePaymentCard
          course={course}
          payment={coursePayment}
          onUnlock={handleUnlockCourse}
        />
      )}

      {/* Video player + lesson list */}
      <VideoPlayer course={course} />
    </div>
  );
}
