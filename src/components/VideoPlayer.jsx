import { useState } from 'react';
import { CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, StickyNote, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProgressBar from './ProgressBar';
import { getCourseProgress } from '../utils/storage';

export default function VideoPlayer({ course }) {
  const { completedLessons, markComplete, markIncomplete, lessonNotes, saveNote } = useApp();
  const [activeLesson, setActiveLesson] = useState(course.lessons[0]);
  const [noteText, setNoteText] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  const isComplete = (id) => !!completedLessons[id];
  const progress = getCourseProgress(course);

  const selectLesson = (lesson) => {
    setActiveLesson(lesson);
    setShowNote(false);
    setNoteText(lessonNotes[lesson.id]?.text || '');
    setNoteSaved(false);
  };

  const toggleLesson = (lesson) => {
    if (isComplete(lesson.id)) markIncomplete(lesson.id);
    else markComplete(lesson.id, course.id);
  };

  const handleSaveNote = () => {
    saveNote(activeLesson.id, noteText);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 animate-fade-in">
      {/* ── Left: Video + Info ── */}
      <div className="flex-1 min-w-0">
        {/* Video */}
        <div className="video-container mb-4">
          <iframe
            src={`https://www.youtube.com/embed/${activeLesson.videoId}?rel=0&modestbranding=1&color=white`}
            title={activeLesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Lesson info */}
        <div className="glass-card p-4 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-cinzel font-bold text-gold-400 text-lg leading-snug">{activeLesson.title}</h2>
              <p className="text-cream/60 font-crimson text-sm mt-1">{activeLesson.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs text-cream/40 font-crimson">
                  <Clock size={12} /> {activeLesson.duration}
                </span>
                <span className="badge badge-emerald">{course.subject}</span>
              </div>
            </div>

            {/* Mark complete button */}
            <button
              onClick={() => toggleLesson(activeLesson)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-cinzel font-bold transition-all
                ${isComplete(activeLesson.id)
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40'
                  : 'btn-gold text-xs'}`}>
              {isComplete(activeLesson.id)
                ? <><CheckCircle2 size={15} /> Completed</>
                : <><Circle size={15} /> Mark Complete</>}
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <ProgressBar value={progress} label={`Course Progress`} />
          </div>
        </div>

        {/* Notes section */}
        <div className="glass-card p-4">
          <button onClick={() => setShowNote(!showNote)}
            className="flex items-center gap-2 w-full text-left">
            <StickyNote size={15} className="text-gold-500" />
            <span className="font-cinzel text-sm text-gold-400">Lesson Notes</span>
            {showNote ? <ChevronUp size={14} className="ml-auto text-cream/40" /> : <ChevronDown size={14} className="ml-auto text-cream/40" />}
          </button>

          {showNote && (
            <div className="mt-3">
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Write your notes for this lesson..."
                rows={4}
                className="w-full rounded-lg p-3 text-sm font-crimson text-cream resize-none outline-none"
                style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.2)' }}
              />
              <button onClick={handleSaveNote}
                className="mt-2 flex items-center gap-1.5 btn-gold text-xs">
                <Save size={12} />
                {noteSaved ? 'Saved! ✓' : 'Save Note'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Lesson List ── */}
      <div className="lg:w-80 flex-shrink-0">
        <div className="glass-card overflow-hidden">
          <div className="px-4 py-3 border-b border-gold-800/20">
            <h3 className="font-cinzel font-bold text-gold-400 text-sm tracking-wide">LESSONS</h3>
            <p className="text-xs text-cream/40 font-crimson mt-0.5">
              {Object.values(completedLessons).filter(l => l.courseId === course.id).length}/{course.lessons.length} completed
            </p>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {course.lessons.map((lesson, idx) => {
              const done = isComplete(lesson.id);
              const isActive = activeLesson.id === lesson.id;

              return (
                <div key={lesson.id}
                  onClick={() => selectLesson(lesson)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all border-b
                    ${isActive
                      ? 'bg-gold-900/20 border-b-gold-700/20'
                      : 'hover:bg-emerald-900/20 border-b-emerald-900/20'}`}>

                  {/* Completion icon */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLesson(lesson); }}
                    className="flex-shrink-0 mt-0.5">
                    {done
                      ? <CheckCircle2 size={18} className="text-emerald-400" />
                      : <div className="w-[18px] h-[18px] rounded-full border-2 border-cream/20 flex items-center justify-center text-xs text-cream/30 font-cinzel">{idx + 1}</div>}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug font-crimson ${isActive ? 'text-gold-400 font-semibold' : done ? 'text-cream/50 line-through' : 'text-cream/80'}`}>
                      {lesson.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock size={10} className="text-cream/30" />
                      <span className="text-[10px] text-cream/30 font-crimson">{lesson.duration}</span>
                      {done && <span className="badge badge-emerald text-[9px] px-1 py-0">✓</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
