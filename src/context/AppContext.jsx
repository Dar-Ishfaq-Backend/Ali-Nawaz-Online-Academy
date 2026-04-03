import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CERTIFICATE_TEMPLATES, CERTIFICATE_THEMES } from '../utils/certificateTemplates';
import {
  STAFF_ACCESS_RULES,
  getSupabaseUser,
  isSupabaseEnabled,
  listSupabaseProfiles,
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
  getUserLearningStats,
  createManagedCourse,
  createManagedUser,
  editManagedCourse,
  editManagedUser,
  enrollCourse as storageEnroll,
  forceUnlockCourseCertificate as storageForceUnlockCertificate,
  issueCertificate as storageIssue,
  loginUser as storageLoginUser,
  logoutUser as storageLogoutUser,
  markLessonComplete as storageMarkComplete,
  markLessonIncomplete as storageMarkIncomplete,
  registerUser as storageRegisterUser,
  resetCourseProgress as storageResetCourseProgress,
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
const ROLE_ORDER = {
  Student: 0,
  Teacher: 1,
  Admin: 2,
  'Super Admin': 3,
};

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

const sortUsers = (users = []) => [...users].sort((a, b) => {
  const roleDelta = (ROLE_ORDER[b.role] || 0) - (ROLE_ORDER[a.role] || 0);
  if (roleDelta !== 0) return roleDelta;
  return (a.name || '').localeCompare(b.name || '');
});

const decorateUsersWithLocalStats = (users = []) => sortUsers(users.map((user) => ({
  ...user,
  ...getUserLearningStats(user.id),
})));

export function AppProvider({ children }) {
  const supabaseEnabled = isSupabaseEnabled();
  const [state, setState] = useState(getSnapshot);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [authReady, setAuthReady] = useState(!supabaseEnabled);
  const [passwordRecoveryReady, setPasswordRecoveryReady] = useState(false);

  const refreshState = useCallback(() => {
    setState(getSnapshot());
  }, []);

  const refreshSupabaseUsers = useCallback(async () => {
    if (!supabaseEnabled) {
      setRemoteUsers([]);
      return { ok: true, users: [] };
    }

    const result = await listSupabaseProfiles();

    if (result.ok) {
      setRemoteUsers(decorateUsersWithLocalStats(result.users));
    }

    return result;
  }, [supabaseEnabled]);

  const syncSupabaseSessionUser = useCallback(async () => {
    if (!supabaseEnabled) {
      return { ok: false, message: 'Supabase is not configured.' };
    }

    const result = await getSupabaseUser();

    if (!result.ok) {
      const shouldClearLocalSession = (
        result.message === 'No active Supabase session was found.'
        || result.message?.includes('retired')
      );

      if (shouldClearLocalSession) {
        storageLogoutUser();
        setPasswordRecoveryReady(false);
        setState(getSnapshot());
      }

      return result;
    }

    const mirroredUser = syncExternalUser(result.user);
    setCurrentSessionUser(mirroredUser.id, { provider: 'supabase' });
    setPasswordRecoveryReady(result.recoveryType === 'recovery');
    setState(getSnapshot());

    return { ...result, user: mirroredUser };
  }, [supabaseEnabled]);

  useEffect(() => {
    let active = true;

    const bootstrapSupabaseAuth = async () => {
      if (!supabaseEnabled) {
        setRemoteUsers([]);
        setAuthReady(true);
        return;
      }

      const result = await syncSupabaseSessionUser();

      if (!active) return;

      if (result.ok) {
        await refreshSupabaseUsers();
      } else if (result.message === 'No active Supabase session was found.') {
        setRemoteUsers([]);
      }

      refreshState();
      setAuthReady(true);
    };

    bootstrapSupabaseAuth();

    return () => {
      active = false;
    };
  }, [refreshState, refreshSupabaseUsers, supabaseEnabled, syncSupabaseSessionUser]);

  useEffect(() => {
    if (!supabaseEnabled || !authReady || !state.currentUser) {
      return undefined;
    }

    const syncOnFocus = () => {
      void syncSupabaseSessionUser();
      void refreshSupabaseUsers();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncOnFocus();
      }
    };

    window.addEventListener('focus', syncOnFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', syncOnFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [authReady, refreshSupabaseUsers, state.currentUser?.id, supabaseEnabled, syncSupabaseSessionUser]);

  const login = useCallback(async (email, password) => {
    if (supabaseEnabled) {
      const supabaseResult = await signInWithSupabase(email, password);

      if (!supabaseResult.ok) {
        return supabaseResult;
      }

      const mirroredUser = syncExternalUser(supabaseResult.user);
      setCurrentSessionUser(mirroredUser.id, { provider: 'supabase' });
      setPasswordRecoveryReady(false);
      refreshState();
      await refreshSupabaseUsers();
      return { ok: true, user: mirroredUser };
    }

    const result = storageLoginUser(email, password);
    if (result.ok) refreshState();
    return result;
  }, [refreshState, refreshSupabaseUsers, supabaseEnabled]);

  const register = useCallback(async (payload) => {
    if (supabaseEnabled) {
      const supabaseResult = await registerWithSupabase(payload);

      if (!supabaseResult.ok) {
        return supabaseResult;
      }

      if (supabaseResult.user) {
        const mirroredUser = syncExternalUser(supabaseResult.user);
        setCurrentSessionUser(mirroredUser.id, { provider: 'supabase' });
        setPasswordRecoveryReady(false);
        refreshState();
        await refreshSupabaseUsers();
        return { ...supabaseResult, user: mirroredUser };
      }

      refreshState();
      await refreshSupabaseUsers();
      return supabaseResult;
    }

    const result = storageRegisterUser(payload);
    if (result.ok) refreshState();
    return result;
  }, [refreshState, refreshSupabaseUsers, supabaseEnabled]);

  const requestPasswordReset = useCallback(async (email) => {
    if (supabaseEnabled) {
      return requestSupabasePasswordReset(email);
    }

    return {
      ok: true,
      message: 'Enter a new password below to update the account stored in this browser.',
    };
  }, []);

  const updatePassword = useCallback(async ({ email, newPassword }) => {
    if (supabaseEnabled) {
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
    if (supabaseEnabled) {
      await signOutSupabase();
    }

    storageLogoutUser();
    setPasswordRecoveryReady(false);
    setRemoteUsers([]);
    refreshState();
  }, [refreshState, supabaseEnabled]);

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

  const forceUnlockCert = useCallback((courseId, courseName) => {
    const nextStudentName = state.studentName || state.currentUser?.name || 'Student';
    const result = storageForceUnlockCertificate(courseId, courseName, nextStudentName);
    if (result.ok) refreshState();
    return result;
  }, [refreshState, state.currentUser?.name, state.studentName]);

  const resetCourseProgress = useCallback((courseId) => {
    const result = storageResetCourseProgress(courseId);
    if (result.ok) refreshState();
    return result;
  }, [refreshState]);

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
      users: supabaseEnabled ? remoteUsers : state.users,
      authReady,
      isSupabaseEnabled: supabaseEnabled,
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
      forceUnlockCert,
      resetCourseProgress,
      saveNote,
      updateWatchProgress,
      addUser,
      updateUser,
      toggleUserBlocked,
      addCourse,
      updateCourse,
      savePlatformSettings,
      refreshState,
      refreshUsers: refreshSupabaseUsers,
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
