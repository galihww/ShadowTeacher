
import { ActivityCategory, EmotionState, LocationType } from './types';
import { 
  Home, 
  School, 
  Car, 
  TreePine, 
  BookOpen, 
  Utensils, 
  Smile, 
  Frown, 
  Meh, 
  AlertCircle, 
  BrainCircuit,
  Activity,
  User,
  Clock
} from 'lucide-react';

export const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  [ActivityCategory.ADL]: 'bg-emerald-500/20 text-emerald-100 border-emerald-500/30',
  [ActivityCategory.AKADEMIK]: 'bg-blue-500/20 text-blue-100 border-blue-500/30',
  [ActivityCategory.IBADAH]: 'bg-purple-500/20 text-purple-100 border-purple-500/30',
  [ActivityCategory.NUTRISI]: 'bg-orange-500/20 text-orange-100 border-orange-500/30',
  [ActivityCategory.SENSORI]: 'bg-pink-500/20 text-pink-100 border-pink-500/30',
  [ActivityCategory.TRANSISI]: 'bg-slate-500/20 text-slate-100 border-slate-500/30',
  [ActivityCategory.REGULASI]: 'bg-red-500/20 text-red-100 border-red-500/30',
  [ActivityCategory.SOSIAL]: 'bg-yellow-500/20 text-yellow-100 border-yellow-500/30',
  [ActivityCategory.KREATIF]: 'bg-indigo-500/20 text-indigo-100 border-indigo-500/30',
  [ActivityCategory.MOBILITAS]: 'bg-cyan-500/20 text-cyan-100 border-cyan-500/30',
  [ActivityCategory.KESEHATAN]: 'bg-teal-500/20 text-teal-100 border-teal-500/30',
  [ActivityCategory.ISTIRAHAT]: 'bg-zinc-500/20 text-zinc-100 border-zinc-500/30',
  [ActivityCategory.LEISURE]: 'bg-lime-500/20 text-lime-100 border-lime-500/30',
};

export const EMOTION_ICONS: Record<EmotionState, any> = {
  [EmotionState.HAPPY]: Smile,
  [EmotionState.NEUTRAL]: Meh,
  [EmotionState.DISTRESSED]: AlertCircle,
  [EmotionState.RESISTANT]: Frown,
  [EmotionState.TIRED]: Clock, // Using Clock as a metaphor for tired/waiting
};

export const LOCATION_ICONS: Record<LocationType, any> = {
  [LocationType.HOME]: Home,
  [LocationType.SCHOOL]: School,
  [LocationType.TRANSIT]: Car,
  [LocationType.OUTDOOR]: TreePine,
};

export const MOCK_DATA_SEED = [
  {
    activity: "Bangun Tidur",
    cat: ActivityCategory.ADL,
    loc: LocationType.HOME,
    note: "Bangun sendiri, mood baik",
    duration: 15
  },
  {
    activity: "Mandi & Siap-siap",
    cat: ActivityCategory.ADL,
    loc: LocationType.HOME,
    note: "Perlu bantuan mengancingkan baju",
    duration: 20
  },
  {
    activity: "Sarapan",
    cat: ActivityCategory.NUTRISI,
    loc: LocationType.HOME,
    note: "Makan lahap, menu ayam",
    duration: 15
  },
  {
    activity: "Perjalanan ke Sekolah",
    cat: ActivityCategory.TRANSISI,
    loc: LocationType.TRANSIT,
    note: "Tenang di perjalanan",
    duration: 30
  },
  {
    activity: "Sholat Dhuha",
    cat: ActivityCategory.IBADAH,
    loc: LocationType.SCHOOL,
    note: "Bisa mengikuti gerakan imam",
    duration: 15
  },
  {
    activity: "Belajar di Kelas",
    cat: ActivityCategory.AKADEMIK,
    loc: LocationType.SCHOOL,
    note: "Fokus selama 10 menit, lalu minta istirahat",
    duration: 45
  },
  {
    activity: "Tantrum (Sensory Overload)",
    cat: ActivityCategory.REGULASI,
    loc: LocationType.SCHOOL,
    note: "Suara bel sekolah terlalu keras",
    duration: 20,
    flags: { tantrum: true, sensoryHigh: true }
  }
];
