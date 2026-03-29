import { useState } from 'react';
import { Users, BookOpen, Award, TrendingUp, BarChart3, Shield, Settings, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COURSES, MOCK_STUDENTS } from '../data/courses';
import { getAnalytics, getCourseProgress } from '../utils/storage';
import ProgressBar from '../components/ProgressBar';

const StatCard = ({ icon: Icon, label, value, change, color }) => (
  <div className="glass-card p-5">
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={20} style={{ color }} />
      </div>
      {change && <span className={`text-xs font-cinzel ${change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {change > 0 ? '+' : ''}{change}%
      </span>}
    </div>
    <div className="font-cinzel font-black text-2xl" style={{ color }}>{value}</div>
    <div className="text-cream/50 font-crimson text-sm mt-0.5">{label}</div>
  </div>
);

export default function AdminPanel() {
  const { role } = useApp();
  const [tab, setTab] = useState('analytics');
  const analytics = getAnalytics();

  if (role === 'Student' || role === 'Teacher') {
    return (
      <div className="glass-card p-16 text-center animate-fade-in">
        <Shield size={40} className="text-cream/10 mx-auto mb-4" />
        <p className="font-cinzel text-cream/30 text-lg">Access Denied</p>
        <p className="text-cream/20 font-crimson mt-2">Admin and Super Admin only.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    ...(role === 'Super Admin' ? [{ id: 'settings', label: 'Settings', icon: Settings }] : []),
  ];

  // Mock bar chart data
  const weeklyData = [
    { day: 'Mon', lessons: 42 },
    { day: 'Tue', lessons: 68 },
    { day: 'Wed', lessons: 55 },
    { day: 'Thu', lessons: 91 },
    { day: 'Fri', lessons: 73 },
    { day: 'Sat', lessons: 38 },
    { day: 'Sun', lessons: 22 },
  ];
  const maxLessons = Math.max(...weeklyData.map(d => d.lessons));

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cinzel font-black text-2xl md:text-3xl text-gold-400 mb-1">
            {role === 'Super Admin' ? 'Super Admin' : 'Admin'} Panel
          </h1>
          <p className="text-cream/50 font-crimson">Platform overview and management</p>
        </div>
        <span className={`badge ${role === 'Super Admin' ? 'badge-red' : 'badge-gold'} text-sm px-3 py-1`}>
          {role}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: 'rgba(5,26,15,0.6)', border: '1px solid rgba(245,158,11,0.1)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-cinzel transition-all
              ${tab === t.id ? 'bg-gold-600 text-emerald-950 font-bold' : 'text-cream/50 hover:text-cream/80'}`}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* Analytics Tab */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Students" value={analytics.totalStudents} change={12} color="#10b981" />
            <StatCard icon={Activity} label="Active Today" value={analytics.activeToday} change={5} color="#f59e0b" />
            <StatCard icon={BookOpen} label="Courses Live" value={analytics.coursesPublished} color="#6ee7b7" />
            <StatCard icon={Award} label="Certs Issued" value={analytics.certificatesIssued} change={8} color="#d97706" />
          </div>

          {/* Weekly activity chart */}
          <div className="glass-card p-5">
            <h3 className="font-cinzel font-bold text-gold-400 text-sm mb-5 flex items-center gap-2">
              <BarChart3 size={16} /> Weekly Lesson Activity
            </h3>
            <div className="flex items-end gap-3 h-40">
              {weeklyData.map(({ day, lessons }) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-cinzel text-cream/40">{lessons}</span>
                  <div className="w-full rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${(lessons / maxLessons) * 100}%`,
                      background: `linear-gradient(to top, #065f46, #10b981)`,
                      minHeight: 4,
                      boxShadow: '0 0 8px rgba(16,185,129,0.3)',
                    }} />
                  <span className="text-[10px] font-cinzel text-cream/40">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top courses */}
          <div className="glass-card p-5">
            <h3 className="font-cinzel font-bold text-gold-400 text-sm mb-4">Course Completion Rates</h3>
            <div className="space-y-3">
              {COURSES.slice(0, 5).map((c, i) => {
                const pct = [78, 64, 55, 82, 48][i];
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="text-xs font-cinzel text-cream/30 w-4">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-crimson text-cream/70 truncate">{c.title}</span>
                        <span className="text-xs font-cinzel text-emerald-400 ml-2">{pct}%</span>
                      </div>
                      <ProgressBar value={pct} showLabel={false} height={4} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-cinzel font-bold text-gold-400">Mock Users</h2>
            <button className="btn-gold text-xs px-4 py-2">+ Add User</button>
          </div>
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(245,158,11,0.15)' }}>
                  {['Name', 'Email', 'Courses', 'Lessons', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-cinzel text-gold-500/60 tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_STUDENTS.map(s => (
                  <tr key={s.id} className="transition-colors hover:bg-emerald-900/10"
                    style={{ borderBottom: '1px solid rgba(16,185,129,0.06)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-cinzel text-gold-400">{s.name[0]}</div>
                        <span className="text-sm font-crimson text-cream/80">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-crimson text-cream/40">{s.email}</td>
                    <td className="px-4 py-3 font-cinzel text-gold-400 text-sm">{s.coursesEnrolled}</td>
                    <td className="px-4 py-3 font-cinzel text-emerald-400 text-sm">{s.lessonsCompleted}</td>
                    <td className="px-4 py-3 text-xs font-crimson text-cream/40">{new Date(s.joinDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="text-[10px] badge badge-emerald">Edit</button>
                        <button className="text-[10px] badge badge-red">Block</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {tab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-cinzel font-bold text-gold-400">All Courses</h2>
            <span className="text-sm font-crimson text-cream/40">{COURSES.length} total</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {COURSES.map(c => (
              <div key={c.id} className="glass-card flex items-center gap-3 p-3">
                <img src={c.thumbnail} alt={c.title} className="w-14 h-10 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-cinzel font-bold text-gold-400 text-xs truncate">{c.title}</p>
                  <p className="text-cream/30 text-xs font-crimson">{c.totalLessons} lessons · {c.category}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <span className="badge badge-emerald text-[9px]">Live</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Super Admin Settings Tab */}
      {tab === 'settings' && role === 'Super Admin' && (
        <div className="max-w-2xl space-y-5">
          <h2 className="font-cinzel font-bold text-gold-400 text-lg">Super Admin Controls</h2>
          
          {[
            { label: 'Platform Name', value: 'Ali Nawaz Academy', desc: 'Displayed in navbar and certificates' },
            { label: 'Academy Tagline', value: 'أكاديمية علي نواز', desc: 'Arabic subtitle' },
            { label: 'Default Role', value: 'Student', desc: 'Role assigned to new users' },
            { label: 'Certificate Signatory', value: 'Ali Nawaz Academy Board', desc: 'Name on certificates' },
          ].map(item => (
            <div key={item.label} className="glass-card p-4">
              <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1">{item.label.toUpperCase()}</label>
              <input defaultValue={item.value}
                className="w-full px-3 py-2 rounded-lg text-sm font-crimson text-cream outline-none mb-1"
                style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.2)' }} />
              <p className="text-xs text-cream/30 font-crimson">{item.desc}</p>
            </div>
          ))}

          {/* Certificate template selector */}
          <div className="glass-card p-4">
            <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-3">CERTIFICATE TEMPLATE</label>
            <div className="grid grid-cols-3 gap-3">
              {['Classic Gold', 'Emerald Sage', 'Royal Blue'].map((t, i) => (
                <button key={t}
                  className={`p-3 rounded-xl text-xs font-cinzel text-center transition-all
                    ${i === 0 ? 'border-2 border-gold-500 text-gold-400 bg-gold-900/20' : 'border border-cream/10 text-cream/30 hover:border-gold-500/40'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-gold w-full py-3">Save Settings</button>
        </div>
      )}
    </div>
  );
}
