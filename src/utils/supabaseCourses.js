import { getSupabaseSession, isSupabaseEnabled, requestSupabase } from './supabaseAuth';
import { buildManualVideoLessons, extractYouTubeVideoId, importPlaylistLessons } from './playlistCourses';

const COURSE_COLUMNS = 'id,title,description,price,is_paid,youtube_playlist_url,thumbnail,instructor,created_at';
const VIDEO_COLUMNS = 'id,course_id,title,youtube_url,position,created_at';

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

const normalizeVideoPayload = (videos = []) => videos
  .map((video, index) => ({
    title: (video.title || video.name || '').trim(),
    youtube_url: (video.url || video.youtube_url || '').trim(),
    position: Number.isFinite(Number(video.position)) ? Number(video.position) : index + 1,
  }))
  .filter((video) => video.title && extractYouTubeVideoId(video.youtube_url))
  .sort((a, b) => a.position - b.position);

const ensureCourseVideosTable = async (accessToken) => {
  const result = await requestSupabase('/rest/v1/course_videos?select=id&limit=1', {
    accessToken,
  });

  if (!result.ok) {
    return {
      ok: false,
      message: 'Your Supabase project is missing the `course_videos` table. Run `supabase/fix-existing-schema.sql`, then add the course again.',
    };
  }

  return { ok: true };
};

const fetchSupabaseVideos = async (accessToken) => {
  const result = await requestSupabase(`/rest/v1/course_videos?select=${VIDEO_COLUMNS}&order=position.asc`, {
    accessToken,
  });

  if (!result.ok) {
    return result;
  }

  const videosByCourseId = new Map();
  (result.data || []).forEach((video) => {
    const courseVideos = videosByCourseId.get(video.course_id) || [];
    courseVideos.push(video);
    videosByCourseId.set(video.course_id, courseVideos);
  });

  return { ok: true, videosByCourseId };
};

const enrichSupabaseCourse = async (course, courseVideos = []) => {
  if (courseVideos.length > 0) {
    const lessons = buildManualVideoLessons({
      videos: courseVideos,
      courseId: course.id,
      courseTitle: course.title,
    });

    return {
      ...course,
      lessons,
      totalLessons: lessons.length,
      courseVideos,
    };
  }

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

  const [coursesResult, videosResult] = await Promise.all([
    requestSupabase(`/rest/v1/courses?select=${COURSE_COLUMNS}&order=created_at.asc`, {
      accessToken: sessionResult.session.access_token,
    }),
    fetchSupabaseVideos(sessionResult.session.access_token),
  ]);

  if (!coursesResult.ok) {
    return coursesResult;
  }

  const videosByCourseId = videosResult.ok ? videosResult.videosByCourseId : new Map();
  const courses = await Promise.all((coursesResult.data || []).map((course) => (
    enrichSupabaseCourse(course, videosByCourseId.get(course.id) || [])
  )));

  return { ok: true, courses };
};

const replaceCourseVideos = async ({ accessToken, courseId, videos }) => {
  const normalizedVideos = normalizeVideoPayload(videos);

  const deleteResult = await requestSupabase(`/rest/v1/course_videos?course_id=eq.${encodeURIComponent(courseId)}`, {
    method: 'DELETE',
    accessToken,
  });

  if (!deleteResult.ok) {
    return deleteResult;
  }

  if (normalizedVideos.length === 0) {
    return { ok: true, videos: [] };
  }

  const rows = normalizedVideos.map((video, index) => ({
    course_id: courseId,
    title: video.title,
    youtube_url: video.youtube_url,
    position: index + 1,
  }));

  const insertResult = await requestSupabase('/rest/v1/course_videos', {
    method: 'POST',
    accessToken,
    headers: {
      Prefer: 'return=representation',
    },
    body: rows,
  });

  if (!insertResult.ok) {
    return insertResult;
  }

  return { ok: true, videos: insertResult.data || rows };
};

export const createSupabaseCourse = async (payload) => {
  const sessionResult = await getSupabaseSession();
  if (!sessionResult.ok) return sessionResult;

  const normalizedCourse = normalizeCoursePayload(payload);
  const videos = normalizeVideoPayload(payload.videos);

  if (videos.length > 0) {
    const tableResult = await ensureCourseVideosTable(sessionResult.session.access_token);
    if (!tableResult.ok) return tableResult;
  }

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
  const videosResult = videos.length > 0
    ? await replaceCourseVideos({
      accessToken: sessionResult.session.access_token,
      courseId: savedCourse.id,
      videos,
    })
    : { ok: true, videos: [] };

  if (!videosResult.ok) {
    await requestSupabase(`/rest/v1/courses?id=eq.${encodeURIComponent(savedCourse.id)}`, {
      method: 'DELETE',
      accessToken: sessionResult.session.access_token,
    });

    return videosResult;
  }

  const enrichedCourse = await enrichSupabaseCourse(savedCourse, videosResult.videos);

  return {
    ok: true,
    course: enrichedCourse,
    message: enrichedCourse.totalLessons > 0
      ? `Course added successfully with ${enrichedCourse.totalLessons} video${enrichedCourse.totalLessons !== 1 ? 's' : ''}.`
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
  const videos = normalizeVideoPayload(updates.videos);

  if (Array.isArray(updates.videos)) {
    const tableResult = await ensureCourseVideosTable(sessionResult.session.access_token);
    if (!tableResult.ok) return tableResult;
  }

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
  const videosResult = Array.isArray(updates.videos)
    ? await replaceCourseVideos({
      accessToken: sessionResult.session.access_token,
      courseId: savedCourse.id,
      videos,
    })
    : { ok: true, videos: [] };

  if (!videosResult.ok) {
    return videosResult;
  }

  const enrichedCourse = await enrichSupabaseCourse(savedCourse, videosResult.videos);

  return {
    ok: true,
    course: enrichedCourse,
    message: enrichedCourse.totalLessons > 0
      ? `Course updated successfully with ${enrichedCourse.totalLessons} video${enrichedCourse.totalLessons !== 1 ? 's' : ''}.`
      : 'Course updated successfully.',
  };
};
