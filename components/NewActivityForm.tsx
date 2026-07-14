import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from './GlassCard';
import { ActivityCategory, LocationType, EmotionState, ActivityFlags, ActivityLog, MediaItem, User, Child } from '../types';
import { getChildrenForUser } from '../services/childService';
import { X, Save, CalendarDays, MapPin, Zap, CheckCircle2, AlertCircle, XCircle, Camera, Trash2, Video, Baby } from 'lucide-react';

interface NewActivityFormProps {
  onClose: () => void;
  onSave: (activity: ActivityLog) => void;
  user: User;
  initialData?: ActivityLog | null; // Optional data for editing
}

export const NewActivityForm: React.FC<NewActivityFormProps> = ({ onClose, onSave, user, initialData }) => {
  // Child Selection
  const [selectedChildId, setSelectedChildId] = useState(initialData?.childId || '');
  const [availableChildren, setAvailableChildren] = useState<Child[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const isEditing = !!initialData;

  // Form Fields - Initialize with initialData if available
  const [activityMain, setActivityMain] = useState(initialData?.activityMain || '');
  const [activitySub, setActivitySub] = useState(initialData?.activitySub || '');
  const [category, setCategory] = useState<ActivityCategory>((initialData?.category as ActivityCategory) || ActivityCategory.ADL);
  
  // Parse location to get type and detail
  // Assuming format: "TYPE (Detail)" or just "TYPE"
  const parseLocation = () => {
      if (!initialData) return { type: LocationType.SCHOOL, detail: '' };
      
      // Try to match enum values
      const locString = initialData.location;
      // Simple heuristic: if locString contains parentheses
      const match = locString.match(/(.*)\s\((.*)\)/);
      
      if (match) {
        // Check if part 1 is a valid LocationType
        const possibleType = match[1] as LocationType;
        if (Object.values(LocationType).includes(possibleType)) {
             return { type: possibleType, detail: match[2] };
        }
      }
      
      // Fallback: Check if the string itself is a type
      if (Object.values(LocationType).includes(locString as LocationType)) {
          return { type: locString as LocationType, detail: '' };
      }

      return { type: LocationType.SCHOOL, detail: locString };
  };

  const parsedLoc = parseLocation();
  const [location, setLocation] = useState<LocationType>(parsedLoc.type);
  const [detailLocation, setDetailLocation] = useState(parsedLoc.detail);
  
  const [emotion, setEmotion] = useState<EmotionState>((initialData?.emotion as EmotionState) || EmotionState.NEUTRAL);
  const [sensoryLoad, setSensoryLoad] = useState<number>(initialData?.sensoryLoad || 1);
  const [complianceScore, setComplianceScore] = useState<number>(initialData?.complianceScore ?? 2);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(initialData?.media || []);
  const [isSaving, setIsSaving] = useState(false);
  
  // Date State
  const [activityDate, setActivityDate] = useState(() => {
      if (initialData) return new Date(initialData.startTime).toISOString().split('T')[0];
      return new Date().toISOString().split('T')[0];
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [startTime, setStartTime] = useState(() => {
    if (initialData) return new Date(initialData.startTime).toTimeString().slice(0, 5);
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  });
  const [endTime, setEndTime] = useState(() => {
    if (initialData) return new Date(initialData.endTime).toTimeString().slice(0, 5);
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    return now.toTimeString().slice(0, 5);
  });
  
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [flags, setFlags] = useState<ActivityFlags>(initialData?.flags || {
    tantrum: false, aggression: false, refusal: false, elopement: false,
    toilet: false, health: false, sensoryHigh: false
  });

  useEffect(() => {
    // Fetch assigned children for dropdown
    const loadChildren = async () => {
        setLoadingChildren(true);
        const kids = await getChildrenForUser(user);
        setAvailableChildren(kids);
        if (kids.length > 0 && !selectedChildId) setSelectedChildId(kids[0].id);
        setLoadingChildren(false);
    };
    loadChildren();
  }, [user]);

  // AUTOMATION: Sensory Load (Only run on changes if NOT editing initially to avoid overriding saved data, 
  // OR if user interacts with fields)
  // Simple approach: Only auto-calc if user creates new, OR explicit user action. 
  // For now, let's allow manual override always, but auto-set logic runs on dependency change.
  // To prevent overwriting initialData on mount, we can use a ref or check if changes made.
  // Ideally, automation assists input, but shouldn't fight existing data.
  // Simplified: Automation runs on change.
  useEffect(() => {
    if (isEditing) return; // Don't auto-change when editing existing form initially
    let est = 1; 
    if (location === LocationType.TRANSIT || category === ActivityCategory.TRANSISI || category === ActivityCategory.SOSIAL || category === ActivityCategory.AKADEMIK) est = 2;
    if (flags.sensoryHigh || flags.tantrum || flags.aggression || flags.refusal || flags.elopement || emotion === EmotionState.DISTRESSED || emotion === EmotionState.RESISTANT || location === LocationType.OUTDOOR) est = 3;
    setSensoryLoad(est);
  }, [category, location, emotion, flags, isEditing]);

  // AUTOMATION: Compliance Score
  useEffect(() => {
    if (isEditing) return;
    let score = 2; 
    if (flags.refusal || flags.tantrum || flags.elopement || emotion === EmotionState.RESISTANT) score = 0;
    else if (emotion === EmotionState.TIRED || emotion === EmotionState.DISTRESSED || flags.sensoryHigh) score = 1;
    setComplianceScore(score);
  }, [flags, emotion, isEditing]);

  // Helper to get Placeholder for Activity Main based on Category
  const getActivityMainPlaceholder = (cat: ActivityCategory) => {
      switch (cat) {
          case ActivityCategory.ADL: return "Contoh: Perawatan Diri, Mandi, Berpakaian";
          case ActivityCategory.NUTRISI: return "Contoh: Sarapan, Makan Siang, Snack";
          case ActivityCategory.IBADAH: return "Contoh: Sholat Dhuha, Mengaji, Berdoa";
          case ActivityCategory.AKADEMIK: return "Contoh: Belajar Membaca, Berhitung, Terapi Wicara";
          case ActivityCategory.TRANSISI: return "Contoh: Perjalanan ke Sekolah, Pulang Sekolah";
          case ActivityCategory.SOSIAL: return "Contoh: Bermain dengan Teman, Berbagi Mainan";
          case ActivityCategory.SENSORI: return "Contoh: Bermain Pasir, Ayunan, Terapi Sensori";
          case ActivityCategory.REGULASI: return "Contoh: Breathing, Calming Down";
          default: return "Contoh: Nama Kegiatan Utama";
      }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const type = file.type.startsWith('video') ? 'video' : 'image';
            setMediaItems(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), type, url: reader.result as string }]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeMedia = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId) {
        alert("Mohon pilih anak terlebih dahulu.");
        return;
    }

    setIsSaving(true);
    
    // Combine selected date with time
    const startDateTime = new Date(`${activityDate}T${startTime}:00`);
    const endDateTime = new Date(`${activityDate}T${endTime}:00`);
    
    if (endDateTime <= startDateTime) {
      alert("Jam selesai harus lebih akhir dari jam mulai.");
      setIsSaving(false);
      return;
    }

    const calculatedDuration = Math.round((endDateTime.getTime() - startDateTime.getTime()) / 60000);

    let locType = 'other';
    if (location === LocationType.HOME) locType = 'home';
    if (location === LocationType.SCHOOL) locType = 'school';
    if (location === LocationType.TRANSIT) locType = 'transit';

    await onSave({
      id: initialData?.id || Date.now().toString(), // Keep existing ID if editing
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      durationMin: calculatedDuration,
      activityMain: activityMain || category, // Fallback to category name if empty
      activitySub: activitySub,
      category,
      location: detailLocation ? `${location} (${detailLocation})` : location,
      locationType: locType,
      emotion,
      sensoryLoad,
      complianceScore,
      flags,
      notes,
      media: mediaItems,
      childId: selectedChildId,
      createdBy: initialData?.createdBy || user.username // Preserve creator
    });
    
    setIsSaving(false);
    onClose();
  };

  const toggleFlag = (key: keyof ActivityFlags) => {
    setFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <GlassCard className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900/90 border-white/30">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Aktivitas' : 'Catat Aktivitas'}</h2>
              <div className="flex items-center gap-2 text-blue-200 text-sm mt-1 bg-white/5 px-2 py-1 rounded-lg w-fit border border-white/10 hover:bg-white/10 transition-colors">
                <CalendarDays size={14} />
                <input
                    type="date"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 p-0 text-blue-200 font-medium cursor-pointer text-sm outline-none [color-scheme:dark]"
                    title="Klik untuk mengubah tanggal"
                />
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-white">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Child Selector */}
            <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/30">
                <label className="block text-sm font-bold text-blue-200 mb-2 flex items-center gap-2">
                    <Baby size={16} /> Pilih Anak
                </label>
                {loadingChildren ? (
                    <div className="text-sm text-white/50 italic flex items-center gap-2"><div className="animate-spin w-3 h-3 border-2 border-white/30 border-t-white rounded-full"></div> Memuat daftar anak...</div>
                ) : availableChildren.length === 0 ? (
                    <div className="text-sm text-red-300 italic">Anda belum memiliki akses ke data anak. Hubungi Admin.</div>
                ) : (
                    <select
                        value={selectedChildId}
                        onChange={(e) => setSelectedChildId(e.target.value)}
                        className="w-full bg-slate-800 border border-white/20 rounded-lg p-2.5 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        {availableChildren.map(child => (
                            <option key={child.id} value={child.id}>{child.fullName}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Category & Location */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none bg-slate-800"
                >
                  {Object.values(ActivityCategory).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Activity Main & Sub */}
            <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">Jenis Kegiatan</label>
                  <input
                    type="text"
                    value={activityMain}
                    onChange={(e) => setActivityMain(e.target.value)}
                    placeholder={getActivityMainPlaceholder(category)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">Detail Aktivitas</label>
                  <input
                    type="text"
                    required
                    value={activitySub}
                    onChange={(e) => setActivitySub(e.target.value)}
                    placeholder="Contoh: Mandi air hangat, Makan ayam goreng..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
            </div>

            {/* Time & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Jam Mulai</label>
                <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none [color-scheme:dark]"
                  />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Jam Selesai</label>
                <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none [color-scheme:dark]"
                  />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">Lokasi Umum</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value as LocationType)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none bg-slate-800"
                  >
                    {Object.values(LocationType).map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">Detail Lokasi</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={detailLocation}
                      onChange={(e) => setDetailLocation(e.target.value)}
                      placeholder="Cth: Dapur, Kelas..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-9 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <MapPin className="absolute left-3 top-3.5 text-white/40" size={16} />
                  </div>
                </div>
            </div>

            {/* Behaviors & Emotions */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Indikator Perilaku</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(flags) as Array<keyof ActivityFlags>).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleFlag(key)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                      ${flags[key] 
                        ? 'bg-red-500/40 border-red-400 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}
                    `}
                  >
                    {key.replace(/([A-Z])/g, ' $1').replace('sensoryHigh', 'Sensori Tinggi').replace('health', 'Masalah Kesehatan').replace('toilet', 'Toileting').replace('aggression', 'Agresi').replace('tantrum', 'Tantrum').replace('refusal', 'Menolak').replace('elopement', 'Kabur')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Emosi</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.values(EmotionState).map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmotion(em)}
                    className={`
                      p-2 text-xs rounded-lg border transition-all
                      ${emotion === em 
                        ? 'bg-blue-500 text-white border-blue-400 font-bold' 
                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'}
                    `}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Assessment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={18} className="text-yellow-400" />
                  <label className="text-sm font-medium text-blue-100">Beban Sensori</label>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSensoryLoad(val)}
                      className={`flex-1 p-2 rounded-lg border text-center transition-all ${
                        sensoryLoad === val 
                        ? val === 3 ? 'bg-red-500/30 border-red-500' : val === 2 ? 'bg-yellow-500/30 border-yellow-500' : 'bg-emerald-500/30 border-emerald-500'
                        : 'bg-white/5 border-white/10 text-white/50'
                      }`}
                    >
                      <div className="text-lg font-bold">{val}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <label className="text-sm font-medium text-blue-100">Kepatuhan</label>
                </div>
                <div className="flex gap-2">
                  {[2, 1, 0].map((val) => (
                     <button
                        key={val}
                        type="button"
                        onClick={() => setComplianceScore(val)}
                        className={`flex-1 p-2 rounded-lg border text-center transition-all ${
                          complianceScore === val
                          ? val === 2 ? 'bg-emerald-500/30 border-emerald-500 text-emerald-100' 
                          : val === 1 ? 'bg-yellow-500/30 border-yellow-500 text-yellow-100'
                          : 'bg-red-500/30 border-red-500 text-red-100'
                          : 'bg-white/5 border-white/10 text-white/50'
                        }`}
                      >
                        <div className="text-lg font-bold">{val}</div>
                      </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Dokumentasi</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {mediaItems.map((item) => (
                  <div key={item.id} className="relative group aspect-square bg-black/40 rounded-lg overflow-hidden border border-white/10">
                    {item.type === 'video' ? (
                       <video src={item.url} muted playsInline className="w-full h-full object-cover opacity-80" />
                    ) : (
                       <img src={item.url} alt="preview" className="w-full h-full object-cover opacity-80" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(item.id)}
                      className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square flex flex-col items-center justify-center gap-1 bg-white/5 hover:bg-white/10 border border-dashed border-white/30 rounded-lg text-white/50 hover:text-white/80 transition-colors"
                >
                  <Camera size={24} />
                  <span className="text-[10px]">Tambah</span>
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*" multiple className="hidden" />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Catatan Tambahan</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Contoh: Respon anak baik saat instruksi pertama, namun mulai gelisah setelah 10 menit..."
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving || availableChildren.length === 0}
              className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaving ? <span className="animate-spin text-xl">⟳</span> : <Save size={20} />}
              {isSaving ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan Aktivitas'}
            </button>
          </form>
        </div>
      </GlassCard>
    </div>
  );
};