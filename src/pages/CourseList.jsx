import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { COURSES } from '../data/courses';
import { useApp } from '../context/AppContext';
import CourseCard from '../components/CourseCard';

const CATEGORIES = ['All', 'Aalim Course', 'Seerah Course'];
const SUBJECTS = ['All', 'Quran', 'Hadith', 'Fiqh', 'Sarf', 'Nahw', 'Arabic', 'Seerah'];

export default function CourseList() {
  const { enrollments } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [subject, setSubject] = useState('All');

  const filtered = COURSES.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase())
      || c.description.toLowerCase().includes(search.toLowerCase())
      || c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || c.category === category;
    const matchSub = subject === 'All' || c.subject === subject;
    return matchSearch && matchCat && matchSub;
  });

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-10 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(5,26,15,0.9) 0%, rgba(6,78,59,0.3) 100%)',
          border: '1px solid rgba(245,158,11,0.2)',
        }}>
        <p className="font-amiri text-gold-400 text-2xl mb-2">علم النافع</p>
        <h1 className="font-cinzel font-black text-3xl text-cream mb-2">Course Catalog</h1>
        <p className="text-cream/50 font-crimson">Explore our complete Islamic curriculum</p>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <Search size={15} className="text-gold-500 opacity-60" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search courses, instructors..."
            className="flex-1 bg-transparent text-sm font-crimson text-cream placeholder-cream/30 outline-none" />
        </div>

        {/* Category filter */}
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm font-crimson text-cream/80 outline-none cursor-pointer"
          style={{ background: 'rgba(6,78,59,0.3)', border: '1px solid rgba(245,158,11,0.2)' }}>
          {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#051a0f' }}>{c}</option>)}
        </select>

        {/* Subject filter */}
        <select value={subject} onChange={e => setSubject(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm font-crimson text-cream/80 outline-none cursor-pointer"
          style={{ background: 'rgba(6,78,59,0.3)', border: '1px solid rgba(245,158,11,0.2)' }}>
          {SUBJECTS.map(s => <option key={s} value={s} style={{ background: '#051a0f' }}>{s}</option>)}
        </select>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-crimson text-cream/40">
          {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
        </span>
        {(search || category !== 'All' || subject !== 'All') && (
          <button onClick={() => { setSearch(''); setCategory('All'); setSubject('All'); }}
            className="text-xs text-gold-400 hover:text-gold-300 underline font-crimson">
            Clear filters
          </button>
        )}
      </div>

      {/* Aalim Course section */}
      {(category === 'All' || category === 'Aalim Course') && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="gold-divider flex-1" />
            <h2 className="font-cinzel font-bold text-gold-400 text-lg whitespace-nowrap">Aalim Course</h2>
            <div className="gold-divider flex-1" />
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.filter(c => c.category === 'Aalim Course').map(c => (
              <CourseCard key={c.id} course={c} enrolled={!!enrollments[c.id]} />
            ))}
          </div>
        </section>
      )}

      {/* Seerah Course section */}
      {(category === 'All' || category === 'Seerah Course') && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="gold-divider flex-1" />
            <h2 className="font-cinzel font-bold text-gold-400 text-lg whitespace-nowrap">Seerah Course</h2>
            <div className="gold-divider flex-1" />
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.filter(c => c.category === 'Seerah Course').map(c => (
              <CourseCard key={c.id} course={c} enrolled={!!enrollments[c.id]} />
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="glass-card p-16 text-center">
          <p className="font-cinzel text-cream/30 text-lg">No courses match your filters</p>
        </div>
      )}
    </div>
  );
}
