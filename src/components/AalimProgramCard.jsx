import { Link } from 'react-router-dom';
import { BookOpenCheck, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import { AALIM_PROGRAM } from '../data/courses';

const formatPKR = (amount) => `PKR ${new Intl.NumberFormat('en-PK').format(Math.max(0, Number(amount) || 0))}`;

export default function AalimProgramCard({ requiredCourses = [] }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="relative px-6 py-7"
        style={{
          background: 'linear-gradient(135deg, rgba(5,26,15,0.92) 0%, rgba(6,78,59,0.38) 52%, rgba(124,45,18,0.26) 100%)',
          borderBottom: '1px solid rgba(245,158,11,0.14)',
        }}>
        <div className="absolute -right-10 -top-12 w-40 h-40 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.55), transparent 65%)' }} />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-cinzel text-emerald-300"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <ShieldCheck size={12} />
              Full Aalim Certificate Path
            </div>
            <h2 className="font-cinzel font-black text-2xl md:text-3xl text-gold-400 mt-4">
              {AALIM_PROGRAM.title}
            </h2>
            <p className="text-cream/60 font-crimson mt-3 leading-relaxed">
              {AALIM_PROGRAM.description}
            </p>
          </div>

          <div className="rounded-2xl px-4 py-4 min-w-[220px]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold-500/60 font-cinzel">Program Price</p>
            <p className="font-cinzel font-black text-3xl text-gold-400 mt-2">{formatPKR(AALIM_PROGRAM.pricePKR)}</p>
            <p className="text-xs font-crimson text-cream/45 mt-2">
              Includes the full subject path needed for the Aalim certificate.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 text-sm font-cinzel text-gold-400">
            <BookOpenCheck size={15} />
            {requiredCourses.length} core subjects
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-crimson text-emerald-300">
            <Sparkles size={14} />
            Structured from Quran to Tafsir
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {requiredCourses.map((course) => (
            <span
              key={course.id}
              className="rounded-full px-3 py-1.5 text-xs font-cinzel text-cream/80"
              style={{ background: 'rgba(6,78,59,0.18)', border: '1px solid rgba(245,158,11,0.16)' }}
            >
              {course.subject}
            </span>
          ))}
        </div>

        <Link
          to="/aalim-program"
          className="inline-flex items-center gap-2 btn-gold text-sm px-5 py-3"
        >
          View Complete Aalim Path
          <ChevronRight size={15} />
        </Link>
      </div>
    </div>
  );
}
