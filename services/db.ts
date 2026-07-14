import { neon } from '@neondatabase/serverless';

// ---------------------------------------------------------------------------
// KONFIGURASI KONEKSI DATABASE
// ---------------------------------------------------------------------------
const DATABASE_URL = "postgresql://neondb_owner:npg_bBT7RdSCmE2U@ep-little-lake-ahy7cixw-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

export const sql = neon(DATABASE_URL);

// Initialize Database Tables
export const initDB = async () => {
  try {
    console.log("Initializing Database...");
    
    // 1. Create Tables if not exist
    await sql`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        date DATE NOT NULL,
        day TEXT,
        start_time TEXT,
        end_time TEXT,
        start_dt TIMESTAMPTZ NOT NULL,
        end_dt TIMESTAMPTZ NOT NULL,
        duration_min NUMERIC,
        location TEXT,
        location_type TEXT,
        activity_main TEXT,
        activity_sub TEXT,
        category TEXT,
        note TEXT,
        aggression BOOLEAN DEFAULT FALSE,
        tantrum BOOLEAN DEFAULT FALSE,
        refusal BOOLEAN DEFAULT FALSE,
        elopement BOOLEAN DEFAULT FALSE,
        toilet BOOLEAN DEFAULT FALSE,
        health BOOLEAN DEFAULT FALSE,
        sensory_high BOOLEAN DEFAULT FALSE,
        emotion_est TEXT,
        sensory_load_est INTEGER,
        compliance_est INTEGER,
        media JSONB,
        created_by TEXT,
        child_id TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        gender TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS children (
        id TEXT PRIMARY KEY,
        parent_id TEXT NOT NULL,
        full_name TEXT NOT NULL,
        date_of_birth DATE NOT NULL,
        gender TEXT NOT NULL,
        diagnosis TEXT,
        notes TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        shadow_teacher_id TEXT,
        teacher_id TEXT
      );
    `;

    // 2. Run Migrations (Sequential to avoid connection race conditions)
    // Activities Table Migrations
    try {
        await sql`ALTER TABLE activities ADD COLUMN IF NOT EXISTS child_id TEXT`;
        await sql`ALTER TABLE activities ADD COLUMN IF NOT EXISTS created_by TEXT`;
    } catch (e) {
        console.warn("Migration for activities table (child_id/created_by) might have failed or columns exist:", e);
    }

    // Children Table Migrations
    try {
        await sql`ALTER TABLE children ADD COLUMN IF NOT EXISTS shadow_teacher_id TEXT`;
        await sql`ALTER TABLE children ADD COLUMN IF NOT EXISTS teacher_id TEXT`;
    } catch (e) {
         console.warn("Migration for children table (teachers) might have failed or columns exist:", e);
    }
    
    // Users Table Migrations
    try {
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT`;
    } catch (e) {
        console.warn("Migration for users table (created_at/email/gender) might have failed or column exists:", e);
    }

    // 3. Seed Default Users
    try {
      const usersCheck = await sql`SELECT count(*) FROM users`;
      if (Number(usersCheck[0].count) === 0) {
        console.log("Seeding default users...");
        await sql`
          INSERT INTO users (id, username, email, password, name, role, gender) VALUES 
          ('1', 'admin', 'admin@sekolah.id', 'admin123', 'Administrator', 'admin', 'Laki-laki'),
          ('2', 'shadow', 'shadow@sekolah.id', 'shadow123', 'Shadow Teacher', 'shadow_teacher', 'Perempuan'),
          ('3', 'guru', 'guru@sekolah.id', 'guru123', 'Guru Pendamping', 'teacher', 'Perempuan'),
          ('4', 'ortu', 'ortu@rumah.com', 'ortu123', 'Orang Tua', 'parent', 'Laki-laki');
        `;
      }
    } catch (seedError) {
      console.warn("Seeding skipped (safe to ignore if users exist):", seedError);
    }

    console.log("Database initialized and migrations applied successfully.");
  } catch (error) {
    console.error("CRITICAL: Failed to initialize database:", error);
  }
};
