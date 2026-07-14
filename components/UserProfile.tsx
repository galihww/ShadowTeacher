import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { User, Gender, UserRole } from '../types';
import { updateUser } from '../services/authService';
import { UserCircle, Mail, Shield, Save, Edit2, RotateCcw, Loader2, Lock, Users, Camera } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
    email: user.email || '',
    gender: user.gender || Gender.FEMALE,
    password: '' // Only for changing password
  });

  const getRoleLabel = (role: UserRole) => {
    switch(role) {
        case UserRole.ADMIN: return 'Administrator';
        case UserRole.SHADOW_TEACHER: return 'Shadow Teacher';
        case UserRole.TEACHER: return 'Guru Pendamping';
        case UserRole.PARENT: return 'Orang Tua';
        default: return role;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);

    const updatedData: User & { password?: string } = {
        ...user,
        name: formData.name,
        username: formData.username,
        email: formData.email,
        gender: formData.gender,
    };

    // Only add password if user typed something
    if (formData.password.trim() !== '') {
        updatedData.password = formData.password;
    }

    const success = await updateUser(updatedData);

    if (success) {
        // Remove password from state object before passing up
        const { password, ...userState } = updatedData;
        onUpdate(userState);
        setIsEditing(false);
        setStatusMsg({ type: 'success', text: 'Profil berhasil diperbarui!' });
        setFormData(prev => ({ ...prev, password: '' })); // Reset password field
    } else {
        setStatusMsg({ type: 'error', text: 'Gagal memperbarui profil. Silakan coba lagi.' });
    }
    setIsSaving(false);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleCancel = () => {
    setFormData({
        name: user.name,
        username: user.username,
        email: user.email || '',
        gender: user.gender || Gender.FEMALE,
        password: ''
    });
    setIsEditing(false);
    setStatusMsg(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="px-2">
         <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCircle className="text-blue-400" size={24} />
            Profil Saya
         </h2>
         <p className="text-xs text-blue-200">Kelola informasi akun dan preferensi Anda.</p>
      </div>

      <GlassCard className="p-6 md:p-8 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row gap-8 relative z-10">
            {/* Left Column: Avatar & Role */}
            <div className="flex flex-col items-center gap-4 md:w-1/3 border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/20 relative group">
                    <UserCircle className="text-white w-20 h-20" />
                    {/* Placeholder for future avatar upload */}
                    {isEditing && (
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera size={24} className="text-white" />
                        </div>
                    )}
                </div>
                
                <div className="text-center">
                    <h3 className="text-xl font-bold text-white">{user.name}</h3>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-200 text-xs font-medium">
                        <Shield size={12} />
                        {getRoleLabel(user.role)}
                    </div>
                </div>
            </div>

            {/* Right Column: Details / Form */}
            <div className="md:w-2/3 flex-1">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-semibold text-white/90">Detail Informasi</h4>
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="text-xs flex items-center gap-1 bg-white/5 hover:bg-white/10 text-blue-200 px-3 py-1.5 rounded-lg transition-colors border border-white/10"
                        >
                            <Edit2 size={14} /> Edit Profil
                        </button>
                    )}
                </div>

                {statusMsg && (
                    <div className={`mb-4 p-3 rounded-lg text-sm border flex items-center gap-2 ${statusMsg.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100' : 'bg-red-500/20 border-red-500/50 text-red-100'}`}>
                        {statusMsg.text}
                    </div>
                )}

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-blue-200 block mb-1">Nama Lengkap</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs text-blue-200 block mb-1">Username</label>
                                <input 
                                    type="text" 
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-blue-200 block mb-1">Email</label>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 pl-9 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <Mail className="absolute left-3 top-3 text-white/30" size={14} />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-blue-200 block mb-1">Jenis Kelamin</label>
                            <div className="relative">
                                <select 
                                    value={formData.gender}
                                    onChange={e => setFormData({...formData, gender: e.target.value as Gender})}
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg p-2.5 pl-9 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
                                >
                                    <option value={Gender.MALE}>Laki-laki</option>
                                    <option value={Gender.FEMALE}>Perempuan</option>
                                </select>
                                <Users className="absolute left-3 top-3 text-white/30" size={14} />
                            </div>
                        </div>

                        <div className="pt-2 border-t border-white/10 mt-2">
                             <label className="text-xs text-blue-200 block mb-1">Password Baru (Opsional)</label>
                             <div className="relative">
                                <input 
                                    type="password" 
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    placeholder="Kosongkan jika tidak ingin mengubah password"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 pl-9 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-white/30"
                                />
                                <Lock className="absolute left-3 top-3 text-white/30" size={14} />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button 
                                type="button" 
                                onClick={handleCancel}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-blue-200 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={16} /> Batal
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <span className="text-xs text-blue-300">Username</span>
                                <p className="text-white font-medium">@{user.username}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-blue-300">Jenis Kelamin</span>
                                <p className="text-white font-medium">{user.gender}</p>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <span className="text-xs text-blue-300">Email</span>
                                <div className="flex items-center gap-2 text-white font-medium">
                                    <Mail size={16} className="text-white/50" />
                                    {user.email || <span className="text-white/30 italic">Belum diatur</span>}
                                </div>
                            </div>
                            <div className="space-y-1 md:col-span-2 pt-2 border-t border-white/10">
                                <span className="text-xs text-blue-300">Password</span>
                                <p className="text-white/50 text-sm italic">••••••••</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </GlassCard>
    </div>
  );
};
