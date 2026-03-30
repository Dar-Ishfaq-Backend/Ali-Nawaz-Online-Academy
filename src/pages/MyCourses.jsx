import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, CheckCircle2, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCourseProgress } from '../utils/storage';
import ProgressBar from '../components/ProgressBar';
import CourseCard from '../components/CourseCard';

export default function MyCourses() {
  const { enrollments, completedLessons, certificates, courses } = useApp();

  const enrolled = courses.filter(c => enrollments[c.id])
    .map(c => ({ ...c, progress: getCourseProgress(c) }))
    .sort((a, b) => b.progress - a.progress);

  const completed = enrolled.filter(c => c.progress === 100);
  const inProgress = enrolled.filter(c => c.progress < 100 && c.progress > 0);
  const notStarted = enrolled.filter(c => c.progress === 0);

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-cinzel font-black text-2xl md:text-3xl text-gold-400 mb-1">My Learning</h1>
        <p className="text-cream/50 font-crimson">{enrolled.length} course{enrolled.length !== 1 ? 's' : ''} enrolled</p>
      </div>

      {enrolled.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <BookOpen size={48} className="text-gold-500/20 mx-auto mb-4" />
          <p className="font-cinzel text-cream/30 text-lg mb-4">You haven't enrolled in any courses yet.</p>
          <Link to="/courses" className="btn-gold inline-block">Browse Courses</Link>
        </div>
      ) : (
        <>
          {/* In Progress */}
          {inProgress.length > 0 && (
            <section>
              <h2 className="font-cinzel font-bold text-gold-400 text-lg mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                In Progress ({inProgress.length})
              </h2>
              <div className="space-y-3">
                {inProgress.map(course => (
                  <Link key={course.id} to={`/course/${course.id}`} state={{ course }}
                    className="glass-card flex items-center gap-4 p-4 no-underline group hover:scale-[1.005] transition-transform">
                    <img src={course.thumbnail} alt={course.title} className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-cinzel font-bold text-gold-400 truncate">{course.title}</p>
                      <p className="text-cream/40 font-crimson text-xs mb-2">{course.instructor}</p>
                      <ProgressBar value={course.progress} showLabel={false} height={5} />
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-cinzel font-bold text-xl text-gold-400">{course.progress}%</div>
                      <div className="text-cream/30 text-xs font-crimson">completed</div>
                      <ChevronRight size={16} className="ml-auto text-cream/30 mt-1 group-hover:text-gold-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Not started */}
          {notStarted.length > 0 && (
            <section>
              <h2 className="font-cinzel font-bold text-gold-400 text-lg mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Not Started ({notStarted.length})
              </h2>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {notStarted.map(c => <CourseCard key={c.id} course={c} enrolled />)}
              </div>
            </section>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <section>
              <h2 className="font-cinzel font-bold text-gold-400 text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400" />
                Completed ({completed.length})
              </h2>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {completed.map(course => (
                  <div key={course.id} className="glass-card overflow-hidden">
                    <div className="relative h-32 overflow-hidden">
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center"
                        style={{ background: 'rgba(2,15,10,0.6)' }}>
                        <CheckCircle2 size={40} className="text-emerald-400" />
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-cinzel font-bold text-gold-400 text-sm mb-1">{course.title}</p>
                      <p className="text-emerald-400 font-crimson text-xs mb-3">✓ 100% Complete</p>
                      <div className="flex gap-2">
                        <Link to={`/course/${course.id}`} state={{ course }}
                          className="flex-1 text-center py-1.5 rounded text-xs font-cinzel border border-gold-700/30 text-gold-400 hover:bg-gold-900/20 transition-colors">
                          Review
                        </Link>
                        <Link to="/certificates"
                          className="flex-1 text-center py-1.5 rounded text-xs font-cinzel btn-gold">
                          Certificate
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
