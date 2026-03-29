import { Flame, Trophy, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Get array of last 7 day labels + date strings
function getLast7Days() {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push({
      label: dayNames[d.getDay()],
      dateStr: d.toISOString().split('T')[0],
    });
  }
  return days;
}

export default function StreakWidget({ compact = false }) {
  const { streak } = useApp();
  const days = getLast7Days();
  const studiedSet = new Set(streak.weekDays || []);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Flame size={16} className="text-orange-400" />
        <span className="font-cinzel font-bold text-orange-300 text-sm">{streak.currentStreak}</span>
        <span className="text-xs text-cream/40 font-crimson">day streak</span>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame size={20} className="text-orange-400" />
          <h3 className="font-cinzel font-bold text-gold-400 text-sm tracking-wide">LEARNING STREAK</h3>
        </div>
        <div className="flex items-center gap-1">
          <Trophy size={13} className="text-gold-500" />
          <span className="text-xs font-crimson text-cream/50">Best: {streak.longestStreak} days</span>
        </div>
      </div>

      {/* Big streak number */}
      <div className="flex items-end gap-3 mb-5">
        <div className="streak-badge text-2xl px-4 py-2">
          🔥 {streak.currentStreak}
        </div>
        <div className="text-sm font-crimson text-cream/50 pb-1">
          consecutive day{streak.currentStreak !== 1 ? 's' : ''}
        </div>
      </div>

      {/* 7-day grid */}
      <div className="mb-2">
        <div className="flex items-center gap-1 mb-2">
          <Calendar size={12} className="text-gold-500/50" />
          <span className="text-[10px] font-cinzel text-gold-500/40 tracking-widest">THIS WEEK</span>
        </div>
        <div className="flex gap-1.5">
          {days.map(({ label, dateStr }) => {
            const studied = studiedSet.has(dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            return (
              <div key={dateStr} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-sm
                  ${studied
                    ? 'bg-gradient-to-b from-orange-500 to-orange-700 shadow-[0_2px_8px_rgba(249,115,22,0.4)]'
                    : isToday
                      ? 'bg-emerald-800/40 border border-emerald-600/40'
                      : 'bg-emerald-950/50 border border-emerald-900/30'
                  }`}>
                  {studied ? '🔥' : isToday ? '📖' : ''}
                </div>
                <span className={`text-[9px] font-cinzel ${isToday ? 'text-gold-400' : 'text-cream/30'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivation line */}
      <div className="gold-divider" />
      <p className="text-xs font-amiri text-center text-cream/40 italic">
        {streak.currentStreak === 0
          ? '"The journey of a thousand miles begins with one step."'
          : streak.currentStreak >= 7
            ? '"Indeed, with hardship comes ease." — Quran 94:6 ✨'
            : '"Seek knowledge from the cradle to the grave." — Hadith'}
      </p>
    </div>
  );
}
