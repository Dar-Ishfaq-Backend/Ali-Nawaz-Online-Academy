import { Link } from 'react-router-dom';
import { BookOpen, Award, TrendingUp, Clock, ChevronRight, Star, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCourseProgress } from '../utils/storage';
import StreakWidget from '../components/StreakWidget';
import ProgressBar from '../components/ProgressBar';
import CourseCard from '../components/CourseCard';
import AalimProgramCard from '../components/AalimProgramCard';
import { AALIM_PROGRAM } from '../data/courses';

// Stat card widget
const StatCard = ({ icon: Icon, label, value, sub, color = '#f59e0b' }) => (
  <div className="glass-card p-4 flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
      <Icon size={22} style={{ color }} />
    </div>
    <div>
      <div className="font-cinzel font-bold text-xl" style={{ color }}>{value}</div>
      <div className="text-cream/60 font-crimson text-sm">{label}</div>
      {sub && <div className="text-cream/30 font-crimson text-xs">{sub}</div>}
    </div>
  </div>
);

export default function Dashboard() {
  const { enrollments, completedLessons, certificates, studentName, courses } = useApp();

  const enrolledCourses = courses.filter(c => enrollments[c.id]);
  const totalLessonsCompleted = Object.keys(completedLessons).length;
  const totalCerts = Object.keys(certificates).length;

  // Active courses with progress
  const activeCourses = enrolledCourses.map(c => ({
    ...c,
    progress: getCourseProgress(c),
  })).sort((a, b) => b.progress - a.progress);
  const requiredAalimCourses = AALIM_PROGRAM.requiredCourseIds
    .map((courseId) => courses.find((course) => course.id === courseId))
    .filter(Boolean);

  return (
    <div className="animate-fade-in space-y-8">
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl px-4 py-6 sm:px-6 sm:py-8"
        style={{
          background: 'linear-gradient(135deg, rgba(6,78,59,0.6) 0%, rgba(5,26,15,0.8) 60%, rgba(124,45,18,0.3) 100%)',
          border: '1px solid rgba(245,158,11,0.25)',
        }}>

        {/* Decorative circle */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />

        <div className="relative">
          <p className="font-amiri text-gold-400 text-lg sm:text-xl mb-1">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
          <h1 className="font-cinzel font-black text-2xl md:text-3xl text-cream mb-2">
            Welcome back, <span className="text-gold-400">{studentName}</span>
          </h1>
          <p className="text-cream/50 font-crimson max-w-xl">
            "Seek knowledge, for seeking knowledge is a duty upon every Muslim." — Ibn Majah
          </p>
          {enrolledCourses.length === 0 && (
            <Link to="/courses" className="btn-gold inline-flex items-center gap-2 mt-4 text-sm">
              <BookOpen size={15} />
              Browse Courses
            </Link>
          )}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Enrolled Courses" value={enrolledCourses.length} color="#10b981" />
        <StatCard icon={Play} label="Lessons Done" value={totalLessonsCompleted} color="#f59e0b" />
        <StatCard icon={Award} label="Certificates" value={totalCerts} color="#d97706" />
        <StatCard icon={TrendingUp} label="Overall Progress"
          value={enrolledCourses.length ? `${Math.round(activeCourses.reduce((a, c) => a + c.progress, 0) / activeCourses.length)}%` : '0%'}
          color="#6ee7b7" />
      </div>

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left col: Active courses */}
        <div className="lg:col-span-2 space-y-4">
          <AalimProgramCard requiredCourses={requiredAalimCourses} />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-cinzel font-bold text-gold-400 text-lg">Continue Learning</h2>
            <Link to="/courses" className="text-sm text-emerald-400 hover:text-emerald-300 font-crimson flex items-center gap-1">
              All courses <ChevronRight size={14} />
            </Link>
          </div>

          {activeCourses.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <BookOpen size={40} className="text-gold-500/30 mx-auto mb-3" />
              <p className="font-cinzel text-cream/40 text-sm">No courses yet.</p>
              <Link to="/courses" className="btn-gold inline-block mt-4 text-xs">Browse Courses</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCourses.slice(0, 4).map(course => (
                <Link key={course.id} to={`/course/${course.id}`} state={{ course }}
                  className="glass-card flex flex-col sm:flex-row sm:items-center gap-4 p-4 no-underline hover:scale-[1.01] transition-transform">
                  <img src={course.thumbnail} alt={course.title}
                    className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-cinzel font-bold text-gold-400 text-sm truncate">{course.title}</p>
                    <p className="text-cream/40 font-crimson text-xs">{course.subject} · {course.instructor}</p>
                    <div className="mt-2">
                      <ProgressBar value={course.progress} showLabel={false} height={4} />
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <div className="font-cinzel font-bold text-emerald-400 text-sm">{course.progress}%</div>
                    <ChevronRight size={16} className="text-cream/30 sm:ml-auto mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Recommended courses */}
          {enrolledCourses.length < courses.length && (
            <>
              <h2 className="font-cinzel font-bold text-gold-400 text-lg mt-6">Recommended</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {courses.filter(c => !enrollments[c.id]).slice(0, 2).map(c => (
                  <CourseCard key={c.id} course={c} enrolled={false} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right col: Streak + certs */}
        <div className="space-y-4">
          <StreakWidget />

          {/* Certificates panel */}
          {totalCerts > 0 && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Award size={16} className="text-gold-500" />
                <h3 className="font-cinzel font-bold text-gold-400 text-sm">Your Certificates</h3>
              </div>
              {Object.values(certificates).map(cert => (
                <div key={cert.id} className="flex items-center gap-3 py-2 border-b border-gold-900/20 last:border-0">
                  <Star size={13} className="text-gold-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-crimson text-cream/80 truncate">{cert.courseName}</p>
                    <p className="text-[10px] text-cream/30 font-crimson">{cert.id}</p>
                  </div>
                  <Link to="/certificates" className="text-[10px] btn-gold px-2 py-0.5">View</Link>
                </div>
              ))}
            </div>
          )}

          {/* Aalim subjects quick nav */}
          <div className="glass-card p-4">
            <h3 className="font-cinzel font-bold text-gold-400 text-sm mb-3">Aalim Subjects</h3>
            <div className="grid grid-cols-2 gap-2">
              {['Quran', 'Hadith', 'Fiqh', 'Sarf', 'Nahw', 'Arabic', 'Aqeedah', 'Tafsir'].map(s => {
                const course = courses.find(c => c.subject === s);
                const enrolled = course && !!enrollments[course.id];
                return (
                  <Link key={s} to={course ? `/course/${course.id}` : '/courses'} state={{ course }}
                    className={`px-3 py-2 rounded-lg text-xs font-cinzel text-center transition-all
                      ${enrolled ? 'bg-gold-900/20 text-gold-400 border border-gold-700/30' : 'bg-emerald-900/20 text-emerald-400 border border-emerald-700/20 hover:bg-emerald-800/30'}`}>
                    {s}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
