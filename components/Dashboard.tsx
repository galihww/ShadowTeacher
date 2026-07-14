import React from 'react';
import { ActivityLog, ActivityCategory, EmotionState } from '../types';
import { GlassCard } from './GlassCard';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { CATEGORY_COLORS } from '../constants';

interface DashboardProps {
  activities: ActivityLog[];
}

export const Dashboard: React.FC<DashboardProps> = ({ activities }) => {
  // Aggregate Duration by Category
  const categoryData = Object.values(ActivityCategory).map(cat => {
    const totalMinutes = activities
      .filter(a => a.category === cat)
      .reduce((sum, a) => sum + a.durationMin, 0);
    return { name: cat, value: totalMinutes };
  }).filter(d => d.value > 0);

  // Behavior Counts
  const behaviorStats = [
    { name: 'Tantrum', count: activities.filter(a => a.flags.tantrum).length },
    { name: 'Sensori Tinggi', count: activities.filter(a => a.flags.sensoryHigh).length },
    { name: 'Menolak', count: activities.filter(a => a.flags.refusal).length },
    { name: 'Kabur', count: activities.filter(a => a.flags.elopement).length },
  ];

  // Emotion Distribution
  const emotionData = Object.values(EmotionState).map(emo => ({
    name: emo.split('/')[0], // Take first part for shorter label
    count: activities.filter(a => a.emotion === emo).length
  })).filter(d => d.count > 0);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Time Allocation Chart */}
      <GlassCard className="p-6 flex flex-col h-[300px]">
        <h3 className="text-lg font-semibold mb-4 text-blue-100">Alokasi Waktu (Menit)</h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Behavior Stats */}
      <GlassCard className="p-6 flex flex-col justify-center h-[300px]">
        <h3 className="text-lg font-semibold mb-4 text-blue-100">Frekuensi Perilaku</h3>
        <div className="grid grid-cols-2 gap-4">
          {behaviorStats.map((stat, idx) => (
            <div key={idx} className="bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center border border-white/10">
              <span className="text-3xl font-bold text-white mb-1">{stat.count}</span>
              <span className="text-xs text-blue-200 uppercase tracking-wider">{stat.name}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Emotion Chart */}
      <GlassCard className="p-6 flex flex-col h-[300px] md:col-span-2">
        <h3 className="text-lg font-semibold mb-4 text-blue-100">Distribusi Emosi</h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={emotionData}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.1)'}}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
              />
              <Bar dataKey="count" fill="#60a5fa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
};