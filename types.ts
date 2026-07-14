
export enum LocationType {
  HOME = 'Rumah',
  SCHOOL = 'Sekolah',
  TRANSIT = 'Jalan Raya', 
  OUTDOOR = 'Luar Ruangan' 
}

export enum EmotionState {
  NEUTRAL = 'neutral',
  HAPPY = 'happy',
  DISTRESSED = 'distressed',
  RESISTANT = 'resistant',
  TIRED = 'tired'
}

export enum ActivityCategory {
  ADL = 'ADL',
  AKADEMIK = 'Akademik',
  IBADAH = 'Ibadah',
  NUTRISI = 'Nutrisi',
  SENSORI = 'Sensori',
  TRANSISI = 'Transisi',
  REGULASI = 'Regulasi Diri', 
  SOSIAL = 'Sosial',
  KREATIF = 'Kreatif',
  MOBILITAS = 'Mobilitas',
  KESEHATAN = 'Kesehatan',
  ISTIRAHAT = 'Istirahat',
  LEISURE = 'Leisure'
}

export interface ActivityFlags {
  tantrum: boolean;
  aggression: boolean;
  refusal: boolean;
  elopement: boolean; 
  toilet: boolean;
  health: boolean; 
  sensoryHigh: boolean;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
}

export interface ActivityLog {
  id: string;
  startTime: string; 
  endTime: string;   
  durationMin: number;
  activityMain: string; 
  activitySub: string;  
  category: string; 
  location: string; 
  locationType: string; 
  emotion: string; 
  sensoryLoad?: number; 
  complianceScore?: number; 
  flags: ActivityFlags;
  notes: string;
  media?: MediaItem[];
  date?: string;
  day?: string;
  createdBy?: string; 
  childId?: string; // New: Relasi ke anak
  childName?: string; // New: Untuk display
}

export interface InsightMetrics {
  totalDuration: number;
  tantrumCount: number;
  mostFrequentCategory: string;
  complianceRate: number;
}

// --- AUTH TYPES ---

export enum UserRole {
  ADMIN = 'admin',
  SHADOW_TEACHER = 'shadow_teacher',
  TEACHER = 'teacher', // Guru Pendamping
  PARENT = 'parent'
}

export enum Gender {
  MALE = 'Laki-laki',
  FEMALE = 'Perempuan'
}

export interface User {
  id: string;
  username: string;
  email: string; 
  password?: string; 
  name: string;
  role: UserRole;
  gender?: Gender; // New: Gender Field
}

// --- CHILD REGISTRATION TYPES ---

export enum ChildStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface Child {
  id: string;
  parentId: string;
  fullName: string;
  dateOfBirth: string; // ISO Date string
  gender: Gender;
  diagnosis: string;
  notes: string;
  status: ChildStatus;
  createdAt: string;
  
  // Relations Display Data
  parentName?: string; 
  
  // Assignments
  shadowTeacherId?: string;
  teacherId?: string;
  shadowTeacherName?: string;
  teacherName?: string;
}
