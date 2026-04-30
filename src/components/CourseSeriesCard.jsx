import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, PlayCircle } from 'lucide-react';
import { getCourseProgress } from '../utils/storage';

export default function CourseSeriesCard({
  title,
  subtitle,
  description,
  courses = [],
  enrollments = {},
}) {
  const navigate = useNavigate();

  const orderedCourses = [...courses].sort((a, b) => {
    const aOrder = a.displayOrder ?? Number.POSITIVE_INFINITY;
    const bOrder = b.displayOrder ?? Number.POSITIVE_INFINITY;
    return aOrder - bOrder;
  });

  return (
    <div className="glass-card overflow-hidden">
      <div
        className="relative px-5 py-6 sm:px-6 sm:py-7"
        style={{
          background: 'linear-gradient(135deg, rgba(5,26,15,0.94) 0%, rgba(6,78,59,0.34) 55%, rgba(124,45,18,0.2) 100%)',
          borderBottom: '1px solid rgba(245,158,11,0.14)',
        }}
      >
        <div className="absolute -right-10 -top-12 w-40 h-40 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.55), transparent 65%)' }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-cinzel text-emerald-300"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <BookOpen size={12} />
            {subtitle}
          </div>
          <h3 className="font-cinzel font-black text-2xl text-gold-400 mt-4">{title}</h3>
          <p className="text-cream/60 font-crimson mt-3 leading-relaxed max-w-3xl">{description}</p>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-3">
        {orderedCourses.map((course, index) => {
          const enrolled = Boolean(enrollments[course.id]);
          const progress = enrolled ? getCourseProgress(course) : 0;

          return (
            <button
              key={course.id}
              type="button"
              onClick={() => navigate(`/course/${course.id}`, { state: { course } })}
              className="w-full text-left rounded-2xl p-4 transition-all hover:bg-emerald-900/10"
              style={{ border: '1px solid rgba(245,158,11,0.12)', background: 'rgba(2,15,10,0.28)' }}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="badge badge-gold text-[10px]">Book {index + 1}</span>
                    <span className="badge badge-emerald text-[10px]">{course.totalLessons} lessons</span>
                    <span className="badge badge-emerald text-[10px]">Free</span>
                  </div>
                  <p className="font-cinzel font-bold text-gold-400 text-base">{course.title}</p>
                  <p className="text-sm text-cream/50 font-crimson mt-1">
                    {course.level} · {course.instructor}
                  </p>
                  <p className="text-sm text-cream/42 font-crimson mt-2 line-clamp-2">
                    {course.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 md:flex-col md:items-end md:text-right flex-shrink-0">
                  <div className="text-xs text-cream/40 font-crimson">
                    {enrolled ? `${progress}% complete` : 'Open course'}
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm font-cinzel text-emerald-300">
                    <PlayCircle size={15} />
                    View Book
                    <ChevronRight size={15} />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
