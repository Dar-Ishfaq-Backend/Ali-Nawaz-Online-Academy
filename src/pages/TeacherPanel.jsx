import { useState } from 'react';
import { PlusCircle, Edit2, Trash2, Youtube, BookOpen, Users, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COURSES, MOCK_STUDENTS } from '../data/courses';
import { getTeacherCourses, addTeacherCourse } from '../utils/storage';
import { getCourseProgress } from '../utils/storage';
import ProgressBar from '../components/ProgressBar';

const EMPTY_FORM = { title: '', subject: '', description: '', instructor: '', playlistUrl: '', totalLessons: '', level: 'Beginner', category: 'Aalim Course' };

export default function TeacherPanel() {
  const { role } = useApp();
  const [tab, setTab] = useState('courses');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saved, setSaved] = useState(false);
  const [teacherCourses, setTeacherCourses] = useState(getTeacherCourses());

  if (role === 'Student') {
    return (
      <div className="glass-card p-16 text-center animate-fade-in">
        <p className="font-cinzel text-cream/30 text-lg">Access Denied</p>
        <p className="text-cream/20 font-crimson mt-2">This area is for teachers and administrators.</p>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    addTeacherCourse({
      ...form,
      totalLessons: parseInt(form.totalLessons) || 0,
      thumbnail: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600&q=80',
      lessons: [],
    });
    setTeacherCourses(getTeacherCourses());
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'add', label: 'Add Course', icon: PlusCircle },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-cinzel font-black text-2xl md:text-3xl text-gold-400 mb-1">Teacher Panel</h1>
        <p className="text-cream/50 font-crimson">Manage your courses and students</p>
      </div>

      {saved && (
        <div className="px-4 py-3 rounded-xl text-sm font-crimson text-emerald-300 animate-slide-up"
          style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
          ✓ Course added successfully!
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(5,26,15,0.6)', border: '1px solid rgba(245,158,11,0.1)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); if (t.id === 'add') setShowForm(true); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-cinzel transition-all
              ${tab === t.id ? 'bg-gold-600 text-emerald-950 font-bold' : 'text-cream/50 hover:text-cream/80'}`}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* Courses Tab */}
      {tab === 'courses' && (
        <div className="space-y-4">
          <h2 className="font-cinzel font-bold text-gold-400">Platform Courses</h2>
          <div className="space-y-3">
            {COURSES.map(c => (
              <div key={c.id} className="glass-card flex items-center gap-4 p-4">
                <img src={c.thumbnail} alt={c.title} className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-cinzel font-bold text-gold-400 text-sm truncate">{c.title}</p>
                  <p className="text-cream/40 font-crimson text-xs">{c.subject} · {c.totalLessons} lessons · {c.instructor}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="badge badge-emerald text-[9px]">{c.level}</span>
                    <span className="badge badge-gold text-[9px]">{c.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="p-1.5 rounded hover:bg-emerald-800/30 text-cream/40 hover:text-emerald-400 transition-colors">
                    <Eye size={14} />
                  </button>
                  <button className="p-1.5 rounded hover:bg-gold-900/30 text-cream/40 hover:text-gold-400 transition-colors">
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {/* Teacher-added courses */}
            {teacherCourses.map(c => (
              <div key={c.id} className="glass-card flex items-center gap-4 p-4 border-gold-500/20">
                <div className="w-16 h-12 rounded-lg bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="font-cinzel font-bold text-gold-400 text-sm">{c.title}</p>
                  <p className="text-cream/40 font-crimson text-xs">{c.subject} · {c.totalLessons} lessons</p>
                  <span className="badge badge-gold text-[9px] mt-1">Locally Added</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students Tab */}
      {tab === 'students' && (
        <div className="space-y-4">
          <h2 className="font-cinzel font-bold text-gold-400">Mock Student Progress</h2>
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(245,158,11,0.15)' }}>
                  {['Student', 'Enrolled', 'Lessons Done', 'Joined'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-cinzel text-gold-500/60 tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_STUDENTS.map((s, i) => (
                  <tr key={s.id} className="transition-colors hover:bg-emerald-900/10"
                    style={{ borderBottom: '1px solid rgba(16,185,129,0.06)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-cinzel text-gold-400">
                          {s.name[0]}
                        </div>
                        <span className="font-crimson text-cream/80 text-sm">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-cinzel text-gold-400 text-sm">{s.coursesEnrolled}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={Math.round((s.lessonsCompleted / 80) * 100)} showLabel={false} height={4} className="w-20" />
                        <span className="text-xs font-crimson text-cream/40">{s.lessonsCompleted}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-crimson text-cream/40">{new Date(s.joinDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Course Tab */}
      {tab === 'add' && (
        <div className="max-w-2xl">
          <h2 className="font-cinzel font-bold text-gold-400 mb-5">Add New Course</h2>
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
            {[
              { key: 'title', label: 'Course Title', placeholder: 'e.g. Advanced Fiqh — Muamalat' },
              { key: 'instructor', label: 'Instructor Name', placeholder: 'e.g. Mufti Ibrahim Desai' },
              { key: 'playlistUrl', label: 'YouTube Playlist URL', placeholder: 'https://youtube.com/playlist?list=...' },
              { key: 'totalLessons', label: 'Total Lessons', placeholder: '12', type: 'number' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">{field.label.toUpperCase()}</label>
                <input
                  type={field.type || 'text'}
                  value={form[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  required
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                  style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.2)' }}
                />
              </div>
            ))}

            {/* Subject select */}
            <div>
              <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">SUBJECT</label>
              <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required
                className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream/80 outline-none"
                style={{ background: 'rgba(6,78,59,0.3)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <option value="" style={{ background: '#051a0f' }}>Select subject...</option>
                {['Quran', 'Hadith', 'Fiqh', 'Sarf', 'Nahw', 'Arabic', 'Seerah', 'Aqeedah', 'Other'].map(s => (
                  <option key={s} value={s} style={{ background: '#051a0f' }}>{s}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">DESCRIPTION</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of the course..." rows={3} required
                className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream resize-none outline-none"
                style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.2)' }}
              />
            </div>

            <button type="submit" className="btn-gold w-full py-3 flex items-center justify-center gap-2">
              <PlusCircle size={16} /> Add Course
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
