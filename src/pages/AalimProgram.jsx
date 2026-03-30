import { Link } from 'react-router-dom';
import { ArrowLeft, Award, BookOpenCheck, CheckCircle2, GraduationCap, WalletCards } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AALIM_PROGRAM } from '../data/courses';
import { getCourseProgress } from '../utils/storage';
import CourseCard from '../components/CourseCard';

const formatPKR = (amount) => `PKR ${new Intl.NumberFormat('en-PK').format(Math.max(0, Number(amount) || 0))}`;

export default function AalimProgram() {
  const { courses, enrollments, certificates } = useApp();

  const requiredCourses = AALIM_PROGRAM.requiredCourseIds
    .map((courseId) => courses.find((course) => course.id === courseId))
    .filter(Boolean);

  const enrolledCount = requiredCourses.filter((course) => enrollments[course.id]).length;
  const certificateCount = requiredCourses.filter((course) => certificates[course.id]).length;
  const averageProgress = requiredCourses.length
    ? Math.round(requiredCourses.reduce((sum, course) => sum + getCourseProgress(course), 0) / requiredCourses.length)
    : 0;

  return (
    <div className="animate-fade-in space-y-6">
      <Link to="/courses" className="inline-flex items-center gap-2 text-cream/40 hover:text-cream/80 font-crimson text-sm transition-colors">
        <ArrowLeft size={15} />
        Back to Courses
      </Link>

      <div className="relative overflow-hidden rounded-3xl px-6 py-8 md:px-8 md:py-10"
        style={{
          background: 'linear-gradient(140deg, rgba(5,26,15,0.94) 0%, rgba(6,78,59,0.36) 52%, rgba(124,45,18,0.22) 100%)',
          border: '1px solid rgba(245,158,11,0.18)',
        }}>
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.8), transparent 65%)' }} />
        <div className="relative grid lg:grid-cols-[1.4fr,0.9fr] gap-6 items-start">
          <div>
            <p className="font-amiri text-gold-400 text-2xl mb-2">رحلة العلم</p>
            <h1 className="font-cinzel font-black text-3xl md:text-4xl text-gold-400">{AALIM_PROGRAM.title}</h1>
            <p className="text-cream/60 font-crimson mt-4 leading-relaxed max-w-3xl">
              Complete the core Ali Nawaz Academy Aalim subjects below to build a full classical foundation and work toward the academy&apos;s Aalim certificate path.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <span className="rounded-full px-3 py-1.5 text-xs font-cinzel text-emerald-300"
                style={{ background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.2)' }}>
                {requiredCourses.length} Required Courses
              </span>
              <span className="rounded-full px-3 py-1.5 text-xs font-cinzel text-gold-300"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
                Program Fee: {formatPKR(AALIM_PROGRAM.pricePKR)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.22)' }}>
                <GraduationCap size={18} className="text-gold-400" />
              </div>
              <p className="font-cinzel text-2xl text-gold-400 font-black">{enrolledCount}</p>
              <p className="text-sm font-crimson text-cream/45 mt-1">Enrolled Subjects</p>
            </div>
            <div className="glass-card p-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.22)' }}>
                <Award size={18} className="text-emerald-400" />
              </div>
              <p className="font-cinzel text-2xl text-emerald-400 font-black">{certificateCount}</p>
              <p className="text-sm font-crimson text-cream/45 mt-1">Course Certificates</p>
            </div>
            <div className="glass-card p-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(110,231,183,0.14)', border: '1px solid rgba(110,231,183,0.22)' }}>
                <BookOpenCheck size={18} className="text-emerald-300" />
              </div>
              <p className="font-cinzel text-2xl text-emerald-300 font-black">{averageProgress}%</p>
              <p className="text-sm font-crimson text-cream/45 mt-1">Average Progress</p>
            </div>
            <div className="glass-card p-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(99,102,241,0.14)', border: '1px solid rgba(99,102,241,0.22)' }}>
                <WalletCards size={18} className="text-indigo-300" />
              </div>
              <p className="font-cinzel text-lg text-indigo-300 font-black">{formatPKR(AALIM_PROGRAM.pricePKR)}</p>
              <p className="text-sm font-crimson text-cream/45 mt-1">Bundle Price</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="font-cinzel font-bold text-gold-400 text-lg">Required Subjects for the Aalim Path</h2>
        <p className="text-sm font-crimson text-cream/45 mt-2">
          Complete these subjects and their certificates to finish the full Aalim track on this website.
        </p>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-5">
          {requiredCourses.map((course) => {
            const hasCertificate = Boolean(certificates[course.id]);
            const progress = getCourseProgress(course);

            return (
              <div key={course.id} className="rounded-2xl px-4 py-4"
                style={{ background: 'rgba(6,78,59,0.12)', border: '1px solid rgba(245,158,11,0.12)' }}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-cinzel font-bold text-gold-400 text-sm">{course.subject}</p>
                  {hasCertificate ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : (
                    <span className="text-xs font-cinzel text-cream/35">{progress}%</span>
                  )}
                </div>
                <p className="text-xs font-crimson text-cream/45 mt-2 leading-relaxed">{course.title}</p>
                <Link
                  to={`/course/${course.id}`}
                  state={{ course }}
                  className="inline-flex items-center gap-2 text-xs font-cinzel text-emerald-300 hover:text-emerald-200 mt-4"
                >
                  Open Subject
                  <ArrowLeft size={12} className="rotate-180" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="font-cinzel font-bold text-gold-400 text-lg">Subject Cards</h2>
          <p className="text-sm font-crimson text-cream/45 mt-1">Each subject remains available as its own course card and certificate journey.</p>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {requiredCourses.map((course) => (
            <CourseCard key={course.id} course={course} enrolled={!!enrollments[course.id]} />
          ))}
        </div>
      </section>
    </div>
  );
}
