import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, BookOpen, Award, BarChart3, Shield, Settings, Activity, PencilLine, UserPlus, Upload, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAnalytics } from '../utils/storage';
import CertificateGenerator from '../components/CertificateGenerator';
import ProgressBar from '../components/ProgressBar';

const ROLE_RANK = {
  Student: 0,
  Teacher: 1,
  Admin: 2,
  'Super Admin': 3,
};

const EMPTY_USER_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'Student',
};
const MAX_SIGNATURE_FILE_SIZE = 2 * 1024 * 1024;
const SIGNATURE_MAX_WIDTH = 480;
const SIGNATURE_MAX_HEIGHT = 160;

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
  reader.onerror = () => reject(new Error('The signature file could not be read.'));
  reader.readAsDataURL(file);
});

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('The selected file could not be opened as an image.'));
  image.src = src;
});

const convertSignatureToPng = async (file) => {
  const sourceUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceUrl);
  const scale = Math.min(1, SIGNATURE_MAX_WIDTH / image.width, SIGNATURE_MAX_HEIGHT / image.height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('The signature preview could not be prepared.');
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/png');
};

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
  const location = useLocation();
  const navigate = useNavigate();
  const {
    role,
    currentUser,
    users,
    courses,
    assignableRoles,
    addUser,
    updateUser,
    toggleUserBlocked,
    platformSettings,
    certificateTemplates,
    savePlatformSettings,
  } = useApp();
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM);
  const [feedback, setFeedback] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(platformSettings.certificateTemplate);
  const [selectedSignature, setSelectedSignature] = useState(platformSettings.certificateSignature || '');
  const signatureInputRef = useRef(null);
  const analytics = getAnalytics();
  const tab = useMemo(() => {
    if (location.pathname === '/admin/users') return 'users';
    if (location.pathname === '/admin/courses') return 'courses';
    if (location.pathname === '/admin/settings') return 'settings';
    return 'analytics';
  }, [location.pathname]);

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'courses', label: 'Courses', icon: BookOpen, path: '/admin/courses' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const weeklyData = [
    { day: 'Mon', lessons: 42 },
    { day: 'Tue', lessons: 68 },
    { day: 'Wed', lessons: 55 },
    { day: 'Thu', lessons: 91 },
    { day: 'Fri', lessons: 73 },
    { day: 'Sat', lessons: 38 },
    { day: 'Sun', lessons: 22 },
  ];
  const maxLessons = Math.max(...weeklyData.map((d) => d.lessons));

  const editableRoles = useMemo(() => (
    editingUserId === currentUser?.id ? [currentUser.role] : assignableRoles
  ), [assignableRoles, currentUser, editingUserId]);
  const selectedTemplateMeta = useMemo(() => (
    certificateTemplates.find((template) => template.id === selectedTemplate) || certificateTemplates[0]
  ), [certificateTemplates, selectedTemplate]);
  const savedTemplateMeta = useMemo(() => (
    certificateTemplates.find((template) => template.id === platformSettings.certificateTemplate) || certificateTemplates[0]
  ), [certificateTemplates, platformSettings.certificateTemplate]);
  const previewCertificate = useMemo(() => ({
    id: 'ANA-PREVIEW-001',
    studentName: 'Amina Yusuf',
    courseName: 'Advanced Tajweed Foundations',
    issuedAt: '2026-03-29T00:00:00.000Z',
  }), []);
  const savedSignature = platformSettings.certificateSignature || '';
  const templateChanged = selectedTemplate !== platformSettings.certificateTemplate;
  const signatureChanged = selectedSignature !== savedSignature;
  const settingsChanged = templateChanged || signatureChanged;

  useEffect(() => {
    setSelectedTemplate(platformSettings.certificateTemplate);
  }, [platformSettings.certificateTemplate]);

  useEffect(() => {
    setSelectedSignature(platformSettings.certificateSignature || '');
  }, [platformSettings.certificateSignature]);

  if (role === 'Student' || role === 'Teacher') {
    return (
      <div className="glass-card p-16 text-center animate-fade-in">
        <Shield size={40} className="text-cream/10 mx-auto mb-4" />
        <p className="font-cinzel text-cream/30 text-lg">Access Denied</p>
        <p className="text-cream/20 font-crimson mt-2">Admin and Super Admin only.</p>
      </div>
    );
  }

  const canManageUser = (user) => {
    if (!currentUser) return false;
    if (user.id === currentUser.id) return true;
    if (role === 'Super Admin') return true;
    if (role === 'Admin') return ROLE_RANK[user.role] < ROLE_RANK.Admin;
    return false;
  };

  const canBlockUser = (user) => user.id !== currentUser?.id && canManageUser(user);

  const startAddUser = () => {
    setEditingUserId(null);
    setUserForm(EMPTY_USER_FORM);
    setShowUserForm(true);
    setFeedback(null);
  };

  const startEditUser = (user) => {
    setEditingUserId(user.id);
    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setShowUserForm(true);
    setFeedback(null);
  };

  const resetUserEditor = () => {
    setEditingUserId(null);
    setUserForm(EMPTY_USER_FORM);
    setShowUserForm(false);
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: userForm.name,
      email: userForm.email,
      role: userForm.role,
    };

    if (userForm.password) {
      payload.password = userForm.password;
    }

    const result = editingUserId
      ? updateUser(editingUserId, payload)
      : addUser({
        ...payload,
        password: userForm.password || 'Password123!',
      });

    if (!result.ok) {
      setFeedback({ type: 'error', text: result.message });
      return;
    }

    setFeedback({ type: 'success', text: editingUserId ? 'User updated successfully.' : 'User created successfully.' });
    resetUserEditor();
  };

  const handleToggleBlocked = (user) => {
    const result = toggleUserBlocked(user.id);
    setFeedback({
      type: result.ok ? 'success' : 'error',
      text: result.ok
        ? `${user.name} has been ${user.blocked ? 'unblocked' : 'blocked'}.`
        : result.message,
    });
  };

  const handleSettingsSave = () => {
    const result = savePlatformSettings({
      certificateTemplate: selectedTemplate,
      certificateSignature: selectedSignature,
    });

    let successText = 'Certificate settings are already live.';
    if (templateChanged && signatureChanged) {
      successText = 'Certificate template and signature are now live.';
    } else if (templateChanged) {
      successText = `${selectedTemplateMeta.name} is now the active certificate template.`;
    } else if (signatureChanged) {
      successText = selectedSignature
        ? 'The certificate signature is now live.'
        : 'The certificate signature has been removed.';
    }

    setFeedback({
      type: result.ok ? 'success' : 'error',
      text: result.ok
        ? successText
        : result.message,
    });
  };

  const handleSignatureUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    const isImageFile = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name);
    if (!isImageFile) {
      setFeedback({ type: 'error', text: 'Please choose an image file for the signature.' });
      return;
    }

    if (file.size > MAX_SIGNATURE_FILE_SIZE) {
      setFeedback({ type: 'error', text: 'Please keep the signature PNG under 2 MB.' });
      return;
    }

    try {
      const normalizedSignature = await convertSignatureToPng(file);
      const result = savePlatformSettings({ certificateSignature: normalizedSignature });

      if (!result.ok) {
        setFeedback({ type: 'error', text: result.message });
        return;
      }

      setSelectedSignature(normalizedSignature);
      setFeedback({ type: 'success', text: `${file.name} has been saved as the live certificate signature.` });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message || 'The signature file could not be processed.' });
    }
  };

  const handleSignatureClear = () => {
    const result = savePlatformSettings({ certificateSignature: '' });

    if (!result.ok) {
      setFeedback({ type: 'error', text: result.message });
      return;
    }

    setSelectedSignature('');
    setFeedback({ type: 'success', text: 'The live certificate signature has been removed.' });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: 'rgba(5,26,15,0.6)', border: '1px solid rgba(245,158,11,0.1)' }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => navigate(t.path)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-cinzel transition-all
              ${tab === t.id ? 'bg-gold-600 text-emerald-950 font-bold' : 'text-cream/50 hover:text-cream/80'}`}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
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

      {tab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Students" value={analytics.totalStudents} change={12} color="#10b981" />
            <StatCard icon={Activity} label="Active Today" value={analytics.activeToday} change={5} color="#f59e0b" />
            <StatCard icon={BookOpen} label="Courses Live" value={analytics.coursesPublished} color="#6ee7b7" />
            <StatCard icon={Award} label="Certs Issued" value={analytics.certificatesIssued} change={8} color="#d97706" />
          </div>

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
                      background: 'linear-gradient(to top, #065f46, #10b981)',
                      minHeight: 4,
                      boxShadow: '0 0 8px rgba(16,185,129,0.3)',
                    }} />
                  <span className="text-[10px] font-cinzel text-cream/40">{day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-cinzel font-bold text-gold-400 text-sm mb-4">Course Completion Rates</h3>
            <div className="space-y-3">
              {courses.slice(0, 5).map((course, index) => {
                const pct = [78, 64, 55, 82, 48][index] || 40;
                return (
                  <div key={course.id} className="flex items-center gap-3">
                    <span className="text-xs font-cinzel text-cream/30 w-4">{index + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-crimson text-cream/70 truncate">{course.title}</span>
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

      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-cinzel font-bold text-gold-400">User Accounts</h2>
            <button type="button" onClick={startAddUser} className="btn-gold text-xs px-4 py-2 inline-flex items-center gap-2">
              <UserPlus size={14} />
              Add User
            </button>
          </div>

          {showUserForm && (
            <form onSubmit={handleUserSubmit} className="glass-card p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-cinzel font-bold text-gold-400 text-sm">
                  {editingUserId ? 'Edit User' : 'Create User'}
                </h3>
                <button type="button" onClick={resetUserEditor} className="text-xs font-crimson text-cream/40 hover:text-cream/70">
                  Cancel
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">FULL NAME</label>
                  <input
                    value={userForm.name}
                    onChange={(e) => setUserForm((current) => ({ ...current, name: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                    style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.2)' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">EMAIL</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm((current) => ({ ...current, email: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                    style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.2)' }}
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">
                    {editingUserId ? 'NEW PASSWORD (OPTIONAL)' : 'PASSWORD'}
                  </label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm((current) => ({ ...current, password: e.target.value }))}
                    placeholder={editingUserId ? 'Leave blank to keep current password' : 'Password123!'}
                    className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                    style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.2)' }}
                    required={!editingUserId}
                  />
                </div>
                <div>
                  <label className="block text-xs font-cinzel text-gold-500/60 tracking-wider mb-1.5">ROLE</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm((current) => ({ ...current, role: e.target.value }))}
                    disabled={editingUserId === currentUser?.id}
                    className="w-full px-3 py-2.5 rounded-lg text-sm font-crimson text-cream outline-none"
                    style={{ background: 'rgba(6,78,59,0.3)', border: '1px solid rgba(245,158,11,0.2)' }}
                  >
                    {editableRoles.map((option) => (
                      <option key={option} value={option} style={{ background: '#051a0f' }}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-gold w-full py-3">
                {editingUserId ? 'Save User Changes' : 'Create User'}
              </button>
            </form>
          )}

          <div className="hidden md:block glass-card overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(245,158,11,0.15)' }}>
                  {['Name', 'Role', 'Email', 'Courses', 'Lessons', 'Joined', 'Status', 'Actions'].map((header) => (
                    <th key={header} className="text-left px-4 py-3 text-xs font-cinzel text-gold-500/60 tracking-wider">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-emerald-900/10"
                    style={{ borderBottom: '1px solid rgba(16,185,129,0.06)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-cinzel text-gold-400">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-crimson text-cream/80">{user.name}</p>
                          {user.isDemo && <p className="text-[10px] font-cinzel text-gold-500/60">DEMO</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-cinzel text-gold-400">{user.role}</td>
                    <td className="px-4 py-3 text-xs font-crimson text-cream/40">{user.email}</td>
                    <td className="px-4 py-3 font-cinzel text-gold-400 text-sm">{user.coursesEnrolled}</td>
                    <td className="px-4 py-3 font-cinzel text-emerald-400 text-sm">{user.lessonsCompleted}</td>
                    <td className="px-4 py-3 text-xs font-crimson text-cream/40">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${user.blocked ? 'badge-red' : 'badge-emerald'}`}>
                        {user.blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditUser(user)}
                          disabled={!canManageUser(user)}
                          className="text-[10px] badge badge-emerald disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleBlocked(user)}
                          disabled={!canBlockUser(user)}
                          className="text-[10px] badge badge-red disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {user.blocked ? 'Unblock' : 'Block'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {users.map((user) => (
              <div key={user.id} className="glass-card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-800 flex items-center justify-center text-sm font-cinzel text-gold-400">{user.name[0]}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-crimson text-cream/80">{user.name}</p>
                      <span className={`badge ${user.blocked ? 'badge-red' : 'badge-emerald'}`}>{user.blocked ? 'Blocked' : 'Active'}</span>
                    </div>
                    <p className="text-xs font-crimson text-cream/35 break-all">{user.email}</p>
                    <p className="text-[11px] font-cinzel text-gold-400 mt-1">{user.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-cinzel text-gold-500/60 tracking-wider">COURSES</p>
                    <p className="font-cinzel text-gold-400">{user.coursesEnrolled}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-cinzel text-gold-500/60 tracking-wider">LESSONS</p>
                    <p className="font-cinzel text-emerald-400">{user.lessonsCompleted}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-crimson text-cream/40">{new Date(user.createdAt).toLocaleDateString()}</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => startEditUser(user)}
                      disabled={!canManageUser(user)}
                      className="text-[10px] badge badge-emerald disabled:opacity-40 disabled:cursor-not-allowed">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleToggleBlocked(user)}
                      disabled={!canBlockUser(user)}
                      className="text-[10px] badge badge-red disabled:opacity-40 disabled:cursor-not-allowed">
                      {user.blocked ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'courses' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-cinzel font-bold text-gold-400">All Courses</h2>
              <p className="text-sm font-crimson text-cream/40">{courses.length} total</p>
            </div>
            <Link to="/teacher" className="btn-gold text-xs px-4 py-2 inline-flex items-center gap-2">
              <PencilLine size={14} />
              Manage Course Content
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {courses.map((course) => (
              <div key={course.id} className="glass-card flex items-center gap-3 p-3">
                <img src={course.thumbnail} alt={course.title} className="w-14 h-10 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-cinzel font-bold text-gold-400 text-xs truncate">{course.title}</p>
                  <p className="text-cream/30 text-xs font-crimson">{course.totalLessons} lessons · {course.category}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <span className={`badge ${course.isCustom ? 'badge-gold' : 'badge-emerald'} text-[9px]`}>
                    {course.isCustom ? 'Custom' : 'Live'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="space-y-5">
          <div>
            <h2 className="font-cinzel font-bold text-gold-400 text-lg">Certificate Designer</h2>
            <p className="text-sm text-cream/40 font-crimson mt-1">
              Admin and Super Admin accounts can choose the live certificate template and preview it directly inside the website.
            </p>
          </div>

          <div className="grid xl:grid-cols-[360px,1fr] gap-5 items-start">
            <div className="space-y-4">
              <div className="glass-card p-4 space-y-4">
                <div>
                  <p className="text-xs font-cinzel text-gold-500/60 tracking-wider mb-1">ACTIVE TEMPLATE</p>
                  <p className="font-cinzel font-bold text-gold-400">{savedTemplateMeta.name}</p>
                  <p className="text-xs text-cream/35 font-crimson mt-1">
                    Save a new selection to update the live certificate design across the demo site on this browser.
                  </p>
                  <p className="text-xs text-cream/35 font-crimson mt-2">
                    Live signature: {savedSignature ? 'PNG uploaded' : 'No signature uploaded yet'}
                  </p>
                </div>

                <div className="space-y-3">
                  {certificateTemplates.map((template) => {
                    const isSelected = template.id === selectedTemplate;

                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`w-full rounded-2xl p-3 text-left transition-all ${
                          isSelected ? 'bg-emerald-900/10' : 'hover:bg-emerald-900/5'
                        }`}
                        style={{
                          border: isSelected ? '1px solid rgba(245,158,11,0.45)' : '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <div className="h-16 rounded-xl mb-3" style={{ background: template.swatch }} />
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className={`font-cinzel font-bold text-sm ${isSelected ? 'text-gold-400' : 'text-cream/75'}`}>
                              {template.name}
                            </p>
                            <p className="text-xs font-crimson text-cream/35 mt-1">{template.description}</p>
                          </div>
                          {isSelected && <span className="badge badge-gold text-[10px]">Previewing</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div
                  className="rounded-2xl p-3 space-y-3"
                  style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(6,78,59,0.08)' }}
                >
                  <div>
                    <p className="text-xs font-cinzel text-gold-500/60 tracking-wider mb-1">AUTHORIZED SIGNATURE</p>
                    <p className="text-xs text-cream/35 font-crimson">
                      Upload a signature image to place it above the Authorized By line. It is converted to PNG and saved immediately.
                    </p>
                  </div>

                  <div
                    className="rounded-xl p-3 flex items-center justify-center"
                    style={{ minHeight: 92, border: '1px dashed rgba(245,158,11,0.22)', background: 'rgba(2,15,10,0.35)' }}
                  >
                    {selectedSignature ? (
                      <img
                        src={selectedSignature}
                        alt="Certificate signature preview"
                        className="max-h-16 w-auto object-contain"
                      />
                    ) : (
                      <div className="text-center space-y-1">
                        <p className="text-xs text-cream/30 font-crimson">
                          No signature selected yet
                        </p>
                        <p className="text-[11px] text-cream/25 font-crimson">
                          PNG size should be below 2 MB
                        </p>
                      </div>
                    )}
                  </div>

                  <input
                    ref={signatureInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                    onChange={handleSignatureUpload}
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => signatureInputRef.current?.click()}
                      className="btn-gold text-xs px-4 py-2 inline-flex items-center justify-center gap-2"
                    >
                      <Upload size={13} />
                      Upload Signature
                    </button>
                    <button
                      type="button"
                      onClick={handleSignatureClear}
                      disabled={!selectedSignature}
                      className="px-4 py-2 rounded-lg text-xs font-cinzel border border-cream/10 text-cream/60 hover:text-cream/80 hover:border-gold-500/30 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                    >
                      <Trash2 size={13} />
                      Remove Signature
                    </button>
                  </div>

                  <p className="text-[11px] text-cream/30 font-crimson">
                    Transparent PNGs look best. JPG and WebP uploads are converted to PNG automatically. Keep the saved PNG under 2 MB.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSettingsSave}
                  disabled={!settingsChanged}
                  className="btn-gold w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {settingsChanged ? 'Save Certificate Settings' : 'Settings Already Live'}
                </button>
              </div>

              <div className="glass-card p-4">
                <p className="text-xs font-cinzel text-gold-500/60 tracking-wider mb-1">SELECTED PREVIEW</p>
                <p className="font-cinzel font-bold text-gold-400">{selectedTemplateMeta.name}</p>
                <p className="text-xs text-cream/35 font-crimson mt-1">
                  {role === 'Super Admin'
                    ? 'Super Admin can preview the full certificate here before publishing the change.'
                    : 'Admin can preview the full certificate here before saving the live template.'}
                </p>
                <p className="text-xs text-cream/35 font-crimson mt-2">
                  Preview signature: {selectedSignature ? 'Ready' : 'Not added'}
                </p>
              </div>
            </div>

            <div className="glass-card p-3 sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <p className="text-xs font-cinzel text-gold-500/60 tracking-wider mb-1">LIVE WEBSITE PREVIEW</p>
                  <h3 className="font-cinzel font-bold text-gold-400">{selectedTemplateMeta.name}</h3>
                </div>
                <span className="badge badge-emerald text-[10px] w-fit">Certificate Preview</span>
              </div>

              <CertificateGenerator
                cert={previewCertificate}
                template={selectedTemplate}
                signatureImage={selectedSignature}
                showDownload={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
