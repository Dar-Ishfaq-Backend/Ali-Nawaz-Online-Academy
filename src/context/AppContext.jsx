import { createContext, useCallback, useContext, useState } from 'react';
import { CERTIFICATE_TEMPLATES } from '../utils/certificateTemplates';
import {
  DEMO_ACCOUNTS,
  getAssignableRoles,
  getCertificates,
  getCompletedLessons,
  getCoursePayments,
  getCurrentUser,
  getEnrollments,
  getLessonWatchProgress,
  getLessonNotes,
  getManagedCourses,
  getManagedUsers,
  getPlatformSettings,
  getRole,
  getStreak,
  getStudentName,
  createManagedCourse,
  createManagedUser,
  editManagedCourse,
  editManagedUser,
  enrollCourse as storageEnroll,
  issueCertificate as storageIssue,
  loginUser as storageLoginUser,
  logoutUser as storageLogoutUser,
  markLessonComplete as storageMarkComplete,
  markLessonIncomplete as storageMarkIncomplete,
  registerUser as storageRegisterUser,
  resetUserPassword as storageResetUserPassword,
  saveLessonNote,
  setStudentName,
  toggleManagedUserBlocked,
  unlockCourseAccess as storageUnlockCourseAccess,
  updateLessonWatchProgress as storageUpdateLessonWatchProgress,
  updatePlatformSettings as storageUpdatePlatformSettings,
} from '../utils/storage';

const AppContext = createContext(null);

const getSnapshot = () => ({
  currentUser: getCurrentUser(),
  role: getCurrentUser()?.role || getRole(),
  studentName: getCurrentUser()?.name || getStudentName(),
  enrollments: getEnrollments(),
  coursePayments: getCoursePayments(),
  completedLessons: getCompletedLessons(),
  lessonWatchProgress: getLessonWatchProgress(),
  streak: getStreak(),
  certificates: getCertificates(),
  lessonNotes: getLessonNotes(),
  courses: getManagedCourses(),
  users: getManagedUsers(),
  assignableRoles: getAssignableRoles(),
  platformSettings: getPlatformSettings(),
});

export function AppProvider({ children }) {
  const [state, setState] = useState(getSnapshot);

  const refreshState = useCallback(() => {
    setState(getSnapshot());
  }, []);

  const login = useCallback((email, password) => {
    const result = storageLoginUser(email, password);
    if (result.ok) refreshState();
    return result;
  }, [refreshState]);

  const register = useCallback((payload) => {
    const result = storageRegisterUser(payload);
    if (result.ok) refreshState();
    return result;
  }, [refreshState]);

  const resetPassword = useCallback((payload) => {
    const result = storageResetUserPassword(payload);
    if (result.ok) refreshState();
    return result;
  }, [refreshState]);

  const logout = useCallback(() => {
    storageLogoutUser();
    refreshState();
  }, [refreshState]);

  const changeName = useCallback((name) => {
    setStudentName(name);
    refreshState();
  }, [refreshState]);

  const enrollCourse = useCallback((courseId) => {
    storageEnroll(courseId);
    refreshState();
  }, [refreshState]);

  const unlockCourseAccess = useCallback((courseId, payment) => {
    const result = storageUnlockCourseAccess(courseId, payment);
    if (result.ok) refreshState();
    return result;
  }, [refreshState]);

  const markComplete = useCallback((lessonId, courseId) => {
    storageMarkComplete(lessonId, courseId);
    refreshState();
  }, [refreshState]);

  const markIncomplete = useCallback((lessonId) => {
    storageMarkIncomplete(lessonId);
    refreshState();
  }, [refreshState]);

  const issueCert = useCallback((courseId, courseName) => {
    const result = storageIssue(courseId, courseName, state.studentName);
    if (result.ok) refreshState();
    return result;
  }, [refreshState, state.studentName]);

  const saveNote = useCallback((lessonId, text) => {
    saveLessonNote(lessonId, text);
    refreshState();
  }, [refreshState]);

  const updateWatchProgress = useCallback((lessonId, courseId, progress) => {
    const result = storageUpdateLessonWatchProgress(lessonId, courseId, progress);
    refreshState();
    return result;
  }, [refreshState]);

  const addUser = useCallback((payload) => {
    const result = createManagedUser(payload);
    if (result.ok) refreshState();
    return result;
  }, [refreshState]);

  const updateUser = useCallback((userId, updates) => {
    const result = editManagedUser(userId, updates);
    if (result.ok) refreshState();
    return result;
  }, [refreshState]);

  const toggleUserBlocked = useCallback((userId) => {
    const result = toggleManagedUserBlocked(userId);
    if (result.ok) refreshState();
    return result;
  }, [refreshState]);

  const addCourse = useCallback((payload) => {
    const result = createManagedCourse(payload);
    if (result.ok) refreshState();
    return result;
  }, [refreshState]);

  const updateCourse = useCallback((courseId, updates) => {
    const result = editManagedCourse(courseId, updates);
    if (result.ok) refreshState();
    return result;
  }, [refreshState]);

  const savePlatformSettings = useCallback((updates) => {
    const result = storageUpdatePlatformSettings(updates);
    if (result.ok) refreshState();
    return result;
  }, [refreshState]);

  return (
    <AppContext.Provider value={{
      ...state,
      isAuthenticated: !!state.currentUser,
      demoAccounts: DEMO_ACCOUNTS,
      certificateTemplates: CERTIFICATE_TEMPLATES,
      login,
      register,
      resetPassword,
      logout,
      changeName,
      enrollCourse,
      unlockCourseAccess,
      markComplete,
      markIncomplete,
      issueCert,
      saveNote,
      updateWatchProgress,
      addUser,
      updateUser,
      toggleUserBlocked,
      addCourse,
      updateCourse,
      savePlatformSettings,
      refreshState,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
