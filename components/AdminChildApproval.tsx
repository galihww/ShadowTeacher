import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { Child, ChildStatus, Gender } from '../types';
import { getAllChildren, setChildStatus, updateChild, deleteChild } from '../services/childService';
import { Check, X, User as UserIcon, Calendar, Loader2, AlertCircle, Edit2, Trash2, ChevronLeft, ChevronRight, Save, RotateCcw, Baby, Stethoscope, Activity, FileText } from 'lucide-react';

export const AdminChildApproval: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Child>>({});

  const fetchChildren = async () => {
    setIsLoading(true);
    const data = await getAllChildren();
    setChildren(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  // --- ACTIONS ---

  const handleStatusAction = async (id: string, action: 'approved' | 'rejected') => {
    setProcessingId(id);
    setStatusMsg(null);
    try {
        const success = await setChildStatus(id, action);
        if (success) {
            setStatusMsg({ type: 'success', text: `Status berhasil diubah menjadi ${action}` });
            await fetchChildren();
        } else {
            setStatusMsg({ type: 'error', text: "Gagal update status." });
        }
    } catch (e) {
        setStatusMsg({ type: 'error', text: "Terjadi kesalahan sistem." });
    } finally {
        setProcessingId(null);
        setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    // Non-blocking delete
    setProcessingId(id);
    const success = await deleteChild(id);
    if (success) {
        setStatusMsg({ type: 'success', text: "Data anak berhasil dihapus" });
        await fetchChildren();
    } else {
        setStatusMsg({ type: 'error', text: "Gagal menghapus data" });
    }
    setProcessingId(null);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleEditClick = (child: Child) => {
    setEditForm({
        id: child.id,
        fullName: child.fullName,
        dateOfBirth: child.dateOfBirth,
        gender: child.gender,
        diagnosis: child.diagnosis,
        notes: child.notes
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.id || !editForm.fullName) return;

    setProcessingId('form');
    const success = await updateChild(editForm as Child);
    
    if (success) {
        setStatusMsg({ type: 'success', text: "Data anak berhasil diperbarui" });
        setIsEditing(false);
        setEditForm({});
        await fetchChildren();
    } else {
        setStatusMsg({ type: 'error', text: "Gagal update data" });
    }
    setProcessingId(null);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  // --- RENDER HELPERS ---

  const getStatusBadge = (status: ChildStatus) => {
    switch (status) {
        case ChildStatus.APPROVED:
            return <span className="px-2 py-1 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit"><Check size={10} /> Disetujui</span>;
        case ChildStatus.REJECTED:
            return <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1 w-fit"><X size={10} /> Ditolak</span>;
        default:
            return <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1 w-fit"><AlertCircle size={10} /> Pending</span>;
    }
  };

  // --- PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = children.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(children.length / itemsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6">
      <div className="px-2">
         <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Baby className="text-pink-400" size={20} />
            Manajemen Data Anak
         </h2>
         <p className="text-xs text-blue-200">Kelola data anak, status persetujuan, dan informasi medis.</p>
      </div>

      {statusMsg && (
        <div className={`mx-2 p-3 rounded-lg text-sm border ${statusMsg.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100' : 'bg-red-500/20 border-red-500/50 text-red-100'}`}>
            {statusMsg.text}
        </div>
      )}

      {/* EDIT FORM */}
      {isEditing && (
        <GlassCard className="p-6 border-l-4 border-l-yellow-400 mx-2">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Edit2 size={18} /> Edit Data Anak
                </h3>
                <button onClick={cancelEdit} className="text-xs text-blue-200 hover:text-white flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                    <RotateCcw size={12} /> Batal
                </button>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-blue-200 block mb-1">Nama Lengkap</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={editForm.fullName || ''}
                            onChange={e => setEditForm({...editForm, fullName: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 pl-9 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                        <Baby className="absolute left-3 top-2.5 text-white/40" size={16} />
                    </div>
                </div>
                <div>
                    <label className="text-xs text-blue-200 block mb-1">Tanggal Lahir</label>
                    <input 
                        type="date" 
                        value={editForm.dateOfBirth || ''}
                        onChange={e => setEditForm({...editForm, dateOfBirth: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                    />
                </div>
                <div>
                    <label className="text-xs text-blue-200 block mb-1">Jenis Kelamin</label>
                    <select 
                        value={editForm.gender}
                        onChange={e => setEditForm({...editForm, gender: e.target.value as Gender})}
                        className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value={Gender.MALE}>Laki-laki</option>
                        <option value={Gender.FEMALE}>Perempuan</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-blue-200 block mb-1">Diagnosis</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={editForm.diagnosis || ''}
                            onChange={e => setEditForm({...editForm, diagnosis: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 pl-9 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                        <Activity className="absolute left-3 top-2.5 text-white/40" size={16} />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="text-xs text-blue-200 block mb-1">Catatan</label>
                    <div className="relative">
                        <textarea 
                            value={editForm.notes || ''}
                            onChange={e => setEditForm({...editForm, notes: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 pl-9 text-sm text-white focus:outline-none focus:border-blue-500"
                            rows={2}
                        />
                        <FileText className="absolute left-3 top-3 text-white/40" size={16} />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <button 
                        type="submit" 
                        disabled={processingId === 'form'}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {processingId === 'form' ? <Loader2 className="animate-spin" /> : <Save size={16} />}
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </GlassCard>
      )}

      {/* DATA TABLE */}
      <GlassCard className="overflow-hidden">
        {isLoading ? (
            <div className="p-10 text-center flex justify-center">
                <Loader2 className="animate-spin text-blue-400" size={30} />
            </div>
        ) : children.length === 0 ? (
            <div className="p-10 text-center text-white/50">Tidak ada data anak.</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-white">
                    <thead>
                        <tr className="bg-white/10 text-blue-200 border-b border-white/10">
                            <th className="p-4 font-semibold">
                                <div className="flex items-center gap-2">
                                    <Baby size={16} /> Nama Anak
                                </div>
                            </th>
                            <th className="p-4 font-semibold">
                                <div className="flex items-center gap-2">
                                    <UserIcon size={16} /> Orang Tua
                                </div>
                            </th>
                            <th className="p-4 font-semibold">
                                <div className="flex items-center gap-2">
                                    <Stethoscope size={16} /> Diagnosis
                                </div>
                            </th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map(child => (
                            <tr key={child.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-white flex items-center gap-2">
                                        <Baby size={14} className="text-pink-300 opacity-70" />
                                        {child.fullName}
                                    </div>
                                    <div className="text-xs text-blue-200 opacity-70 flex items-center gap-1 mt-1 ml-5">
                                        <Calendar size={10} /> {child.dateOfBirth}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1 text-sm">
                                        <UserIcon size={12} className="text-blue-300" />
                                        {child.parentName}
                                    </div>
                                </td>
                                <td className="p-4 text-xs max-w-[150px] truncate" title={child.diagnosis}>
                                    <div className="flex items-center gap-1">
                                        <Activity size={12} className="text-emerald-400" />
                                        {child.diagnosis || '-'}
                                    </div>
                                </td>
                                <td className="p-4">
                                    {getStatusBadge(child.status)}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2 items-center">
                                        {/* Approval Buttons for Pending */}
                                        {child.status === ChildStatus.PENDING && (
                                            <div className="flex bg-white/5 rounded-lg mr-2">
                                                <button 
                                                    onClick={() => handleStatusAction(child.id, 'approved')}
                                                    disabled={!!processingId}
                                                    className="p-1.5 hover:bg-emerald-500/20 text-emerald-400 rounded-l-lg border-r border-white/10 transition-colors"
                                                    title="Setujui"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusAction(child.id, 'rejected')}
                                                    disabled={!!processingId}
                                                    className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-r-lg transition-colors"
                                                    title="Tolak"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}

                                        <button 
                                            onClick={() => handleEditClick(child)}
                                            className="p-1.5 bg-blue-500/10 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
                                            title="Edit Info"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(child.id)}
                                            disabled={!!processingId}
                                            className="p-1.5 bg-red-500/10 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                                            title="Hapus Data"
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