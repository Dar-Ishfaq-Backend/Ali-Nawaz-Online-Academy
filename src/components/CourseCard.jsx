import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users, Star, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCourseProgress } from '../utils/storage';
import ProgressBar from './ProgressBar';

export default function CourseCard({ course, enrolled: enrolledProp }) {
  const { enrollments, completedLessons } = useApp();
  const enrolled = enrolledProp !== undefined ? enrolledProp : !!enrollments[course.id];
  const progress = enrolled ? getCourseProgress(course) : 0;

  return (
    <div className="glass-card overflow-hidden flex flex-col group animate-slide-up">
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden">
        <img src={course.thumbnail} alt={course.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(2,15,10,0.85) 20%, transparent 70%)' }} />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="badge badge-gold text-[10px]">{course.category}</span>
        </div>

        {/* Subject badge */}
        <div className="absolute top-3 right-3">
          <span className="badge badge-emerald text-[10px]">{course.subject}</span>
        </div>

        {/* Completion bar overlay */}
        {enrolled && (
          <div className="absolute bottom-3 left-3 right-3">
            <ProgressBar value={progress} showLabel={false} height={3} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-cinzel font-bold text-gold-400 text-base leading-snug mb-1.5">{course.title}</h3>
        <p className="text-cream/50 font-crimson text-sm leading-relaxed line-clamp-2 mb-3 flex-1">{course.description}</p>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-xs text-cream/40 font-crimson mb-4">
          <span className="flex items-center gap-1"><BookOpen size={11} /> {course.totalLessons} lessons</span>
          <span className="flex items-center gap-1"><Clock size={11} /> {course.duration}</span>
          <span className="flex items-center gap-1 text-gold-500">
            <Star size={11} fill="currentColor" /> 4.9
          </span>
        </div>

        {/* Instructor */}
        <div className="text-xs text-cream/40 font-crimson mb-4">
          <span className="text-emerald-400">Instructor: </span>{course.instructor}
        </div>

        {/* Progress info (if enrolled) */}
        {enrolled && (
          <div className="mb-3">
            <ProgressBar value={progress} label="Progress" height={5} />
          </div>
        )}

        {/* CTA */}
        <Link to={enrolled ? `/course/${course.id}` : `/courses`}
          state={{ course }}
          className={`w-full text-center py-2.5 rounded-lg font-cinzel font-bold text-sm transition-all
            ${enrolled
              ? progress === 100
                ? 'btn-emerald'
                : 'btn-gold'
              : 'border border-gold-600/40 text-gold-400 hover:bg-gold-900/20'}`}>
          {enrolled
            ? progress === 100 ? '✓ Completed' : progress > 0 ? 'Continue →' : 'Start Learning →'
            : 'View Course'}
        </Link>
      </div>
    </div>
  );
}
