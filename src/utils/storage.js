// ─────────────────────────────────────────────
// localStorage Helpers — Ali Nawaz Academy
// All data persistence goes through these utils
// ─────────────────────────────────────────────

const PREFIX = 'ali_nawaz_';

const key = (k) => `${PREFIX}${k}`;

// ── Generic get/set ──────────────────────────
export const getItem = (k, fallback = null) => {
  try {
    const val = localStorage.getItem(key(k));
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
};

export const setItem = (k, value) => {
  try { localStorage.setItem(key(k), JSON.stringify(value)); } catch (e) { console.error('Storage error:', e); }
};

export const removeItem = (k) => {
  try { localStorage.removeItem(key(k)); } catch (e) { console.error('Storage error:', e); }
};

// ── Role ─────────────────────────────────────
export const getRole = () => getItem('role', 'Student');
export const setRole = (role) => setItem('role', role);

// ── Student Name ─────────────────────────────
export const getStudentName = () => getItem('student_name', 'Abdullah');
export const setStudentName = (name) => setItem('student_name', name);

// ── Enrollments ──────────────────────────────
export const getEnrollments = () => getItem('enrollments', {});
export const enrollCourse = (courseId) => {
  const enrollments = getEnrollments();
  enrollments[courseId] = { enrolledAt: new Date().toISOString() };
  setItem('enrollments', enrollments);
};
export const isEnrolled = (courseId) => !!getEnrollments()[courseId];

// ── Lesson Progress ───────────────────────────
export const getCompletedLessons = () => getItem('completed_lessons', {});

export const markLessonComplete = (lessonId, courseId) => {
  const completed = getCompletedLessons();
  completed[lessonId] = { completedAt: new Date().toISOString(), courseId };
  setItem('completed_lessons', completed);
  // Update streak when a lesson is completed
  updateStreak();
};

export const markLessonIncomplete = (lessonId) => {
  const completed = getCompletedLessons();
  delete completed[lessonId];
  setItem('completed_lessons', completed);
};

export const isLessonComplete = (lessonId) => !!getCompletedLessons()[lessonId];

// ── Course Progress % ─────────────────────────
export const getCourseProgress = (course) => {
  if (!course?.lessons?.length) return 0;
  const completed = getCompletedLessons();
  const done = course.lessons.filter(l => completed[l.id]).length;
  return Math.round((done / course.lessons.length) * 100);
};

export const isCourseComplete = (course) => getCourseProgress(course) === 100;

// ── Streak ────────────────────────────────────
const toDateStr = (date) => date.toISOString().split('T')[0];

export const getStreak = () => getItem('streak', {
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  weekDays: [], // array of ISO date strings for last 7 days studied
});

export const updateStreak = () => {
  const streak = getStreak();
  const today = toDateStr(new Date());

  // Already studied today — no update needed
  if (streak.lastStudyDate === today) return streak;

  // Check if yesterday was the last study day
  const yesterday = toDateStr(new Date(Date.now() - 86400000));
  let current = streak.currentStreak;

  if (streak.lastStudyDate === yesterday) {
    // Consecutive day — increment
    current += 1;
  } else {
    // Missed a day — reset
    current = 1;
  }

  const longest = Math.max(current, streak.longestStreak || 0);

  // Track studied days (keep last 7 unique dates)
  const weekDays = [...(streak.weekDays || [])];
  if (!weekDays.includes(today)) weekDays.push(today);
  const recentWeek = weekDays.slice(-7);

  const updated = { currentStreak: current, longestStreak: longest, lastStudyDate: today, weekDays: recentWeek };
  setItem('streak', updated);
  return updated;
};

// ── Certificates ──────────────────────────────
export const getCertificates = () => getItem('certificates', {});

export const issueCertificate = (courseId, courseName, studentName) => {
  const certs = getCertificates();
  if (!certs[courseId]) {
    certs[courseId] = {
      id: `ANA-${Date.now().toString(36).toUpperCase()}`,
      courseId,
      courseName,
      studentName,
      issuedAt: new Date().toISOString(),
    };
    setItem('certificates', certs);
  }
  return certs[courseId];
};

export const getCertificate = (courseId) => getCertificates()[courseId] || null;

// ── Teacher Courses (locally added) ──────────
export const getTeacherCourses = () => getItem('teacher_courses', []);
export const addTeacherCourse = (course) => {
  const courses = getTeacherCourses();
  courses.push({ ...course, id: `tc-${Date.now()}`, createdAt: new Date().toISOString() });
  setItem('teacher_courses', courses);
};

// ── Notes ─────────────────────────────────────
export const getLessonNotes = () => getItem('lesson_notes', {});
export const saveLessonNote = (lessonId, note) => {
  const notes = getLessonNotes();
  notes[lessonId] = { text: note, savedAt: new Date().toISOString() };
  setItem('lesson_notes', notes);
};

// ── Analytics (mock) ──────────────────────────
export const getAnalytics = () => ({
  totalStudents: 247,
  activeToday: 38,
  coursesPublished: 7,
  certificatesIssued: 89,
  avgCompletion: 64,
  topCourse: 'Seerah Course',
});
