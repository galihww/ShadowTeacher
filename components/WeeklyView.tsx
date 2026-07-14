import React, { useMemo } from 'react';
import { GlassCard } from './GlassCard';
import { ActivityLog } from '../types';
import { ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface WeeklyViewProps {
  activities: ActivityLog[];
  onDateSelect: (date: Date) => void;
  currentDate: Date;
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({ activities, onDateSelect, currentDate }) => {
  // Helper: Get Monday of the current week based on currentDate
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
  };

  const startOfWeek = useMemo(() => getMonday(currentDate), [currentDate]);

  // Generate 7 days array
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [startOfWeek]);

  // Group activities by date string (YYYY-MM-DD)
  const activitiesByDate = useMemo(() => {
    const map: Record<string, ActivityLog[]> = {};
    activities.forEach(act => {
      const dateKey = new Date(act.startTime).toDateString();
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(act);
    });
    return map;
  }, [activities]);

  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  return (
    <div className="space-y-3">
      <div className="px-2 mb-4">
        <h2 className="text-lg font-bold text-white">
          Minggu Ini
        </h2>
        <p className="text-xs text-blue-200">
          {startOfWeek.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} - {weekDays[6].toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {weekDays.map((dateObj) => {
        const dateKey = dateObj.toDateString();
        const dayActivities = activitiesByDate[dateKey] || [];
        const count = dayActivities.length;
        const isToday = new Date().toDateString() === dateKey;
        
        // Check for specific flags to show quick indicators
        const hasTantrum = dayActivities.some(a => a.flags.tantrum || a.flags.aggression);
        const hasSensory = dayActivities.some(a => a.flags.sensoryHigh);

        return (
          <GlassCard
            key={dateKey}
            onClick={() => onDateSelect(dateObj)}
            className={`
              p-4 flex items-center justify-between cursor-pointer group transition-all
              ${isToday ? 'bg-blue-600/20 border-blue-400/60' : 'hover:bg-white/10'}
            `}
          >
            <div className="flex items-center gap-4">
              <div className={`
                flex flex-col items-center justify-center w-12 h-12 rounded-xl border 
                ${isToday ? 'bg-blue-500 text-white border-blue-400' : 'bg-white/5 text-blue-200 border-white/10'}
              `}>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                  {dayNames[dateObj.getDay()].substring(0, 3)}
                </span>
                <span className="text-lg font-bold leading-none">
                  {dateObj.getDate()}
                </span>
              </div>
              
              <div>
                <h3 className={`font-medium ${isToday ? 'text-white' : 'text-blue-100'}`}>
                  {dayNames[dateObj.getDay()]}
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/60 mt-0.5">
                  <span>{count} Aktivitas</span>
                  {count > 0 && (
                     <>
                        <span className="w-1 h-1 rounded-full bg-white/30" />
                        {hasTantrum ? (
                             <span className="text-red-400 flex items-center gap-1">
                                <AlertCircle size={10} /> Perlu Perhatian
                             </span>
                        ) : (
                             <span className="text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 size={10} /> Aman
                             </span>
                        )}
                     </>
                  )}
                </div>
              </div>
            </div>

            <ChevronRight size={18} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </GlassCard>
        );
      })}
    </div>
  );
};