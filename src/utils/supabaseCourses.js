import { getSupabaseSession, isSupabaseEnabled, requestSupabase } from './supabaseAuth';
import { importPlaylistLessons } from './playlistCourses';

const normalizeCoursePayload = (payload = {}) => {
  const title = (payload.title || '').trim();
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const timestamp = Date.now().toString(36);

  return {
    id: String(payload.id || `${slug || 'course'}-${timestamp}`),
    title,
    description: (payload.description || '').trim(),
    price: Math.max(0, Number.parseInt(payload.price, 10) || 0),
    is_paid: Boolean(payload.is_paid),
    youtube_playlist_url: (payload.youtube_playlist_url || payload.playlistUrl || '').trim(),
    thumbnail: (payload.thumbnail || '').trim(),
    instructor: (payload.instructor || '').trim(),
    created_at: payload.created_at || new Date().toISOString(),
  };
};

const enrichSupabaseCourse = async (course) => {
  if (!course.youtube_playlist_url) {
    return {
      ...course,
      lessons: [],
      totalLessons: 0,
    };
  }

  const playlistResult = await importPlaylistLessons({
    playlistUrl: course.youtube_playlist_url,
    courseId: course.id,
    courseTitle: course.title,
  });

  return {
    ...course,
    lessons: playlistResult.lessons,
    totalLessons: playlistResult.totalLessons,
  };
};

export const listSupabaseCourses = async () => {
  if (!isSupabaseEnabled()) {
    return { ok: true, courses: [] };
  }

  const sessionResult = await getSupabaseSession();
  if (!sessionResult.ok) return sessionResult;

  const result = await requestSupabase('/rest/v1/courses?select=id,title,description,price,is_paid,youtube_playlist_url,thumbnail,instructor,created_at&order=created_at.asc', {
    accessToken: sessionResult.session.access_token,
  });

  if (!result.ok) {
    return result;
  }

  const courses = await Promise.all((result.data || []).map((course) => enrichSupabaseCourse(course)));
  return { ok: true, courses };
};

export const createSupabaseCourse = async (payload) => {
  const sessionResult = await getSupabaseSession();
  if (!sessionResult.ok) return sessionResult;

  const normalizedCourse = normalizeCoursePayload(payload);
  const insertResult = await requestSupabase('/rest/v1/courses', {
    method: 'POST',
    accessToken: sessionResult.session.access_token,
    headers: {
      Prefer: 'return=representation',
    },
    body: [normalizedCourse],
  });

  if (!insertResult.ok) {
    return insertResult;
  }

  const savedCourse = Array.isArray(insertResult.data) ? insertResult.data[0] : normalizedCourse;
  const enrichedCourse = await enrichSupabaseCourse(savedCourse);

  return {
    ok: true,
    course: enrichedCourse,
    message: enrichedCourse.totalLessons > 1
      ? `Course added successfully with ${enrichedCourse.totalLessons} playlist lessons.`
      : 'Course added successfully.',
  };
};

export const updateSupabaseCourse = async (courseId, updates) => {
  const sessionResult = await getSupabaseSession();
  if (!sessionResult.ok) return sessionResult;

  const normalizedCourse = normalizeCoursePayload({
    ...updates,
    id: courseId,
  });

  const patchResult = await requestSupabase(`/rest/v1/courses?id=eq.${encodeURIComponent(courseId)}`, {
    method: 'PATCH',
    accessToken: sessionResult.session.access_token,
    headers: {
      Prefer: 'return=representation',
    },
    body: {
      title: normalizedCourse.title,
      description: normalizedCourse.description,
      price: normalizedCourse.price,
      is_paid: normalizedCourse.is_paid,
      youtube_playlist_url: normalizedCourse.youtube_playlist_url,
      thumbnail: normalizedCourse.thumbnail,
      instructor: normalizedCourse.instructor,
    },
  });

  if (!patchResult.ok) {
    return patchResult;
  }

  const savedCourse = Array.isArray(patchResult.data) ? patchResult.data[0] : normalizedCourse;
  const enrichedCourse = await enrichSupabaseCourse(savedCourse);

  return {
    ok: true,
    course: enrichedCourse,
    message: enrichedCourse.totalLessons > 1
      ? `Course updated successfully with ${enrichedCourse.totalLessons} playlist lessons.`
      : 'Course updated successfully.',
  };
};
