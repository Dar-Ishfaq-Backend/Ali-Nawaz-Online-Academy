import { BookOpen, Castle, Play, Sparkles } from 'lucide-react';
import ProgressBar from './ProgressBar';

const optionButtonClass = (active) => (
  `w-full text-left rounded-2xl px-4 py-4 transition-all ${
    active
      ? 'ring-1 ring-emerald-700/40'
      : ''
  }`
);

const optionButtonStyle = (active) => ({
  background: active ? 'rgba(4,120,87,0.08)' : 'rgba(120,113,108,0.06)',
  border: active ? '1px solid rgba(6,95,70,0.7)' : '1px solid rgba(217,119,6,0.16)',
});

export default function SeriesCourseSelector({
  seriesCourse,
  seriesCourses = [],
  activeCourseId = '',
  enrolled = false,
  progress = 0,
  onSelectCourse,
  onPrimaryAction,
}) {
  const activeCourse = seriesCourses.find((course) => course.id === activeCourseId) || seriesCourses[0] || null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-card p-6 md:p-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.16)' }}>
            <Castle size={28} className="text-gold-400" />
          </div>
          <h1 className="font-cinzel font-black text-2xl md:text-3xl text-gold-400">{seriesCourse.title}</h1>
          <p className="text-emerald-400 font-cinzel text-2xl mt-4">Free</p>
          <p className="text-cream/55 font-crimson mt-4">{seriesCourse.description}</p>
        </div>

        <div className="mt-8">
          <p className="text-xs font-cinzel text-gold-500/70 tracking-[0.22em] mb-3">CHOOSE COURSE OPTION</p>

          <div className="space-y-3">
            {seriesCourses.map((course, index) => {
              const isActive = course.id === activeCourseId;
              const optionTitle = `Book ${index + 1} (Urdu)`;

              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => onSelectCourse(course.id)}
                  className={optionButtonClass(isActive)}
                  style={optionButtonStyle(isActive)}
                >
                  <div className="flex items-start gap-3 justify-between">
                    <div className="min-w-0">
                      <p className="font-cinzel font-bold text-emerald-950 text-2xl/none sm:text-xl"
                        style={{ color: '#0b4f46' }}>
                        {optionTitle}
                      </p>
                      <p className="text-sm font-crimson mt-2 text-stone-600">
                        {course.description}
                      </p>
                    </div>

                    {isActive && (
                      <span className="text-sm font-cinzel text-gold-500 flex-shrink-0 mt-1">Active</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-sm font-crimson text-cream/55 mt-4">
            {enrolled
              ? `You are enrolled in this course. Switching options updates the active study path to ${activeCourse?.title || 'the selected book'}.`
              : `Choose the book you want to begin with first. Your active study path will start with ${activeCourse?.title || 'the selected book'}.`}
          </p>

          <button
            type="button"
            onClick={onPrimaryAction}
            className="mt-5 w-full rounded-2xl px-5 py-4 text-base font-cinzel font-bold inline-flex items-center justify-center gap-2"
            style={{ background: '#0d5c49', color: '#f8f3e9' }}
          >
            {enrolled ? <Play size={18} /> : <Sparkles size={18} />}
            {enrolled ? 'Resume Course' : 'Start Free Series'}
          </button>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm font-crimson text-cream/55 mb-2">
              <span>{progress}% complete</span>
              <span className="text-emerald-400 font-cinzel">{progress}%</span>
            </div>
            <ProgressBar value={progress} showLabel={false} height={6} />
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-xs font-crimson text-cream/45">
            <span className="inline-flex items-center gap-1"><BookOpen size={12} /> {seriesCourse.totalLessons} total lessons</span>
            <span>{seriesCourses.length} books inside this series</span>
          </div>
        </div>
      </div>
    </div>
  );
}
