import playlistMetadata from './youtubePlaylistMetadata.json';

// ─────────────────────────────────────────────
// Mock Course Database — Ali Nawaz Academy
// Replace videoId values with real YouTube IDs
// ─────────────────────────────────────────────

const PAID_COURSE_ACCESS = {
  requiresPayment: true,
  freePreviewLessons: 3,
  currency: 'PKR',
};

const sanitizeLessonTitle = (title = '') => title
  .replace(/^"+|"+$/g, '')
  .replace(/\\u0026/g, '&')
  .trim();

const createPlaylistLessons = (key, prefix, description, { limit } = {}) => {
  const source = playlistMetadata[key] || [];
  const selectedLessons = source.slice(0, limit ?? source.length);

  return selectedLessons.map((lesson, index) => ({
    id: `${prefix}${index + 1}`,
    title: sanitizeLessonTitle(lesson.title),
    videoId: lesson.videoId,
    duration: lesson.duration || '0:00',
    description,
  }));
};

const cloneLessonSeries = (lessons, prefix, description, { limit } = {}) => lessons
  .slice(0, limit ?? lessons.length)
  .map((lesson, index) => ({
    ...lesson,
    id: `${prefix}${index + 1}`,
    description,
  }));

const DEFAULT_COURSE_CREATED_AT = '2026-04-02T00:00:00.000Z';

const normalizeCoursePrice = (value) => Math.max(0, Number.parseInt(value, 10) || 0);

const normalizeCourseRecord = (course) => {
  const price = normalizeCoursePrice(course.price ?? course.pricePKR);
  const isPaid = typeof course.is_paid === 'boolean'
    ? course.is_paid
    : Boolean(course.requiresPayment ?? price > 0);
  const youtubePlaylistUrl = course.youtube_playlist_url || course.playlistUrl || '';
  const createdAt = course.created_at || course.createdAt || DEFAULT_COURSE_CREATED_AT;
  const totalLessons = Math.max(1, Number.parseInt(course.totalLessons, 10) || course.lessons?.length || 1);
  const freePreviewLessons = isPaid
    ? Math.max(1, Math.min(totalLessons, Number.parseInt(course.freePreviewLessons, 10) || 3))
    : totalLessons;

  return {
    ...course,
    id: String(course.id),
    price,
    is_paid: isPaid,
    youtube_playlist_url: youtubePlaylistUrl,
    created_at: createdAt,
    totalLessons,
    requiresPayment: isPaid,
    pricePKR: price,
    playlistUrl: youtubePlaylistUrl,
    createdAt,
    freePreviewLessons,
    thumbnail: course.thumbnail,
    instructor: course.instructor,
  };
};

const HADITH_LESSONS = createPlaylistLessons('aalim-hadith', 'h', 'A lesson from the Hadith sciences playlist.');
const FIQH_LESSONS = createPlaylistLessons('aalim-fiqh', 'f', 'A lesson from the Hanafi fiqh playlist.');
const SARF_LESSONS = createPlaylistLessons('aalim-sarf', 's', 'A lesson from the Arabic morphology playlist.', { limit: 8 });
const NAHW_LESSONS = createPlaylistLessons('aalim-nahw', 'n', 'A lesson from the Arabic grammar playlist.', { limit: 10 });
const ARABIC_LESSONS = createPlaylistLessons('aalim-arabic', 'a', 'A lesson from the Arabic language playlist.', { limit: 10 });
const AQEEDAH_LESSONS = createPlaylistLessons('aalim-aqeedah', 'aq', 'A lesson from the Aqeedah playlist.', { limit: 10 });
const TAFSIR_LESSONS = createPlaylistLessons('aalim-tafsir', 't', 'A lesson from the Tafsir playlist.', { limit: 12 });
const SEERAH_LESSONS = createPlaylistLessons('seerah', 'se', 'A lesson from the Seerah playlist.', { limit: 12 });
const DAILY_DUAS_LESSONS = createPlaylistLessons('short-daily-duas', 'sd', 'A short daily dua lesson.', { limit: 6 });
const SALAH_BASICS_LESSONS = createPlaylistLessons('short-salah-basics', 'ss', 'A short salah basics lesson.', { limit: 5 });
const RAMADAN_PREP_LESSONS = createPlaylistLessons('short-ramadan-prep', 'sr', 'A short Ramadan preparation lesson.', { limit: 4 });
const PAYMENT_TEST_DUAS_LESSONS = cloneLessonSeries(
  DAILY_DUAS_LESSONS,
  'ptd',
  'A compact paid test lesson for checking the Ali Nawaz Academy payment and approval flow.',
  { limit: 5 },
);
const QAIDA_FOUNDATIONS_LESSONS = [
  {
    id: 'qf1',
    title: 'TOO MANY Tajweed Rules? Here\'s the ultimate solution - Arabic101 - Tajweed series',
    videoId: 'kklrHE85hHE',
    duration: '11:12',
    description: 'An opening lesson that simplifies how beginners should approach Arabic Qaida and Tajweed study.',
  },
  {
    id: 'qf2',
    title: 'What do the symbols in Quran mean? - Arabic 101',
    videoId: 'meQsEM3V2m8',
    duration: '6:38',
    description: 'Understand the main Quran reading symbols that appear while learning foundational recitation.',
  },
  {
    id: 'qf3',
    title: 'How to pronounce Hamza Wasl (همزة وصل) VS. Hamza Qat\' (همزة قطع) in the Holy Quran - Arabic 101',
    videoId: 'iS31xI9JF2k',
    duration: '13:49',
    description: 'A practical pronunciation lesson that helps beginners recognise and sound key letter forms correctly.',
  },
  {
    id: 'qf4',
    title: 'How to PROPERLY pronounce the word (Allah) in the Holy Quran - Arabic 101',
    videoId: '0paH22-NvzU',
    duration: '5:46',
    description: 'A focused recitation drill on one of the most important pronunciation patterns in Quran study.',
  },
  {
    id: 'qf5',
    title: 'Learn the Quranic Noon Sakinah (نون ساكنه) in 10 MINUTES - Arabic101',
    videoId: 'hy8V7CsxaQk',
    duration: '11:34',
    description: 'A core beginner rule that supports smoother recitation and clearer Arabic letter recognition.',
  },
  {
    id: 'qf6',
    title: 'How to PROPERLY pronounce Meem (م) sakinah in the holy Quran? - Learn Tajweed - Arabic 101',
    videoId: 'MAvDrZgWRTs',
    duration: '10:30',
    description: 'Build confidence with one of the most repeated recitation rules in beginner Quran reading.',
  },
];
const TAJWEED_SKILL_BUILDER_LESSONS = [
  {
    id: 'tj1',
    title: 'How to PROPERLY stop/ resume in longer Aya\'s in the Holy Quran - Arabic 101',
    videoId: 'j3AR6-BThPU',
    duration: '12:47',
    description: 'Practice where to stop and resume correctly while reading longer ayat.',
  },
  {
    id: 'tj2',
    title: 'Madd (مد) in Quran MADE EASY - Arabic 101',
    videoId: 'Q737ZCSbC_g',
    duration: '14:04',
    description: 'A dedicated walkthrough of elongation rules used regularly in Quran recitation.',
  },
  {
    id: 'tj3',
    title: 'Learn the Quranic Noon Sakinah (نون ساكنه) in 10 MINUTES - Arabic101',
    videoId: 'hy8V7CsxaQk',
    duration: '11:34',
    description: 'Strengthen one of the most essential Tajweed topics with a practical rule-focused lesson.',
  },
  {
    id: 'tj4',
    title: 'How to PROPERLY pronounce Meem (م) sakinah in the holy Quran? - Learn Tajweed - Arabic 101',
    videoId: 'MAvDrZgWRTs',
    duration: '10:30',
    description: 'A clear lesson on Meem Sakinah rules and how to apply them confidently.',
  },
  {
    id: 'tj5',
    title: 'How to deal with Letters with NO TASHKEEL in the Holy Quran - Arabic101 - Tajweed series',
    videoId: '4g61PiwOQ2E',
    duration: '10:18',
    description: 'Learn how unmarked letters should be handled during recitation.',
  },
  {
    id: 'tj6',
    title: 'Quranic Qalqala (Echoing sounds) Explained - القلقلة - Tajweed series - Arabic 101',
    videoId: 'thu6eZ-AeOA',
    duration: '10:15',
    description: 'A practical ending lesson on Qalqalah and its distinctive echoing sounds.',
  },
];
const NAHW_BOOTCAMP_LESSONS = cloneLessonSeries(
  NAHW_LESSONS,
  'ng',
  'A focused beginner Arabic grammar lesson selected for the Nahw bootcamp.',
  { limit: 6 },
);
const SARF_DRILLS_LESSONS = cloneLessonSeries(
  SARF_LESSONS,
  'sp',
  'A focused Arabic morphology lesson selected for pattern drills and practice.',
  { limit: 6 },
);
const SPOKEN_ARABIC_KICKSTART_LESSONS = cloneLessonSeries(
  ARABIC_LESSONS,
  'ak',
  'A beginner Arabic speaking lesson selected for day-one language confidence.',
  { limit: 6 },
);

const RAW_COURSES = [
  {
    id: 'aalim-quran',
    courseGroup: 'aalim',
    subject: 'Quran',
    title: 'Quran & Tajweed',
    description: 'Master the rules of Tajweed, Qira\'ah, and proper recitation of the Holy Quran under expert guidance. This comprehensive course covers Makharij al-Huruf, Sifaat, and Waqf rules.',
    thumbnail: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600&q=80',
    instructor: 'Shaykh Abdullah al-Qari',
    level: 'Beginner → Advanced',
    duration: '120 hours',
    totalLessons: 12,
    category: 'Aalim Course',
    ...PAID_COURSE_ACCESS,
    pricePKR: 6500,
    playlistId: 'PL6TlMIZ5ylgqM4Uuu7iAhIeuSdF0v9yxo',
    playlistUrl: 'https://www.youtube.com/playlist?list=PL6TlMIZ5ylgqM4Uuu7iAhIeuSdF0v9yxo',
    lessons: [
      { id: 'q1', title: 'TOO MANY Tajweed Rules? Here\'s the ultimate solution - Arabic101 - Tajweed series', videoId: 'kklrHE85hHE', duration: '11:12', description: 'A practical entry point into Tajweed with a simpler way to approach the rules.' },
      { id: 'q2', title: 'What do the symbols in Quran mean? - Arabic 101', videoId: 'meQsEM3V2m8', duration: '6:38', description: 'Learn the key Quranic symbols and what they indicate during recitation.' },
      { id: 'q3', title: 'What do the symbols in Quran mean? - PART II (ADVANCED) - Arabic101', videoId: 'IOXzx2H5cT8', duration: '11:18', description: 'A deeper continuation of the Quranic symbol guide for Tajweed learners.' },
      { id: 'q4', title: 'What do the symbols in Quran mean? For Urdu + Turkish Mus\'haf - Arabic 101', videoId: '48KSABnA0D8', duration: '13:25', description: 'Understanding Quranic recitation symbols as they appear in different Mushaf prints.' },
      { id: 'q5', title: 'How to PROPERLY stop/ resume in longer Aya\'s in the Holy Quran - Arabic 101', videoId: 'j3AR6-BThPU', duration: '12:47', description: 'Guidance on pausing and resuming correctly in longer verses.' },
      { id: 'q6', title: 'Madd (مد) in Quran MADE EASY - Arabic 101', videoId: 'Q737ZCSbC_g', duration: '14:04', description: 'A focused lesson on elongation rules and how to apply them clearly.' },
      { id: 'q7', title: 'How to pronounce Hamza Wasl (همزة وصل) VS. Hamza Qat\' (همزة قطع) in the Holy Quran - Arabic 101', videoId: 'iS31xI9JF2k', duration: '13:49', description: 'Distinguish and pronounce Hamzat al-Wasl and Hamzat al-Qat\' correctly.' },
      { id: 'q8', title: 'How to PROPERLY pronounce the word (Allah) in the Holy Quran - Arabic 101', videoId: '0paH22-NvzU', duration: '5:46', description: 'Master the proper recitation of the Divine Name in different contexts.' },
      { id: 'q9', title: 'Learn the Quranic Noon Sakinah (نون ساكنه) in 10 MINUTES - Arabic101', videoId: 'hy8V7CsxaQk', duration: '11:34', description: 'A quick and practical explanation of the rules of Noon Sakinah.' },
      { id: 'q10', title: 'How to PROPERLY pronounce Meem (م) sakinah in the holy Quran? - Learn Tajweed - Arabic 101', videoId: 'MAvDrZgWRTs', duration: '10:30', description: 'A lesson dedicated to the rules and pronunciation of Meem Sakinah.' },
      { id: 'q11', title: 'How to deal with Letters with NO TASHKEEL in the Holy Quran - Arabic101 - Tajweed series', videoId: '4g61PiwOQ2E', duration: '10:18', description: 'Clarifies how to handle letters without visible tashkeel during recitation.' },
      { id: 'q12', title: 'Quranic Qalqala (Echoing sounds) Explained - القلقلة - Tajweed series - Arabic 101', videoId: 'thu6eZ-AeOA', duration: '10:15', description: 'A focused explanation of Qalqalah and its sound in Quranic recitation.' },
    ],
  },
  {
    id: 'aalim-hadith',
    courseGroup: 'aalim',
    subject: 'Hadith',
    title: 'Science of Hadith',
    description: 'A rigorous study of Hadith sciences — Mustalah al-Hadith, the major collections (Kutub al-Sittah), chain of narrators (isnad), and practical application of Hadith in Islamic jurisprudence.',
    thumbnail: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=600&q=80',
    instructor: 'Mufti Yusuf al-Hanafi',
    level: 'Intermediate',
    duration: '90 hours',
    totalLessons: HADITH_LESSONS.length,
    category: 'Aalim Course',
    ...PAID_COURSE_ACCESS,
    pricePKR: 7000,
    playlistId: 'PLViVR9emF28bKKOHB1wqDJYoEYlhzfZCE',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLViVR9emF28bKKOHB1wqDJYoEYlhzfZCE',
    lessons: HADITH_LESSONS,
  },
  {
    id: 'aalim-fiqh',
    courseGroup: 'aalim',
    subject: 'Fiqh',
    title: 'Islamic Jurisprudence (Fiqh)',
    description: 'Comprehensive study of Hanafi Fiqh covering Taharah, Salah, Zakah, Sawm, Hajj, Muamalat, and contemporary issues. Based on Mukhtasar al-Quduri and Hidayah.',
    thumbnail: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=600&q=80',
    instructor: 'Mufti Ibrahim Desai',
    level: 'Beginner → Advanced',
    duration: '150 hours',
    totalLessons: FIQH_LESSONS.length,
    category: 'Aalim Course',
    ...PAID_COURSE_ACCESS,
    pricePKR: 7500,
    playlistId: 'PLDQHQxgPBUdYaYkjeemsL7yPNd1CdChxg',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLDQHQxgPBUdYaYkjeemsL7yPNd1CdChxg',
    lessons: FIQH_LESSONS,
  },
  {
    id: 'aalim-sarf',
    courseGroup: 'aalim',
    subject: 'Sarf',
    title: 'Arabic Morphology (Sarf)',
    description: 'Master Arabic Sarf — the science of word forms, root letters, verb patterns, and derivations. Essential for understanding the Quran and classical Arabic texts.',
    thumbnail: 'https://images.unsplash.com/photo-1601037295119-f2c39fb40184?w=600&q=80',
    instructor: 'Ustadh Hassan al-Basri',
    level: 'Beginner',
    duration: '60 hours',
    totalLessons: 8,
    category: 'Aalim Course',
    ...PAID_COURSE_ACCESS,
    pricePKR: 4500,
    playlistId: 'PLboKgKkarggP-TpYzNN0NsZ8XtsPtesWl',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLboKgKkarggP-TpYzNN0NsZ8XtsPtesWl',
    lessons: SARF_LESSONS,
  },
  {
    id: 'aalim-nahw',
    courseGroup: 'aalim',
    subject: 'Nahw',
    title: 'Arabic Grammar (Nahw)',
    description: 'Comprehensive study of classical Arabic grammar through the Ajurrumiyyah and beyond. Learn I\'rab, sentence structure, and parsing of Quranic verses.',
    thumbnail: 'https://images.unsplash.com/photo-1614036417651-efe5912149d8?w=600&q=80',
    instructor: 'Ustadh Hassan al-Basri',
    level: 'Beginner → Intermediate',
    duration: '80 hours',
    totalLessons: 10,
    category: 'Aalim Course',
    ...PAID_COURSE_ACCESS,
    pricePKR: 5000,
    playlistId: 'PLvAM-d-YA8MdQXM9-2i5YGjn92Wdjrzfr',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLvAM-d-YA8MdQXM9-2i5YGjn92Wdjrzfr',
    lessons: NAHW_LESSONS,
  },
  {
    id: 'aalim-arabic',
    courseGroup: 'aalim',
    subject: 'Arabic',
    title: 'Arabic Language & Composition',
    description: 'Develop fluency in classical and modern standard Arabic. Covers reading comprehension, essay writing, conversation, and analysis of classical texts.',
    thumbnail: 'https://images.unsplash.com/photo-1565791380713-1756b9a05343?w=600&q=80',
    instructor: 'Dr. Fatima al-Zahra',
    level: 'Beginner → Advanced',
    duration: '100 hours',
    totalLessons: 10,
    category: 'Aalim Course',
    ...PAID_COURSE_ACCESS,
    pricePKR: 6000,
    playlistId: 'PLr_tqbGZylgY_ZGOgGO2KlCLknUPA8g4w',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLr_tqbGZylgY_ZGOgGO2KlCLknUPA8g4w',
    lessons: ARABIC_LESSONS,
  },
  {
    id: 'aalim-aqeedah',
    courseGroup: 'aalim',
    subject: 'Aqeedah',
    title: 'Aqeedah & Core Beliefs',
    description: 'Build a sound foundation in Islamic creed through the study of Tawhid, prophethood, the unseen, divine decree, and the core beliefs every Muslim should understand with clarity.',
    thumbnail: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=600&q=80',
    instructor: 'Shaykh Salman al-Azhari',
    level: 'Beginner → Intermediate',
    duration: '70 hours',
    totalLessons: 10,
    category: 'Aalim Course',
    ...PAID_COURSE_ACCESS,
    pricePKR: 5000,
    playlistId: 'PLExCKwROz20Fx-CU6VpfWMKC5vEluvJ3R',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLExCKwROz20Fx-CU6VpfWMKC5vEluvJ3R',
    lessons: AQEEDAH_LESSONS,
  },
  {
    id: 'aalim-tafsir',
    courseGroup: 'aalim',
    subject: 'Tafsir',
    title: 'Quran Tafsir Foundations',
    description: 'Study the meanings, themes, and lessons of the Quran through a structured tafsir journey that deepens reflection, context, and practical understanding of revelation.',
    thumbnail: 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=600&q=80',
    instructor: 'Shaykh Hamza al-Mufassir',
    level: 'Beginner → Intermediate',
    duration: '95 hours',
    totalLessons: 12,
    category: 'Aalim Course',
    ...PAID_COURSE_ACCESS,
    pricePKR: 6500,
    playlistId: 'PL9Uv4BWc1XeF0TT6XSC6cW_1DB4yT0jGA',
    playlistUrl: 'https://www.youtube.com/playlist?list=PL9Uv4BWc1XeF0TT6XSC6cW_1DB4yT0jGA',
    lessons: TAFSIR_LESSONS,
  },
  {
    id: 'seerah',
    courseGroup: 'seerah',
    subject: 'Seerah',
    title: 'Seerah — Life of the Prophet ﷺ',
    description: 'A comprehensive and moving study of the life of the Prophet Muhammad ﷺ — from his blessed birth in Makkah to his eternal departure. Covers all major events, battles, and lessons for modern Muslims.',
    thumbnail: 'https://images.unsplash.com/photo-1564769610726-59cead6a6f8f?w=600&q=80',
    instructor: 'Shaykh Muhammad al-Nuri',
    level: 'All Levels',
    duration: '110 hours',
    totalLessons: 12,
    category: 'Seerah Course',
    ...PAID_COURSE_ACCESS,
    pricePKR: 4000,
    playlistId: 'PLuUzuzAeLoSc3zdtfCnWTQ57itvPMGOgM',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLuUzuzAeLoSc3zdtfCnWTQ57itvPMGOgM',
    lessons: SEERAH_LESSONS,
  },
  {
    id: 'qaida-foundations',
    courseGroup: 'workshop',
    subject: 'Arabic',
    title: 'Arabic Qaida & Letter Sounds Foundations',
    description: 'A short paid workshop for testing enrollments and approvals while giving students a structured starter path through letter sounds, Qaida awareness, and beginner recitation symbols.',
    thumbnail: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=600&q=80',
    instructor: 'Ustadh Kareem Ahmad',
    level: 'Beginner',
    duration: '6 focused lessons',
    totalLessons: QAIDA_FOUNDATIONS_LESSONS.length,
    category: 'Workshop',
    ...PAID_COURSE_ACCESS,
    pricePKR: 1200,
    playlistId: 'PL6TlMIZ5ylgqM4Uuu7iAhIeuSdF0v9yxo',
    playlistUrl: 'https://www.youtube.com/playlist?list=PL6TlMIZ5ylgqM4Uuu7iAhIeuSdF0v9yxo',
    lessons: QAIDA_FOUNDATIONS_LESSONS,
  },
  {
    id: 'tajweed-skill-builder',
    courseGroup: 'workshop',
    subject: 'Quran',
    title: 'Tajweed Skill Builder Workshop',
    description: 'A paid Tajweed practice workshop built around stopping rules, madd, noon sakinah, meem sakinah, and qalqalah so you can test the full payment approval flow with a practical Quran course.',
    thumbnail: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=600&q=80',
    instructor: 'Shaykh Abdullah al-Qari',
    level: 'Beginner → Intermediate',
    duration: '6 focused lessons',
    totalLessons: TAJWEED_SKILL_BUILDER_LESSONS.length,
    category: 'Workshop',
    ...PAID_COURSE_ACCESS,
    pricePKR: 1800,
    playlistId: 'PL6TlMIZ5ylgqM4Uuu7iAhIeuSdF0v9yxo',
    playlistUrl: 'https://www.youtube.com/playlist?list=PL6TlMIZ5ylgqM4Uuu7iAhIeuSdF0v9yxo',
    lessons: TAJWEED_SKILL_BUILDER_LESSONS,
  },
  {
    id: 'nahw-grammar-bootcamp',
    courseGroup: 'workshop',
    subject: 'Nahw',
    title: 'Arabic Grammar Bootcamp',
    description: 'A compact paid Nahw track for testing course enrollments while giving students a beginner-friendly entry into Arabic grammar and sentence structure.',
    thumbnail: 'https://images.unsplash.com/photo-1614036417651-efe5912149d8?w=600&q=80',
    instructor: 'Mufti Madani Raza',
    level: 'Beginner',
    duration: '6 selected lessons',
    totalLessons: NAHW_BOOTCAMP_LESSONS.length,
    category: 'Workshop',
    ...PAID_COURSE_ACCESS,
    pricePKR: 1600,
    playlistId: 'PLvAM-d-YA8MdQXM9-2i5YGjn92Wdjrzfr',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLvAM-d-YA8MdQXM9-2i5YGjn92Wdjrzfr',
    lessons: NAHW_BOOTCAMP_LESSONS,
  },
  {
    id: 'sarf-pattern-drills',
    courseGroup: 'workshop',
    subject: 'Sarf',
    title: 'Sarf Pattern Drills',
    description: 'A short paid morphology course that helps students practice Arabic word patterns while giving you another clean flow to verify payments from the admin dashboard.',
    thumbnail: 'https://images.unsplash.com/photo-1601037295119-f2c39fb40184?w=600&q=80',
    instructor: 'Moulana Malik Mohsin Shehzad',
    level: 'Beginner',
    duration: '6 selected lessons',
    totalLessons: SARF_DRILLS_LESSONS.length,
    category: 'Workshop',
    ...PAID_COURSE_ACCESS,
    pricePKR: 1500,
    playlistId: 'PLboKgKkarggP-TpYzNN0NsZ8XtsPtesWl',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLboKgKkarggP-TpYzNN0NsZ8XtsPtesWl',
    lessons: SARF_DRILLS_LESSONS,
  },
  {
    id: 'spoken-arabic-kickstart',
    courseGroup: 'workshop',
    subject: 'Arabic',
    title: 'Spoken Arabic Kickstart',
    description: 'A short paid Arabic language course with beginner speaking lessons so you can test another playlist-backed enrollment path from student sign-in through admin approval.',
    thumbnail: 'https://images.unsplash.com/photo-1565791380713-1756b9a05343?w=600&q=80',
    instructor: 'Dr. Fatima al-Zahra',
    level: 'Beginner',
    duration: '6 selected lessons',
    totalLessons: SPOKEN_ARABIC_KICKSTART_LESSONS.length,
    category: 'Workshop',
    ...PAID_COURSE_ACCESS,
    pricePKR: 1500,
    playlistId: 'PLr_tqbGZylgY_ZGOgGO2KlCLknUPA8g4w',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLr_tqbGZylgY_ZGOgGO2KlCLknUPA8g4w',
    lessons: SPOKEN_ARABIC_KICKSTART_LESSONS,
  },
  {
    id: 'payment-test-duas-course',
    courseGroup: 'short',
    subject: 'Duas',
    title: 'Payment Test Mini Course',
    description: 'A very small paid course with five short dua videos so you can quickly test student enrollment, payment proof submission, and admin approval on the live system.',
    thumbnail: 'https://images.unsplash.com/photo-1519817914152-22f90e22f9c4?w=600&q=80',
    instructor: 'Ustadh Abdul Hakeem',
    level: 'Beginner',
    duration: '5 short lessons',
    totalLessons: PAYMENT_TEST_DUAS_LESSONS.length,
    category: 'Mini Course',
    requiresPayment: true,
    freePreviewLessons: 2,
    currency: 'PKR',
    pricePKR: 15,
    playlistId: 'PL5nHjmHggAVhlvtCS8Lw848ikBKLDWMNO',
    playlistUrl: 'https://www.youtube.com/playlist?list=PL5nHjmHggAVhlvtCS8Lw848ikBKLDWMNO',
    lessons: PAYMENT_TEST_DUAS_LESSONS,
  },
  {
    id: 'short-daily-duas',
    courseGroup: 'short',
    subject: 'Duas',
    title: 'Daily Duas & Supplications',
    description: 'A short free course to help students learn and revise everyday duas for morning, evening, travel, food, study, and protection.',
    thumbnail: 'https://images.unsplash.com/photo-1519817914152-22f90e22f9c4?w=600&q=80',
    instructor: 'Ustadh Abdul Hakeem',
    level: 'All Levels',
    duration: '6 hours',
    totalLessons: 6,
    category: 'Short Course',
    requiresPayment: false,
    freePreviewLessons: 6,
    currency: 'PKR',
    pricePKR: 0,
    isShortCourse: true,
    playlistId: 'PL5nHjmHggAVhlvtCS8Lw848ikBKLDWMNO',
    playlistUrl: 'https://www.youtube.com/playlist?list=PL5nHjmHggAVhlvtCS8Lw848ikBKLDWMNO',
    lessons: DAILY_DUAS_LESSONS,
  },
  {
    id: 'short-salah-basics',
    courseGroup: 'short',
    subject: 'Salah',
    title: 'How to Pray Salah Correctly',
    description: 'A free beginner-friendly short course covering wudu, prayer positions, recitations, and the structure of salah in a simple step-by-step format.',
    thumbnail: 'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=600&q=80',
    instructor: 'Shaykh Umar Rahmani',
    level: 'Beginner',
    duration: '5 hours',
    totalLessons: 5,
    category: 'Short Course',
    requiresPayment: false,
    freePreviewLessons: 5,
    currency: 'PKR',
    pricePKR: 0,
    isShortCourse: true,
    playlistId: 'PL12lIy0Cbpjr6kzgaGyq-K_oVEjBOD04X',
    playlistUrl: 'https://www.youtube.com/playlist?list=PL12lIy0Cbpjr6kzgaGyq-K_oVEjBOD04X',
    lessons: SALAH_BASICS_LESSONS,
  },
  {
    id: 'short-ramadan-prep',
    courseGroup: 'short',
    subject: 'Ramadan',
    title: 'Ramadan Preparation Essentials',
    description: 'A free short course to help students prepare spiritually and practically for Ramadan with intention, duas, time planning, and worship habits.',
    thumbnail: 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=600&q=80',
    instructor: 'Ustadha Maryam Noor',
    level: 'All Levels',
    duration: '4 hours',
    totalLessons: 4,
    category: 'Short Course',
    requiresPayment: true,
    freePreviewLessons: 2,
    currency: 'PKR',
    pricePKR: 10,
    isShortCourse: true,
    playlistId: 'PLnv9ODvUmjGa18AKJoO0u6dKjm46PvctR',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLnv9ODvUmjGa18AKJoO0u6dKjm46PvctR',
    lessons: RAMADAN_PREP_LESSONS,
  },
  {
    id: 'mini-wudu-course',
    courseGroup: 'short',
    subject: 'Wudu',
    title: 'Wudu Mini Course',
    description: 'A small YouTube-based course to test paid access on the platform. Students can watch the first two lessons free, then unlock the remaining lessons for a small fee.',
    thumbnail: 'https://images.unsplash.com/photo-1519817914152-22f90e22f9c4?w=600&q=80',
    instructor: 'Ustadh Imran Siddiqi',
    level: 'Beginner',
    duration: 'Mini course',
    totalLessons: 4,
    category: 'Mini Course',
    requiresPayment: true,
    freePreviewLessons: 2,
    currency: 'PKR',
    pricePKR: 50,
    playlistId: 'PLAO8qLIRONvtJHkpidwe-EZ4Ftd7cyGia',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLAO8qLIRONvtJHkpidwe-EZ4Ftd7cyGia',
    lessons: [
      { id: 'mw1', title: '1 -  How to make Wudu: The intention of wudhu', videoId: '87kStHDV8G0', duration: '1:01', description: 'A short introduction to beginning wudu with the correct intention.' },
      { id: 'mw2', title: '2 - How to make Wudu: The obligatory acts of wudhu', videoId: 'dcr9q0mPC28', duration: '1:43', description: 'Learn the essential obligatory acts that make wudu valid.' },
      { id: 'mw3', title: '3 - How to make Wudu: Sunnah to use the miswak, and men and women are equal in wudhu', videoId: 'cgYJICpGye8', duration: '1:00', description: 'Covers a sunnah practice in wudu and a brief fiqh reminder.' },
      { id: 'mw4', title: '4 - How to make Wudu: From the sunnan of wudhu is to say "bismillah" at the beginning of it', videoId: 'My1moyg69lo', duration: '0:39', description: 'A quick closing lesson on beginning wudu with Bismillah.' },
    ],
  },
];

export const COURSES = RAW_COURSES.map(normalizeCourseRecord);

export const MOCK_STUDENTS = [
  { id: 'u1', name: 'Ahmad ibn Yusuf', email: 'ahmad@example.com', joinDate: '2024-09-01', coursesEnrolled: 3, lessonsCompleted: 28 },
  { id: 'u2', name: 'Fatima al-Zahra', email: 'fatima@example.com', joinDate: '2024-09-15', coursesEnrolled: 2, lessonsCompleted: 14 },
  { id: 'u3', name: 'Umar Abdullah', email: 'umar@example.com', joinDate: '2024-10-01', coursesEnrolled: 4, lessonsCompleted: 45 },
  { id: 'u4', name: 'Maryam Hasan', email: 'maryam@example.com', joinDate: '2024-10-20', coursesEnrolled: 1, lessonsCompleted: 8 },
  { id: 'u5', name: 'Ibrahim al-Hanafi', email: 'ibrahim@example.com', joinDate: '2024-11-01', coursesEnrolled: 5, lessonsCompleted: 62 },
];

export const ROLES = ['Student', 'Teacher', 'Admin', 'Super Admin'];

export const AALIM_SUBJECTS = ['Quran', 'Hadith', 'Fiqh', 'Sarf', 'Nahw', 'Arabic', 'Aqeedah', 'Tafsir'];

export const AALIM_PROGRAM = {
  id: 'aalim-program',
  title: 'Complete Aalim Program',
  description: 'A structured multi-subject path that brings together the core subjects needed for the Ali Nawaz Academy Aalim certificate.',
  pricePKR: 39999,
  currency: 'PKR',
  requiredCourseIds: [
    'aalim-quran',
    'aalim-hadith',
    'aalim-fiqh',
    'aalim-sarf',
    'aalim-nahw',
    'aalim-arabic',
    'aalim-aqeedah',
    'aalim-tafsir',
  ],
};
