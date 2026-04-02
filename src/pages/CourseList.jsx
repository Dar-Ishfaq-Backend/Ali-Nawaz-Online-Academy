import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import AalimProgramCard from '../components/AalimProgramCard';
import { AALIM_PROGRAM } from '../data/courses';
import { useApp } from '../context/AppContext';

export default function CourseList() {
  const { courses, enrollments } = useApp();
  const [search, setSearch] = useState('');
  const [access, setAccess] = useState('All');
  const [instructor, setInstructor] = useState('All');

  const accessOptions = useMemo(
    () => ['All', 'Paid', 'Free'],
    [courses],
  );

  const instructors = useMemo(
    () => ['All', ...new Set(courses.map((course) => course.instructor).filter(Boolean))],
    [courses],
  );

  const requiredAalimCourses = useMemo(
    () => AALIM_PROGRAM.requiredCourseIds
      .map((courseId) => courses.find((course) => course.id === courseId))
      .filter(Boolean),
    [courses],
  );

  const filtered = useMemo(() => courses.filter((course) => {
    const matchSearch = course.title?.toLowerCase().includes(search.toLowerCase())
      || course.description?.toLowerCase().includes(search.toLowerCase())
      || course.instructor?.toLowerCase().includes(search.toLowerCase());
    const matchAccess = access === 'All'
      || (access === 'Paid' && course.is_paid)
      || (access === 'Free' && !course.is_paid);
    const matchInstructor = instructor === 'All' || course.instructor === instructor;
    return matchSearch && matchAccess && matchInstructor;
  }), [access, courses, instructor, search]);

  const courseGroups = useMemo(() => ([
    {
      id: 'paid',
      label: 'Paid Courses',
      courses: filtered.filter((course) => course.is_paid),
    },
    {
      id: 'free',
      label: 'Free Courses',
      courses: filtered.filter((course) => !course.is_paid),
    },
  ]).filter((group) => group.courses.length > 0), [filtered]);

  return (
    <div className="animate-fade-in space-y-6">
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-10 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(5,26,15,0.9) 0%, rgba(6,78,59,0.3) 100%)',
          border: '1px solid rgba(245,158,11,0.2)',
        }}
      >
        <p className="font-amiri text-gold-400 text-2xl mb-2">علم النافع</p>
        <h1 className="font-cinzel font-black text-3xl text-cream mb-2">Course Catalog</h1>
        <p className="text-cream/50 font-crimson">Explore the Ali Nawaz Academy learning library</p>
      </div>

      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.15)' }}
        >
          <Search size={15} className="text-gold-500 opacity-60" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search courses..."
            className="flex-1 bg-transparent text-sm font-crimson text-cream placeholder-cream/30 outline-none"
          />
        </div>

        <select
          value={access}
          onChange={(event) => setAccess(event.target.value)}
          className="px-3 py-2 rounded-lg text-sm font-crimson text-cream/80 outline-none cursor-pointer"
          style={{ background: 'rgba(6,78,59,0.3)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          {accessOptions.map((value) => (
            <option key={value} value={value} style={{ background: '#051a0f' }}>
              {value}
            </option>
          ))}
        </select>

        <select
          value={instructor}
          onChange={(event) => setInstructor(event.target.value)}
          className="px-3 py-2 rounded-lg text-sm font-crimson text-cream/80 outline-none cursor-pointer"
          style={{ background: 'rgba(6,78,59,0.3)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          {instructors.map((value) => (
            <option key={value} value={value} style={{ background: '#051a0f' }}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-crimson text-cream/40">
          {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
        </span>
        {(search || access !== 'All' || instructor !== 'All') && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setAccess('All');
              setInstructor('All');
            }}
            className="text-xs text-gold-400 hover:text-gold-300 underline font-crimson"
          >
            Clear filters
          </button>
        )}
      </div>

      {(access === 'All' || access === 'Paid') && (
        <AalimProgramCard requiredCourses={requiredAalimCourses} />
      )}

      {courseGroups.map((group) => (
        <section key={group.id}>
          <div className="flex items-center gap-3 mb-4">
            <div className="gold-divider flex-1" />
            <h2 className="font-cinzel font-bold text-gold-400 text-lg">{group.label}</h2>
            <div className="gold-divider flex-1" />
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {group.courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrolled={Boolean(enrollments[course.id])}
                />
              ))}
          </div>
        </section>
      ))}

      {filtered.length === 0 && (
        <div className="glass-card p-16 text-center">
          <p className="font-cinzel text-cream/30 text-lg">No courses match your filters</p>
        </div>
      )}
    </div>
  );
}
