import React, { useMemo } from 'react';
import { GlassCard } from './GlassCard';
import { ActivityLog } from '../types';

interface YearlyViewProps {
  activities: ActivityLog[];
  year: number;
  onDateSelect: (date: Date) => void;
}

export const YearlyView: React.FC<YearlyViewProps> = ({ activities, year, onDateSelect }) => {
  const months = Array.from({ length: 12 }, (_, i) => i); // 0..11

  // Group activities by "YYYY-MM-DD" for fast lookup
  const activitiesMap = useMemo(() => {
    const map: Record<string, number> = {}; // DateString -> count
    activities.forEach(act => {
      const dateKey = new Date(act.startTime).toDateString();
      map[dateKey] = (map[dateKey] || 0) + 1;
    });
    return map;
  }, [activities]);

  // Helper to get days in month
  const getMonthData = (monthIndex: number) => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDay = new Date(year, monthIndex, 1).getDay(); // 0 = Sunday
    return { daysInMonth, firstDay };
  };

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">{year}</h2>
        <p className="text-xs text-blue-200">Pilih tanggal untuk melihat detail aktivitas</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {months.map((monthIndex) => {
          const { daysInMonth, firstDay } = getMonthData(monthIndex);
          const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
          const emptySlots = Array.from({ length: firstDay });

          return (
            <GlassCard key={monthIndex} className="p-3 hover:bg-white/10 transition-colors">
              <h3 className="text-sm font-bold text-white mb-2 text-center border-b border-white/10 pb-1">
                {monthNames[monthIndex]}
              </h3>
              
              {/* Mini Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Day Headers (S, M, T...) */}
                {['M','S','S','R','K','J','S'].map((d, i) => (
                    <span key={i} className="text-[8px] font-bold text-blue-200 opacity-60">{d}</span>
                ))}

                {/* Empty Slots */}
                {emptySlots.map((_, i) => <div key={`empty-${i}`} />)}

                {/* Days */}
                {days.map(day => {
                  const dateObj = new Date(year, monthIndex, day);
                  const dateKey = dateObj.toDateString();
                  const count = activitiesMap[dateKey] || 0;
                  const isToday = new Date().toDateString() === dateKey;

                  return (
                    <button
                      key={day}
                      onClick={() => onDateSelect(dateObj)}
                      className={`
                        aspect-square flex flex-col items-center justify-center rounded-sm relative transition-all
                        ${isToday ? 'bg-blue-600 text-white font-bold ring-1 ring-blue-400' : 'text-white/70 hover:bg-white/20'}
                        ${count > 0 && !isToday ? 'font-medium text-white' : ''}
                      `}
                    >
                      <span className="text-[10px] z-10">{day}</span>
                      
                      {/* Activity Dot Indicator */}
                      {count > 0 && (
                        <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-emerald-400'}`}></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
