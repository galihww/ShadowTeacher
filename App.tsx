import React, { useState, useEffect } from 'react';
import { ActivityLog, User, UserRole } from './types';
import { initDB, fetchActivities, saveActivityToDB, updateActivityInDB, deleteActivityFromDB } from './services/dataService';
import { ActivityTimeline } from './components/ActivityTimeline';
import { NewActivityForm } from './components/NewActivityForm';
import { Dashboard } from './components/Dashboard';
import { GlassCard } from './components/GlassCard';
import { CalendarView } from './components/CalendarView';
import { WeeklyView } from './components/WeeklyView';
import { YearlyView } from './components/YearlyView';
import { Login } from './components/Login';
import { AdminUserManagement } from './components/AdminUserManagement';
import { ParentChildRegistration } from './components/ParentChildRegistration';
import { AdminChildApproval } from './components/AdminChildApproval';
import { AdminTeacherAssignment } from './components/AdminTeacherAssignment';
import { UserProfile } from './components/UserProfile';
import { Logo } from './components/Logo';
import { Plus, LayoutDashboard, List, Sparkles, Filter, Loader2, ChevronLeft, LogOut, Settings, Baby, Users, Briefcase, Shield, GraduationCap, Heart, UserCog, ChevronRight, EyeOff, AlertTriangle, Trash2 } from 'lucide-react';

type TimeRange = 'day' | 'week' | 'month' | 'year';
// View Modes:
// timeline: Main feed
// dashboard: Stats
// admin: User Management
// admin_child: Child Approvals
// admin_assignment: Teacher Assignments
// parent_child: Child Registration for Parents
// profile: User Profile View/Edit
type ViewMode = 'timeline' | 'dashboard' | 'admin' | 'admin_child' | 'admin_assignment' | 'parent_child' | 'profile';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [originalAdmin, setOriginalAdmin] = useState<User | null>(null); // For Impersonation
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityLog | null>(null); // New state for editing

  // DELETE CONFIRMATION STATE
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [view, setView] = useState<ViewMode>('timeline');
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk tanggal yang dipilih pada view 'day'
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Init DB only once
  useEffect(() => {
    const initialize = async () => {
        await initDB();
    };
    initialize();
  }, []);

  // Load Data when user logs in
  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    // Fetch activities scoped to the current user
    const data = await fetchActivities(user);
    setActivities(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setOriginalAdmin(null);
    // Jika role parent, default ke dashboard view karena lebih visual
    if (loggedInUser.role === UserRole.PARENT) {
        setView('dashboard');
    } else {
        setView('timeline');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setOriginalAdmin(null);
    setActivities([]);
    setView('timeline');
  };

  // --- IMPERSONATION LOGIC ---
  const handleImpersonate = (targetUser: User) => {
    if (user && user.role === UserRole.ADMIN) {
        setOriginalAdmin(user); // Simpan sesi admin
        setUser(targetUser); // Switch user
        
        // Atur view default berdasarkan role user yang di-impersonate
        if (targetUser.role === UserRole.PARENT) setView('dashboard');
        else setView('timeline');
        
        // Reset tanggal filter ke hari ini
        setSelectedDate(new Date());
        setTimeRange('day');
    }
  };

  const handleStopImpersonation = () => {
    if (originalAdmin) {
        setUser(originalAdmin);
        setOriginalAdmin(null);
        setView('admin'); // Kembali ke menu admin
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  // --- ACTIVITY HANDLERS (Create, Edit, Delete) ---

  const handleEditActivity = (activity: ActivityLog) => {
    setEditingActivity(activity);
    setShowForm(true);
  };

  // 1. Request Delete (Opens Modal)
  const handleRequestDelete = (id: string) => {
    setItemToDelete(id);
  };

  // 2. Confirm Delete (Executes Logic)
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    const id = itemToDelete;

    try {
        // Optimistic Update: Remove from UI immediately
        setActivities(prev => prev.filter(act => act.id !== id));

        // Check if Mock Data (starts with 'mock-')
        if (id.startsWith('mock-')) {
            // Mock data only exists in memory/UI, no DB call needed
            setIsDeleting(false);
            setItemToDelete(null);
            return;
        }

        // If Real Data, call API
        const success = await deleteActivityFromDB(id);
        
        if (!success) {
            // If failed, reload to revert
            // alert("Gagal menghapus aktivitas dari database."); // Avoid alert too
            await loadData(); 
        }
    } catch (error) {
        console.error("Delete failed:", error);
        await loadData(); // Safety reload
    } finally {
        setIsDeleting(false);
        setItemToDelete(null);
    }
  };

  const handleSaveActivity = async (activityData: ActivityLog) => {
    let success = false;
    
    // Optimistic UI Update placeholder (optional, but good for UX)
    // For now we rely on loadData after save for simplicity in creation logic

    if (editingActivity) {
         // Prevent editing mock data in DB if it hasn't been persisted yet
         if (activityData.id.startsWith('mock-')) {
             // If user edits a mock item, we treat it as creating a NEW item in the DB
             // but we reuse the ID logic or let DB handle it. 
             // Ideally: Convert mock ID to real ID.
             // Strategy: Treat as new Insert, but visually replace.
             const newActivity = { ...activityData, id: Date.now().toString() };
             success = await saveActivityToDB(newActivity);
             // Note: The old mock item will disappear on reload if DB has data now.
         } else {
             success = await updateActivityInDB(activityData);
         }
    } else {
         const activityWithId = {
            ...activityData,
            id: Date.now().toString(), 
            createdBy: user?.username 
         };
         success = await saveActivityToDB(activityWithId);
    }
    
    if (success) {
      await loadData();
      setShowForm(false);
      setEditingActivity(null);
    } else {
      // alert("Gagal menyimpan data ke database.");
    }
  };

  const handleCloseForm = () => {
      setShowForm(false);
      setEditingActivity(null);
  };

  const handleGeminiInsight = () => {
    alert("Fitur AI Insight: Menganalisis pola perilaku (Tantrum sering terjadi saat transisi di sekolah, Sensory Load tinggi di pagi hari).");
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    if (range === 'day') {
      setSelectedDate(new Date());
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setTimeRange('day');
  };
  
  const navigateYear = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(selectedDate.getFullYear() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  // Permission Checks
  const canEdit = user && [UserRole.ADMIN, UserRole.SHADOW_TEACHER, UserRole.TEACHER].includes(user.role);
  const isAdmin = user && user.role === UserRole.ADMIN;
  const isParent = user && user.role === UserRole.PARENT;

  // Filter Logic
  const filteredActivities = activities.filter(act => {
    const actDate = new Date(act.startTime);
    
    if (timeRange === 'day') {
      const targetDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const actDateReset = new Date(actDate.getFullYear(), actDate.getMonth(), actDate.getDate());
      return actDateReset.getTime() === targetDate.getTime();
    } 
    else if (timeRange === 'week') {
       // Filter untuk minggu yang dipilih (Senin - Minggu)
       const startOfWeek = new Date(selectedDate);
       const day = startOfWeek.getDay();
       const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Senin start
       startOfWeek.setDate(diff);
       startOfWeek.setHours(0,0,0,0);
       
       const endOfWeek = new Date(startOfWeek);
       endOfWeek.setDate(startOfWeek.getDate() + 6);
       endOfWeek.setHours(23,59,59,999);

       return actDate >= startOfWeek && actDate <= endOfWeek;
    }
    else if (timeRange === 'month') {
      return actDate.getMonth() === selectedDate.getMonth() && actDate.getFullYear() === selectedDate.getFullYear();
    }
    else if (timeRange === 'year') {
      return actDate.getFullYear() === selectedDate.getFullYear();
    }
    return true;
  });

  const getFilterText = () => {
    if (timeRange === 'day') {
      const isToday = selectedDate.toDateString() === new Date().toDateString();
      if (isToday) return 'hari ini';
      return `pada ${selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}`;
    }
    if (timeRange === 'week') return 'minggu ini';
    if (timeRange === 'month') return `Bulan ${selectedDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
    if (timeRange === 'year') return `tahun ${selectedDate.getFullYear()}`;
    return '';
  };

  const renderTimelineContent = () => {
      if (timeRange === 'year') {
          return (
            <YearlyView 
                activities={filteredActivities} // Pass filtered data to ensure correct year data
                year={selectedDate.getFullYear()}
                onDateSelect={handleDateSelect}
            />
          );
      }
      
      return (
        <div className="space-y-6">
            {timeRange === 'month' && (
                <CalendarView 
                    activities={filteredActivities} 
                    onDateSelect={handleDateSelect}
                    currentDate={selectedDate}
                />
            )}
            
            {timeRange === 'week' && (
                <WeeklyView 
                    activities={filteredActivities}
                    onDateSelect={handleDateSelect}
                    currentDate={selectedDate}
                />
            )}

            <ActivityTimeline 
                activities={filteredActivities} 
                user={user}
                onEdit={handleEditActivity}
                onDelete={handleRequestDelete}
            />
        </div>
      );
  };

  const renderMainContent = () => {
      switch (view) {
          case 'admin':
              return <AdminUserManagement onImpersonate={handleImpersonate} />;
          case 'admin_child':
              return <AdminChildApproval />;
          case 'admin_assignment':
              return <AdminTeacherAssignment />;
          case 'parent_child':
              return user ? <ParentChildRegistration user={user} /> : null;
          case 'profile':
              return user ? <UserProfile user={user} onUpdate={handleUserUpdate} /> : null;
          case 'dashboard':
              return <Dashboard activities={filteredActivities} />;
          case 'timeline':
          default:
              return (
                  <>
                    <div className="mb-6">
                        {/* Time Filter Tabs */}
                        <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-white/10 overflow-x-auto scrollbar-hide">
                            {(['day', 'week', 'month', 'year'] as TimeRange[]).map((range) => (
                            <button
                                key={range}
                                onClick={() => handleTimeRangeChange(range)}
                                className={`
                                flex-1 py-1.5 px-3 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap
                                ${timeRange === range 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                    : 'text-blue-200 hover:bg-white/5'}
                                `}
                            >
                                {range === 'day' ? 'Harian' : range === 'week' ? 'Mingguan' : range === 'month' ? 'Bulanan' : 'Tahunan'}
                            </button>
                            ))}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 mb-2 pl-2">
                             <div className="flex items-center gap-2 text-white/70">
                                {/* Navigation Back for Month View */}
                                {timeRange === 'day' && selectedDate.toDateString() !== new Date().toDateString() && (
                                    <button onClick={() => setTimeRange('month')} className="flex items-center gap-1 text-blue-300 hover:text-white mr-2">
                                        <ChevronLeft size={14} /> Kembali
                                    </button>
                                )}
                                <Filter size={14} />
                                <span className="text-xs">
                                    {timeRange === 'week' 
                                    ? 'Pilih hari untuk melihat detail' 
                                    : timeRange === 'year' 
                                        ? `Ringkasan Aktivitas ${selectedDate.getFullYear()}`
                                        : `Menampilkan ${filteredActivities.length} aktivitas ${getFilterText()}`
                                    }
                                </span>
                             </div>

                             {/* Year & Month Navigation Controls */}
                             {(timeRange === 'year' || timeRange === 'month') && (
                                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
                                    <button 
                                        onClick={() => {
                                            const d = new Date(selectedDate);
                                            if (timeRange === 'year') d.setFullYear(d.getFullYear() - 1);
                                            else d.setMonth(d.getMonth() - 1);
                                            setSelectedDate(d);
                                        }} 
                                        className="p-1 hover:bg-white/10 rounded text-blue-200"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="text-xs font-bold text-white px-2">
                                        {timeRange === 'year' ? selectedDate.getFullYear() : selectedDate.toLocaleDateString('id-ID', {month: 'short', year: 'numeric'})}
                                    </span>
                                    <button 
                                        onClick={() => {
                                            const d = new Date(selectedDate);
                                            if (timeRange === 'year') d.setFullYear(d.getFullYear() + 1);
                                            else d.setMonth(d.getMonth() + 1);
                                            setSelectedDate(d);
                                        }} 
                                        className="p-1 hover:bg-white/10 rounded text-blue-200"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                             )}
                        </div>
                    </div>
                    {renderTimelineContent()}
                  </>
              );
      }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
        case UserRole.ADMIN: return <Shield size={12} />;
        case UserRole.PARENT: return <Heart size={12} />;
        case UserRole.SHADOW_TEACHER: return <UserCog size={12} />;
        case UserRole.TEACHER: return <GraduationCap size={12} />;
        default: return <Users size={12} />;
    }
  };

  // -- MAIN RENDER --
  
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen pb-20 sm:pb-8 font-sans selection:bg-blue-500/30">
      
      {/* Header */}
      <header className={`sticky top-0 z-30 pt-6 pb-4 px-4 backdrop-blur-xl border-b border-white/5 ${originalAdmin ? 'bg-indigo-950/90 border-indigo-500/30 shadow-indigo-900/20 shadow-lg' : 'bg-[#0f172a]/80'}`}>
        {originalAdmin && (
             <div className="max-w-3xl mx-auto mb-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg p-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-indigo-200">
                    <EyeOff size={14} />
                    <span>Sedang login sebagai: <strong>{user.name}</strong></span>
                </div>
                <button 
                    onClick={handleStopImpersonation}
                    className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-full transition-colors"
                >
                    Kembali ke Admin
                </button>
             </div>
        )}

        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => setView('profile')}
            className="flex items-center gap-3 group focus:outline-none"
            title="Lihat Profil"
          >
            {/* LOGO BARU */}
            <div className={`transition-transform group-hover:scale-105 ${view === 'profile' ? 'ring-2 ring-white rounded-full' : ''}`}>
               <Logo className="w-10 h-10 shadow-blue-500/30" />
            </div>

            <div className="text-left">
              <h1 className="text-xl font-bold text-white leading-none group-hover:text-blue-200 transition-colors">ShadowTeacher</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-blue-200 capitalize bg-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    {getRoleIcon(user.role)}
                    {user.role.replace('_', ' ')}
                </span>
                <span className="text-xs text-white/50">Hi, {user.name}</span>
              </div>
            </div>
          </button>
          
          <div className="flex gap-2">
            {/* Admin Toggle */}
            {isAdmin && !originalAdmin && (
                <button 
                  onClick={() => setView(view === 'admin' ? 'timeline' : 'admin')}
                  className={`p-2 rounded-full border transition-colors ${['admin', 'admin_child', 'admin_assignment'].includes(view) ? 'bg-blue-600 text-white border-blue-400' : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'}`}
                  title="Admin Settings"
                >
                  <Settings size={20} />
                </button>
            )}
            {/* Parent Toggle */}
            {isParent && (
                <button 
                  onClick={() => setView(view === 'parent_child' ? 'dashboard' : 'parent_child')}
                  className={`p-2 rounded-full border transition-colors ${view === 'parent_child' ? 'bg-blue-600 text-white border-blue-400' : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'}`}
                  title="Profil Anak"
                >
                  <Baby size={20} />
                </button>
            )}

            <button 
              onClick={handleGeminiInsight}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              title="AI Insights"
            >
              <Sparkles className="text-yellow-300" size={20} />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 mt-6">
        
        {/* Toggle View (Only show if not in Admin/Parent/Profile specific pages) */}
        {!['admin', 'admin_child', 'admin_assignment', 'parent_child', 'profile'].includes(view) && (
            <div className="flex gap-4 mb-6">
            <GlassCard 
                onClick={() => setView('timeline')}
                className={`flex-1 p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors ${view === 'timeline' ? 'bg-blue-600/40 border-blue-400/50' : 'hover:bg-white/10'}`}
            >
                <List size={18} />
                <span className="font-medium">Aktivitas</span>
            </GlassCard>
            <GlassCard 
                onClick={() => setView('dashboard')}
                className={`flex-1 p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors ${view === 'dashboard' ? 'bg-blue-600/40 border-blue-400/50' : 'hover:bg-white/10'}`}
            >
                <LayoutDashboard size={18} />
                <span className="font-medium">Statistik</span>
            </GlassCard>
            </div>
        )}

        {/* Admin Sub-Navigation */}
        {isAdmin && !originalAdmin && ['admin', 'admin_child', 'admin_assignment'].includes(view) && (
             <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setView('admin')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${view === 'admin' ? 'bg-blue-600 text-white' : 'bg-white/5 text-blue-200 hover:bg-white/10'}`}
                >
                    <Users size={16} /> User
                </button>
                <button
                    onClick={() => setView('admin_child')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${view === 'admin_child' ? 'bg-blue-600 text-white' : 'bg-white/5 text-blue-200 hover:bg-white/10'}`}
                >
                    <Baby size={16} /> Anak
                </button>
                <button
                    onClick={() => setView('admin_assignment')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${view === 'admin_assignment' ? 'bg-blue-600 text-white' : 'bg-white/5 text-blue-200 hover:bg-white/10'}`}
                >
                    <Briefcase size={16} /> Penugasan
                </button>
             </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-blue-400" size={40} />
          </div>
        ) : (
            renderMainContent()
        )}
      </main>

      {/* Floating Action Button */}
      {canEdit && view === 'timeline' && (
        <div className="fixed bottom-6 right-6 z-40">
            <button
            onClick={() => {
                setEditingActivity(null); 
                setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] border border-blue-400/30 transition-transform hover:scale-105 active:scale-95"
            >
            <Plus size={28} strokeWidth={2.5} />
            </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && user && (
        <NewActivityForm 
          onClose={handleCloseForm} 
          onSave={handleSaveActivity}
          user={user}
          initialData={editingActivity} 
        />
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <GlassCard className="w-full max-w-sm p-6 bg-slate-900/90 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Hapus Aktivitas?</h3>
                    <p className="text-blue-200 text-sm mb-6">
                        Tindakan ini tidak dapat dibatalkan. Data aktivitas akan dihapus secara permanen.
                    </p>
                    
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => setItemToDelete(null)}
                            disabled={isDeleting}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                            {isDeleting ? 'Menghapus...' : 'Hapus'}
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
      )}

    </div>
  );
}

export default App;