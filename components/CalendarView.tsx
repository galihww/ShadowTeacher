import React, { useMemo } from 'react';
import { GlassCard } from './GlassCard';
import { ActivityLog } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  activities: ActivityLog[];
  onDateSelect: (date: Date) => void;
  currentDate: Date; // Tanggal referensi untuk bulan yang ditampilkan (biasanya hari ini)
}

export const CalendarView: React.FC<CalendarViewProps> = ({ activities, onDateSelect, currentDate }) => {
  // Helper: Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper: Get day of week for the 1st of the month (0 = Sunday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  // Create array for empty slots before the 1st
  const emptySlots = Array.from({ length: firstDay });
  
  // Create array for days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Group activities by date for indicators
  const activitiesByDate = useMemo(() => {
    const map: Record<number, ActivityLog[]> = {};
    activities.forEach(act => {
      const d = new Date(act.startTime);
      // Filter only for current viewed month/year
      if (d.getMonth() === month && d.getFullYear() === year) {
        const dayNum = d.getDate();
        if (!map[dayNum]) map[dayNum] = [];
        map[dayNum].push(act);
      }
    });
    return map;
  }, [activities, month, year]);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xl font-bold text-white">
          {monthNames[month]} {year}
        </h2>
        {/* Navigation placeholder if needed in future */}
        <div className="flex gap-2">
            {/* Tombol navigasi bulan bisa ditambahkan di sini nanti */}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center mb-2">
        {dayNames.map(d => (
          <div key={d} className="text-xs font-medium text-blue-200 opacity-70">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {emptySlots.map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const dateObj = new Date(year, month, day);
          const isToday = new Date().toDateString() === dateObj.toDateString();
          const dayActivities = activitiesByDate[day] || [];
          const count = dayActivities.length;
          
          // Check for flags (tantrum/high sensory) to color the dot
          const hasIssues = dayActivities.some(a => a.flags.tantrum || a.flags.aggression);
          
          return (
            <GlassCard
              key={day}
              onClick={() => onDateSelect(dateObj)}
              className={`
                aspect-square flex flex-col items-center justify-center cursor-pointer relative
                ${isToday ? 'bg-blue-600/30 border-blue-400' : 'hover:bg-white/20'}
              `}
            >
              <span className={`text-sm font-semibold ${isToday ? 'text-white' : 'text-white/80'}`}>
                {day}
              </span>
              
              {/* Activity Indicators */}
              {count > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {/* Show max 3 dots */}
                  {Array.from({ length: Math.min(count, 3) }).map((_, idx) => (
                    <div 
                      key={idx}
                      className={`
                        w-1 h-1 rounded-full 
                        ${hasIssues ? 'bg-red-400' : 'bg-emerald-400'}
                      `}
                    />
                  ))}
                  {count > 3 && <span className="text-[8px] leading-none text-white/50">+</span>}
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
      
      <GlassCard className="p-3 mt-4 text-xs text-center text-blue-200">
        <p>Klik tanggal untuk melihat detail aktivitas harian.</p>
      </GlassCard>
    </div>
  );
};