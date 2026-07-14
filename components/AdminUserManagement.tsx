import React, { useEffect, useState } from 'react';
import { GlassCard } from './GlassCard';
import { User, UserRole, Gender } from '../types';
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/authService';
import { Trash2, UserPlus, Shield, User as UserIcon, GraduationCap, Heart, Edit2, ChevronLeft, ChevronRight, RotateCcw, Save, Mail, Users, LogIn } from 'lucide-react';

interface AdminUserManagementProps {
  onImpersonate: (user: User) => void;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ onImpersonate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form State
  const initialFormState = { id: '', username: '', email: '', password: '', name: '', role: UserRole.SHADOW_TEACHER, gender: Gender.FEMALE };
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    // Basic Validation
    if (!formData.username || !formData.name) return;
    if (!isEditing && !formData.password) {
        setStatusMsg({ type: 'error', text: 'Password wajib diisi untuk user baru.' });
        return;
    }

    setIsSubmitting(true);
    let success = false;

    if (isEditing) {
        success = await updateUser({
            id: formData.id,
            name: formData.name,
            username: formData.username,
            email: formData.email,
            role: formData.role,
            gender: formData.gender,
            password: formData.password // Optional in backend
        });
    } else {
        success = await createUser({
            name: formData.name,
            username: formData.username,
            email: formData.email,
            role: formData.role,
            gender: formData.gender,
            password: formData.password
        });
    }

    if (success) {
      resetForm();
      await fetchUsers();
      setStatusMsg({ type: 'success', text: isEditing ? 'User diperbarui!' : 'User berhasil dibuat!' });
      setTimeout(() => setStatusMsg(null), 3000);
    } else {
      setStatusMsg({ type: 'error', text: 'Gagal menyimpan data.' });
    }
    setIsSubmitting(false);
  };

  const handleEditClick = (user: User) => {
    setFormData({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email || '',
        role: user.role,
        gender: user.gender || Gender.FEMALE,
        password: '' // Keep empty, only fill if changing
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  const handleDeleteUser = async (id: string) => {
    await deleteUser(id);
    await fetchUsers();
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setStatusMsg(null);
  };

  const getRoleBadge = (role: UserRole) => {
    switch(role) {
        case UserRole.ADMIN: 
            return <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1 w-fit"><Shield size={10} /> Admin</span>;
        case UserRole.SHADOW_TEACHER: 
            return <span className="px-2 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1 w-fit"><UserIcon size={10} /> Shadow</span>;
        case UserRole.TEACHER: 
            return <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1 w-fit"><GraduationCap size={10} /> Guru</span>;
        case UserRole.PARENT: 
            return <span className="px-2 py-1 rounded text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1 w-fit"><Heart size={10} /> Ortu</span>;
        default: return null;
    }
  };

  const getGenderIcon = (gender?: Gender) => {
    if (gender === Gender.MALE) return <span className="text-blue-300" title="Laki-laki">♂</span>;
    if (gender === Gender.FEMALE) return <span className="text-pink-300" title="Perempuan">♀</span>;
    return null;
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <GlassCard className={`p-6 border-l-4 ${isEditing ? 'border-l-yellow-400' : 'border-l-blue-400'}`}>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {isEditing ? <Edit2 size={20} className="text-yellow-400" /> : <UserPlus size={20} className="text-blue-400" />}
                {isEditing ? 'Edit Data User' : 'Tambah User Baru'}
            </h3>
            {isEditing && (
                <button onClick={resetForm} className="text-xs text-blue-200 hover:text-white flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                    <RotateCcw size={12} /> Batal
                </button>
            )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="text-xs text-blue-200 block mb-1">Nama Lengkap</label>
                <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Nama User"
                    required
                />
            </div>
            
            <div>
                <label className="text-xs text-blue-200 block mb-1">Email</label>
                <div className="relative">
                    <input 
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 pl-8 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="contoh@email.com"
                    />
                    <Mail className="absolute left-2.5 top-2.5 text-white/30" size={14} />
                </div>
            </div>

            <div>
                <label className="text-xs text-blue-200 block mb-1">Role</label>
                <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                    <option value={UserRole.SHADOW_TEACHER}>Shadow Teacher</option>
                    <option value={UserRole.TEACHER}>Guru Pendamping</option>
                    <option value={UserRole.PARENT}>Orang Tua</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                </select>
            </div>

            <div>
                <label className="text-xs text-blue-200 block mb-1">Jenis Kelamin</label>
                <div className="relative">
                    <select 
                        value={formData.gender}
                        onChange={e => setFormData({...formData, gender: e.target.value as Gender})}
                        className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 pl-8 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value={Gender.MALE}>Laki-laki</option>
                        <option value={Gender.FEMALE}>Perempuan</option>
                    </select>
                    <Users className="absolute left-2.5 top-2.5 text-white/30" size={14} />
                </div>
            </div>

            <div>
                <label className="text-xs text-blue-200 block mb-1">Username</label>
                <input 
                    type="text" 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Username login"
                    required
                />
            </div>
            
            <div>
                <label className="text-xs text-blue-200 block mb-1">
                    Password {isEditing && <span className="text-white/50 font-normal">(Kosongkan jika tidak ingin ubah)</span>}
                </label>
                <input 
                    type="password" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder={isEditing ? "••••••" : "Password baru"}
                />
            </div>

            {statusMsg && (
                <div className={`md:col-span-2 text-xs p-2 rounded ${statusMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'}`}>
                    {statusMsg.text}
                </div>
            )}

            <div className="md:col-span-2 pt-2">
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`
                        w-full font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2
                        ${isEditing 
                            ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' 
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                        }
                    `}
                >
                    {isSubmitting ? 'Memproses...' : (
                        <>
                            {isEditing ? <Save size={16} /> : <UserPlus size={16} />}
                            {isEditing ? 'Simpan Perubahan' : 'Buat User Baru'}
                        </>
                    )}
                </button>
            </div>
        </form>
      </GlassCard>

      {/* Table Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-2">
             <h3 className="text-lg font-bold text-white">Daftar Pengguna</h3>
             <span className="text-xs text-blue-200 bg-white/10 px-2 py-1 rounded-full">Total: {users.length}</span>
        </div>
        
        <GlassCard className="overflow-hidden">
            {isLoading ? (
                <div className="p-8 text-center text-white/50">Memuat data...</div>
            ) : users.length === 0 ? (
                <div className="p-8 text-center text-white/50">Belum ada user terdaftar.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-white">
                        <thead>
                            <tr className="bg-white/10 text-blue-200 border-b border-white/10">
                                <th className="p-4 font-semibold">Nama & Email</th>
                                <th className="p-4 font-semibold">Username</th>
                                <th className="p-4 font-semibold">Role</th>
                                <th className="p-4 font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map(user => (
                                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-medium flex items-center gap-2">
                                            {user.name}
                                            {getGenderIcon(user.gender)}
                                        </div>
                                        {user.email && (
                                            <div className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                                                <Mail size={10} /> {user.email}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 opacity-80">@{user.username}</td>
                                    <td className="p-4">{getRoleBadge(user.role)}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {user.role !== UserRole.ADMIN && (
                                                <button 
                                                    onClick={() => onImpersonate(user)}
                                                    className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-300 rounded-lg transition-colors flex items-center gap-1 group/btn"
                                                    title="Login sebagai user ini"
                                                >
                                                    <LogIn size={16} />
                                                    <span className="text-[10px] hidden group-hover/btn:inline font-bold">Login As</span>
                                                </button>
                                            )}
                                            
                                            <button 
                                                onClick={() => handleEditClick(user)}
                                                className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            {user.username !== 'admin' && (
                                                <button 
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-1.5 bg-red-500/10 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && users.length > 0 && (
                <div className="p-4 border-t border-white/10 flex items-center justify-between">
                    <button 
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-white"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    
                    <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                            <button
                                key={number}
                                onClick={() => paginate(number)}
                                className={`
                                    w-8 h-8 rounded-lg text-xs font-bold transition-all
                                    ${currentPage === number 
                                        ? 'bg-blue-600 text-white shadow-lg' 
                                        : 'bg-white/5 text-blue-200 hover:bg-white/10'}
                                `}
                            >
                                {number}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-white"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </GlassCard>
      </div>
    </div>
  );
};
