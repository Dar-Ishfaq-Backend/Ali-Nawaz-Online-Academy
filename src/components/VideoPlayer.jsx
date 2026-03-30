import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Clock, ChevronDown, ChevronUp, StickyNote, Save, ExternalLink, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProgressBar from './ProgressBar';
import {
  LESSON_WATCH_THRESHOLD,
  canAccessCourseLesson,
  getAccessibleLessonCount,
  getCourseProgress,
} from '../utils/storage';

let youtubeIframeApiPromise = null;
const PLACEHOLDER_VIDEO_ID = 'dQw4w9WgXcQ';

const getPlaylistId = (playlistUrl = '') => {
  if (!playlistUrl) return '';

  try {
    const parsed = new URL(playlistUrl);
    return parsed.searchParams.get('list') || '';
  } catch {
    const match = playlistUrl.match(/[?&]list=([^&]+)/);
    return match?.[1] || '';
  }
};

const buildFallbackEmbedUrl = ({ playlistId, videoId, lessonIndex }) => {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });

  if (typeof window !== 'undefined' && window.location?.origin) {
    params.set('origin', window.location.origin);
  }

  if (playlistId) {
    params.set('list', playlistId);
    params.set('index', String(Math.max(0, lessonIndex)));
    return `https://www.youtube-nocookie.com/embed/videoseries?${params.toString()}`;
  }

  if (!videoId) return '';
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
};

const normalizeWatchState = (progress = {}) => ({
  watchedSeconds: Math.max(0, Number(progress?.watchedSeconds) || 0),
  durationSeconds: Math.max(0, Number(progress?.durationSeconds) || 0),
  percent: Math.max(0, Math.min(100, Math.round(Number(progress?.percent) || 0))),
});

const formatDurationLabel = (seconds) => {
  const totalSeconds = Math.max(0, Math.round(Number(seconds) || 0));
  if (!totalSeconds) return '';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${minutes}:${String(secs).padStart(2, '0')}`;
};

const loadYouTubeIframeApi = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is unavailable.'));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (!youtubeIframeApiPromise) {
    youtubeIframeApiPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      const previousReady = window.onYouTubeIframeAPIReady;
      const timeoutId = window.setTimeout(() => {
        youtubeIframeApiPromise = null;
        reject(new Error('Timed out while loading the YouTube player.'));
      }, 15000);

      window.onYouTubeIframeAPIReady = () => {
        window.clearTimeout(timeoutId);
        previousReady?.();
        resolve(window.YT);
      };

      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        script.onerror = () => {
          window.clearTimeout(timeoutId);
          youtubeIframeApiPromise = null;
          reject(new Error('Unable to load the YouTube player.'));
        };
        document.body.appendChild(script);
      }
    });
  }

  return youtubeIframeApiPromise;
};

export default function VideoPlayer({ course }) {
  const {
    role,
    completedLessons,
    markComplete,
    markIncomplete,
    lessonNotes,
    lessonWatchProgress,
    saveNote,
    updateWatchProgress,
  } = useApp();

  const [activeLesson, setActiveLesson] = useState(course.lessons[0]);
  const [noteText, setNoteText] = useState(lessonNotes[course.lessons[0]?.id]?.text || '');
  const [showNote, setShowNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [playerMessage, setPlayerMessage] = useState('');
  const [playerUnavailable, setPlayerUnavailable] = useState(false);
  const [fallbackPlayerActive, setFallbackPlayerActive] = useState(false);
  const usesDirectLessonVideos = useMemo(
    () => course.lessons.every((lesson) => lesson.videoId && lesson.videoId !== PLACEHOLDER_VIDEO_ID),
    [course.lessons],
  );
  const playlistId = useMemo(
    () => (usesDirectLessonVideos ? '' : getPlaylistId(course.playlistUrl)),
    [course.playlistUrl, usesDirectLessonVideos],
  );

  const initialWatchState = normalizeWatchState(lessonWatchProgress[course.lessons[0]?.id]);
  const [watchState, setWatchState] = useState(initialWatchState);
  const playerHostRef = useRef(null);
  const playerRef = useRef(null);
  const trackingIntervalRef = useRef(null);
  const playerMessageTimeoutRef = useRef(null);
  const lastPlayerTimeRef = useRef(0);
  const watchStateRef = useRef(initialWatchState);
  const lastPersistedWatchRef = useRef(initialWatchState);

  const isComplete = (id) => !!completedLessons[id];
  const progress = getCourseProgress(course);
  const activeLessonIndex = Math.max(0, course.lessons.findIndex((lesson) => lesson.id === activeLesson.id));
  const bypassWatchRequirement = role === 'Admin' || role === 'Super Admin';
  const accessibleLessonCount = getAccessibleLessonCount(course, role);
  const activeLessonAccessible = canAccessCourseLesson(course, activeLessonIndex, role);
  const activeWatchPercent = watchState.percent;
  const activeLessonUnlocked = bypassWatchRequirement || activeWatchPercent >= LESSON_WATCH_THRESHOLD;
  const fallbackEmbedUrl = useMemo(() => buildFallbackEmbedUrl({
    playlistId,
    videoId: activeLesson.videoId,
    lessonIndex: activeLessonIndex,
  }), [activeLesson.videoId, activeLessonIndex, playlistId]);

  const getLessonWatchPercent = (lessonId) => {
    if (lessonId === activeLesson.id) {
      return activeWatchPercent;
    }

    return normalizeWatchState(lessonWatchProgress[lessonId]).percent;
  };

  const getLessonDurationLabel = (lesson) => {
    const trackedDuration = lesson.id === activeLesson.id
      ? watchState.durationSeconds
      : normalizeWatchState(lessonWatchProgress[lesson.id]).durationSeconds;

    if (trackedDuration > 0) {
      return formatDurationLabel(trackedDuration);
    }

    return course.playlistUrl ? 'Syncing...' : lesson.duration;
  };

  const setLessonMessage = (message) => {
    if (playerMessageTimeoutRef.current) {
      window.clearTimeout(playerMessageTimeoutRef.current);
    }

    setPlayerMessage(message);
    playerMessageTimeoutRef.current = window.setTimeout(() => {
      setPlayerMessage('');
    }, 3200);
  };

  const stopTracking = () => {
    if (trackingIntervalRef.current) {
      window.clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
  };

  const selectLesson = (lesson) => {
    const lessonIndex = course.lessons.findIndex((entry) => entry.id === lesson.id);
    if (!canAccessCourseLesson(course, lessonIndex, role)) {
      setLessonMessage(
        `Only the first ${accessibleLessonCount} lesson${accessibleLessonCount !== 1 ? 's are' : ' is'} free. Pay to unlock the remaining course videos.`,
      );
      return false;
    }

    setActiveLesson(lesson);
    setShowNote(false);
    setNoteText(lessonNotes[lesson.id]?.text || '');
    setNoteSaved(false);
    setPlayerMessage('');
    return true;
  };

  const moveToNextLesson = (lesson) => {
    const lessonIndex = course.lessons.findIndex((entry) => entry.id === lesson.id);
    const nextLesson = course.lessons[lessonIndex + 1];

    if (nextLesson) {
      const didSelect = selectLesson(nextLesson);
      if (!didSelect) {
        setLessonMessage('Your free preview is complete. Use the payment section above to unlock the rest of this course.');
      }
    }
  };

  const completeLessonAfterWatch = (lesson, { shouldAdvance = false } = {}) => {
    if (!lesson) return;

    const lessonIndex = course.lessons.findIndex((entry) => entry.id === lesson.id);
    if (!canAccessCourseLesson(course, lessonIndex, role)) return;

    if (!isComplete(lesson.id)) {
      markComplete(lesson.id, course.id);
    }

    if (shouldAdvance) {
      moveToNextLesson(lesson);
    }
  };

  const persistWatchState = (nextState, { force = false } = {}) => {
    const normalizedState = normalizeWatchState(nextState);
    watchStateRef.current = normalizedState;

    setWatchState((currentState) => {
      if (
        currentState.percent === normalizedState.percent
        && currentState.durationSeconds === normalizedState.durationSeconds
        && Math.abs(currentState.watchedSeconds - normalizedState.watchedSeconds) < 0.01
      ) {
        return currentState;
      }

      return normalizedState;
    });

    const lastPersisted = lastPersistedWatchRef.current;
    const shouldPersist = force
      || normalizedState.percent > lastPersisted.percent
      || normalizedState.durationSeconds > lastPersisted.durationSeconds
      || normalizedState.watchedSeconds - lastPersisted.watchedSeconds >= 5;

    if (shouldPersist) {
      updateWatchProgress(activeLesson.id, course.id, normalizedState);
      lastPersistedWatchRef.current = normalizedState;
    }
  };

  const finalizeWatchProgress = (percent = 100) => {
    const player = playerRef.current;
    const duration = Math.max(
      watchStateRef.current.durationSeconds,
      Number(player?.getDuration?.() || 0),
    );

    if (!duration) return;

    const nextPercent = Math.max(watchStateRef.current.percent, Math.min(100, Math.round(percent)));
    persistWatchState({
      watchedSeconds: Math.min(duration, (duration * nextPercent) / 100),
      durationSeconds: duration,
      percent: nextPercent,
    }, { force: true });
  };

  const startTracking = () => {
    stopTracking();
    lastPlayerTimeRef.current = Number(playerRef.current?.getCurrentTime?.() || 0);

    trackingIntervalRef.current = window.setInterval(() => {
      const player = playerRef.current;
      if (!player?.getCurrentTime || !player?.getDuration) return;

      const currentTime = Number(player.getCurrentTime()) || 0;
      const duration = Number(player.getDuration()) || watchStateRef.current.durationSeconds;
      const previousTime = lastPlayerTimeRef.current;
      const rawDelta = currentTime - previousTime;
      lastPlayerTimeRef.current = currentTime;

      if (!duration) return;

      const creditedDelta = rawDelta > 0 ? Math.min(rawDelta, 2) : 0;
      const nextWatchedSeconds = Math.min(duration, watchStateRef.current.watchedSeconds + creditedDelta);
      const nextPercent = Math.max(
        watchStateRef.current.percent,
        Math.round((nextWatchedSeconds / duration) * 100),
      );

      persistWatchState({
        watchedSeconds: nextWatchedSeconds,
        durationSeconds: duration,
        percent: nextPercent,
      });
    }, 1000);
  };

  const toggleLesson = (lesson, { shouldAdvance = false } = {}) => {
    const lessonIndex = course.lessons.findIndex((entry) => entry.id === lesson.id);
    if (!canAccessCourseLesson(course, lessonIndex, role)) {
      setLessonMessage('This lesson is locked for students until the course payment is confirmed.');
      return;
    }

    if (isComplete(lesson.id)) {
      markIncomplete(lesson.id);
      return;
    }

    const lessonWatchPercent = getLessonWatchPercent(lesson.id);
    if (!bypassWatchRequirement && lessonWatchPercent < LESSON_WATCH_THRESHOLD) {
      setLessonMessage(
        `Watch at least ${LESSON_WATCH_THRESHOLD}% before marking this lesson complete. (${lessonWatchPercent}% watched)`,
      );
      return;
    }

    markComplete(lesson.id, course.id);

    if (shouldAdvance) {
      moveToNextLesson(lesson);
    }
  };

  const handleSaveNote = () => {
    saveNote(activeLesson.id, noteText);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  useEffect(() => {
    const nextWatchState = normalizeWatchState(lessonWatchProgress[activeLesson.id]);
    setWatchState(nextWatchState);
    watchStateRef.current = nextWatchState;
    lastPersistedWatchRef.current = nextWatchState;
  }, [
    activeLesson.id,
    lessonWatchProgress[activeLesson.id]?.durationSeconds,
    lessonWatchProgress[activeLesson.id]?.percent,
    lessonWatchProgress[activeLesson.id]?.watchedSeconds,
  ]);

  useEffect(() => {
    if (activeLessonAccessible) return;
    const firstOpenLesson = course.lessons.find((_, index) => canAccessCourseLesson(course, index, role));
    if (firstOpenLesson) {
      setActiveLesson(firstOpenLesson);
    }
  }, [activeLessonAccessible, course, role]);

  useEffect(() => {
    let isCancelled = false;
    const host = playerHostRef.current;

    stopTracking();
    setPlayerUnavailable(false);
    setFallbackPlayerActive(false);

    if (!host) return undefined;
    host.innerHTML = '';

    if (!activeLessonAccessible) {
      return undefined;
    }

    loadYouTubeIframeApi()
      .then((YT) => {
        if (isCancelled || !playerHostRef.current) return;

        playerRef.current = new YT.Player(playerHostRef.current, {
          width: '100%',
          height: '100%',
          host: 'https://www.youtube-nocookie.com',
          videoId: playlistId ? undefined : activeLesson.videoId,
          playerVars: {
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1,
            ...(typeof window !== 'undefined' && window.location?.origin ? { origin: window.location.origin } : {}),
            ...(playlistId ? { listType: 'playlist', list: playlistId, index: activeLessonIndex } : {}),
          },
          events: {
            onReady: (event) => {
              if (playlistId && event.target?.cuePlaylist) {
                try {
                  event.target.cuePlaylist({
                    listType: 'playlist',
                    list: playlistId,
                    index: activeLessonIndex,
                  });
                } catch {
                  // If cueing the playlist fails, we keep the constructor-driven setup.
                }
              }

              const duration = Number(event.target?.getDuration?.() || 0);
              if (duration > watchStateRef.current.durationSeconds) {
                persistWatchState({
                  ...watchStateRef.current,
                  durationSeconds: duration,
                }, { force: true });
              }
            },
            onStateChange: (event) => {
              const state = event.data;
              if (state === YT.PlayerState.PLAYING) {
                const duration = Number(event.target?.getDuration?.() || 0);
                if (duration > watchStateRef.current.durationSeconds) {
                  persistWatchState({
                    ...watchStateRef.current,
                    durationSeconds: duration,
                  }, { force: true });
                }
                startTracking();
                return;
              }

              stopTracking();

              if (state === YT.PlayerState.ENDED) {
                finalizeWatchProgress(100);
                completeLessonAfterWatch(activeLesson, { shouldAdvance: true });
              }
            },
            onError: () => {
              stopTracking();
              setPlayerUnavailable(true);
              setFallbackPlayerActive(Boolean(fallbackEmbedUrl));
            },
          },
        });
      })
      .catch(() => {
        if (!isCancelled) {
          setPlayerUnavailable(true);
          setFallbackPlayerActive(Boolean(fallbackEmbedUrl));
        }
      });

    return () => {
      isCancelled = true;
      stopTracking();

      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
      }

      playerRef.current = null;
      if (host) {
        host.innerHTML = '';
      }
    };
  }, [activeLesson.id, activeLesson.videoId, activeLessonIndex, playlistId]);

  useEffect(() => () => {
    stopTracking();

    if (playerMessageTimeoutRef.current) {
      window.clearTimeout(playerMessageTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!activeLessonAccessible) return;
    if (watchState.percent < 100) return;
    if (isComplete(activeLesson.id)) return;

    completeLessonAfterWatch(activeLesson);
  }, [activeLesson.id, activeLessonAccessible, isComplete, watchState.percent]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 animate-fade-in">
      <div className="flex-1 min-w-0">
        <div className="video-container mb-4">
          <div
            ref={playerHostRef}
            className={`absolute inset-0 transition-opacity ${fallbackPlayerActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          />
          {fallbackPlayerActive && fallbackEmbedUrl && (
            <iframe
              title={`${course.title} lesson player`}
              src={fallbackEmbedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          )}
          {!activeLessonAccessible && (
            <div
              className="absolute inset-0 flex items-center justify-center px-6 text-center"
              style={{ background: 'rgba(2, 15, 10, 0.92)' }}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.18)' }}>
                  <Lock size={18} className="text-gold-400" />
                </div>
                <p className="font-cinzel text-gold-400 text-sm">Lesson locked</p>
                <p className="text-cream/60 font-crimson text-sm mt-2">
                  The first {accessibleLessonCount} lesson{accessibleLessonCount !== 1 ? 's are' : ' is'} free. Use the payment section above to continue the course.
                </p>
              </div>
            </div>
          )}
          {playerUnavailable && !fallbackPlayerActive && (
            <div
              className="absolute inset-0 flex items-center justify-center px-6 text-center"
              style={{ background: 'rgba(2, 15, 10, 0.88)' }}
            >
              <div>
                <p className="font-cinzel text-gold-400 text-sm">Video player unavailable</p>
                <p className="text-cream/60 font-crimson text-sm mt-2">
                  Open the playlist directly, then come back here to continue your lesson progress.
                </p>
              </div>
            </div>
          )}
        </div>

        {playerUnavailable && fallbackPlayerActive && activeLessonAccessible && (
          <div
            className="mb-4 rounded-xl px-4 py-3"
            style={{ background: 'rgba(6,78,59,0.14)', border: '1px solid rgba(245,158,11,0.16)' }}
          >
            <p className="text-xs font-crimson text-gold-300">
              The main YouTube player did not load for this lesson, so the website switched to a fallback in-page embed.
            </p>
          </div>
        )}

        <div className="glass-card p-4 mb-4">
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-start gap-3">
                <h2 className="font-cinzel font-bold text-gold-400 text-lg leading-snug flex-1">{activeLesson.title}</h2>
                <button
                  type="button"
                  onClick={() => toggleLesson(activeLesson, { shouldAdvance: !isComplete(activeLesson.id) })}
                  disabled={!activeLessonAccessible}
                  className={`mt-0.5 w-6 h-6 rounded-[6px] border flex items-center justify-center transition-all ${
                    isComplete(activeLesson.id)
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                      : activeLessonAccessible && activeLessonUnlocked
                        ? 'border-gold-500/40 text-gold-400 hover:bg-gold-900/20'
                        : 'border-cream/20 text-cream/25 bg-white/[0.02]'
                  }`}
                  aria-label={isComplete(activeLesson.id) ? 'Mark lesson incomplete' : 'Mark lesson complete'}
                  title={
                    !activeLessonAccessible
                      ? 'This lesson unlocks after payment'
                      : isComplete(activeLesson.id)
                        ? 'Mark incomplete'
                        : bypassWatchRequirement
                          ? 'Mark complete'
                          : `Watch ${LESSON_WATCH_THRESHOLD}% to mark complete`
                  }
                >
                  {isComplete(activeLesson.id) && <Check size={14} />}
                </button>
              </div>
              <p className="text-cream/60 font-crimson text-sm mt-1">{activeLesson.description}</p>

              <div
                className="mt-3 rounded-xl px-3 py-3"
                style={{ background: 'rgba(6,78,59,0.16)', border: '1px solid rgba(245,158,11,0.14)' }}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  {!activeLessonAccessible ? (
                    <p className="text-xs font-crimson text-gold-300">
                      This lesson is part of the paid section of the course. Your student account can still watch the first {accessibleLessonCount} free lessons.
                    </p>
                  ) : bypassWatchRequirement ? (
                    <p className="text-xs font-crimson text-emerald-300">
                      Admin access is active. You can complete lessons without the {LESSON_WATCH_THRESHOLD}% watch requirement.
                    </p>
                  ) : (
                    <p className="text-xs font-crimson text-cream/60">
                      Watch at least {LESSON_WATCH_THRESHOLD}% of this lesson before marking it complete.
                    </p>
                  )}
                  <p className={`text-xs font-cinzel ${activeLessonAccessible && activeLessonUnlocked ? 'text-emerald-400' : 'text-gold-400'}`}>
                    {!activeLessonAccessible ? 'Payment Required' : bypassWatchRequirement ? 'Admin Override' : `${activeWatchPercent}% watched`}
                  </p>
                </div>
                <div className="progress-track mt-2">
                  <div className="progress-fill" style={{ width: `${activeWatchPercent}%` }} />
                </div>
              </div>

              {playerMessage && (
                <p className="text-xs font-crimson text-gold-300 mt-2">{playerMessage}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="flex items-center gap-1 text-xs text-cream/40 font-crimson">
                  <Clock size={12} /> {getLessonDurationLabel(activeLesson)}
                </span>
                <span className="badge badge-emerald">{course.subject}</span>
                {course.playlistUrl && (
                  <a
                    href={course.playlistUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-crimson text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    <ExternalLink size={12} />
                    Open Playlist
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <ProgressBar value={progress} label="Course Progress" />
          </div>
        </div>

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

      <div className="lg:w-80 flex-shrink-0">
        <div className="glass-card overflow-hidden">
          <div className="px-4 py-3 border-b border-gold-800/20">
            <h3 className="font-cinzel font-bold text-gold-400 text-sm tracking-wide">LESSONS</h3>
            <p className="text-xs text-cream/40 font-crimson mt-0.5">
              {Object.values(completedLessons).filter((lesson) => lesson.courseId === course.id).length}/{course.lessons.length} completed
            </p>
          </div>

          <div className="max-h-[55vh] lg:max-h-[70vh] overflow-y-auto">
            {course.lessons.map((lesson, idx) => {
              const done = isComplete(lesson.id);
              const isActive = activeLesson.id === lesson.id;
              const lessonWatchPercent = getLessonWatchPercent(lesson.id);
              const lessonUnlocked = lessonWatchPercent >= LESSON_WATCH_THRESHOLD;
              const lessonAccessible = canAccessCourseLesson(course, idx, role);

              return (
                <div key={lesson.id}
                  onClick={() => selectLesson(lesson)}
                  className={`flex items-start gap-3 px-4 py-3 transition-all border-b
                    ${isActive
                      ? 'bg-gold-900/20 border-b-gold-700/20'
                      : lessonAccessible
                        ? 'hover:bg-emerald-900/20 border-b-emerald-900/20 cursor-pointer'
                        : 'border-b-emerald-900/20 cursor-not-allowed opacity-75'}`}>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center text-[10px] font-cinzel flex-shrink-0 mt-0.5 ${
                        !lessonAccessible ? 'border-red-400/40 text-red-300' : isActive ? 'border-gold-400 text-gold-400' : 'border-cream/20 text-cream/30'
                      }`}>
                        {!lessonAccessible ? <Lock size={9} /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <p className={`text-sm leading-snug font-crimson flex-1 ${!lessonAccessible ? 'text-cream/35' : isActive ? 'text-gold-400 font-semibold' : done ? 'text-cream/55' : 'text-cream/80'}`}>
                            {lesson.title}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLesson(lesson, { shouldAdvance: isActive && !done });
                            }}
                            disabled={!lessonAccessible}
                            className={`w-5 h-5 rounded-[5px] border flex items-center justify-center transition-all flex-shrink-0 ${
                              done
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                                : lessonAccessible && lessonUnlocked
                                  ? 'border-gold-500/40 text-gold-400 hover:bg-gold-900/20'
                                  : 'border-cream/20 text-cream/25 bg-white/[0.02]'
                            }`}
                            aria-label={done ? 'Mark lesson incomplete' : 'Mark lesson complete'}
                            title={
                              !lessonAccessible
                                ? 'This lesson unlocks after payment'
                                : done
                                  ? 'Mark incomplete'
                                  : bypassWatchRequirement
                                    ? 'Mark complete'
                                    : `Watch ${LESSON_WATCH_THRESHOLD}% to mark complete`
                            }
                          >
                            {done && <Check size={12} />}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <Clock size={10} className="text-cream/30" />
                          <span className="text-[10px] text-cream/30 font-crimson">{getLessonDurationLabel(lesson)}</span>
                          <span className={`text-[10px] font-crimson ${lessonAccessible && lessonUnlocked ? 'text-emerald-400' : 'text-gold-400/80'}`}>
                            {!lessonAccessible ? 'Locked' : bypassWatchRequirement ? 'Admin Override' : `${lessonWatchPercent}% watched`}
                          </span>
                          {done && <span className="badge badge-emerald text-[9px] px-1 py-0">✓</span>}
                        </div>
                      </div>
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
