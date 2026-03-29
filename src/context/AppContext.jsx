import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getRole, setRole, getStudentName, setStudentName,
  getEnrollments, getCompletedLessons, getStreak, getCertificates,
  enrollCourse as storageEnroll, markLessonComplete as storageMarkComplete,
  markLessonIncomplete as storageMarkIncomplete, issueCertificate as storageIssue,
  saveLessonNote, getLessonNotes, updateStreak,
} from '../utils/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [role, setRoleState] = useState(getRole);
  const [studentName, setStudentNameState] = useState(getStudentName);
  const [enrollments, setEnrollments] = useState(getEnrollments);
  const [completedLessons, setCompletedLessons] = useState(getCompletedLessons);
  const [streak, setStreak] = useState(getStreak);
  const [certificates, setCertificates] = useState(getCertificates);
  const [lessonNotes, setLessonNotes] = useState(getLessonNotes);

  // Sync state → localStorage
  const changeRole = useCallback((r) => { setRole(r); setRoleState(r); }, []);
  const changeName = useCallback((n) => { setStudentName(n); setStudentNameState(n); }, []);

  const enrollCourse = useCallback((courseId) => {
    storageEnroll(courseId);
    setEnrollments(getEnrollments());
  }, []);

  const markComplete = useCallback((lessonId, courseId) => {
    storageMarkComplete(lessonId, courseId);
    setCompletedLessons(getCompletedLessons());
    setStreak(getStreak());
  }, []);

  const markIncomplete = useCallback((lessonId) => {
    storageMarkIncomplete(lessonId);
    setCompletedLessons(getCompletedLessons());
  }, []);

  const issueCert = useCallback((courseId, courseName) => {
    const cert = storageIssue(courseId, courseName, studentName);
    setCertificates(getCertificates());
    return cert;
  }, [studentName]);

  const saveNote = useCallback((lessonId, text) => {
    saveLessonNote(lessonId, text);
    setLessonNotes(getLessonNotes());
  }, []);

  // Re-check streak on mount
  useEffect(() => {
    const updated = updateStreak();
    // Only set if something changed
    setStreak(getStreak());
  }, []);

  return (
    <AppContext.Provider value={{
      role, changeRole,
      studentName, changeName,
      enrollments, enrollCourse,
      completedLessons, markComplete, markIncomplete,
      streak,
      certificates, issueCert,
      lessonNotes, saveNote,
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
