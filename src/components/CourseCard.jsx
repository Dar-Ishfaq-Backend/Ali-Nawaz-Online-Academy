import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Lock, PlayCircle, Star } from 'lucide-react';
import ProgressBar from './ProgressBar';
import { useApp } from '../context/AppContext';
import { getCourseProgress } from '../utils/storage';

const formatPKR = (amount) =>
  `PKR ${new Intl.NumberFormat('en-PK').format(Math.max(0, Number(amount) || 0))}`;

export default function CourseCard({ course, enrolled }) {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const progress = enrolled ? getCourseProgress(course) : 0;
  const isPaidCourse = Boolean(course.is_paid);
  const coursePrice = Math.max(0, Number(course.price) || 0);
  const playlistUrl = course.youtube_playlist_url || course.playlistUrl || '';

  const courseDurationLabel = playlistUrl ? 'YouTube playlist' : course.duration;

  const handleOpenCourse = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    navigate(`/course/${course.id}`, { state: { course } });
  };

  const primaryLabel = enrolled
    ? 'Continue Course'
    : isPaidCourse
      ? 'View Course'
      : 'Start Free';

  return (
    <div className="glass-card overflow-hidden flex flex-col group animate-slide-up">
      <div className="relative h-44 overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(2,15,10,0.85) 20%, transparent 70%)' }}
        />

        <div className="absolute top-3 left-3">
          <span className="badge badge-gold text-[10px]">{isPaidCourse ? 'Paid Course' : 'Free Course'}</span>
        </div>

        <div className="absolute top-3 right-3">
          <span className="badge badge-emerald text-[10px]">{playlistUrl ? 'YouTube' : 'Course'}</span>
        </div>

        <div className="absolute bottom-3 left-3">
          <span className={`badge text-[10px] ${isPaidCourse ? 'badge-red' : 'badge-emerald'}`}>
            {isPaidCourse ? formatPKR(coursePrice) : 'Free'}
          </span>
        </div>

        {enrolled && (
          <div className="absolute bottom-3 right-3 min-w-[86px]">
            <ProgressBar value={progress} showLabel={false} height={3} />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-cinzel font-bold text-gold-400 text-base mb-1.5">
          {course.title}
        </h3>

        <p className="text-cream/50 text-sm mb-3 flex-1 font-crimson">
          {course.description}
        </p>

        <div className="flex flex-wrap gap-3 text-xs text-cream/40 mb-4 font-crimson">
          <span className="flex items-center gap-1"><BookOpen size={11} /> {course.totalLessons} lessons</span>
          <span className="flex items-center gap-1"><Clock size={11} /> {courseDurationLabel}</span>

          {playlistUrl && (
            <span className="flex items-center gap-1 text-emerald-300">
              <PlayCircle size={11} /> Playlist
            </span>
          )}

          {isPaidCourse && (
            <span className="flex items-center gap-1 text-red-300">
              <Lock size={11} /> Paid
            </span>
          )}

          <span className="flex items-center gap-1 text-gold-500">
            <Star size={11} fill="currentColor" /> 4.9
          </span>
        </div>

        <button onClick={handleOpenCourse} className="btn-gold w-full">
          {primaryLabel} →
        </button>
      </div>
    </div>
  );
}
