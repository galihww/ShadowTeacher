import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { Child, Gender, ChildStatus } from '../types';
import { registerChild, getChildrenByParent } from '../services/childService';
import { User } from '../types';
import { Baby, Calendar, Activity, Save, Loader2, CheckCircle2, Clock, XCircle, User as UserIcon, Users, FileText, AlignLeft } from 'lucide-react';

interface ParentChildRegistrationProps {
  user: User;
}

export const ParentChildRegistration: React.FC<ParentChildRegistrationProps> = ({ user }) => {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  const fetchChildren = async () => {
    setIsLoading(true);
    const data = await getChildrenByParent(user.id);
    setChildren(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchChildren();
  }, [user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !dob) return;

    setIsSubmitting(true);
    setShowSuccess(false);

    const success = await registerChild({
        parentId: user.id,
        fullName,
        dateOfBirth: dob,
        gender,
        diagnosis,
        notes
    });

    if (success) {
        // Reset form
        setFullName('');
        setDob('');
        setGender(Gender.MALE);
        setDiagnosis('');
        setNotes('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
        await fetchChildren();
    }
    setIsSubmitting(false);
  };

  const getStatusBadge = (status: ChildStatus) => {
    switch (status) {
        case ChildStatus.APPROVED:
            return <span className="flex items-center gap-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full border border-emerald-500/30"><CheckCircle2 size={12} /> Disetujui</span>;
        case ChildStatus.REJECTED:
            return <span className="flex items-center gap-1 text-xs font-bold bg-red-500/20 text-red-300 px-2 py-1 rounded-full border border-red-500/30"><XCircle size={12} /> Ditolak</span>;
        default:
            return <span className="flex items-center gap-1 text-xs font-bold bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-500/30"><Clock size={12} /> Menunggu</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Registration */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Baby size={20} className="text-blue-300" /> Registrasi Data Anak
        </h3>
        <p className="text-xs text-blue-200 mb-6">
            Mohon isi data anak dengan lengkap. Data akan diverifikasi oleh admin sebelum dapat digunakan.
        </p>

        {showSuccess && (
            <div className="mb-4 bg-emerald-500/20 border border-emerald-500/50 p-3 rounded-lg text-emerald-100 text-sm flex items-center gap-2">
                <CheckCircle2 size={16} /> Pendaftaran berhasil dikirim!
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">Nama Lengkap Anak</label>
                <div className="relative">
                    <input 
                        type="text" 
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: Muhammad Ali"
                    />
                    <UserIcon className="absolute left-3 top-3.5 text-white/40" size={18} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-blue-100 mb-1">Tanggal Lahir</label>
                    <div className="relative">
                        <input 
                            type="date" 
                            required
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-blue-100 mb-1">Jenis Kelamin</label>
                    <div className="relative">
                        <select 
                            value={gender}
                            onChange={(e) => setGender(e.target.value as Gender)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-slate-800"
                        >
                            <option value={Gender.MALE}>Laki-laki</option>
                            <option value={Gender.FEMALE}>Perempuan</option>
                        </select>
                        <Users className="absolute left-3 top-3.5 text-white/40" size={18} />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">Diagnosis Awal</label>
                <div className="relative">
                    <input 
                        type="text" 
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: ASD Level 1, Speech Delay..."
                    />
                    <Activity className="absolute left-3 top-3.5 text-white/40" size={18} />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">Catatan Tambahan (Opsional)</label>
                <div className="relative">
                    <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Riwayat alergi, preferensi sensori, dll..."
                    />
                    <FileText className="absolute left-3 top-3.5 text-white/40" size={18} />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {isSubmitting ? 'Mengirim Data...' : 'Daftarkan Anak'}
            </button>
        </form>
      </GlassCard>

      {/* List Children */}
      <div>
        <h3 className="text-lg font-bold text-white px-2 mb-3">Daftar Anak</h3>
        {isLoading ? (
            <div className="text-center py-8 text-white/50">Memuat data...</div>
        ) : children.length === 0 ? (
            <div className="text-center py-8 text-white/50 bg-white/5 rounded-xl border border-white/5 border-dashed">
                Belum ada data anak yang didaftarkan.
            </div>
        ) : (
            <div className="space-y-3">
                {children.map(child => (
                    <GlassCard key={child.id} className="p-4 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                    <Baby size={18} className="text-pink-300" />
                                    {child.fullName}
                                </h4>
                                {getStatusBadge(child.status)}
                            </div>
                            <div className="text-sm text-blue-200 space-y-0.5 ml-6">
                                <div className="flex items-center gap-2">
                                    <Calendar size={12} /> 
                                    <span>{new Date(child.dateOfBirth).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
                                    <span className="text-white/30">•</span>
                                    <span>{child.gender}</span>
                                </div>
                                {child.diagnosis && (
                                    <div className="text-white/70 italic text-xs flex items-center gap-1">
                                        <Activity size={10} /> Diagnosis: {child.diagnosis}
                                    </div>
                                )}
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};