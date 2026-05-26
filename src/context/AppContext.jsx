import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  STAFF_ACCESS_RULES,
  getSupabaseUser,
  isSupabaseEnabled,
  getSupabaseSession,
  listSupabaseProfiles,
  registerWithSupabase,
  requestSupabasePasswordReset,
  signInWithSupabase,
  signOutSupabase,
  updateSupabasePassword,
} from '../utils/supabaseAuth';
import {
  createSupabaseCourse,
  listSupabaseCourses,
  updateSupabaseCourse,
} from '../utils/supabaseCourses';
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
  getLocalCustomCourses,
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
  setSupabaseCourseCache,
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

const isSupabaseNetworkFailure = (result) => (
  result?.isNetworkError
  || result?.message === 'Failed to fetch'
  || result?.message?.includes('Could not resolve host')
  || result?.message?.includes('NetworkError')
);

export function AppProvider({ children }) {
  const supabaseEnabled = isSupabaseEnabled();
  const [state, setState] = useState(getSnapshot);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [remoteCourses, setRemoteCourses] = useState([]);
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

  const refreshSupabaseCourses = useCallback(async () => {
    if (!supabaseEnabled) {
      setSupabaseCourseCache([]);
      setRemoteCourses([]);
      return { ok: true, courses: [] };
    }

    const sessionResult = await getSupabaseSession();
    if (!sessionResult.ok) {
      return sessionResult;
    }

    let result = await listSupabaseCourses();

    const actor = getCurrentUser();
    const canSyncLocalCourses = actor && (actor.role === 'Admin' || actor.role === 'Super Admin');

    if (result.ok && canSyncLocalCourses) {
      const remoteCourseIds = new Set(result.courses.map((course) => course.id));
      const localCustomCourses = getLocalCustomCourses().filter((course) => !remoteCourseIds.has(course.id));

      if (localCustomCourses.length > 0) {
        for (const localCourse of localCustomCourses) {
          await createSupabaseCourse(localCourse);
        }

        result = await listSupabaseCourses();
      }
    }

    if (result.ok) {
      setSupabaseCourseCache(result.courses);
      const mergedCourses = getSnapshot().courses;
      setRemoteCourses(mergedCourses);
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
        await refreshSupabaseCourses();
      } else if (result.message === 'No active Supabase session was found.') {
        setRemoteUsers([]);
        setSupabaseCourseCache([]);
        setRemoteCourses([]);
      }

      refreshState();
      setAuthReady(true);
    };

    bootstrapSupabaseAuth();

    return () => {
      active = false;
    };
  }, [refreshState, refreshSupabaseCourses, refreshSupabaseUsers, supabaseEnabled, syncSupabaseSessionUser]);

  useEffect(() => {
    if (!supabaseEnabled || !authReady || !state.currentUser) {
      return undefined;
    }

    const syncOnFocus = () => {
      void syncSupabaseSessionUser();
      void refreshSupabaseUsers();
      void refreshSupabaseCourses();
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
  }, [authReady, refreshSupabaseCourses, refreshSupabaseUsers, state.currentUser?.id, supabaseEnabled, syncSupabaseSessionUser]);

  const login = useCallback(async (email, password) => {
    if (supabaseEnabled) {
      const supabaseResult = await signInWithSupabase(email, password);

      if (!supabaseResult.ok) {
        if (isSupabaseNetworkFailure(supabaseResult)) {
          const localResult = storageLoginUser(email, password);
          if (localResult.ok) {
            refreshState();
            return {
              ...localResult,
              message: 'Signed in locally because Supabase is currently unreachable.',
            };
          }

          return {
            ok: false,
            message: 'Supabase is currently unreachable. Local sign-in was tried too, but no matching local account was found.',
          };
        }

        return supabaseResult;
      }

      const mirroredUser = syncExternalUser(supabaseResult.user);
      setCurrentSessionUser(mirroredUser.id, { provider: 'supabase' });
      setPasswordRecoveryReady(false);
      refreshState();
      await refreshSupabaseUsers();
      await refreshSupabaseCourses();
      return { ok: true, user: mirroredUser };
    }

    const result = storageLoginUser(email, password);
    if (result.ok) refreshState();
    return result;
  }, [refreshState, refreshSupabaseCourses, refreshSupabaseUsers, supabaseEnabled]);

  const register = useCallback(async (payload) => {
    if (supabaseEnabled) {
      const supabaseResult = await registerWithSupabase(payload);

      if (!supabaseResult.ok) {
        if (isSupabaseNetworkFailure(supabaseResult)) {
          const localResult = storageRegisterUser(payload);
          if (localResult.ok) {
            refreshState();
            return {
              ...localResult,
              message: 'Your student account was created locally because Supabase is currently unreachable.',
            };
          }

          return localResult;
        }

        return supabaseResult;
      }

      if (supabaseResult.user) {
        const mirroredUser = syncExternalUser(supabaseResult.user);
        setCurrentSessionUser(mirroredUser.id, { provider: 'supabase' });
        setPasswordRecoveryReady(false);
        refreshState();
        await refreshSupabaseUsers();
        await refreshSupabaseCourses();
        return { ...supabaseResult, user: mirroredUser };
      }

      refreshState();
      await refreshSupabaseUsers();
      await refreshSupabaseCourses();
      return supabaseResult;
    }

    const result = storageRegisterUser(payload);
    if (result.ok) refreshState();
    return result;
  }, [refreshState, refreshSupabaseCourses, refreshSupabaseUsers, supabaseEnabled]);

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
    setSupabaseCourseCache([]);
    setRemoteCourses([]);
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

  const issueCert = useCallback(async (courseId, courseName) => {
    const result = await storageIssue(courseId, courseName, state.studentName);
    if (result.ok) refreshState();
    return result;
  }, [refreshState, state.studentName]);

  const forceUnlockCert = useCallback(async (courseId, courseName) => {
    const nextStudentName = state.studentName || state.currentUser?.name || 'Student';
    const result = await storageForceUnlockCertificate(courseId, courseName, nextStudentName);
    if (result.ok) refreshState();
    return result;
  }, [refreshState, state.currentUser?.name, state.studentName]);

  const resetCourseProgress = useCallback(async (courseId) => {
    const result = await storageResetCourseProgress(courseId);
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

  const addCourse = useCallback(async (payload) => {
    if (supabaseEnabled) {
      const result = await createSupabaseCourse(payload);
      if (result.ok) {
        await refreshSupabaseCourses();
        refreshState();
      }
      return result;
    }

    const result = createManagedCourse(payload);
    if (result.ok) refreshState();
    return result;
  }, [refreshState, refreshSupabaseCourses, supabaseEnabled]);

  const updateCourse = useCallback(async (courseId, updates) => {
    if (supabaseEnabled) {
      const result = await updateSupabaseCourse(courseId, updates);
      if (result.ok) {
        await refreshSupabaseCourses();
        refreshState();
      }
      return result;
    }

    const result = editManagedCourse(courseId, updates);
    if (result.ok) refreshState();
    return result;
  }, [refreshState, refreshSupabaseCourses, supabaseEnabled]);

  const savePlatformSettings = useCallback((updates) => {
    const result = storageUpdatePlatformSettings(updates);
    if (result.ok) refreshState();
    return result;
  }, [refreshState]);

  return (
    <AppContext.Provider value={{
      ...state,
      users: supabaseEnabled ? remoteUsers : state.users,
      courses: supabaseEnabled && remoteCourses.length ? remoteCourses : state.courses,
      authReady,
      isSupabaseEnabled: supabaseEnabled,
      passwordRecoveryReady,
      isAuthenticated: !!state.currentUser,
      demoAccounts: DEMO_ACCOUNTS,
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
      refreshCourses: refreshSupabaseCourses,
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
