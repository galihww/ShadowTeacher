import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { Child, User, UserRole } from '../types';
import { getApprovedChildren, assignTeachersToChild } from '../services/childService';
import { getUsersByRole } from '../services/authService';
import { Loader2, Save, User as UserIcon, CheckCircle2, Edit2, Trash2, ChevronLeft, ChevronRight, RotateCcw, Briefcase, GraduationCap, UserCog, Baby, School } from 'lucide-react';

export const AdminTeacherAssignment: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [shadowTeachers, setShadowTeachers] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    childId: string;
    childName: string;
    shadowId: string;
    teacherId: string;
  }>({ childId: '', childName: '', shadowId: '', teacherId: '' });

  const fetchData = async () => {
    setIsLoading(true);
    const [childrenData, shadowsData, teachersData] = await Promise.all([
        getApprovedChildren(),
        getUsersByRole(UserRole.SHADOW_TEACHER),
        getUsersByRole(UserRole.TEACHER)
    ]);
    setChildren(childrenData);
    setShadowTeachers(shadowsData);
    setTeachers(teachersData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ACTIONS ---

  const handleEditClick = (child: Child) => {
    setEditForm({
        childId: child.id,
        childName: child.fullName,
        shadowId: child.shadowTeacherId || '',
        teacherId: child.teacherId || ''
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUnassign = async (childId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus penugasan guru untuk anak ini?")) return;
    
    setProcessingId(childId);
    const success = await assignTeachersToChild(childId, null, null);
    
    if (success) {
        setStatusMsg({ type: 'success', text: "Penugasan berhasil dihapus (Unassigned)." });
        await fetchData();
    } else {
        setStatusMsg({ type: 'error', text: "Gagal menghapus penugasan." });
    }
    setProcessingId(null);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.childId) return;

    setProcessingId('form');
    // Convert empty strings to null for DB
    const sId = editForm.shadowId === '' ? null : editForm.shadowId;
    const tId = editForm.teacherId === '' ? null : editForm.teacherId;

    const success = await assignTeachersToChild(editForm.childId, sId, tId);
    
    if (success) {
        setStatusMsg({ type: 'success', text: "Penugasan berhasil disimpan!" });
        setIsEditing(false);
        setEditForm({ childId: '', childName: '', shadowId: '', teacherId: '' });
        await fetchData();
    } else {
        setStatusMsg({ type: 'error', text: "Gagal menyimpan data." });
    }
    setProcessingId(null);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({ childId: '', childName: '', shadowId: '', teacherId: '' });
  };

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = children.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(children.length / itemsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6">
      <div className="px-2">
         <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Briefcase className="text-blue-400" size={20} />
            Penugasan Guru
         </h2>
         <p className="text-xs text-blue-200">Atur Shadow Teacher dan Guru Sekolah untuk setiap anak.</p>
      </div>

      {statusMsg && (
        <div className={`mx-2 p-3 rounded-lg text-sm border ${statusMsg.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100' : 'bg-red-500/20 border-red-500/50 text-red-100'}`}>
            {statusMsg.text}
        </div>
      )}

      {/* EDIT FORM SECTION */}
      {isEditing && (
        <GlassCard className="p-6 border-l-4 border-l-yellow-400 mx-2">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Edit2 size={18} /> Edit Penugasan: {editForm.childName}
                </h3>
                <button onClick={cancelEdit} className="text-xs text-blue-200 hover:text-white flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                    <RotateCcw size={12} /> Batal
                </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-blue-200 block mb-1">Nama Anak (Read Only)</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={editForm.childName}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 pl-9 text-sm text-white/50 cursor-not-allowed"
                        />
                        <Baby className="absolute left-3 top-2.5 text-white/30" size={16} />
                    </div>
                </div>
                <div className="hidden md:block"></div> {/* Spacer */}

                <div>
                    <label className="text-xs text-blue-200 block mb-1 uppercase font-bold tracking-wide flex items-center gap-1">
                        <UserCog size={12} /> Shadow Teacher
                    </label>
                    <select 
                        value={editForm.shadowId}
                        onChange={e => setEditForm({...editForm, shadowId: e.target.value})}
                        className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="">-- Belum Ditugaskan --</option>
                        {shadowTeachers.map(st => (
                            <option key={st.id} value={st.id}>{st.name}</option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label className="text-xs text-blue-200 block mb-1 uppercase font-bold tracking-wide flex items-center gap-1">
                        <GraduationCap size={12} /> Guru Sekolah
                    </label>
                    <select 
                        value={editForm.teacherId}
                        onChange={e => setEditForm({...editForm, teacherId: e.target.value})}
                        className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="">-- Belum Ditugaskan --</option>
                        {teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2 pt-2">
                    <button 
                        type="submit" 
                        disabled={processingId === 'form'}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {processingId === 'form' ? <Loader2 className="animate-spin" /> : <Save size={16} />}
                        Simpan Penugasan
                    </button>
                </div>
            </form>
        </GlassCard>
      )}

      {/* TABLE VIEW */}
      <GlassCard className="overflow-hidden">
        {isLoading ? (
            <div className="p-10 text-center flex justify-center">
                <Loader2 className="animate-spin text-blue-400" size={30} />
            </div>
        ) : children.length === 0 ? (
            <div className="p-10 text-center text-white/50">Tidak ada anak yang disetujui.</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-white">
                    <thead>
                        <tr className="bg-white/10 text-blue-200 border-b border-white/10">
                            <th className="p-4 font-semibold">
                                <div className="flex items-center gap-2">
                                    <Baby size={16} className="text-pink-300" /> Nama Anak
                                </div>
                            </th>
                            <th className="p-4 font-semibold">
                                <div className="flex items-center gap-2">
                                    <UserIcon size={16} /> Orang Tua
                                </div>
                            </th>
                            <th className="p-4 font-semibold">
                                <div className="flex items-center gap-2">
                                    <UserCog size={16} className="text-blue-300" /> Shadow Teacher
                                </div>
                            </th>
                            <th className="p-4 font-semibold">
                                <div className="flex items-center gap-2">
                                    <GraduationCap size={16} className="text-yellow-300" /> Guru Sekolah
                                </div>
                            </th>
                            <th className="p-4 font-semibold text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map(child => (
                            <tr key={child.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-4 font-bold text-white">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-emerald-400 opacity-60" />
                                        {child.fullName}
                                    </div>
                                </td>
                                <td className="p-4 text-blue-100">
                                    <div className="flex items-center gap-1">
                                        <span className="opacity-70 text-xs">{child.parentName}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    {child.shadowTeacherName ? (
                                        <span className="px-2 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1 w-fit">
                                            <UserCog size={12} /> {child.shadowTeacherName}
                                        </span>
                                    ) : (
                                        <span className="text-white/30 text-xs italic flex items-center gap-1"><UserCog size={12} /> -</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    {child.teacherName ? (
                                        <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1 w-fit">
                                            <School size={12} /> {child.teacherName}
                                        </span>
                                    ) : (
                                        <span className="text-white/30 text-xs italic flex items-center gap-1"><School size={12} /> -</span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => handleEditClick(child)}
                                            className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors"
                                            title="Edit Penugasan"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleUnassign(child.id)}
                                            disabled={!!processingId}
                                            className="p-1.5 bg-red-500/10 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                                            title="Hapus Penugasan"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* PAGINATION */}
        {!isLoading && children.length > 0 && (
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
  );
};
