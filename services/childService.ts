import { sql, initDB } from './db';
import { Child, ChildStatus, Gender, User, UserRole } from '../types';

// Helper to handle errors
const handleDbError = async (error: any, retryFn: () => Promise<any>) => {
    const msg = error.message || '';
    if (msg.includes('relation "children" does not exist')) {
        await initDB();
        return retryFn();
    }
    throw error;
};

export const registerChild = async (child: Omit<Child, 'id' | 'status' | 'createdAt' | 'parentName'>): Promise<boolean> => {
    try {
        const id = Date.now().toString();
        const status = ChildStatus.PENDING;
        const createdAt = new Date().toISOString();

        await sql`
            INSERT INTO children (id, parent_id, full_name, date_of_birth, gender, diagnosis, notes, status, created_at)
            VALUES (${id}, ${child.parentId}, ${child.fullName}, ${child.dateOfBirth}, ${child.gender}, ${child.diagnosis}, ${child.notes}, ${status}, ${createdAt})
        `;
        return true;
    } catch (error) {
        console.error("Error registering child:", error);
        return false;
    }
};

export const getAllChildren = async (): Promise<Child[]> => {
    try {
        const rows = await sql`
            SELECT 
                c.*, p.name as parent_name, s.name as shadow_name, t.name as teacher_name
            FROM children c
            LEFT JOIN users p ON c.parent_id = p.id
            LEFT JOIN users s ON c.shadow_teacher_id = s.id
            LEFT JOIN users t ON c.teacher_id = t.id
            ORDER BY c.created_at DESC
        `;
        return mapRowsToChildren(rows);
    } catch (err) {
        console.error("Error fetching all children:", err);
        return [];
    }
};

// --- QUERY BARU UNTUK SCOPING AKSES ---
export const getChildrenForUser = async (user: User): Promise<Child[]> => {
    try {
        let rows;
        if (user.role === UserRole.ADMIN) {
            // Admin melihat semua anak yang approved (untuk dropdown aktivitas)
            rows = await sql`SELECT * FROM children WHERE status = 'approved' ORDER BY full_name ASC`;
        } else if (user.role === UserRole.PARENT) {
            // Parent melihat anak kandungnya sendiri (yang sudah approved)
            rows = await sql`SELECT * FROM children WHERE parent_id = ${user.id} AND status = 'approved' ORDER BY full_name ASC`;
        } else {
            // Guru/Shadow melihat anak yang ditugaskan kepada mereka
            rows = await sql`
                SELECT * FROM children 
                WHERE (shadow_teacher_id = ${user.id} OR teacher_id = ${user.id}) 
                AND status = 'approved'
                ORDER BY full_name ASC
            `;
        }
        return mapRowsToChildren(rows);
    } catch (err) {
        console.error("Error fetching children for user scope:", err);
        return [];
    }
};

export const updateChild = async (child: Partial<Child> & { id: string }): Promise<boolean> => {
    try {
        await sql`
            UPDATE children 
            SET full_name = ${child.fullName}, 
                date_of_birth = ${child.dateOfBirth}, 
                gender = ${child.gender}, 
                diagnosis = ${child.diagnosis}, 
                notes = ${child.notes}
            WHERE id = ${child.id}
        `;
        return true;
    } catch (error) {
        console.error("Error updating child:", error);
        return false;
    }
};

export const deleteChild = async (id: string): Promise<boolean> => {
    try {
        await sql`DELETE FROM children WHERE id = ${id}`;
        return true;
    } catch (error) {
        console.error("Error deleting child:", error);
        return false;
    }
};

export const getChildrenByParent = async (parentId: string): Promise<Child[]> => {
    try {
        const rows = await sql`SELECT * FROM children WHERE parent_id = ${parentId} ORDER BY created_at DESC`;
        return mapRowsToChildren(rows);
    } catch (err) {
        return [];
    }
};

export const getPendingChildren = async (): Promise<Child[]> => {
    try {
        const rows = await sql`
            SELECT 
                c.*, p.name as parent_name
            FROM children c
            LEFT JOIN users p ON c.parent_id = p.id
            WHERE c.status = 'pending'
            ORDER BY c.created_at ASC
        `;
        return mapRowsToChildren(rows);
    } catch (err) {
        console.error("Error fetching pending:", err);
        return [];
    }
};

export const getApprovedChildren = async (): Promise<Child[]> => {
    try {
        const rows = await sql`
            SELECT 
                c.*, p.name as parent_name, s.name as shadow_name, t.name as teacher_name
            FROM children c
            LEFT JOIN users p ON c.parent_id = p.id
            LEFT JOIN users s ON c.shadow_teacher_id = s.id
            LEFT JOIN users t ON c.teacher_id = t.id
            WHERE c.status = 'approved'
            ORDER BY c.full_name ASC
        `;
        return mapRowsToChildren(rows);
    } catch (err) {
        console.error("Error fetching approved:", err);
        return [];
    }
};

export const setChildStatus = async (childId: string, newStatus: 'approved' | 'rejected'): Promise<boolean> => {
    try {
        const result = await sql`
            UPDATE children 
            SET status = ${newStatus} 
            WHERE id = ${childId}
            RETURNING id
        `;
        return result.length > 0;
    } catch (error) {
        console.error("Error setting status:", error);
        return false;
    }
};

export const assignTeachersToChild = async (childId: string, shadowId: string | null, teacherId: string | null): Promise<boolean> => {
    try {
        await sql`
            UPDATE children 
            SET shadow_teacher_id = ${shadowId}, teacher_id = ${teacherId} 
            WHERE id = ${childId}
        `;
        return true;
    } catch (error) {
        console.error("Error assigning teachers:", error);
        return false;
    }
};

// --- Helper Mapper ---
const mapRowsToChildren = (rows: any[]): Child[] => {
    return rows.map((r: any) => ({
        id: r.id,
        parentId: r.parent_id,
        fullName: r.full_name,
        dateOfBirth: new Date(r.date_of_birth).toISOString().split('T')[0],
        gender: r.gender as Gender,
        diagnosis: r.diagnosis,
        notes: r.notes,
        status: r.status as ChildStatus,
        createdAt: r.created_at,
        parentName: r.parent_name || 'Unknown',
        shadowTeacherId: r.shadow_teacher_id,
        teacherId: r.teacher_id,
        shadowTeacherName: r.shadow_name,
        teacherName: r.teacher_name
    }));
};
