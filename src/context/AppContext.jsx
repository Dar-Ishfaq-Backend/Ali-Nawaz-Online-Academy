import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CERTIFICATE_TEMPLATES, CERTIFICATE_THEMES } from '../utils/certificateTemplates';
import {
  STAFF_ACCESS_RULES,
  getSupabaseUser,
  isSupabaseEnabled,
  registerWithSupabase,
  requestSupabasePasswordReset,
  signInWithSupabase,
  signOutSupabase,
  updateSupabasePassword,
} from '../utils/supabaseAuth';
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
  setCurrentSessionUser,
  setStudentName,
  syncExternalUser,
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
  const [authReady, setAuthReady] = useState(!isSupabaseEnabled());
  const [passwordRecoveryReady, setPasswordRecoveryReady] = useState(false);

  const refreshState = useCallback(() => {
    setState(getSnapshot());
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrapSupabaseAuth = async () => {
      if (!isSupabaseEnabled()) {
        setAuthReady(true);
        return;
      }

      const result = await getSupabaseUser();

      if (active && result.ok) {
        const mirroredUser = syncExternalUser(result.user);
        setCurrentSessionUser(mirroredUser.id, { provider: 'supabase' });
        setPasswordRecoveryReady(result.recoveryType === 'recovery');
      }

      if (active) {
        refreshState();
        setAuthReady(true);
      }
    };

    bootstrapSupabaseAuth();

    return () => {
      active = false;
    };
  }, [refreshState]);

  const login = useCallback(async (email, password) => {
    let supabaseResult = null;

    if (isSupabaseEnabled()) {
      supabaseResult = await signInWithSupabase(email, password);

      if (supabaseResult.ok) {
        const mirroredUser = syncExternalUser(supabaseResult.user);
        setCurrentSessionUser(mirroredUser.id, { provider: 'supabase' });
        refreshState();
        return { ok: true, user: mirroredUser };
      }
    }

    const result = storageLoginUser(email, password);
    if (result.ok) refreshState();
    return supabaseResult && !result.ok ? supabaseResult : result;
  }, [refreshState]);

  const register = useCallback(async (payload) => {
    if (isSupabaseEnabled()) {
      const supabaseResult = await registerWithSupabase(payload);

      if (!supabaseResult.ok) {
        return supabaseResult;
      }

      if (supabaseResult.user) {
        const mirroredUser = syncExternalUser(supabaseResult.user);
        setCurrentSessionUser(mirroredUser.id, { provider: 'supabase' });
        refreshState();
        return { ...supabaseResult, user: mirroredUser };
      }

      refreshState();
      return supabaseResult;
    }

    const result = storageRegisterUser(payload);
    if (result.ok) refreshState();
    return result;
  }, [refreshState]);

  const requestPasswordReset = useCallback(async (email) => {
    if (isSupabaseEnabled()) {
      return requestSupabasePasswordReset(email);
    }

    return {
      ok: true,
      message: 'Enter a new password below to update the account stored in this browser.',
    };
  }, []);

  const updatePassword = useCallback(async ({ email, newPassword }) => {
    if (isSupabaseEnabled()) {
      const result = await updateSupabasePassword(newPassword);
      if (result.ok) {
        setPasswordRecoveryReady(false);
      }
      return result;
    }

    const result = storageResetUserPassword({ email, newPassword });
    if (result.ok) refreshState();
    return result;
  }, [refreshState]);

  const logout = useCallback(async () => {
    if (isSupabaseEnabled()) {
      await signOutSupabase();
    }

    storageLogoutUser();
    setPasswordRecoveryReady(false);
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
      authReady,
      isSupabaseEnabled: isSupabaseEnabled(),
      passwordRecoveryReady,
      isAuthenticated: !!state.currentUser,
      demoAccounts: DEMO_ACCOUNTS,
      certificateTemplates: CERTIFICATE_TEMPLATES,
      certificateThemes: CERTIFICATE_THEMES,
      staffAccessRules: STAFF_ACCESS_RULES,
      login,
      register,
      requestPasswordReset,
      updatePassword,
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
