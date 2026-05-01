import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Edit2, BookOpen, Users, Eye, PencilLine, Image, Video, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProgressBar from '../components/ProgressBar';
import { extractYouTubeVideoId } from '../utils/playlistCourses';

const EMPTY_VIDEO = {
  title: '',
  url: '',
};

const EMPTY_FORM = {
  title: '',
  description: '',
  instructor: '',
  youtube_playlist_url: '',
  thumbnail: '',
  price: '0',
  is_paid: true,
  videos: [],
};

export default function TeacherPanel() {
  const navigate = useNavigate();
  const { role, currentUser, users, courses, addCourse, updateCourse } = useApp();
  const [tab, setTab] = useState('courses');
  const [courseForm, setCourseForm] = useState(EMPTY_FORM);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (role === 'Student') {
    return (
      <div className="glass-card p-16 text-center animate-fade-in">
        <p className="font-cinzel text-cream/30 text-lg">Access Denied</p>
        <p className="text-cream/20 font-crimson mt-2">This area is for teachers and administrators.</p>
      </div>
    );
  }

  const studentUsers = useMemo(
    () => users.filter((user) => user.role === 'Student'),
    [users],
  );

  const tabs = [
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'add', label: editingCourseId ? 'Edit Course' : 'Add Course', icon: PlusCircle },
  ];

  const openNewCourseForm = () => {
    setEditingCourseId(null);
    setCourseForm({
      ...EMPTY_FORM,
      instructor: currentUser?.name || '',
    });
    setTab('add');
    setFeedback(null);
  };

  const startEditCourse = (course) => {
    const editableVideos = Array.isArray(course.courseVideos) && course.courseVideos.length > 0
      ? course.courseVideos.map((video) => ({
        title: video.title || '',
        url: video.youtube_url || '',
      }))
      : !course.youtube_playlist_url && Array.isArray(course.lessons)
        ? course.lessons.map((lesson) => ({
          title: lesson.title || '',
          url: lesson.videoId ? `https://www.youtube.com/watch?v=${lesson.videoId}` : '',
        }))
        : [];

    setEditingCourseId(course.id);
    setCourseForm({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      youtube_playlist_url: course.youtube_playlist_url || '',
      thumbnail: course.thumbnail || '',
      price: String(course.price ?? 0),
      is_paid: Boolean(course.is_paid),
      videos: editableVideos,
    });
    setTab('add');
    setFeedback(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isPaid = Boolean(courseForm.is_paid);
    const videos = courseForm.videos
      .map((video) => ({
        title: video.title.trim(),
        url: video.url.trim(),
      }))
      .filter((video) => video.title || video.url);

    if (!editingCourseId && videos.length === 0) {
      setFeedback({ type: 'error', text: 'Please add at least one YouTube video for the new course.' });
      return;
    }

    if (videos.some((video) => !video.title || !video.url)) {
      setFeedback({ type: 'error', text: 'Each video needs both a video name and a YouTube URL.' });
      return;
    }

    if (videos.some((video) => !extractYouTubeVideoId(video.url))) {
      setFeedback({ type: 'error', text: 'Please enter valid YouTube video URLs before saving the course.' });
      return;
    }

    const payload = {
      ...courseForm,
      price: isPaid ? (Number.parseInt(courseForm.price, 10) || 0) : 0,
      is_paid: isPaid,
      videos,
    };

    let result;
    setSubmitting(true);

    try {
      result = editingCourseId
        ? await updateCourse(editingCourseId, payload)
        : await addCourse(payload);
    } finally {
      setSubmitting(false);
    }

    if (!result.ok) {
      setFeedback({ type: 'error', text: result.message });
      return;
    }

    setFeedback({
      type: 'success',
      text: result.message || (editingCourseId ? 'Course updated successfully.' : 'Course added successfully.'),
    });
    setEditingCourseId(null);
    setCourseForm({
      ...EMPTY_FORM,
      instructor: currentUser?.name || '',
    });
    setTab('courses');
  };

  const handleFieldChange = (key, value) => {
    setCourseForm((current) => ({ ...current, [key]: value }));
  };

  const handleVideoChange = (index, key, value) => {
    setCourseForm((current) => ({
      ...current,
      videos: current.videos.map((video, videoIndex) => (
        videoIndex === index ? { ...video, [key]: value } : video
      )),
    }));
  };

  const addVideoRow = () => {
    setCourseForm((current) => ({
      ...current,
      videos: [...current.videos, { ...EMPTY_VIDEO }],
    }));
  };

  const removeVideoRow = (index) => {
    setCourseForm((current) => ({
      ...current,
      videos: current.videos.filter((_, videoIndex) => videoIndex !== index),
    }));
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-cinzel font-black text-2xl md:text-3xl text-gold-400 mb-1">Course Management</h1>
        <p className="text-cream/50 font-crimson">Create courses, add videos, and review learner activity</p>
      </div>

      {feedback && (
        <div className={`px-4 py-3 rounded-xl text-sm font-crimson ${feedback.type === 'success' ? 'text-emerald-200' : 'text-red-200'}`}
          style={{
            background: feedback.type === 'success' ? 'rgba(6,78,59,0.35)' : 'rgba(127,29,29,0.35)',
            border: feedback.type === 'success' ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(248,113,113,0.25)',
          }}>
          {feedback.text}
        </div>
      )}

      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: 'rgba(5,26,15,0.6)', border: '1px solid rgba(245,158,11,0.1)' }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => {
            if (t.id === 'add' && !editingCourseId) {
              openNewCourseForm();
              return;
            }
            setTab(t.id);
          }}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-cinzel transition-all
              ${tab === t.id ? 'bg-gold-600 text-emerald-950 font-bold' : 'text-cream/50 hover:text-cream/80'}`}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {tab === 'courses' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-cinzel font-bold text-gold-400">Platform Courses</h2>
              <p className="text-sm font-crimson text-cream/40">{courses.length} total</p>
            </div>
            <button type="button" onClick={openNewCourseForm} className="btn-gold text-xs px-4 py-2 inline-flex items-center gap-2">
              <PlusCircle size={14} />
              Add Course
            </button>
          </div>

          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="glass-card flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                <img src={course.thumbnail} alt={course.title} className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-cinzel font-bold text-gold-400 text-sm truncate">{course.title}</p>
                    <span className={`badge ${course.isCustom ? 'badge-gold' : 'badge-emerald'} text-[9px]`}>
                      {course.isCustom ? 'Custom' : 'Core'}
                    </span>
                  </div>
                  <p className="text-cream/40 font-crimson text-xs">
                    {course.totalLessons} lessons · {course.instructor}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className={`badge text-[9px] ${course.is_paid ? 'badge-red' : 'badge-emerald'}`}>
                      {course.is_paid ? `PKR ${course.price}` : 'Free'}
                    </span>
                    {course.youtube_playlist_url && <span className="badge badge-gold text-[9px]">YouTube Playlist</span>}
                    {course.createdBy === currentUser?.id && <span className="badge badge-emerald text-[9px]">Created By You</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                  <button type="button" onClick={() => navigate(`/course/${course.id}`, { state: { course } })}
                    className="p-1.5 rounded hover:bg-emerald-800/30 text-cream/40 hover:text-emerald-400 transition-colors">
                    <Eye size={14} />
                  </button>
                  <button type="button" onClick={() => startEditCourse(course)}
                    className="p-1.5 rounded hover:bg-gold-900/30 text-cream/40 hover:text-gold-400 transition-colors">
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'students' && (
        <div className="space-y-4">
          <h2 className="font-cinzel font-bold text-gold-400">Student Progress</h2>

          {studentUsers.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <Users size={40} className="text-gold-500/20 mx-auto mb-4" />
              <p className="font-cinzel text-cream/30 text-lg">No student accounts yet</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block glass-card overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(245,158,11,0.15)' }}>
                      {['Student', 'Email', 'Enrolled', 'Lessons Done', 'Certificates', 'Joined'].map((header) => (
                        <th key={header} className="text-left px-4 py-3 text-xs font-cinzel text-gold-500/60 tracking-wider">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {studentUsers.map((student) => (
                      <tr key={student.id} className="transition-colors hover:bg-emerald-900/10"
                        style={{ borderBottom: '1px solid rgba(16,185,129,0.06)' }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-cinzel text-gold-400">
                              {student.name[0]}
                            </div>
                            <span className="font-crimson text-cream/80 text-sm">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-crimson text-cream/40">{student.email}</td>
                        <td className="px-4 py-3 font-cinzel text-gold-400 text-sm">{student.coursesEnrolled}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <ProgressBar value={Math.min(100, student.lessonsCompleted * 5)} showLabel={false} height={4} className="w-20" />
                            <span className="text-xs font-crimson text-cream/40">{student.lessonsCompleted}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-cinzel text-emerald-400 text-sm">{student.certificatesIssued}</td>
                        <td className="px-4 py-3 text-xs font-crimson text-cream/40">{new Date(student.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {studentUsers.map((student) => (
                  <div key={student.id} className="glass-card p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-800 flex items-center justify-center text-sm font-cinzel text-gold-400">
                        {student.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-crimson text-cream/80 text-sm">{student.name}</p>
                        <p className="text-xs font-crimson text-cream/35 break-all">{student.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-[10px] font-cinzel text-gold-500/60 tracking-wider">COURSES</p>
                        <p className="font-cinzel text-gold-400 text-sm">{student.coursesEnrolled}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-cinzel text-gold-500/60 tracking-wider">LESSONS</p>
                        <p className="font-cinzel text-emerald-400 text-sm">{student.lessonsCompleted}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-cinzel text-gold-500/60 tracking-wider">CERTS</p>
                        <p className="font-cinzel text-gold-400 text-sm">{student.certificatesIssued}</p>
                      </div>
                    </div>
                    <ProgressBar value={Math.min(100, student.lessonsCompleted * 5)} showLabel={false} height={4} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'add' && (
        <div className="max-w-2xl">
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="font-cinzel font-bold text-gold-400">
              {editingCourseId ? 'Edit Course' : 'Add New Course'}
            </h2>
            {editingCourseId && (
              <button type="button" onClick={openNewCourseForm} className="text-xs font-crimson text-emerald-400 hover:text-emerald-300">
                Switch to new course
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">
                <Image size={13} />
                THUMBNAIL URL
              </label>
              <input
                value={courseForm.thumbnail}
                onChange={(e) => handleFieldChange('thumbnail', e.target.value)}
                placeholder="https://example.com/course-cover.jpg"
                className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.2)' }}
              />
              {courseForm.thumbnail && (
                <div className="mt-3 h-36 rounded-lg overflow-hidden" style={{ border: '1px solid rgba(245,158,11,0.14)' }}>
                  <img src={courseForm.thumbnail} alt="Course thumbnail preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">COURSE NAME</label>
              <input
                value={courseForm.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="e.g. Advanced Fiqh - Muamalat"
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.2)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">COURSE DESCRIPTION</label>
              <textarea
                value={courseForm.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Brief description of the course..."
                rows={4}
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream resize-none outline-none"
                style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.2)' }}
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">INSTRUCTOR</label>
                <input
                  value={courseForm.instructor}
                  onChange={(e) => handleFieldChange('instructor', e.target.value)}
                  placeholder="e.g. Mufti Ibrahim Desai"
                  required
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                  style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.2)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">PRICE (PKR)</label>
                <input
                  type="number"
                  min="0"
                  value={courseForm.price}
                  onChange={(e) => handleFieldChange('price', e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                  style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.2)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">ACCESS TYPE</label>
                <select
                  value={courseForm.is_paid ? 'paid' : 'free'}
                  onChange={(e) => handleFieldChange('is_paid', e.target.value === 'paid')}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream/80 outline-none"
                  style={{ background: 'rgba(6,78,59,0.3)', border: '1px solid rgba(245,158,11,0.2)' }}
                >
                  <option value="paid" style={{ background: '#051a0f' }}>Paid</option>
                  <option value="free" style={{ background: '#051a0f' }}>Free</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-cinzel text-gold-500/60 tracking-wider">
                  <Video size={13} />
                  COURSE VIDEOS
                </label>
                <span className="text-[11px] font-crimson text-cream/35">{courseForm.videos.length} added</span>
              </div>

              {courseForm.videos.map((video, index) => (
                <div
                  key={`course-video-${index}`}
                  className="rounded-lg p-3 space-y-3"
                  style={{ background: 'rgba(6,78,59,0.16)', border: '1px solid rgba(245,158,11,0.16)' }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-cinzel text-xs text-gold-400">Video {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeVideoRow(index)}
                      className="p-1.5 rounded text-red-200 hover:text-red-100 hover:bg-red-900/20 transition-colors"
                      aria-label={`Remove video ${index + 1}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-cinzel text-gold-500/50 tracking-wider mb-1.5">VIDEO NAME</label>
                      <input
                        value={video.title}
                        onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                        placeholder="e.g. Lesson 1 - Introduction"
                        className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                        style={{ background: 'rgba(2,15,10,0.28)', border: '1px solid rgba(245,158,11,0.14)' }}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-cinzel text-gold-500/50 tracking-wider mb-1.5">YOUTUBE URL</label>
                      <input
                        value={video.url}
                        onChange={(e) => handleVideoChange(index, 'url', e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                        style={{ background: 'rgba(2,15,10,0.28)', border: '1px solid rgba(245,158,11,0.14)' }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addVideoRow}
                className="w-full rounded-lg py-3 flex items-center justify-center gap-2 text-sm font-cinzel font-bold text-gold-300 hover:text-gold-200 transition-colors"
                style={{ background: 'rgba(6,78,59,0.2)', border: '1px dashed rgba(245,158,11,0.45)' }}
              >
                <PlusCircle size={16} />
                Add Video
              </button>
            </div>

            <button type="submit" disabled={submitting} className="btn-gold w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {editingCourseId ? <PencilLine size={16} /> : <PlusCircle size={16} />}
              {submitting ? 'Saving Course...' : editingCourseId ? 'Save Course Changes' : 'Add Course'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
