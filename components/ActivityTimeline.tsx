import React from 'react';
import { ActivityLog, User, UserRole } from '../types';
import { CATEGORY_COLORS, EMOTION_ICONS, LOCATION_ICONS } from '../constants';
import { GlassCard } from './GlassCard';
import { AlertTriangle, Zap, CheckCircle2, AlertCircle, XCircle, Video, Calendar, MapPin, Baby, ArrowRight, Clock, Edit2, Trash2 } from 'lucide-react';

interface ActivityTimelineProps {
  activities: ActivityLog[];
  user?: User | null; // Pass current user for permission checks
  onEdit?: (activity: ActivityLog) => void;
  onDelete?: (id: string) => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, user, onEdit, onDelete }) => {
  if (activities.length === 0) {
    return (
      <GlassCard className="p-8 text-center opacity-70 border-dashed border-white/20 bg-transparent shadow-none">
        <p>Belum ada aktivitas tercatat untuk periode ini.</p>
      </GlassCard>
    );
  }

  const sorted = [...activities].sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  const getSensoryBadge = (level?: number) => {
    if (!level) return null;
    const colors = {
        1: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        2: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        3: 'bg-red-500/10 text-red-400 border-red-500/20'
    };
    // @ts-ignore
    const style = colors[level] || colors[1];
    
    return (
      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium ${style}`}>
        <Zap size={10} fill="currentColor" />
        <span>Lvl.{level}</span>
      </div>
    );
  };

  const getComplianceBadge = (score?: number) => {
    if (score === undefined) return null;
    let config = { icon: CheckCircle2, text: 'Patuh', style: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    
    if (score === 1) config = { icon: AlertCircle, text: 'Parsial', style: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
    if (score === 0) config = { icon: XCircle, text: 'Menolak', style: 'text-red-400 bg-red-500/10 border-red-500/20' };

    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium ${config.style}`}>
        <Icon size={10} />
        <span>{config.text}</span>
      </div>
    );
  };

  const formatDateHeader = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "Hari Ini";
    if (isYesterday) return "Kemarin";
    
    return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  let lastDateHeader = '';

  return (
    <div className="relative pb-10">
      {/* Vertical Timeline Line - Adjusted closer to left for mobile */}
      <div className="absolute left-3 sm:left-4 top-0 bottom-0 w-px bg-white/10" />

      {sorted.map((act, index) => {
        const start = new Date(act.startTime);
        const end = new Date(act.endTime);
        const formatTime = (d: Date) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        const EmotionIcon = EMOTION_ICONS[act.emotion] || EMOTION_ICONS['Neutral'];
        const LocationIcon = LOCATION_ICONS[act.locationType as any] || LOCATION_ICONS['Rumah'] || MapPin;
        const hasFlags = Object.values(act.flags).some(v => v);

        const dateHeader = formatDateHeader(act.startTime);
        const showHeader = dateHeader !== lastDateHeader;
        if (showHeader) {
          lastDateHeader = dateHeader;
        }

        const catColorClass = CATEGORY_COLORS[act.category as any] || 'bg-slate-500/20 text-slate-100 border-slate-500/30';
        
        // Permission Check for Edit/Delete
        // Allow if Admin, OR if not Parent AND (creator is user OR creator is unknown/mock)
        const canManage = user && (
            user.role === UserRole.ADMIN || 
            (user.role !== UserRole.PARENT && (!act.createdBy || act.createdBy === user.username))
        );

        return (
          // Adjusted Padding Left for Mobile (pl-8 instead of pl-12)
          <div key={act.id} className="relative mb-4 sm:mb-6 pl-8 sm:pl-12 group">
            
            {/* Date Header Sticky */}
            {showHeader && (
              <div className="absolute -left-1 sm:-left-2 top-[-24px] z-10 py-3 flex items-center">
                <div className="bg-[#0f172a] px-2 py-0.5 rounded border border-white/20 flex items-center gap-1.5 text-[10px] font-bold text-blue-200 shadow-md">
                  <Calendar size={10} />
                  {dateHeader}
                </div>
              </div>
            )}
            
            {/* Timeline Dot - Adjusted position for mobile */}
            <div 
                className={`absolute left-[7px] sm:left-[11px] top-4 sm:top-5 w-2.5 h-2.5 rounded-full ring-4 ring-[#0f172a] z-10 ${catColorClass.replace('bg-', 'bg-opacity-100 bg-').split(' ')[0].replace('/20', '')}`}
            />

            <GlassCard className="p-0 overflow-hidden hover:bg-white/5 transition-colors group/card relative">
                
                {/* Edit/Delete Buttons Overlay - MODIFIED: Removed opacity-0 for better visibility/usability on mobile */}
                {canManage && (
                    <div className="absolute top-2 right-2 flex gap-2 z-20">
                        {onEdit && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onEdit(act); }}
                                className="p-1.5 bg-blue-500/20 hover:bg-blue-600 text-blue-200 hover:text-white rounded-md border border-blue-500/30 backdrop-blur-sm transition-all"
                                title="Edit"
                            >
                                <Edit2 size={14} />
                            </button>
                        )}
                        {onDelete && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(act.id); }}
                                className="p-1.5 bg-red-500/20 hover:bg-red-600 text-red-200 hover:text-white rounded-md border border-red-500/30 backdrop-blur-sm transition-all"
                                title="Hapus"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                )}

                {/* Card Header: Stacked on mobile, Row on Desktop */}
                <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white/5 gap-2 sm:gap-0 pr-20 sm:pr-4">
                    <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${catColorClass}`}>
                            {act.category}
                        </span>
                        {/* Show Time on right for Mobile only */}
                        <div className="sm:hidden flex items-center gap-1 text-[10px] font-mono text-blue-200/70">
                             {formatTime(start)}
                        </div>
                    </div>

                    {/* Desktop Time View */}
                    <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-blue-200">
                        <span>{formatTime(start)}</span>
                        <ArrowRight size={10} className="opacity-50" />
                        <span>{formatTime(end)}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20 mx-1" />
                        <span className="opacity-70">{act.durationMin}m</span>
                    </div>

                    {/* Mobile Duration & Flags Row */}
                    <div className="flex sm:hidden items-center justify-between text-[10px] text-white/50 border-t border-white/5 pt-1 mt-0.5">
                        <div className="flex items-center gap-1">
                            <Clock size={10} />
                            <span>{act.durationMin} mnt</span>
                        </div>
                        {hasFlags && (
                            <span className="flex items-center gap-1 font-bold text-red-300">
                                <AlertTriangle size={10} /> Isu
                            </span>
                        )}
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-3 sm:p-4">
                    {/* Title & Subtitle */}
                    <div className="mb-2 sm:mb-3">
                        <h3 className="font-bold text-base sm:text-lg text-white leading-tight mb-1">{act.activityMain}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-blue-200/80">
                            {act.childName && (
                                <div className="flex items-center gap-1 text-pink-200/80">
                                    <Baby size={12} />
                                    <span className="font-medium">{act.childName}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <LocationIcon size={12} />
                                <span className="truncate max-w-[150px]">{act.location}</span>
                            </div>
                            {act.activitySub && act.activitySub !== act.activityMain && (
                                <div className="w-full sm:w-auto text-white/40 text-[11px] sm:text-xs pl-4 sm:pl-0 border-l-2 sm:border-l-0 border-white/10 sm:border-none">
                                    {act.activitySub}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    {act.notes && (
                        <div className="mb-3 text-xs sm:text-sm bg-black/20 p-2 sm:p-3 rounded-lg text-white/80 border-l-2 border-white/20 italic">
                            "{act.notes}"
                        </div>
                    )}

                    {/* Footer Stats & Flags - Optimized Grid/Flex */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-white/5">
                        {/* Metrics Group */}
                        <div className="flex items-center gap-1.5">
                            {getSensoryBadge(act.sensoryLoad)}
                            {getComplianceBadge(act.complianceScore)}
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/10 text-[10px] font-medium text-white/70 bg-white/5">
                                <EmotionIcon size={10} />
                                <span className="capitalize">{act.emotion}</span>
                            </div>
                        </div>

                        {/* Divider for mobile visual separation if needed */}
                        {hasFlags && <div className="w-px h-3 bg-white/10 hidden sm:block"></div>}

                        {/* Specific Flags - Wrap cleanly */}
                        {hasFlags && (
                             <div className="flex flex-wrap gap-1.5 mt-1 sm:mt-0">
                                {act.flags.tantrum && <span className="text-[9px] font-bold text-red-200 bg-red-500/20 border border-red-500/30 px-1.5 py-0.5 rounded">TANTRUM</span>}
                                {act.flags.sensoryHigh && <span className="text-[9px] font-bold text-pink-200 bg-pink-500/20 border border-pink-500/30 px-1.5 py-0.5 rounded">SENSORI</span>}
                                {act.flags.refusal && <span className="text-[9px] font-bold text-orange-200 bg-orange-500/20 border border-orange-500/30 px-1.5 py-0.5 rounded">TOLAK</span>}
                                {act.flags.elopement && <span className="text-[9px] font-bold text-purple-200 bg-purple-500/20 border border-purple-500/30 px-1.5 py-0.5 rounded">KABUR</span>}
                                {act.flags.aggression && <span className="text-[9px] font-bold text-red-200 bg-red-600/20 border border-red-600/30 px-1.5 py-0.5 rounded">AGRESI</span>}
                                {act.flags.toilet && <span className="text-[9px] font-bold text-blue-200 bg-blue-500/20 border border-blue-500/30 px-1.5 py-0.5 rounded">TOILET</span>}
                                {act.flags.health && <span className="text-[9px] font-bold text-emerald-200 bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 rounded">SAKIT</span>}
                             </div>
                        )}
                    </div>
                </div>

                {/* Media Gallery (Full Width at Bottom) */}
                {act.media && act.media.length > 0 && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0 flex gap-2 overflow-x-auto scrollbar-hide">
                        {act.media.map((item) => (
                            <div key={item.id} className="relative flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16 rounded-md overflow-hidden border border-white/10 bg-black/40 group/media cursor-pointer">
                                {item.type === 'video' ? (
                                    <>
                                        <video src={item.url} className="h-full w-full object-cover opacity-80 group-hover/media:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Video size={14} className="text-white drop-shadow-md" />
                                        </div>
                                    </>
                                ) : (
                                    <img src={item.url} alt="Activity" className="h-full w-full object-cover opacity-80 group-hover/media:opacity-100 transition-opacity" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>
          </div>
        );
      })}
    </div>
  );
};