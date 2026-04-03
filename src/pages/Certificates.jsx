import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Award, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import CertificateGenerator from '../components/CertificateGenerator';
import { useApp } from '../context/AppContext';
import { CERTIFICATE_LAYOUT } from '../utils/certificateTemplates';
import { CERTIFICATE_WATCH_THRESHOLD, canGenerateCertificate, getCourseWatchStats } from '../utils/storage';

const CertificateCardPreview = ({ studentName, courseName }) => (
  <div
    className="mx-auto flex w-full max-w-[11rem] flex-col justify-between rounded-[20px] px-4 py-4"
    style={{
      aspectRatio: CERTIFICATE_LAYOUT.aspectRatio,
      background: `
        linear-gradient(180deg, rgba(255,255,255,0.28), transparent 26%),
        linear-gradient(135deg, #f8f1e4 0%, #efe1c4 60%, #e0c794 100%)
      `,
      border: `1px solid ${CERTIFICATE_LAYOUT.frameGold}`,
      boxShadow: '0 16px 32px rgba(28, 20, 10, 0.18)',
    }}
  >
    <div className="text-center">
      <p className="font-amiri text-sm" style={{ color: CERTIFICATE_LAYOUT.emerald }}>شهادة إتمام</p>
      <p className="font-cormorant text-lg font-semibold leading-none mt-1" style={{ color: CERTIFICATE_LAYOUT.ink }}>
        Certificate
      </p>
    </div>
    <div className="text-center">
      <p className="font-cormorant text-xl font-semibold leading-tight" style={{ color: CERTIFICATE_LAYOUT.emerald }}>
        {studentName}
      </p>
      <p className="mt-2 text-xs leading-4" style={{ color: CERTIFICATE_LAYOUT.inkSoft }}>
        {courseName}
      </p>
    </div>
    <div className="text-center">
      <p className="font-cinzel text-[0.5rem] uppercase" style={{ color: CERTIFICATE_LAYOUT.frameGold, letterSpacing: '0.16em' }}>
        Official Certificate
      </p>
    </div>
  </div>
);

export default function Certificates() {
  const {
    role,
    currentUser,
    certificates,
    enrollments,
    issueCert,
    forceUnlockCert,
    resetCourseProgress,
    courses,
  } = useApp();
  const [viewing, setViewing] = useState(null);
  const [claimMessage, setClaimMessage] = useState('');
  const [workingCourseId, setWorkingCourseId] = useState('');
  const isSuperAdmin = role === 'Super Admin';
  const bypassWatchRequirement = role === 'Admin' || role === 'Super Admin';

  const completedNoCert = useMemo(() => (
    courses.filter((course) => enrollments[course.id] && canGenerateCertificate(course) && !certificates[course.id])
  ), [certificates, courses, enrollments]);

  const watchLockedCourses = useMemo(() => (
    courses.filter((course) => enrollments[course.id] && !canGenerateCertificate(course) && !certificates[course.id])
  ), [certificates, courses, enrollments]);

  const superAdminTestingCourses = useMemo(() => (
    courses.map((course) => ({
      ...course,
      certificate: certificates[course.id] || null,
      watchStats: getCourseWatchStats(course),
    }))
  ), [certificates, courses]);

  const certList = useMemo(() => Object.values(certificates), [certificates]);

  useEffect(() => {
    const legacyCertificates = certList.filter((certificate) => !certificate.verificationUrl || !certificate.qrCodeDataUrl);
    if (!legacyCertificates.length) return undefined;

    let active = true;

    const syncLegacyCertificates = async () => {
      for (const certificate of legacyCertificates) {
        if (!active) return;
        await issueCert(certificate.courseId, certificate.courseName);
      }
    };

    void syncLegacyCertificates();

    return () => {
      active = false;
    };
  }, [certList, issueCert]);

  const handleIssueCertificate = async (course) => {
    setWorkingCourseId(course.id);
    const result = await issueCert(course.id, course.title);
    setWorkingCourseId('');

    if (!result.ok) {
      setClaimMessage(result.message);
      return;
    }

    setClaimMessage('');
    setViewing(result.certificate);
  };

  const handleForceUnlock = async (course) => {
    setWorkingCourseId(course.id);
    const result = await forceUnlockCert(course.id, course.title);
    setWorkingCourseId('');

    if (!result.ok) {
      setClaimMessage(result.message);
      return;
    }

    setClaimMessage(result.message || `Certificate unlocked for ${course.title}.`);
    setViewing(result.certificate);
  };

  const handleResetCourse = async (courseId) => {
    setWorkingCourseId(courseId);
    const result = await resetCourseProgress(courseId);
    setWorkingCourseId('');

    if (!result.ok) {
      setClaimMessage(result.message);
      return;
    }

    if (viewing?.courseId === courseId) {
      setViewing(null);
    }

    setClaimMessage(result.message);
  };

  if (viewing) {
    const viewingCourse = courses.find((course) => course.id === viewing.courseId) || null;

    return (
      <div className="animate-fade-in space-y-5">
        <button
          onClick={() => setViewing(null)}
          className="flex items-center gap-2 text-cream/40 hover:text-cream/80 font-crimson text-sm"
        >
          ← Back to Certificates
        </button>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-cinzel font-black text-2xl text-gold-400">Official Certificate</h1>
            <p className="text-cream/45 font-crimson mt-1">Ali Nawaz Academy portrait certificate with QR verification.</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {viewing.verificationUrl && (
              <a
                href={viewing.verificationUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-emerald text-xs px-4 py-2 inline-flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} />
                Open Verification Page
              </a>
            )}
            {isSuperAdmin && viewingCourse && (
              <button
                type="button"
                onClick={() => handleResetCourse(viewingCourse.id)}
                disabled={workingCourseId === viewingCourse.id}
                className="btn-gold text-xs px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {workingCourseId === viewingCourse.id ? 'Resetting...' : 'Reset This Course To Zero'}
              </button>
            )}
          </div>
        </div>

        <CertificateGenerator cert={viewing} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="font-cinzel font-black text-2xl md:text-3xl text-gold-400 mb-1">Certificates</h1>
        <p className="text-cream/50 font-crimson">Official Ali Nawaz Academy completion certificates.</p>
        {claimMessage && (
          <p className="text-xs text-gold-300 font-crimson mt-3">{claimMessage}</p>
        )}
      </div>

      {isSuperAdmin && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-gold-400" />
            <h2 className="font-cinzel font-bold text-gold-400">Super Admin Certificate Testing</h2>
          </div>
          <p className="text-xs text-cream/40 font-crimson mb-4">
            Unlock any course certificate for this Super Admin account, inspect the design, then reset the same course back to zero progress when you are done testing.
          </p>
          <div className="space-y-3">
            {superAdminTestingCourses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col gap-3 rounded-xl px-4 py-4"
                style={{ background: 'rgba(6,78,59,0.12)', border: '1px solid rgba(245,158,11,0.16)' }}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="font-cinzel font-bold text-gold-300 text-sm">{course.title}</p>
                    <p className="text-cream/40 text-xs font-crimson mt-1">
                      Current watch progress for {currentUser?.name || 'this account'}: {course.watchStats.coursePercent}%
                    </p>
                    <p className="text-cream/25 text-[11px] font-crimson mt-1">
                      {course.certificate ? `Certificate ready: ${course.certificate.id}` : 'No certificate issued for this course yet.'}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    {course.certificate ? (
                      <button
                        type="button"
                        onClick={() => setViewing(course.certificate)}
                        className="btn-gold text-xs px-4 py-2"
                      >
                        Open Certificate
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleForceUnlock(course)}
                        disabled={workingCourseId === course.id}
                        className="btn-gold text-xs px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {workingCourseId === course.id ? 'Unlocking...' : 'Unlock Certificate'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleResetCourse(course.id)}
                      disabled={workingCourseId === course.id}
                      className="btn-emerald text-xs px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {workingCourseId === course.id ? 'Resetting...' : 'Reset Progress'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedNoCert.length > 0 && (
        <div className="glass-card p-5 border-gold-500/30">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-gold-400" />
            <h2 className="font-cinzel font-bold text-gold-400">Ready to Claim</h2>
          </div>
          <div className="space-y-3">
            {completedNoCert.map((course) => (
              <div
                key={course.id}
                className="flex flex-col gap-3 rounded-xl px-4 py-4 md:flex-row md:items-center md:justify-between"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                <div className="flex items-start gap-3">
                  <Award size={20} className="text-gold-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-cinzel font-bold text-gold-300 text-sm">{course.title}</p>
                    <p className="text-cream/40 text-xs font-crimson mt-1">
                      {bypassWatchRequirement
                        ? 'Admin watch-rule override is active for your account.'
                        : `${getCourseWatchStats(course).coursePercent}% of the full course watched.`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleIssueCertificate(course)}
                  disabled={workingCourseId === course.id}
                  className="btn-gold text-xs px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {workingCourseId === course.id ? 'Issuing...' : 'Claim Certificate'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {watchLockedCourses.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-emerald-400" />
            <h2 className="font-cinzel font-bold text-emerald-400">Almost There</h2>
          </div>
          <div className="space-y-3">
            {watchLockedCourses.map((course) => {
              const watchStats = getCourseWatchStats(course);

              return (
                <div
                  key={course.id}
                  className="flex flex-col gap-3 rounded-xl px-4 py-4 md:flex-row md:items-center md:justify-between"
                  style={{ background: 'rgba(6,78,59,0.14)', border: '1px solid rgba(16,185,129,0.2)' }}
                >
                  <div className="flex items-start gap-3">
                    <Award size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-cinzel font-bold text-emerald-300 text-sm">{course.title}</p>
                      <p className="text-cream/40 text-xs font-crimson mt-1">
                        {watchStats.coursePercent}% watched so far. Reach {CERTIFICATE_WATCH_THRESHOLD}% overall to claim the certificate.
                      </p>
                    </div>
                  </div>

                  <Link to={`/course/${course.id}`} className="btn-emerald text-xs px-4 py-2 inline-flex items-center justify-center">
                    Continue Watching
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {certList.length === 0 && completedNoCert.length === 0 && watchLockedCourses.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Award size={60} className="text-gold-500/15 mx-auto mb-4" />
          <p className="font-cinzel text-cream/30 text-lg mb-2">No certificates yet</p>
          <p className="text-cream/20 font-crimson text-sm mb-6">
            {bypassWatchRequirement
              ? 'Open any eligible course to issue your first certificate.'
              : `Watch at least ${CERTIFICATE_WATCH_THRESHOLD}% of an enrolled course to earn your first certificate.`}
          </p>
          <Link to="/courses" className="btn-gold inline-block">Browse Courses</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {certList.map((certificate) => (
            <div
              key={certificate.id}
              className="glass-card p-5 flex flex-col gap-4 hover:scale-[1.01] transition-transform cursor-pointer"
              onClick={() => setViewing(certificate)}
            >
              <CertificateCardPreview studentName={certificate.studentName} courseName={certificate.courseName} />

              <div className="text-center">
                <p className="font-cinzel font-bold text-gold-400 text-sm">{certificate.courseName}</p>
                <p className="text-cream/50 font-crimson text-xs mt-1">{certificate.studentName}</p>
                <p className="text-cream/30 font-crimson text-xs mt-2">
                  {new Date(certificate.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-cream/20 font-crimson text-[10px] mt-1">{certificate.id}</p>
              </div>

              <button className="btn-gold text-xs px-5 py-2 w-full">View & Download</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
