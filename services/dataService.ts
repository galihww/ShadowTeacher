import { ActivityLog, ActivityFlags, ActivityCategory, LocationType, EmotionState, User, UserRole } from '../types';
import { sql } from './db';
import { MOCK_DATA_SEED } from '../constants';

// Helper to map Day names
const getIndonesianDay = (date: Date): string => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[date.getDay()];
};

// Fallback generator
export const generateMockData = (): ActivityLog[] => {
  const today = new Date();
  
  return MOCK_DATA_SEED.map((seed: any, index: number) => {
    const start = new Date(today);
    start.setHours(7 + index * 2, 0, 0, 0); 
    const end = new Date(start.getTime() + (seed.duration || 30) * 60000);
    
    return {
      id: `mock-${index}`,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationMin: seed.duration || 30,
      activityMain: seed.activity,
      activitySub: seed.note,
      category: seed.cat,
      location: seed.loc || LocationType.HOME,
      locationType: 'home',
      emotion: EmotionState.NEUTRAL,
      sensoryLoad: 1,
      complianceScore: 2,
      notes: seed.note,
      flags: { 
        aggression: false, tantrum: false, refusal: false, elopement: false, 
        toilet: false, health: false, sensoryHigh: false, ...seed.flags 
      },
      media: [],
      date: start.toISOString().split('T')[0],
      day: getIndonesianDay(start),
      createdBy: 'shadow' // Default owner so it can be edited in demo
    };
  });
};

// Initialize Database Table with CSV-like Structure
// (Init function moved to db.ts, only keeping data access here)
export { initDB } from './db';

// Fetch Activities SCOPED by User Role
export const fetchActivities = async (user?: User): Promise<ActivityLog[]> => {
  try {
    let rows;

    if (!user || user.role === UserRole.ADMIN) {
        // Admin or fallback: Fetch ALL without limit
        rows = await sql`
          SELECT a.*, c.full_name as child_name
          FROM activities a
          LEFT JOIN children c ON a.child_id = c.id
          ORDER BY a.start_dt DESC
        `;
    } else if (user.role === UserRole.PARENT) {
        // Parent: Fetch activities for THEIR children without limit
        rows = await sql`
          SELECT a.*, c.full_name as child_name
          FROM activities a
          JOIN children c ON a.child_id = c.id
          WHERE c.parent_id = ${user.id}
          ORDER BY a.start_dt DESC
        `;
    } else {
        // Teacher/Shadow: Fetch activities for ASSIGNED children without limit
        rows = await sql`
          SELECT a.*, c.full_name as child_name
          FROM activities a
          JOIN children c ON a.child_id = c.id
          WHERE c.teacher_id = ${user.id} OR c.shadow_teacher_id = ${user.id}
          ORDER BY a.start_dt DESC
        `;
    }
    
    return rows.map((row: any) => ({
      id: row.id,
      startTime: row.start_dt instanceof Date ? row.start_dt.toISOString() : row.start_dt,
      endTime: row.end_dt instanceof Date ? row.end_dt.toISOString() : row.end_dt,
      durationMin: Number(row.duration_min),
      activityMain: row.activity_main,
      activitySub: row.activity_sub,
      category: row.category,
      location: row.location,
      locationType: row.location_type,
      emotion: row.emotion_est,
      sensoryLoad: row.sensory_load_est,
      complianceScore: row.compliance_est,
      notes: row.note || '',
      flags: {
        aggression: row.aggression,
        tantrum: row.tantrum,
        refusal: row.refusal,
        elopement: row.elopement,
        toilet: row.toilet,
        health: row.health,
        sensoryHigh: row.sensory_high
      },
      media: row.media || [],
      date: row.date,
      day: row.day,
      childId: row.child_id,
      childName: row.child_name,
      createdBy: row.created_by
    }));
  } catch (error) {
    console.error("Gagal mengambil data dari DB. Menggunakan Mock Data.", error);
    return generateMockData();
  }
};

// Save Activity to Neon
export const saveActivityToDB = async (activity: ActivityLog): Promise<boolean> => {
  try {
    const startObj = new Date(activity.startTime);
    const endObj = new Date(activity.endTime);
    
    const dateStr = startObj.toISOString().split('T')[0];
    const dayStr = getIndonesianDay(startObj);
    const startTimeStr = startObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    const endTimeStr = endObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });

    await sql`
      INSERT INTO activities (
        id, date, day, start_time, end_time, start_dt, end_dt, duration_min,
        location, location_type, activity_main, activity_sub, category, note,
        aggression, tantrum, refusal, elopement, toilet, health, sensory_high,
        emotion_est, sensory_load_est, compliance_est, media, created_by, child_id
      ) VALUES (
        ${activity.id},
        ${dateStr},
        ${dayStr},
        ${startTimeStr},
        ${endTimeStr},
        ${activity.startTime},
        ${activity.endTime},
        ${activity.durationMin},
        ${activity.location},
        ${activity.locationType},
        ${activity.activityMain},
        ${activity.activitySub},
        ${activity.category},
        ${activity.notes},
        ${activity.flags.aggression},
        ${activity.flags.tantrum},
        ${activity.flags.refusal},
        ${activity.flags.elopement},
        ${activity.flags.toilet},
        ${activity.flags.health},
        ${activity.flags.sensoryHigh},
        ${activity.emotion},
        ${activity.sensoryLoad},
        ${activity.complianceScore},
        ${JSON.stringify(activity.media || [])},
        ${activity.createdBy},
        ${activity.childId}
      )
    `;
    return true;
  } catch (error) {
    console.error("Error saving activity to DB:", error);
    return false;
  }
};

// Update Activity
export const updateActivityInDB = async (activity: ActivityLog): Promise<boolean> => {
  try {
    const startObj = new Date(activity.startTime);
    const endObj = new Date(activity.endTime);
    
    const dateStr = startObj.toISOString().split('T')[0];
    const dayStr = getIndonesianDay(startObj);
    const startTimeStr = startObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    const endTimeStr = endObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });

    await sql`
      UPDATE activities SET
        date = ${dateStr},
        day = ${dayStr},
        start_time = ${startTimeStr},
        end_time = ${endTimeStr},
        start_dt = ${activity.startTime},
        end_dt = ${activity.endTime},
        duration_min = ${activity.durationMin},
        location = ${activity.location},
        location_type = ${activity.locationType},
        activity_main = ${activity.activityMain},
        activity_sub = ${activity.activitySub},
        category = ${activity.category},
        note = ${activity.notes},
        aggression = ${activity.flags.aggression},
        tantrum = ${activity.flags.tantrum},
        refusal = ${activity.flags.refusal},
        elopement = ${activity.flags.elopement},
        toilet = ${activity.flags.toilet},
        health = ${activity.flags.health},
        sensory_high = ${activity.flags.sensoryHigh},
        emotion_est = ${activity.emotion},
        sensory_load_est = ${activity.sensoryLoad},
        compliance_est = ${activity.complianceScore},
        media = ${JSON.stringify(activity.media || [])},
        child_id = ${activity.childId}
      WHERE id = ${activity.id}
    `;
    return true;
  } catch (error) {
    console.error("Error updating activity in DB:", error);
    return false;
  }
};

// Delete Activity
export const deleteActivityFromDB = async (id: string): Promise<boolean> => {
  try {
    await sql`DELETE FROM activities WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error("Error deleting activity:", error);
    return false;
  }
};