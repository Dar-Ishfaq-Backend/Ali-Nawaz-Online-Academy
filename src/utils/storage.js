import { COURSES as BASE_COURSES } from '../data/courses';
import {
  DEFAULT_CERTIFICATE_TEMPLATE,
  DEFAULT_CERTIFICATE_THEME,
  isCertificateTemplate,
  isCertificateTheme,
} from './certificateTemplates';
import { COURSE_PAYMENT_DETAILS } from './paymentConfig';

// ─────────────────────────────────────────────
// localStorage Helpers — Ali Nawaz Academy
// Demo authentication + per-user learning data
// ─────────────────────────────────────────────

const PREFIX = 'ali_nawaz_';
const DEFAULT_VIDEO_ID = 'dQw4w9WgXcQ';
const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600&q=80';
export const LESSON_WATCH_THRESHOLD = 70;
export const CERTIFICATE_WATCH_THRESHOLD = 70;
const DEFAULT_FREE_PREVIEW_LESSONS = 3;
const PNG_DATA_URL_PREFIX = 'data:image/png;base64,';
const LEGACY_REMOVED_USER_IDS = new Set(['demo-super-admin']);
const LEGACY_REMOVED_USER_EMAILS = new Set(['superadmin@alinawaz.academy']);

const ROLE_ORDER = {
  Student: 0,
  Teacher: 1,
  Admin: 2,
  'Super Admin': 3,
};

const key = (k) => `${PREFIX}${k}`;
const normalizeEmail = (email) => email.trim().toLowerCase();
const normalizeTotalLessons = (value, fallback = 1) => Math.max(1, Number.parseInt(value, 10) || fallback || 1);
const normalizePricePkr = (value) => Math.max(0, Number.parseInt(value, 10) || 0);
const normalizeFreePreviewLessons = (value, totalLessons, fallback = DEFAULT_FREE_PREVIEW_LESSONS) => {
  const parsed = Number.parseInt(value, 10);
  const normalized = Number.isFinite(parsed) ? parsed : fallback;
  return Math.max(1, Math.min(totalLessons || 1, normalized));
};
const normalizeProgressPercent = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
};
const normalizeProgressSeconds = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, numeric);
};
const normalizeSignatureImage = (value) => (
  typeof value === 'string' && value.startsWith(PNG_DATA_URL_PREFIX) ? value : ''
);

const DEMO_USERS = [
  {
    id: 'demo-student',
    name: 'Amina Yusuf',
    email: 'student@alinawaz.academy',
    password: 'Student123!',
    role: 'Student',
    createdAt: '2026-03-29T00:00:00.000Z',
    isDemo: true,
    blocked: false,
  },
  {
    id: 'demo-teacher',
    name: 'Ustadh Kareem Ahmad',
    email: 'teacher@alinawaz.academy',
    password: 'Teacher123!',
    role: 'Teacher',
    createdAt: '2026-03-29T00:00:00.000Z',
    isDemo: true,
    blocked: false,
  },
  {
    id: 'demo-admin',
    name: 'Maryam Siddiqui',
    email: 'admin@alinawaz.academy',
    password: 'Admin123!',
    role: 'Admin',
    createdAt: '2026-03-29T00:00:00.000Z',
    isDemo: true,
    blocked: false,
  },
];

export const DEMO_ACCOUNTS = DEMO_USERS.map(({ id, name, email, password, role }) => ({
  id,
  name,
  email,
  password,
  role,
}));

export const getItem = (k, fallback = null) => {
  try {
    const val = localStorage.getItem(key(k));
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

export const setItem = (k, value) => {
  try {
    localStorage.setItem(key(k), JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('Storage error:', e);
    return false;
  }
};

export const removeItem = (k) => {
  try {
    localStorage.removeItem(key(k));
  } catch (e) {
    console.error('Storage error:', e);
  }
};

const mergeDemoUsers = (users = []) => {
  const map = new Map();
  const cleanedUsers = users.filter((user) => (
    !LEGACY_REMOVED_USER_IDS.has(user.id)
    && !LEGACY_REMOVED_USER_EMAILS.has(normalizeEmail(user.email || ''))
  ));

  DEMO_USERS.forEach((user) => {
    map.set(normalizeEmail(user.email), user);
  });

  cleanedUsers.forEach((user) => {
    map.set(normalizeEmail(user.email), user);
  });

  return [...map.values()];
};

const persistUsers = (users) => {
  setItem('users', users);
  return users;
};

export const getUsers = () => {
  const storedUsers = getItem('users', []);
  const mergedUsers = mergeDemoUsers(storedUsers);

  if (mergedUsers.length !== storedUsers.length) {
    persistUsers(mergedUsers);
  }

  return mergedUsers;
};

export const getCurrentSession = () => getItem('session', null);

export const setCurrentSessionUser = (userId, extra = {}) => {
  setItem('session', {
    userId,
    loggedInAt: new Date().toISOString(),
    ...extra,
  });
};

export const getCurrentUser = () => {
  const session = getCurrentSession();
  if (!session?.userId) return null;
  const currentUser = getUsers().find((user) => user.id === session.userId) || null;

  if (!currentUser && LEGACY_REMOVED_USER_IDS.has(session.userId)) {
    removeItem('session');
  }

  return currentUser;
};

const getUserItemById = (userId, k, fallback = null) => getItem(`user_${userId}_${k}`, fallback);
const setUserItemById = (userId, k, value) => setItem(`user_${userId}_${k}`, value);

const userScopedKey = (k) => {
  const user = getCurrentUser();
  return user ? `user_${user.id}_${k}` : `guest_${k}`;
};

const getUserItem = (k, fallback = null) => getItem(userScopedKey(k), fallback);
const setUserItem = (k, value) => setItem(userScopedKey(k), value);

const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const extractVideoId = (value = '') => {
  if (!value) return DEFAULT_VIDEO_ID;

  const watchMatch = value.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  if (watchMatch) return watchMatch[1];

  const shortMatch = value.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  if (shortMatch) return shortMatch[1];

  return DEFAULT_VIDEO_ID;
};

const buildLessons = ({ title, totalLessons, playlistUrl, existingLessons = [] }) => {
  const target = normalizeTotalLessons(totalLessons, existingLessons.length || 1);
  const videoId = extractVideoId(playlistUrl || existingLessons[0]?.videoId);
  const lessons = existingLessons.slice(0, target);

  while (lessons.length < target) {
    const number = lessons.length + 1;
    lessons.push({
      id: `${slugify(title || 'course')}-lesson-${number}`,
      title: `Lesson ${number}`,
      videoId,
      duration: '45:00',
      description: `Lesson ${number} for ${title || 'this course'}.`,
    });
  }

  return lessons;
};

const serializeCourse = (course) => {
  const hydrated = hydrateCourse(course);

  return {
    id: String(hydrated.id),
    title: hydrated.title,
    description: hydrated.description,
    price: hydrated.price,
    is_paid: hydrated.is_paid,
    youtube_playlist_url: hydrated.youtube_playlist_url,
    thumbnail: hydrated.thumbnail,
    instructor: hydrated.instructor,
    created_at: hydrated.created_at,
    lessons: hydrated.lessons,
    freePreviewLessons: hydrated.freePreviewLessons,
    createdBy: hydrated.createdBy || '',
    isCustom: Boolean(hydrated.isCustom),
  };
};

const hydrateCourse = (course) => {
  const youtubePlaylistUrl = course.youtube_playlist_url || course.playlistUrl || '';
  const createdAt = course.created_at || course.createdAt || new Date().toISOString();
  const price = normalizePricePkr(course.price ?? course.pricePKR);
  const isPaid = typeof course.is_paid === 'boolean'
    ? course.is_paid
    : Boolean(course.requiresPayment ?? price > 0);
  const totalLessons = normalizeTotalLessons(course.totalLessons, course.lessons?.length || 1);
  const lessons = buildLessons({
    title: course.title,
    totalLessons,
    playlistUrl: youtubePlaylistUrl,
    existingLessons: Array.isArray(course.lessons) ? course.lessons : [],
  });

  return {
    ...course,
    id: String(course.id),
    totalLessons,
    lessons,
    price,
    is_paid: isPaid,
    youtube_playlist_url: youtubePlaylistUrl,
    created_at: createdAt,
    requiresPayment: isPaid,
    freePreviewLessons: isPaid
      ? normalizeFreePreviewLessons(course.freePreviewLessons, totalLessons)
      : totalLessons,
    pricePKR: price,
    playlistUrl: youtubePlaylistUrl,
    createdAt,
    currency: course.currency || 'PKR',
    isShortCourse: Boolean(course.isShortCourse),
    thumbnail: course.thumbnail || DEFAULT_THUMBNAIL,
    subject: course.subject || 'General Studies',
    category: course.category || (isPaid ? 'Premium Course' : 'Free Course'),
    level: course.level || 'All Levels',
    duration: course.duration || (youtubePlaylistUrl ? 'YouTube playlist' : `${totalLessons} lessons`),
  };
};

const getCourseOverrides = () => getItem('platform_course_overrides', {});
const setCourseOverrides = (overrides) => setItem('platform_course_overrides', overrides);
const getCustomCourses = () => getItem('platform_custom_courses', []).map(hydrateCourse);
const setCustomCourses = (courses) => setItem('platform_custom_courses', courses.map(serializeCourse));
const DEFAULT_PLATFORM_SETTINGS = {
  certificateTemplate: DEFAULT_CERTIFICATE_TEMPLATE,
  certificateTheme: DEFAULT_CERTIFICATE_THEME,
  certificateSignature: '',
};

const normalizePlatformSettings = (settings = {}) => ({
  certificateTemplate: isCertificateTemplate(settings.certificateTemplate)
    ? settings.certificateTemplate
    : DEFAULT_PLATFORM_SETTINGS.certificateTemplate,
  certificateTheme: isCertificateTheme(settings.certificateTheme)
    ? settings.certificateTheme
    : DEFAULT_PLATFORM_SETTINGS.certificateTheme,
  certificateSignature: normalizeSignatureImage(settings.certificateSignature),
});

export const getPlatformSettings = () => {
  const storedSettings = getItem('platform_settings', null);
  const normalizedSettings = normalizePlatformSettings(storedSettings || {});

  if (
    !storedSettings
    || storedSettings.certificateTemplate !== normalizedSettings.certificateTemplate
    || storedSettings.certificateTheme !== normalizedSettings.certificateTheme
    || storedSettings.certificateSignature !== normalizedSettings.certificateSignature
  ) {
    setItem('platform_settings', normalizedSettings);
  }

  return normalizedSettings;
};

export const getManagedCourses = () => {
  const overrides = getCourseOverrides();
  const baseCourses = BASE_COURSES.map((course) => hydrateCourse({ ...course, ...(overrides[course.id] || {}) }));
  return [...baseCourses, ...getCustomCourses()];
};

export const findManagedCourse = (courseId) => getManagedCourses().find((course) => course.id === courseId) || null;

const getActor = () => getCurrentUser();
const isPrivileged = (role) => ROLE_ORDER[role] >= ROLE_ORDER.Admin;
const canManageRole = (actorRole, targetRole) => {
  if (actorRole === 'Super Admin') return true;
  if (actorRole === 'Admin') return ROLE_ORDER[targetRole] < ROLE_ORDER.Admin;
  return false;
};

export const getAssignableRoles = () => {
  const actor = getActor();
  if (!actor) return ['Student'];
  if (actor.role === 'Super Admin') return ['Student', 'Teacher', 'Admin', 'Super Admin'];
  if (actor.role === 'Admin') return ['Student', 'Teacher', 'Admin'];
  return ['Student'];
};

export const updatePlatformSettings = (updates) => {
  const actor = getActor();

  if (!actor || !isPrivileged(actor.role)) {
    return { ok: false, message: 'You do not have permission to update platform settings.' };
  }

  if (updates.certificateTemplate && !isCertificateTemplate(updates.certificateTemplate)) {
    return { ok: false, message: 'Please choose a valid certificate template.' };
  }

  if (updates.certificateTheme && !isCertificateTheme(updates.certificateTheme)) {
    return { ok: false, message: 'Please choose a valid certificate theme.' };
  }

  if (
    Object.prototype.hasOwnProperty.call(updates, 'certificateSignature')
    && updates.certificateSignature !== ''
    && !normalizeSignatureImage(updates.certificateSignature)
  ) {
    return { ok: false, message: 'Please upload a valid PNG signature.' };
  }

  const settings = normalizePlatformSettings({
    ...getPlatformSettings(),
    ...updates,
  });

  const saved = setItem('platform_settings', settings);
  if (!saved) {
    return { ok: false, message: 'The certificate settings could not be saved. Try a smaller signature image.' };
  }

  return { ok: true, settings };
};

export const loginUser = (email, password) => {
  const normalizedEmail = normalizeEmail(email);
  const user = getUsers().find((entry) => normalizeEmail(entry.email) === normalizedEmail);

  if (!user) {
    return { ok: false, message: 'No account was found for that email address.' };
  }

  if (user.blocked) {
    return { ok: false, message: 'This account is blocked. Please contact the administrator.' };
  }

  if (user.password !== password) {
    return { ok: false, message: 'Incorrect password. Please try again.' };
  }

  setCurrentSessionUser(user.id);

  return { ok: true, user };
};

export const logoutUser = () => {
  removeItem('session');
};

export const registerUser = ({ name, email, password }) => {
  const trimmedName = name.trim();
  const normalizedEmail = normalizeEmail(email);

  if (!trimmedName) {
    return { ok: false, message: 'Please enter your full name.' };
  }

  if (getUsers().some((user) => normalizeEmail(user.email) === normalizedEmail)) {
    return { ok: false, message: 'An account with that email already exists.' };
  }

  const user = {
    id: `user-${Date.now().toString(36)}`,
    name: trimmedName,
    email: normalizedEmail,
    password,
    role: 'Student',
    createdAt: new Date().toISOString(),
    isDemo: false,
    blocked: false,
  };

  persistUsers([...getUsers(), user]);
  setCurrentSessionUser(user.id);

  return { ok: true, user };
};

export const resetUserPassword = ({ email, newPassword }) => {
  const normalizedEmail = normalizeEmail(email);
  let found = false;

  const users = getUsers().map((user) => {
    if (normalizeEmail(user.email) !== normalizedEmail) return user;
    found = true;
    return { ...user, password: newPassword };
  });

  if (!found) {
    return { ok: false, message: 'No account was found for that email address.' };
  }

  persistUsers(users);
  return { ok: true, message: 'Password updated. You can sign in with the new password now.' };
};

const updateUserRecord = (userId, updates) => {
  let nextUser = null;

  const users = getUsers().map((user) => {
    if (user.id !== userId) return user;
    nextUser = { ...user, ...updates };
    return nextUser;
  });

  if (!nextUser) return null;

  persistUsers(users);
  return nextUser;
};

export const syncExternalUser = ({
  id,
  name,
  email,
  role = 'Student',
  createdAt,
  blocked = false,
  isDemo = false,
}) => {
  const normalizedEmail = normalizeEmail(email || '');
  const existingUser = getUsers().find((user) => (
    user.id === id || normalizeEmail(user.email) === normalizedEmail
  ));

  const nextUser = {
    ...existingUser,
    id: id || existingUser?.id || `external-user-${Date.now().toString(36)}`,
    name: name?.trim() || existingUser?.name || 'Student',
    email: normalizedEmail,
    role,
    createdAt: existingUser?.createdAt || createdAt || new Date().toISOString(),
    blocked: typeof blocked === 'boolean' ? blocked : Boolean(existingUser?.blocked),
    isDemo: Boolean(existingUser?.isDemo || isDemo),
    password: existingUser?.password || '',
  };

  const nextUsers = getUsers().filter((user) => (
    user.id !== nextUser.id && normalizeEmail(user.email) !== normalizedEmail
  ));

  persistUsers([...nextUsers, nextUser]);
  return nextUser;
};

export const createManagedUser = ({ name, email, password, role }) => {
  const actor = getActor();
  const trimmedName = name.trim();
  const normalizedEmail = normalizeEmail(email);
  const allowedRoles = getAssignableRoles();

  if (!actor || !isPrivileged(actor.role)) {
    return { ok: false, message: 'You do not have permission to create users.' };
  }

  if (!trimmedName || !normalizedEmail || !password) {
    return { ok: false, message: 'Please complete all required user fields.' };
  }

  if (!allowedRoles.includes(role)) {
    return { ok: false, message: 'You cannot assign that role.' };
  }

  if (getUsers().some((user) => normalizeEmail(user.email) === normalizedEmail)) {
    return { ok: false, message: 'An account with that email already exists.' };
  }

  const user = {
    id: `managed-user-${Date.now().toString(36)}`,
    name: trimmedName,
    email: normalizedEmail,
    password,
    role,
    createdAt: new Date().toISOString(),
    isDemo: false,
    blocked: false,
  };

  persistUsers([...getUsers(), user]);
  return { ok: true, user };
};

export const editManagedUser = (userId, updates) => {
  const actor = getActor();
  const targetUser = getUsers().find((user) => user.id === userId);

  if (!actor || !isPrivileged(actor.role) || !targetUser) {
    return { ok: false, message: 'Unable to update that user.' };
  }

  if (!canManageRole(actor.role, targetUser.role) && actor.id !== targetUser.id) {
    return { ok: false, message: 'You do not have permission to edit that user.' };
  }

  const nextRole = updates.role || targetUser.role;
  if (!getAssignableRoles().includes(nextRole) && actor.id !== targetUser.id) {
    return { ok: false, message: 'You cannot assign that role.' };
  }

  const trimmedName = updates.name?.trim();
  const normalizedEmail = updates.email ? normalizeEmail(updates.email) : targetUser.email;

  if (normalizedEmail !== targetUser.email && getUsers().some((user) => user.id !== userId && normalizeEmail(user.email) === normalizedEmail)) {
    return { ok: false, message: 'Another account already uses that email.' };
  }

  const nextUser = updateUserRecord(userId, {
    ...updates,
    name: trimmedName || targetUser.name,
    email: normalizedEmail,
  });

  return nextUser ? { ok: true, user: nextUser } : { ok: false, message: 'Unable to update that user.' };
};

export const toggleManagedUserBlocked = (userId) => {
  const actor = getActor();
  const targetUser = getUsers().find((user) => user.id === userId);

  if (!actor || !isPrivileged(actor.role) || !targetUser) {
    return { ok: false, message: 'Unable to update that user.' };
  }

  if (actor.id === targetUser.id) {
    return { ok: false, message: 'You cannot block your own account.' };
  }

  if (!canManageRole(actor.role, targetUser.role)) {
    return { ok: false, message: 'You do not have permission to block that user.' };
  }

  const nextUser = updateUserRecord(userId, { blocked: !targetUser.blocked });
  return nextUser ? { ok: true, user: nextUser } : { ok: false, message: 'Unable to update that user.' };
};

export const getRole = () => getCurrentUser()?.role || 'Student';

export const setRole = (role) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;
  return updateUserRecord(currentUser.id, { role });
};

export const getStudentName = () => getCurrentUser()?.name || 'Student';

export const setStudentName = (name) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const trimmedName = name.trim();
  if (!trimmedName) return currentUser;

  return updateUserRecord(currentUser.id, { name: trimmedName });
};

export const getEnrollments = () => getUserItem('enrollments', {});
export const getCoursePayments = () => getUserItem('course_payments', {});

export const isCourseAccessUnlocked = (course, role = getCurrentUser()?.role) => {
  if (!course) return false;
  if (role && role !== 'Student') return true;
  if (!course.is_paid) return true;
  return Boolean(getCoursePayments()[course.id]?.unlockedAt);
};

export const getAccessibleLessonCount = (course, role = getCurrentUser()?.role) => {
  if (!course?.lessons?.length) return 0;
  if (isCourseAccessUnlocked(course, role)) return course.lessons.length;
  return normalizeFreePreviewLessons(course.freePreviewLessons, course.lessons.length);
};

export const canAccessCourseLesson = (course, lessonIndex, role = getCurrentUser()?.role) => {
  if (!course?.lessons?.length) return false;
  const normalizedIndex = Number.isFinite(lessonIndex) ? lessonIndex : 0;
  return normalizedIndex >= 0 && normalizedIndex < getAccessibleLessonCount(course, role);
};

export const unlockCourseAccess = (courseId, payment = {}) => {
  const currentUser = getCurrentUser();
  const course = findManagedCourse(courseId);

  if (!currentUser || !course) {
    return { ok: false, message: 'Course payment could not be processed.' };
  }

  if (currentUser.role !== 'Student' || !course.is_paid) {
    return { ok: true, payment: getCoursePayments()[courseId] || null };
  }

  const payerName = payment.payerName?.trim();
  const transactionId = payment.transactionId?.trim();

  if (!payerName) {
    return { ok: false, message: 'Please enter the payer name used for the payment.' };
  }

  if (!transactionId) {
    return { ok: false, message: 'Please enter the transaction or reference ID from your payment app.' };
  }

  const payments = getCoursePayments();
  payments[courseId] = {
    status: 'paid',
    payerName,
    transactionId,
    amountPKR: normalizePricePkr(course.price),
    method: COURSE_PAYMENT_DETAILS.methodLabel,
    accountName: COURSE_PAYMENT_DETAILS.accountName,
    upiId: COURSE_PAYMENT_DETAILS.upiId,
    unlockedAt: new Date().toISOString(),
  };

  const saved = setUserItem('course_payments', payments);
  if (!saved) {
    return { ok: false, message: 'The course payment could not be saved on this device.' };
  }

  return { ok: true, payment: payments[courseId] };
};

export const enrollCourse = (courseId) => {
  const enrollments = getEnrollments();
  enrollments[courseId] = { enrolledAt: new Date().toISOString() };
  setUserItem('enrollments', enrollments);
};

export const isEnrolled = (courseId) => !!getEnrollments()[courseId];

export const getCompletedLessons = () => getUserItem('completed_lessons', {});

export const getLessonWatchProgress = () => getUserItem('lesson_watch_progress', {});

export const updateLessonWatchProgress = (lessonId, courseId, progress = {}) => {
  if (!lessonId) return null;

  const progressMap = getLessonWatchProgress();
  const current = progressMap[lessonId] || {};
  const currentDuration = normalizeProgressSeconds(current.durationSeconds);
  const currentWatched = normalizeProgressSeconds(current.watchedSeconds);
  const currentPercent = normalizeProgressPercent(current.percent);
  const nextDuration = Math.max(currentDuration, normalizeProgressSeconds(progress.durationSeconds));
  const watchedCandidate = Math.max(currentWatched, normalizeProgressSeconds(progress.watchedSeconds));
  const watchedSeconds = nextDuration > 0 ? Math.min(nextDuration, watchedCandidate) : watchedCandidate;
  const derivedPercent = nextDuration > 0 ? Math.round((watchedSeconds / nextDuration) * 100) : 0;
  const percent = Math.max(currentPercent, normalizeProgressPercent(progress.percent), derivedPercent);

  const nextProgress = {
    ...current,
    courseId: courseId || current.courseId || '',
    watchedSeconds,
    durationSeconds: nextDuration,
    percent,
    updatedAt: new Date().toISOString(),
  };

  progressMap[lessonId] = nextProgress;
  setUserItem('lesson_watch_progress', progressMap);
  return nextProgress;
};

export const getLessonWatchPercent = (lessonId) => (
  normalizeProgressPercent(getLessonWatchProgress()[lessonId]?.percent)
);

export const canBypassWatchRequirement = (role = getCurrentUser()?.role) => (
  !!role && ROLE_ORDER[role] >= ROLE_ORDER.Admin
);

export const canMarkLessonComplete = (lessonId, threshold = LESSON_WATCH_THRESHOLD) => (
  canBypassWatchRequirement() || getLessonWatchPercent(lessonId) >= threshold
);

export const markLessonComplete = (lessonId, courseId) => {
  const completed = getCompletedLessons();
  completed[lessonId] = { completedAt: new Date().toISOString(), courseId };
  setUserItem('completed_lessons', completed);
  updateStreak();
};

export const markLessonIncomplete = (lessonId) => {
  const completed = getCompletedLessons();
  delete completed[lessonId];
  setUserItem('completed_lessons', completed);
};

export const isLessonComplete = (lessonId) => !!getCompletedLessons()[lessonId];

export const getCourseProgress = (course) => {
  if (!course?.lessons?.length) return 0;
  const completed = getCompletedLessons();
  const done = course.lessons.filter((lesson) => completed[lesson.id]).length;
  return Math.round((done / course.lessons.length) * 100);
};

export const getCourseWatchStats = (course, threshold = CERTIFICATE_WATCH_THRESHOLD) => {
  if (!course?.lessons?.length) {
    return {
      threshold,
      totalLessons: 0,
      eligibleLessons: 0,
      averagePercent: 0,
      coursePercent: 0,
      watchedSeconds: 0,
      durationSeconds: 0,
      isEligible: false,
    };
  }

  const progressMap = getLessonWatchProgress();
  const lessonStats = course.lessons.map((lesson) => {
    const progress = progressMap[lesson.id] || {};

    return {
      percent: normalizeProgressPercent(progress.percent),
      watchedSeconds: normalizeProgressSeconds(progress.watchedSeconds),
      durationSeconds: normalizeProgressSeconds(progress.durationSeconds),
    };
  });
  const lessonPercents = lessonStats.map((lesson) => lesson.percent);
  const eligibleLessons = lessonPercents.filter((percent) => percent >= threshold).length;
  const averagePercent = Math.round(
    lessonPercents.reduce((sum, percent) => sum + percent, 0) / course.lessons.length
  );
  const durationSeconds = lessonStats.reduce((sum, lesson) => sum + lesson.durationSeconds, 0);
  const watchedSeconds = lessonStats.reduce((sum, lesson) => sum + Math.min(lesson.watchedSeconds, lesson.durationSeconds || lesson.watchedSeconds), 0);
  const coursePercent = durationSeconds > 0
    ? Math.max(0, Math.min(100, Math.round((watchedSeconds / durationSeconds) * 100)))
    : averagePercent;

  return {
    threshold,
    totalLessons: course.lessons.length,
    eligibleLessons,
    averagePercent,
    coursePercent,
    watchedSeconds,
    durationSeconds,
    isEligible: coursePercent >= threshold,
  };
};

export const getCourseProgressForUser = (course, userId) => {
  if (!course?.lessons?.length) return 0;
  const completed = getUserItemById(userId, 'completed_lessons', {});
  const done = course.lessons.filter((lesson) => completed[lesson.id]).length;
  return Math.round((done / course.lessons.length) * 100);
};

export const isCourseComplete = (course) => getCourseProgress(course) === 100;

export const canGenerateCertificate = (course, threshold = CERTIFICATE_WATCH_THRESHOLD) => {
  if (!course?.lessons?.length) return false;
  if (canBypassWatchRequirement()) return true;
  return getCourseWatchStats(course, threshold).isEligible;
};

const toDateStr = (date) => date.toISOString().split('T')[0];

export const getStreak = () => getUserItem('streak', {
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  weekDays: [],
});

export const updateStreak = () => {
  const streak = getStreak();
  const today = toDateStr(new Date());

  if (streak.lastStudyDate === today) return streak;

  const yesterday = toDateStr(new Date(Date.now() - 86400000));
  let current = streak.currentStreak;

  if (streak.lastStudyDate === yesterday) {
    current += 1;
  } else {
    current = 1;
  }

  const longest = Math.max(current, streak.longestStreak || 0);
  const weekDays = [...(streak.weekDays || [])];

  if (!weekDays.includes(today)) weekDays.push(today);

  const updated = {
    currentStreak: current,
    longestStreak: longest,
    lastStudyDate: today,
    weekDays: weekDays.slice(-7),
  };

  setUserItem('streak', updated);
  return updated;
};

export const getCertificates = () => getUserItem('certificates', {});

export const issueCertificate = (courseId, courseName, studentName) => {
  const certs = getCertificates();
  if (certs[courseId]) {
    return { ok: true, certificate: certs[courseId] };
  }

  const course = findManagedCourse(courseId);
  if (!course || !canGenerateCertificate(course)) {
    return {
      ok: false,
      message: `Watch at least ${CERTIFICATE_WATCH_THRESHOLD}% of the full course before claiming the certificate.`,
    };
  }

  certs[courseId] = {
    id: `ANA-${Date.now().toString(36).toUpperCase()}`,
    courseId,
    courseName,
    studentName,
    issuedAt: new Date().toISOString(),
    template: getPlatformSettings().certificateTemplate,
    theme: getPlatformSettings().certificateTheme,
    signatureImage: getPlatformSettings().certificateSignature || '',
  };
  setUserItem('certificates', certs);

  return { ok: true, certificate: certs[courseId] };
};

export const getCertificate = (courseId) => getCertificates()[courseId] || null;

export const getLessonNotes = () => getUserItem('lesson_notes', {});

export const saveLessonNote = (lessonId, note) => {
  const notes = getLessonNotes();
  notes[lessonId] = { text: note, savedAt: new Date().toISOString() };
  setUserItem('lesson_notes', notes);
};

export const getTeacherCourses = () => {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];
  return getManagedCourses().filter((course) => course.createdBy === currentUser.id);
};

export const createManagedCourse = (payload) => {
  const actor = getActor();
  if (!actor || ROLE_ORDER[actor.role] < ROLE_ORDER.Teacher) {
    return { ok: false, message: 'You do not have permission to create courses.' };
  }

  const title = payload.title.trim();
  if (!title) {
    return { ok: false, message: 'Course title is required.' };
  }

  const playlistUrl = payload.youtube_playlist_url?.trim() || payload.playlistUrl?.trim() || '';
  const price = normalizePricePkr(payload.price ?? payload.pricePKR);
  const isPaid = typeof payload.is_paid === 'boolean'
    ? payload.is_paid
    : Boolean(payload.requiresPayment ?? price > 0);

  const course = hydrateCourse({
    id: `${slugify(title)}-${Date.now().toString(36)}`,
    title,
    instructor: payload.instructor?.trim() || actor.name,
    description: payload.description?.trim() || 'New course draft.',
    price,
    is_paid: isPaid,
    youtube_playlist_url: playlistUrl,
    thumbnail: payload.thumbnail?.trim() || DEFAULT_THUMBNAIL,
    created_at: new Date().toISOString(),
    freePreviewLessons: payload.freePreviewLessons,
    lessons: Array.isArray(payload.lessons) ? payload.lessons : [],
    createdBy: actor.id,
    isCustom: true,
  });

  setCustomCourses([...getCustomCourses(), course]);
  return { ok: true, course };
};

export const editManagedCourse = (courseId, updates) => {
  const actor = getActor();
  if (!actor || ROLE_ORDER[actor.role] < ROLE_ORDER.Teacher) {
    return { ok: false, message: 'You do not have permission to edit courses.' };
  }

  const existing = findManagedCourse(courseId);
  if (!existing) {
    return { ok: false, message: 'Course not found.' };
  }

  const nextCourse = hydrateCourse({
    ...existing,
    title: updates.title?.trim() || existing.title,
    instructor: updates.instructor?.trim() || existing.instructor,
    description: updates.description?.trim() || existing.description,
    price: normalizePricePkr(updates.price ?? existing.price),
    is_paid: typeof updates.is_paid === 'boolean' ? updates.is_paid : existing.is_paid,
    youtube_playlist_url: updates.youtube_playlist_url?.trim() || updates.playlistUrl?.trim() || existing.youtube_playlist_url,
    thumbnail: updates.thumbnail?.trim() || existing.thumbnail,
    created_at: existing.created_at,
    freePreviewLessons: updates.freePreviewLessons ?? existing.freePreviewLessons,
    lessons: buildLessons({
      title: updates.title?.trim() || existing.title,
      totalLessons: normalizeTotalLessons(updates.totalLessons, existing.totalLessons),
      playlistUrl: updates.youtube_playlist_url || updates.playlistUrl || existing.youtube_playlist_url,
      existingLessons: existing.lessons,
    }),
  });

  if (existing.isCustom) {
    const customCourses = getCustomCourses().map((course) => (course.id === courseId ? nextCourse : course));
    setCustomCourses(customCourses);
  } else {
    const overrides = getCourseOverrides();
    overrides[courseId] = {
      ...overrides[courseId],
      title: nextCourse.title,
      description: nextCourse.description,
      instructor: nextCourse.instructor,
      price: nextCourse.price,
      is_paid: nextCourse.is_paid,
      youtube_playlist_url: nextCourse.youtube_playlist_url,
      thumbnail: nextCourse.thumbnail,
      created_at: nextCourse.created_at,
      lessons: nextCourse.lessons,
      freePreviewLessons: nextCourse.freePreviewLessons,
    };
    setCourseOverrides(overrides);
  }

  return { ok: true, course: nextCourse };
};

export const getUserLearningStats = (userId) => {
  const enrollments = getUserItemById(userId, 'enrollments', {});
  const completedLessons = getUserItemById(userId, 'completed_lessons', {});
  const certificates = getUserItemById(userId, 'certificates', {});

  return {
    coursesEnrolled: Object.keys(enrollments).length,
    lessonsCompleted: Object.keys(completedLessons).length,
    certificatesIssued: Object.keys(certificates).length,
  };
};

export const getManagedUsers = () => {
  return getUsers()
    .map((user) => ({
      ...user,
      ...getUserLearningStats(user.id),
    }))
    .sort((a, b) => {
      const roleDelta = ROLE_ORDER[b.role] - ROLE_ORDER[a.role];
      if (roleDelta !== 0) return roleDelta;
      return a.name.localeCompare(b.name);
    });
};

export const getAnalytics = () => {
  const users = getManagedUsers();
  const totalStudents = users.filter((user) => user.role === 'Student').length;
  const certificatesIssued = users.reduce((sum, user) => sum + user.certificatesIssued, 0);

  return {
    totalStudents,
    activeToday: Math.max(3, Math.round(totalStudents * 0.32)),
    coursesPublished: getManagedCourses().length,
    certificatesIssued,
    avgCompletion: 64,
    topCourse: 'Seerah Course',
  };
};
