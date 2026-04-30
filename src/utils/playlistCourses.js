const PLAYLIST_PLACEHOLDER_VIDEO_ID = 'dQw4w9WgXcQ';
const PLAYLIST_CACHE_PREFIX = 'ali_nawaz_playlist_import_';
const PLAYLIST_CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const DEFAULT_PLACEHOLDER_COUNT = 12;

const slugify = (value = '') => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const sanitizeTitle = (value = '') => value
  .replace(/^"+|"+$/g, '')
  .replace(/&amp;/g, '&')
  .trim();

export const extractPlaylistId = (playlistUrl = '') => {
  if (!playlistUrl) return '';

  try {
    const parsed = new URL(playlistUrl);
    return parsed.searchParams.get('list') || '';
  } catch {
    const match = playlistUrl.match(/[?&]list=([^&]+)/);
    return match?.[1] || '';
  }
};

const getCacheKey = (playlistId) => `${PLAYLIST_CACHE_PREFIX}${playlistId}`;

const getCachedPlaylist = (playlistId) => {
  if (!playlistId) return null;

  try {
    const raw = window.localStorage.getItem(getCacheKey(playlistId));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.savedAt || !Array.isArray(parsed.lessons)) return null;

    if ((Date.now() - parsed.savedAt) > PLAYLIST_CACHE_TTL_MS) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const setCachedPlaylist = (playlistId, payload) => {
  if (!playlistId) return;

  try {
    window.localStorage.setItem(getCacheKey(playlistId), JSON.stringify({
      ...payload,
      savedAt: Date.now(),
    }));
  } catch {
    // ignore cache failures
  }
};

const buildPlaceholderLessons = ({ courseId, courseTitle, count = DEFAULT_PLACEHOLDER_COUNT }) => (
  Array.from({ length: count }, (_, index) => ({
    id: `${slugify(courseId || courseTitle || 'playlist-course')}-lesson-${index + 1}`,
    title: `${courseTitle || 'Playlist Course'} - Lesson ${String(index + 1).padStart(2, '0')}`,
    videoId: PLAYLIST_PLACEHOLDER_VIDEO_ID,
    duration: 'Playlist lesson',
    description: `Lesson ${index + 1} from the ${courseTitle || 'playlist'} series.`,
  }))
);

const parsePlaylistFeed = async (playlistId, courseId, courseTitle) => {
  const response = await fetch(`https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`);

  if (!response.ok) {
    throw new Error('Could not fetch playlist feed from YouTube.');
  }

  const xmlText = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'text/xml');
  const entries = Array.from(xml.getElementsByTagName('entry'));

  const lessons = entries.map((entry, index) => {
    const title = sanitizeTitle(entry.getElementsByTagName('title')[0]?.textContent || '');
    const videoId = entry.getElementsByTagName('yt:videoId')[0]?.textContent
      || entry.getElementsByTagName('videoId')[0]?.textContent
      || PLAYLIST_PLACEHOLDER_VIDEO_ID;

    return {
      id: `${slugify(courseId || courseTitle || 'playlist-course')}-lesson-${index + 1}`,
      title: title || `${courseTitle || 'Playlist Course'} - Lesson ${String(index + 1).padStart(2, '0')}`,
      videoId,
      duration: 'Playlist lesson',
      description: `Lesson ${index + 1} from the ${courseTitle || 'playlist'} series.`,
    };
  });

  if (!lessons.length) {
    throw new Error('No lessons were returned by the playlist feed.');
  }

  return lessons;
};

export const importPlaylistLessons = async ({ playlistUrl, courseId, courseTitle }) => {
  const playlistId = extractPlaylistId(playlistUrl);

  if (!playlistId) {
    return {
      ok: true,
      lessons: buildPlaceholderLessons({ courseId, courseTitle, count: 1 }),
      totalLessons: 1,
      playlistId: '',
      isFallback: true,
    };
  }

  const cached = getCachedPlaylist(playlistId);
  if (cached) {
    return {
      ok: true,
      lessons: cached.lessons,
      totalLessons: cached.lessons.length,
      playlistId,
      isFallback: Boolean(cached.isFallback),
    };
  }

  try {
    const lessons = await parsePlaylistFeed(playlistId, courseId, courseTitle);
    setCachedPlaylist(playlistId, { lessons, isFallback: false });

    return {
      ok: true,
      lessons,
      totalLessons: lessons.length,
      playlistId,
      isFallback: false,
    };
  } catch {
    const lessons = buildPlaceholderLessons({ courseId, courseTitle });
    setCachedPlaylist(playlistId, { lessons, isFallback: true });

    return {
      ok: true,
      lessons,
      totalLessons: lessons.length,
      playlistId,
      isFallback: true,
    };
  }
};
